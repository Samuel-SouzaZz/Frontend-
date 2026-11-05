import { useMemo, useState } from "react";
import { usePortal } from "./PortalContext";
import { useToast } from "./ToastContext";
import { buildReport } from "../models/reportSelectors";
import { usePagination } from "../hooks/usePagination";
import { useOrdenacao } from "../hooks/useOrdenacao";
import type { Ordenadores } from "../models/ordenacao";
import type {
  BenefitReportItem,
  CampaignReportItem,
  PartnerReportItem,
  PeriodReportItem,
} from "../models/types";
import { canalValidacaoLabel } from "../components/utilizacoes/descricao";
import {
  createDataIndexes,
  colaboradorNomeIndexed,
  beneficioDaUtilizacaoIndexed,
  conveniadoDaUtilizacaoIndexed,
  formatDate,
  statusLabel,
  toLocalDateString,
} from "../models/selectors";

export const REPORT_PAGE_SIZE = 8;

function csvCell(value: unknown) {
  const text = String(value ?? "");
  return `"${(/^[=+\-@\t\r]/.test(text) ? `'${text}` : text).replaceAll('"', '""')}"`;
}

function slicePage<T>(rows: T[], pagination: ReturnType<typeof usePagination>) {
  return {
    current: pagination.page,
    rows: rows.slice(pagination.start, pagination.end),
  };
}

function paginaOrdenada<T>(
  ordenacao: ReturnType<typeof useOrdenacao<T>>,
  pagination: ReturnType<typeof usePagination>,
) {
  return {
    ...slicePage(ordenacao.ordenadas, pagination),
    ordenacao: { ordem: ordenacao.ordem, alternar: ordenacao.alternar },
  };
}

const ORDENAR_BENEFICIOS: Ordenadores<BenefitReportItem> = {
  nome: (row) => row.nome,
  count: (row) => row.count,
  participantes: (row) => row.participantes,
  taxa: (row) => row.taxa,
  valor: (row) => row.valor,
};

const ORDENAR_CONVENIADOS: Ordenadores<PartnerReportItem> = {
  nome: (row) => row.nome,
  count: (row) => row.count,
  participantes: (row) => row.participantes,
  valor: (row) => row.valor,
  medio: (row) => (row.count ? row.valor / row.count : 0),
};

const ORDENAR_PERIODOS: Ordenadores<PeriodReportItem> = {
  mes: (row) => row.key,
  registros: (row) => row.registros,
  count: (row) => row.count,
  participantes: (row) => row.participantes,
  valor: (row) => row.valor,
};

const ORDENAR_CAMPANHAS: Ordenadores<CampaignReportItem> = {
  campanha: (row) => row.nome,
  resgates: (row) => row.count,
  participantes: (row) => row.participantes,
  taxa: (row) => row.taxa,
};

export function useRelatoriosVM() {
  const { data } = usePortal();
  const { notify } = useToast();
  const now = new Date();
  const [inicio, setInicio] = useState(() =>
    toLocalDateString(new Date(now.getFullYear(), now.getMonth(), 1)),
  );
  const [fim, setFim] = useState(() => toLocalDateString(now));
  const [tab, setTab] = useState("utilizacoes");
  const report = useMemo(
    () => buildReport(data, inicio, fim),
    [data, inicio, fim],
  );
  const filterKey = JSON.stringify([inicio, fim, tab]);
  const ordemBeneficios = useOrdenacao(report.benefits, ORDENAR_BENEFICIOS);
  const benefitPagination = usePagination(
    report.benefits.length,
    REPORT_PAGE_SIZE,
    filterKey + ordemBeneficios.chave,
  );
  const ordemConveniados = useOrdenacao(report.partners, ORDENAR_CONVENIADOS);
  const partnerPagination = usePagination(
    report.partners.length,
    REPORT_PAGE_SIZE,
    filterKey + ordemConveniados.chave,
  );
  const ordemPeriodos = useOrdenacao(report.periods, ORDENAR_PERIODOS);
  const periodPagination = usePagination(
    report.periods.length,
    REPORT_PAGE_SIZE,
    filterKey + ordemPeriodos.chave,
  );
  const ordemCampanhas = useOrdenacao(report.campaigns, ORDENAR_CAMPANHAS);
  const campaignPagination = usePagination(
    report.campaigns.length,
    REPORT_PAGE_SIZE,
    filterKey + ordemCampanhas.chave,
  );
  const paginationByTab: Record<
    string,
    ReturnType<typeof usePagination> | undefined
  > = {
    adesao: campaignPagination,
    beneficios: benefitPagination,
    periodo: periodPagination,
    conveniados: partnerPagination,
  };
  const activePagination = paginationByTab[tab];

  const setPage = (value: number) => activePagination?.setPage(value);

  const changeTab = (value: string) => setTab(value);

  const benefitPage = paginaOrdenada(ordemBeneficios, benefitPagination);
  const partnerPage = paginaOrdenada(ordemConveniados, partnerPagination);
  const periodPage = paginaOrdenada(ordemPeriodos, periodPagination);
  const campaignPage = paginaOrdenada(ordemCampanhas, campaignPagination);
  const delta = report.previous.length
    ? ((report.approved.length - report.previous.length) /
        report.previous.length) *
      100
    : null;
  const statusCounts = Object.fromEntries(
    ["APROVADA", "PENDENTE", "REPROVADA", "ESTORNADA"].map((status) => [
      status,
      report.filtered.filter((usage) => usage.status === status).length,
    ]),
  );

  function exportar() {
    const headers = [
      "Registro",
      "Data da solicitação",
      "Colaborador",
      "Benefício ou item",
      "Conveniado",
      "Valor aplicado (R$)",
      "Status",
      "Canal de validação",
      "Observações",
    ];
    const indexes = createDataIndexes(data);
    const rows = report.filtered.map((usage) => [
      usage.id,
      formatDate(usage.data_solicitacao, true),
      colaboradorNomeIndexed(indexes, usage.colaborador_id),
      beneficioDaUtilizacaoIndexed(indexes, usage)?.nome ?? "Não encontrado",
      conveniadoDaUtilizacaoIndexed(indexes, usage)?.nome_fantasia ??
        "Não encontrado",
      Number(usage.valor_aplicado).toFixed(2).replace(".", ","),
      statusLabel(usage.status),
      usage.canal_validacao ? canalValidacaoLabel(usage.canal_validacao) : "",
      usage.observacoes ?? "",
    ]);
    const blob = new Blob(
      [
        "\uFEFF",
        [headers, ...rows]
          .map((row) => row.map(csvCell).join(";"))
          .join("\r\n"),
      ],
      { type: "text/csv;charset=utf-8;" },
    );
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `fcv-utilizacoes-${inicio}-a-${fim}.csv`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    notify(`${report.filtered.length} registros exportados em CSV.`, "success");
  }

  return {
    inicio,
    fim,
    tab,
    setInicio,
    setFim,
    setPage,
    changeTab,
    report,
    delta,
    benefitPage,
    partnerPage,
    periodPage,
    campaignPage,
    statusCounts,
    exportar,
  };
}
