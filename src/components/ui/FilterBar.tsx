import type { ReactNode } from "react";

export function FilterBar({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`filters${className ? ` ${className}` : ""}`}>
      {children}
    </div>
  );
}
