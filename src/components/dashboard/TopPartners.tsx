import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import type { PartnerReportItem } from "../../models/types";

export function TopPartners({
  partners,
  total,
}: {
  partners: PartnerReportItem[];
  total: number;
}) {
  return (
    <section className="panel">
      <div className="panel-header">
        <h2>Parceiros mais utilizados</h2>
        <Link className="button-link" to="/conveniados">
          Ver todos <ArrowUpRight size={15} />
        </Link>
      </div>
      <div className="bar-chart">
        {partners.slice(0, 5).map((item, index) => (
          <div className="bar-row" key={item.id}>
            <div>
              <span className={`rank rank-${index}`}>{index + 1}</span>
              <span>{item.nome}</span>
              <strong>{item.count}</strong>
            </div>
            <div className="bar-track">
              <div
                className="bar-fill"
                style={{ width: `${total ? (item.count / total) * 100 : 0}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
