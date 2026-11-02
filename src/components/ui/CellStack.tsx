import type { ReactNode } from "react";

export function CellStack({
  title,
  subtitle,
}: {
  title: ReactNode;
  subtitle?: ReactNode;
}) {
  return (
    <div>
      <div className="cell-title">{title}</div>
      {subtitle !== undefined && (
        <div className="cell-subtitle">{subtitle}</div>
      )}
    </div>
  );
}
