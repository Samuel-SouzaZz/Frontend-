import type { ReactNode } from "react";

export function SideStats({
  titulo,
  itens,
}: {
  titulo: string;
  itens: { rotulo: string; valor: ReactNode }[];
}) {
  return (
    <div className="summary-card">
      <p className="summary-card-title">{titulo}</p>

      {itens.map((item) => (
        <div className="side-stat" key={item.rotulo}>
          <strong>{item.valor}</strong>
          <span>{item.rotulo}</span>
        </div>
      ))}
    </div>
  );
}