import { DataTable, EmptyState, Pagination, Panel } from "../ui";
import { formatMoney } from "../../models/formatters";
import type { PartnerReportItem, ReportResult } from "../../models/types";
import { REPORT_PAGE_SIZE } from "../../viewmodels/useRelatoriosVM";
import type { PaginaRelatorio } from "./pagina";
import { ReportBars } from "./ReportBars";

type AbaConveniadosProps = {
  report: ReportResult;
  partnerPage: PaginaRelatorio<PartnerReportItem>;
  onPageChange: (page: number) => void;
};

export function AbaConveniados({
  report,
  partnerPage,
  onPageChange,
}: AbaConveniadosProps) {
  return (
    <>
      <Panel
        title="Parceiros mais utilizados"
        description="Até oito conveniados com mais resgates aprovados no período."
      >
        <ReportBars items={report.partners.slice(0, 8)} tone="green" />
      </Panel>
      <Panel title="Indicadores por conveniado">
        {report.partners.length ? (
          <DataTable
            rows={partnerPage.rows}
            getRowKey={(row) => row.id}
            columns={[
              {
                key: "nome",
                label: "Conveniado",
                render: (row) => (
                  <>
                    <span className="cell-title">{row.nome}</span>
                    <span className="cell-subtitle">{row.categoria}</span>
                  </>
                ),
              },
              {
                key: "count",
                label: "Resgates aprovados",
                render: (row) => row.count,
              },
              {
                key: "participantes",
                label: "Participantes únicos",
                render: (row) => row.participantes,
              },
              {
                key: "valor",
                label: "Valor aplicado",
                render: (row) => formatMoney(row.valor),
              },
              {
                key: "medio",
                label: "Valor médio por resgate",
                render: (row) =>
                  formatMoney(row.count ? row.valor / row.count : 0),
              },
            ]}
          />
        ) : (
          <EmptyState title="Nenhum conveniado cadastrado" />
        )}
        <Pagination
          page={partnerPage.current}
          total={report.partners.length}
          pageSize={REPORT_PAGE_SIZE}
          onChange={onPageChange}
        />
      </Panel>
    </>
  );
}
