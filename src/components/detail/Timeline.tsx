import type { ReactNode } from "react";

export type TimelineItem = {
  chave: string | number;
  titulo: ReactNode;
  descricao?: ReactNode;
  data: string;
  selo?: ReactNode;
};

export function Timeline({
  itens,
  vazio,
}: {
  itens: TimelineItem[];
  vazio: ReactNode;
}) {
  if (!itens.length) {
    return (
      <div className="detail-empty">
        {vazio}
      </div>
    );
  }

  return (
    <ol className="timeline">
      {itens.map((item) => (
        <li key={item.chave}>
          <span
            className="timeline-dot"
            aria-hidden="true"
          />

          <div className="timeline-card">
            <div className="timeline-card-top">
              <strong>{item.titulo}</strong>
              {item.selo}
            </div>

            {item.descricao && (
              <p>{item.descricao}</p>
            )}

            <small>{item.data}</small>
          </div>
        </li>
      ))}
    </ol>
  );
}