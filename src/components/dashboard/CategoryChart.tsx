import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import type { CategoryReportItem } from "../../models/types";

type CategoryChartProps = {
  categories: CategoryReportItem[];
  total: number;
  donut: string;
  colors: string[];
};

export function CategoryChart({
  categories,
  total,
  donut,
  colors,
}: CategoryChartProps) {
  const percentual = (count: number) =>
    total ? Math.round((count / total) * 100) : 0;
  const descricao =
    categories.map((item) => `${item.nome}: ${item.count}`).join(", ") ||
    "nenhuma utilização";
  return (
    <section className="panel">
      <div className="panel-header">
        <div>
          <span className="eyebrow">PREFERÊNCIAS</span>
          <h2>Utilizações por categoria</h2>
        </div>
        <Link to="/relatorios" className="icon-button" aria-label="Abrir relatórios">
          <ArrowUpRight size={19} />
        </Link>
      </div>
      <div className="category-chart">
        <div
          className="category-donut"
          style={{ background: donut }}
          role="img"
          aria-label={`Distribuição de utilizações aprovadas: ${descricao}`}
        >
          <div>
            <strong>{total}</strong>
            <small>Total de utilizações</small>
          </div>
        </div>
        <div className="category-legend">
          {categories.map((item, index) => (
            <div key={item.nome}>
              <i style={{ background: colors[index % colors.length] }} />
              <span>{item.nome}</span>
              <strong>{percentual(item.count)}%</strong>
            </div>
          ))}
        </div>
      </div>
      <p className="chart-caption">
        Categorias dos conveniados · Utilizações aprovadas no período
      </p>
    </section>
  );
}
