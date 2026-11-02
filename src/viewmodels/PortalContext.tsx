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
interface Portal {
  data: PortalData;
  loading: boolean;
  error: string | null;
  reload: () => Promise<void>;
  save: <K extends Resource>(
    resource: K,
    id: number | undefined,
    payload: Partial<Entity<K>>,
  ) => Promise<Entity<K>>;
  estornar: (id: number, motivo: string) => Promise<Utilizacao>;
}
const Context = createContext<Portal | null>(null);
export function PortalProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [data, setData] = useState<PortalData>(empty),
    [loading, setLoading] = useState(true),
    [error, setError] = useState<string | null>(null);
  const dataRef = useRef(data);
  const generation = useRef(0);
  dataRef.current = data;
  const userRef = useRef(user);
  userRef.current = user;
  const reload = useCallback(async () => {
    const current = ++generation.current;
    setLoading(true);
    setError(null);
    if (isLocalDemoUser(userRef.current)) {
      const next = createLocalDemoData();
      setData(next);
      dataRef.current = next;
      setLoading(false);
      return;
    }
    const resources = Object.keys(empty) as Resource[];
    try {
      const results = await Promise.all(resources.map((r) => listResource(r)));
      if (current !== generation.current) return;
      const next = Object.fromEntries(
        resources.map((r, i) => [r, results[i]]),
      ) as unknown as PortalData;
      setData(next);
      dataRef.current = next;
    } catch (e) {
      if (current === generation.current)
        setError(e instanceof Error ? e.message : "Falha ao carregar dados.");
    } finally {
      if (current === generation.current) setLoading(false);
    }
  }, []);
  useEffect(() => {
    void reload();
    return () => {
      generation.current++;
    };
  }, [user?.id]);
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
    () => ({ data, loading, error, reload, save, estornar }),
    [data, loading, error, reload, save, estornar],
  );
  return (
    <Context.Provider value={value}>
      {children}
    </Context.Provider>
  );
}
export const usePortal = () => {
  const c = useContext(Context);
  if (!c) throw new Error("PortalProvider ausente");
  return c;
};
