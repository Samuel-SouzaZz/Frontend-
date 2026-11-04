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
import type { Colaborador, PortalData, Resource, Entity, Usuario, Utilizacao } from "../models/types";
import { canEstornar, isAdministrador } from "../models/selectors";
import { errorMessage } from "../hooks/useAsyncAction";
import { cancelUtilizacao, listResource, removeResource, saveResource } from "../services/api";
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
  cadastrarColaborador: (conta: ContaNova, trabalho: Partial<Colaborador>) => Promise<Colaborador>;
}

export type ContaNova = { nome: string; email: string; senha: string };

const Context = createContext<Portal | null>(null);

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
        errors[resource] = errorMessage(
          result.reason,
          "Falha ao carregar dados.",
        );
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
    const result = await saveResource(resource, id, payload);
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
    await saveResource("utilizacoes", id, { observacoes });
    const result = await cancelUtilizacao(id);
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
  const cadastrarColaborador = useCallback(async (conta: ContaNova, trabalho: Partial<Colaborador>) => {
    const u = userRef.current;
    if (!u) throw new Error("Faça login para continuar.");
    if (!isAdministrador(u, dataRef.current))
      throw new Error("Somente o administrador pode criar a conta de acesso de um colaborador.");
    const perfil = dataRef.current.perfis.find((item) => item.escopo === "COLABORADOR" && item.status === "ATIVO");
    if (!perfil) throw new Error("Não há um perfil de Colaborador ativo em Configurações.");
    const usuario = await saveResource("usuarios", undefined, { ...conta, perfil_id: perfil.id, status: "ATIVO" });
    let colaborador: Colaborador;
    try {
      colaborador = await saveResource("colaboradores", undefined, { ...trabalho, usuario_id: usuario.id });
    } catch (erro) {
      await removeResource("usuarios", usuario.id).catch(() => undefined);
      throw erro;
    }
    const semSenha: Usuario = { ...usuario, senha: undefined };
    const next = {
      ...dataRef.current,
      usuarios: [...dataRef.current.usuarios, semSenha],
      colaboradores: [...dataRef.current.colaboradores, colaborador],
    };
    dataRef.current = next;
    setData(next);
    return colaborador;
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
      cadastrarColaborador,
    }),
    [data, loading, refreshing, error, resourceErrors, reload, save, estornar, cadastrarColaborador],
  );
  return <Context.Provider value={value}>{children}</Context.Provider>;
}

export const usePortal = () => {
  const c = useContext(Context);
  if (!c) throw new Error("PortalProvider ausente");
  return c;
};
