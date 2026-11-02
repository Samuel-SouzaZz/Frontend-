import type { ReactNode } from "react";
import {
  ChartNoAxesCombined,
  ClipboardList,
  Gift,
  Handshake,
  Megaphone,
  Settings,
  Users,
} from "lucide-react";

export function PageHeader({
  title,
  description,
  eyebrow = "PORTAL DE GESTÃO",
  actions,
}: {
  title: string;
  description?: string;
  eyebrow?: string;
  actions?: ReactNode;
}) {
  const TitleIcon = title.includes("Colaboradores")
    ? Users
    : title.includes("Benefícios")
      ? Gift
      : title.includes("Conveniados")
        ? Handshake
        : title.includes("Utilizações")
          ? ClipboardList
          : title.includes("Campanhas")
            ? Megaphone
            : title.includes("Relatórios")
              ? ChartNoAxesCombined
              : title.includes("Perfis")
                ? Settings
                : null;
  return (
    <header className="page-heading">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h1 className="page-title">
          {TitleIcon && <TitleIcon size={29} aria-hidden="true" />}
          {title}
        </h1>
        {description && <p className="page-description">{description}</p>}
      </div>
      {actions && <div className="heading-actions">{actions}</div>}
    </header>
  );
}
