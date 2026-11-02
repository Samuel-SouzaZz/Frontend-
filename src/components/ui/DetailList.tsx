import type { ReactNode } from "react";

export function DetailList({
  items,
}: {
  items: { label: string; value: ReactNode }[];
}) {
  return (
    <dl className="detail-list">
      {items.map((item, index) => (
        <div key={`${item.label}-${index}`}>
          <dt>{item.label}</dt>
          <dd>{item.value ?? "Não informado"}</dd>
        </div>
      ))}
    </dl>
  );
}
