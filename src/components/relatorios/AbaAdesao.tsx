import { Info } from "lucide-react";
import { DataTable, EmptyState, Pagination, Panel } from "../ui";
import type { CampaignReportItem, ReportResult } from "../../models/types";
import { REPORT_PAGE_SIZE } from "../../viewmodels/useRelatoriosVM";
import type { PaginaRelatorio } from "./pagina";
import { formatPercent, ReportBars } from "./ReportBars";

type AbaAdesaoProps = {
  report: ReportResult;
  campaignPage: PaginaRelatorio<CampaignReportItem>;
  onPageChange: (page: number) => void;
};

export function AbaAdesao({ report, campaignPage, onPageChange }: AbaAdesaoProps) {
  return (
    <>
      <Panel
        title="Adesão dos colaboradores ativos"
        description={`${report.ativosParticipantes} de ${report.ativos} colaboradores atualmente ativos utilizaram um benefício no período.`}
        aside={
          <strong className="report-highlight">
            {formatPercent(report.taxaAdesao)}
          </strong>
        }
      >
        <ReportBars
          items={[
            {
              nome: "Colaboradores ativos com resgate aprovado",
              count: report.taxaAdesao,
            },
          ]}
          percent
          tone="green"
        />
        <p className="report-note">
          <Info size={16} /> Taxa observada = colaboradores atualmente ativos
          com resgate aprovado ÷ total de colaboradores atualmente ativos. A
          base cadastral é atual e não representa um retrato histórico de
          elegibilidade.
        </p>
      </Panel>
      <Panel
        title="Adesão a campanhas e eventos"
        description="Iniciativas cujo período coincide com o intervalo selecionado."
      >
        {report.campaigns.length ? (
          <DataTable
            rows={campaignPage.rows}
            getRowKey={(row) => row.id}
            columns={[
              {
                key: "campanha",
                label: "Iniciativa",
                render: (row) => <span className="cell-title">{row.nome}</span>,
              },
              {
                key: "resgates",
                label: "Resgates aprovados",
                render: (row) => row.count,
              },
              {
                key: "participantes",
                label: "Participantes únicos",
                render: (row) => row.participantes,
              },
              {
                key: "taxa",
                label: "Adesão da base ativa",
                render: (row) => formatPercent(row.taxa),
              },
            ]}
          />
        ) : (
          <EmptyState
            title="Nenhuma campanha no período"
            description="Selecione um intervalo que coincida com uma iniciativa cadastrada."
          />
        )}
        <Pagination
          page={campaignPage.current}
          total={report.campaigns.length}
          pageSize={REPORT_PAGE_SIZE}
          onChange={onPageChange}
        />
        <p className="report-note">
          A taxa usa a mesma base atual de colaboradores ativos. Os
          participantes únicos incluem todos os colaboradores com resgate
          aprovado da iniciativa.
        </p>
      </Panel>
    </>
  );
}
