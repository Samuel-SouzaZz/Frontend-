import { useMemo, useState, type FormEvent } from "react";
import { usePortal } from "./PortalContext";
import { useToast } from "./ToastContext";
import { usePagination } from "../hooks/usePagination";
import { useUrlFilters } from "../hooks/useUrlFilters";
import { useAsyncAction } from "../hooks/useAsyncAction";
import {
  createDataIndexes,
  colaboradorNomeIndexed,
  beneficioDaUtilizacaoIndexed,
  conveniadoDaUtilizacaoIndexed,
} from "../models/selectors";

type Utilizacao = ReturnType<typeof usePortal>["data"]["utilizacoes"][number];
const PAGE_SIZE = 8;
const URL_KEYS = [
  "buscar",
  "status",
  "inicio",
  "fim",
  "colaborador",
  "conveniado",
  "beneficio",
  "utilizacao",
] as const;

export function useUtilizacoesVM() {
  const { data, estornar: estornarUtilizacao } = usePortal();
  const { notify } = useToast();
  const { running: saving, run } = useAsyncAction();

  // ── Filtros ──
  const { values: filters, setter, update } = useUrlFilters(URL_KEYS);
  const {
    buscar: search,
    status,
    inicio,
    fim,
    colaborador,
    conveniado,
    beneficio,
  } = filters;
  const setSearch = setter("buscar");
  const setStatus = setter("status");
  const setInicio = setter("inicio");
  const setFim = setter("fim");
  const setColaborador = setter("colaborador");
  const setConveniado = setter("conveniado");
  const setBeneficio = setter("beneficio");

  // ── Modais ──
  const selectedId = Number(filters.utilizacao);
  const selected =
    data.utilizacoes.find((item) => item.id === selectedId) ?? null;
  const setSelected = (item: Utilizacao | null) =>
    update({ utilizacao: item ? String(item.id) : "" });
  const [reversal, setReversal] = useState<Utilizacao | null>(null);
  const [motivo, setMotivo] = useState("");

  const periodoInvalido = !!inicio && !!fim && fim < inicio;

  function closeDetails() {
    setSelected(null);
  }

  // ── Índices e dados derivados memoizados em O(N) ──
  const indexes = useMemo(() => createDataIndexes(data), [data]);

  const enrichedRows = useMemo(() => {
    return data.utilizacoes.map((uso) => {
      const item = beneficioDaUtilizacaoIndexed(indexes, uso);
      const parceiro = conveniadoDaUtilizacaoIndexed(indexes, uso);
      const colabNome = colaboradorNomeIndexed(indexes, uso.colaborador_id);
      const dia = uso.data_solicitacao.slice(0, 10);
      const texto =
        `${uso.id} ${colabNome} ${item?.nome ?? ""} ${parceiro?.nome_fantasia ?? ""} ${parceiro?.razao_social ?? ""}`.toLocaleLowerCase(
          "pt-BR",
        );
      const beneficioKey = `${uso.beneficio_conveniado_id ? "beneficio" : "campanha"}:${item?.id}`;
      return {
        ...uso,
        colaboradorNome: colabNome,
        beneficioItem: item,
        conveniadoItem: parceiro,
        conveniadoId: parceiro?.id,
        dia,
        searchTarget: texto,
        beneficioKey,
      };
    });
  }, [data, indexes]);

  const rows = useMemo(() => {
    if (periodoInvalido) return [];
    const term = search.trim().toLocaleLowerCase("pt-BR");
    const colabNum = colaborador ? Number(colaborador) : null;
    const convNum = conveniado ? Number(conveniado) : null;

    return enrichedRows.filter((uso) => {
      return (
        (!term || uso.searchTarget.includes(term)) &&
        (!status || uso.status === status) &&
        (!inicio || uso.dia >= inicio) &&
        (!fim || uso.dia <= fim) &&
        (!colabNum || uso.colaborador_id === colabNum) &&
        (!convNum || uso.conveniadoId === convNum) &&
        (!beneficio || uso.beneficioKey === beneficio)
      );
    });
  }, [
    enrichedRows,
    search,
    status,
    inicio,
    fim,
    colaborador,
    conveniado,
    beneficio,
    periodoInvalido,
  ]);

    const aprovadas = rows.filter((uso) => uso.status === "APROVADA");
    const {
    page: currentPage,
    setPage,
    start,
    end,
  } = usePagination(
    rows.length,
    PAGE_SIZE,
    JSON.stringify([search, status, inicio, fim, colaborador, conveniado, beneficio]),
  );

  const visibleRows = useMemo(
    () =>
      [...rows]
        .sort((a, b) => b.data_solicitacao.localeCompare(a.data_solicitacao))
        .slice(start, end),
    [rows, start, end],
  );

  // ── Ações ──
  async function estornar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!reversal || !motivo.trim() || saving) return;
    const atual = data.utilizacoes.find((uso) => uso.id === reversal.id);
    if (atual?.status !== "APROVADA") {
      notify("Somente utilizações aprovadas podem ser estornadas.", "error");
      setReversal(null);
      return;
    }
    await run(() => estornarUtilizacao(reversal.id, motivo), {
      success: "Utilização estornada. O registro permanece no histórico.",
      fallbackError: "Não foi possível estornar a utilização.",
      onSuccess: () => {
        setReversal(null);
        setSelected(null);
        setMotivo("");
      },
    });
  }

  function limparFiltros() {
    update({
      buscar: "",
      status: "",
      inicio: "",
      fim: "",
      colaborador: "",
      conveniado: "",
      beneficio: "",
    });
    setPage(1);
  }

  return {
    // contexto
    data,
    PAGE_SIZE,

    // filtros
    search,
    setSearch,
    status,
    setStatus,
    inicio,
    setInicio,
    fim,
    setFim,
    colaborador,
    setColaborador,
    conveniado,
    setConveniado,
    beneficio,
    setBeneficio,
    page: currentPage,
    setPage,
    periodoInvalido,
    limparFiltros,

    // dados derivados
    rows,
    aprovadas,
    currentPage,
    visibleRows,

    // detalhes
    selected,
    setSelected,
    closeDetails,

    // estorno
    reversal,
    setReversal,
    motivo,
    setMotivo,
    saving,
    estornar,
  };
}
