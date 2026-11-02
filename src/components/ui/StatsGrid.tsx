import type { ReactNode } from "react";

export function StatsGrid({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`stats-grid${className ? ` ${className}` : ""}`}>
      {children}
    </div>
  );
}
