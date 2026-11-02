import { Link } from "react-router-dom";
import { ArrowUpRight, Gift } from "lucide-react";

type Item = { key: string; name: string; count: number };

export function LeastUsedBenefits({
  items,
  maximum,
}: {
  items: Item[];
  maximum: number;
}) {
  return (
    <section className="panel">
      <div className="panel-header">
        <h2>Benefícios pouco utilizados</h2>
        <Link className="button-link" to="/relatorios">
          Ver todos <ArrowUpRight size={15} />
        </Link>
      </div>
      <div className="least-benefits">
        {items.map((item, index) => (
          <article key={item.key}>
            <span className={`stat-icon ${index % 2 ? "green" : "purple"}`}>
              <Gift size={22} />
            </span>
            <div>
              <strong>{item.name}</strong>
              <small>{item.count} utilizações aprovadas</small>
              <div className="bar-track">
                <div
                  className={`bar-fill bar-color-${index}`}
                  style={{ width: `${(item.count / maximum) * 100}%` }}
                />
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
