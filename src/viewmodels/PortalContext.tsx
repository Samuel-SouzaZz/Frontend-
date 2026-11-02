import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type {
  PortalData,
  Resource,
  Entity,
  Utilizacao,
} from "../models/types";
import { canEstornar, isAdministrador } from "../models/selectors";
import {
  cancelUtilizacao,
  listResource,
  saveResource,
} from "../services/api";
import {
  createLocalDemoData,
  isLocalDemoUser,
  saveLocalDemoEntity,
} from "../local-demo/localDemo";
import { useAuth } from "./AuthContext";

const empty: PortalData = {
  usuarios: [],
  perfis: [],
  colaboradores: [],
  conveniados: [],
  beneficios: [],
  ofertas: [],
  campanhas: [],
  itensCampanha: [],
  ofertasCampanha: [],
  utilizacoes: [],
};

const resources = Object.keys(empty) as Resource[];

export type ResourceErrors = Partial<Record<Resource, string>>;

interface Portal {
  data: PortalData;
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  resourceErrors: ResourceErrors;
  reload: () => Promise<void>;
  save: <K extends Resource>(
    resource: K,
    id: number | undefined,
    payload: Partial<Entity<K>>,
  ) => Promise<Entity<K>>;
  estornar: (id: number, motivo: string) => Promise<Utilizacao>;
}

const Context = createContext<Portal | null>(null);

function failureMessage(reason: unknown) {
  return reason instanceof Error ? reason.message : "Falha ao carregar dados.";
}

export function PortalProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [data, setData] = useState<PortalData>(empty);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resourceErrors, setResourceErrors] = useState<ResourceErrors>({});
  const dataRef = useRef(data);
  const loadedRef = useRef(false);
  const generation = useRef(0);
  const userRef = useRef(user);
  dataRef.current = data;
  userRef.current = user;

  const reload = useCallback(async () => {
    const current = ++generation.current;
    const firstLoad = !loadedRef.current;
    if (firstLoad) setLoading(true);
    else setRefreshing(true);
    setError(null);
    if (isLocalDemoUser(userRef.current)) {
      const next = createLocalDemoData();
      dataRef.current = next;
      loadedRef.current = true;
      setData(next);
      setResourceErrors({});
      setLoading(false);
      setRefreshing(false);
      return;
    }
    const results = await Promise.allSettled(
      resources.map((resource) => listResource(resource)),
    );
    if (current !== generation.current) return;
    const previous = dataRef.current;
    const errors: ResourceErrors = {};
    const next = { ...previous };
    results.forEach((result, index) => {
      const resource = resources[index];
      if (result.status === "fulfilled") {
        Object.assign(next, { [resource]: result.value });
      } else {
        errors[resource] = failureMessage(result.reason);
      }
    });
    const failures = Object.values(errors);
    if (failures.length === resources.length && !loadedRef.current) {
      setError(failures[0] ?? "Falha ao carregar dados.");
    } else {
      loadedRef.current = true;
      dataRef.current = next;
      setData(next);
    }
    setResourceErrors(errors);
    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => {
    loadedRef.current = false;
    dataRef.current = empty;
    void reload();
    return () => {
      generation.current++;
    };
  }, [user?.id, reload]);

  const save = useCallback(async function save<K extends Resource>(
    resource: K,
    id: number | undefined,
    payload: Partial<Entity<K>>,
  ): Promise<Entity<K>> {
    const u = userRef.current;
    if (!u) throw new Error("Faça login para continuar.");
    if (
      (resource === "usuarios" || resource === "perfis") &&
      !isAdministrador(u, dataRef.current)
    )
      throw new Error(
        "Somente o administrador pode alterar usuários e perfis.",
      );
    if (resource === "utilizacoes")
      throw new Error("O histórico de utilização não pode ser editado.");
    const currentData = dataRef.current;
    const rows = currentData[resource] as Entity<K>[];
    const result = isLocalDemoUser(u)
      ? saveLocalDemoEntity(rows, id, payload)
      : await saveResource(resource, id, payload);
    const next = {
      ...currentData,
      [resource]:
        id === undefined
          ? [...rows, result]
          : rows.map((item) => (item.id === id ? result : item)),
    } as PortalData;
    dataRef.current = next;
    setData(next);
    return result;
  }, []);
  const estornar = useCallback(async (id: number, motivo: string) => {
    const u = userRef.current;
    if (!u) throw new Error("Faça login para continuar.");
    const atual = dataRef.current.utilizacoes.find((item) => item.id === id);
    const texto = motivo.trim();
    if (!atual || !canEstornar(atual) || !texto)
      throw new Error(
        "Só é permitido estornar uma utilização aprovada, informando o motivo.",
      );
    const observacoes = [atual.observacoes, `Motivo do estorno: ${texto}`]
      .filter(Boolean)
      .join("\n");
    let result: Utilizacao;
    if (isLocalDemoUser(u)) {
      result = { ...atual, status: "ESTORNADA", observacoes };
    } else {
      await saveResource("utilizacoes", id, { observacoes });
      result = await cancelUtilizacao(id);
    }
    const next = {
      ...dataRef.current,
      utilizacoes: dataRef.current.utilizacoes.map((item) =>
        item.id === id ? result : item,
      ),
    };
    dataRef.current = next;
    setData(next);
    return result;
  }, []);
  const value = useMemo<Portal>(
    () => ({
      data,
      loading,
      refreshing,
      error,
      resourceErrors,
      reload,
      save,
      estornar,
    }),
    [
      data,
      loading,
      refreshing,
      error,
      resourceErrors,
      reload,
      save,
      estornar,
    ],
  );
  return <Context.Provider value={value}>{children}</Context.Provider>;
}

export const usePortal = () => {
  const c = useContext(Context);
  if (!c) throw new Error("PortalProvider ausente");
  return c;
};
