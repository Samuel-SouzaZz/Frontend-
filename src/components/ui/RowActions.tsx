import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

export function RowActions({ children }: { children: ReactNode }) {
  return <div className="table-actions">{children}</div>;
}

export function IconAction({
  icon: Icon,
  label,
  title,
  onClick,
  danger = false,
  size = 17,
}: {
  icon: LucideIcon;
  label: string;
  title?: string;
  onClick: () => void;
  danger?: boolean;
  size?: number;
}) {
  return (
    <button
      type="button"
      className={`icon-button${danger ? " danger" : ""}`}
      title={title}
      aria-label={label}
      onClick={onClick}
    >
      <Icon size={size} />
    </button>
  );
}
