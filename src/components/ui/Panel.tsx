import type { ReactNode } from "react";

type PanelProps = {
  title: ReactNode;
  description?: ReactNode;
  aside?: ReactNode;
  className?: string;
  children?: ReactNode;
};

export function Panel({
  title,
  description,
  aside,
  className,
  children,
}: PanelProps) {
  return (
    <section className={`panel${className ? ` ${className}` : ""}`}>
      <div className="panel-header">
        {description ? (
          <div>
            <h2>{title}</h2>
            <p className="text-muted">{description}</p>
          </div>
        ) : (
          <h2>{title}</h2>
        )}
        {aside}
      </div>
      {children}
    </section>
  );
}
