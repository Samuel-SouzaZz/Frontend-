import { DataTable, EmptyState, Pagination, Panel } from "../ui";
import { formatMoney } from "../../models/formatters";
import type { BenefitReportItem, ReportResult } from "../../models/types";
import { REPORT_PAGE_SIZE } from "../../viewmodels/useRelatoriosVM";
import type { PaginaRelatorio } from "./pagina";
import { formatPercent, ReportBars } from "./ReportBars";

type AbaBeneficiosProps = {
  report: ReportResult;
  benefitPage: PaginaRelatorio<BenefitReportItem>;
  onPageChange: (page: number) => void;
};

export function AbaBeneficios({
  report,
  benefitPage,
  onPageChange,
}: AbaBeneficiosProps) {
  const menosUtilizados = [...report.benefits]
    .sort((a, b) => a.count - b.count || a.nome.localeCompare(b.nome))
    .slice(0, 5);
  return (
    <>
      <div className="chart-grid">
        <Panel title="Mais utilizados">
          <ReportBars items={report.benefits.slice(0, 5)} />
        </Panel>
        <Panel
          title="Menos utilizados"
          description="Inclui benefícios sem resgates no período."
        >
          <ReportBars items={menosUtilizados} tone="amber" />
        </Panel>
      </div>
      <Panel
        title="Indicadores por benefício"
        description="Benefícios regulares e itens promocionais do cadastro atual."
      >
        {report.benefits.length ? (
          <DataTable
            rows={benefitPage.rows}
            getRowKey={(row) => row.key}
            columns={[
              {
                key: "nome",
                label: "Benefício",
                render: (row) => (
                  <>
                    <span className="cell-title">{row.nome}</span>
                    <span className="cell-subtitle">{row.origem}</span>
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
                key: "taxa",
                label: "Adesão da base ativa",
                render: (row) => formatPercent(row.taxa),
              },
              {
                key: "valor",
                label: "Valor aplicado",
                render: (row) => formatMoney(row.valor),
              },
            ]}
          />
        ) : (
          <EmptyState title="Nenhum benefício cadastrado" />
        )}
        <Pagination
          page={benefitPage.current}
          total={report.benefits.length}
          pageSize={REPORT_PAGE_SIZE}
          onChange={onPageChange}
        />
        <p className="report-note">
          Adesão por benefício = colaboradores atualmente ativos com resgate
          aprovado do benefício ÷ base atual de colaboradores ativos.
        </p>
      </Panel>
    </>
  );
}
