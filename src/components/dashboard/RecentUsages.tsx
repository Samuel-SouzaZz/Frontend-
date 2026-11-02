import { Link } from "react-router-dom";
import { ArrowUpRight, Gift } from "lucide-react";
import { Badge } from "../ui";
import { formatDate } from "../../models/formatters";
import type { Utilizacao } from "../../models/types";

type RecentUsagesProps = {
  usos: Utilizacao[];
  beneficio: (uso: Utilizacao) => string | undefined;
  colaborador: (uso: Utilizacao) => string;
  conveniado: (uso: Utilizacao) => string | undefined;
};

export function RecentUsages({
  usos,
  beneficio,
  colaborador,
  conveniado,
}: RecentUsagesProps) {
  return (
    <section className="panel">
      <div className="panel-header">
        <div>
          <span className="eyebrow">HISTÓRICO RECENTE</span>
          <h2>Últimas utilizações</h2>
        </div>
        <Link to="/utilizacoes" className="button-link">
          Ver todas <ArrowUpRight size={15} />
        </Link>
      </div>
      <div className="recent-list">
        {usos.map((uso) => (
          <div className="recent-row" key={uso.id}>
            <span className="recent-icon">
              <Gift size={18} />
            </span>
            <div>
              <strong>{beneficio(uso) ?? "Benefício"}</strong>
              <small>
                {colaborador(uso)} · {conveniado(uso)}
              </small>
            </div>
            <span className="recent-date">
              {formatDate(uso.data_solicitacao)}
            </span>
            <Badge status={uso.status} />
          </div>
        ))}
        {!usos.length && (
          <p className="text-muted">Nenhuma utilização neste período.</p>
        )}
      </div>
    </section>
  );
}
