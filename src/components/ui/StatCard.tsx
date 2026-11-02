import type { ReactNode } from "react";

export type StatTone = "blue" | "green" | "purple" | "amber";

export function StatCard({
  label,
  value,
  icon,
  detail,
  tone = "blue",
}: {
  label: string;
  value: ReactNode;
  icon?: ReactNode;
  detail?: ReactNode;
  tone?: StatTone;
}) {
  return (
    <article className="stat-card">
      <div className={`stat-icon ${tone}`}>{icon}</div>
      <div className="stat-content">
        <p>{label}</p>
        <strong>{value}</strong>
        {detail && <span>{detail}</span>}
      </div>
    </article>
  );
}
