import { EmptyState } from "../ui";

type ReportBarsProps = {
  items: { nome: string; count: number }[];
  percent?: boolean;
  tone?: "blue" | "green" | "purple" | "amber";
};

const formatar = (valor: number, percent: boolean) =>
  percent
    ? `${valor.toLocaleString("pt-BR", { maximumFractionDigits: 1 })}%`
    : valor.toLocaleString("pt-BR");

export function ReportBars({
  items,
  percent = false,
  tone = "blue",
}: ReportBarsProps) {
  if (!items.length)
    return (
      <EmptyState
        title="Sem dados no período"
        description="Escolha outro intervalo para visualizar os indicadores."
      />
    );
  const max = percent ? 100 : Math.max(1, ...items.map((item) => item.count));
  return (
    <div className="bar-chart">
      {items.map((item, index) => (
        <div className="bar-row" key={`${item.nome}-${index}`}>
          <div className="bar-label">
            <span title={item.nome}>{item.nome}</span>
            <strong>{formatar(item.count, percent)}</strong>
          </div>
          <div className="bar-track">
            <div
              className={`bar-fill ${tone}`}
              style={{ width: `${(item.count / max) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

export const formatPercent = (valor: number) =>
  `${valor.toLocaleString("pt-BR", { maximumFractionDigits: 1 })}%`;
