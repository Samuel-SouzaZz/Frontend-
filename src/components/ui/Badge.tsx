import { statusLabel } from "../../models/formatters";

export function Badge({ status, label }: { status: string; label?: string }) {
  return (
    <span className={`badge badge-${status.toLowerCase()}`}>
      <span aria-hidden="true" />
      {label ?? statusLabel(status)}
    </span>
  );
}
