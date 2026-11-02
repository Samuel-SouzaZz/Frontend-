import { Panel } from "../ui";
import { formatDate, statusLabel } from "../../models/formatters";
import type { ReportResult } from "../../models/types";
import { ReportBars } from "./ReportBars";

type AbaUtilizacoesProps = {
  report: ReportResult;
  inicio: string;
  fim: string;
  statusCounts: Record<string, number>;
};

export function AbaUtilizacoes({
  report,
  inicio,
  fim,
  statusCounts,
}: AbaUtilizacoesProps) {
  return (
    <>
      <div className="chart-grid">
        <Panel
          title="Comparativo de resgates"
          description="Períodos consecutivos com a mesma quantidade de dias."
        >
          <div className="comparison-grid">
            <div className="comparison-card">
              <span>Período selecionado</span>
              <strong>{report.approved.length}</strong>
              <small>
                {formatDate(inicio)} a {formatDate(fim)}
              </small>
            </div>
            <div className="comparison-card muted">
              <span>Período anterior</span>
              <strong>{report.previous.length}</strong>
              <small>
                {formatDate(report.previousStart)} a{" "}
                {formatDate(report.previousEnd)}
              </small>
            </div>
          </div>
          <p className="report-note">
            São contadas apenas utilizações aprovadas. Estornos e reprovações
            não compõem o valor aplicado.
          </p>
        </Panel>
        <Panel
          title="Por categoria de conveniado"
          description="Resgates aprovados por categoria do parceiro."
        >
          <ReportBars items={report.categories} tone="purple" />
        </Panel>
      </div>
      <div className="chart-grid">
        <Panel title="Benefícios mais utilizados">
          <ReportBars items={report.benefits.slice(0, 5)} />
        </Panel>
        <Panel title="Conveniados mais utilizados">
          <ReportBars items={report.partners.slice(0, 5)} tone="green" />
        </Panel>
      </div>
      <Panel
        title="Situação dos registros"
        aside={
          <span className="text-muted">
            {report.filtered.length} solicitações no período
          </span>
        }
      >
        <div className="status-summary">
          {Object.entries(statusCounts).map(([status, count]) => (
            <div key={status}>
              <span>{statusLabel(status)}</span>
              <strong>{count}</strong>
            </div>
          ))}
        </div>
      </Panel>
    </>
  );
}
