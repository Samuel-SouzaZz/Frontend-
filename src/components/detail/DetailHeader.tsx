import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export function DetailHeader({
  voltarPara,
  icone,
  titulo,
  etiquetas,
  detalhes,
  acoes,
}: {
  voltarPara: { to: string; label: string };
  icone: ReactNode;
  titulo: string;
  etiquetas?: ReactNode;
  detalhes?: ReactNode;
  acoes?: ReactNode;
}) {
  return (
    <>
      <Link className="detail-back" to={voltarPara.to}>
        <ArrowLeft size={16} aria-hidden="true" /> {voltarPara.label}
      </Link>

      <header className="detail-header">
        <span className="detail-header-icon" aria-hidden="true">
          {icone}
        </span>

        <div className="detail-header-text">
          <h1>{titulo}</h1>

          {etiquetas && (
            <div className="detail-header-tags">
              {etiquetas}
            </div>
          )}

          {detalhes && <p>{detalhes}</p>}
        </div>

        {acoes && (
          <div className="detail-header-actions">
            {acoes}
          </div>
        )}
      </header>
    </>
  );
}