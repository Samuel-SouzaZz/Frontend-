import { DataTable, EmptyState, Pagination, Panel } from "../ui";
import { formatMoney } from "../../models/formatters";
import type { PeriodReportItem, ReportResult } from "../../models/types";
import { REPORT_PAGE_SIZE } from "../../viewmodels/useRelatoriosVM";
import type { PaginaRelatorio } from "./pagina";
import { ReportBars } from "./ReportBars";

type AbaPeriodoProps = {
  report: ReportResult;
  periodPage: PaginaRelatorio<PeriodReportItem>;
  onPageChange: (page: number) => void;
};

export function AbaPeriodo({ report, periodPage, onPageChange }: AbaPeriodoProps) {
  return (
    <>
      <Panel
        title="Utilizações ao longo do tempo"
        description="Últimos 12 meses com registros dentro do intervalo selecionado."
      >
        <ReportBars items={report.periods.slice(-12)} />
      </Panel>
      <Panel
        title="Dados mensais"
        description="Meses com registros. O primeiro e o último mês podem estar parciais."
      >
        {report.periods.length ? (
          <DataTable
            rows={periodPage.rows}
            getRowKey={(row) => row.key}
            columns={[
              {
                key: "mes",
                label: "Mês",
                render: (row) => <span className="cell-title">{row.nome}</span>,
              },
              {
                key: "registros",
                label: "Solicitações",
                render: (row) => row.registros,
              },
              { key: "count", label: "Aprovadas", render: (row) => row.count },
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
            ]}
          />
        ) : (
          <EmptyState title="Nenhum registro no período" />
        )}
        <Pagination
          page={periodPage.current}
          total={report.periods.length}
          pageSize={REPORT_PAGE_SIZE}
          onChange={onPageChange}
        />
      </Panel>
    </>
  );
}
