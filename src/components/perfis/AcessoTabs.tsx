import type { KeyboardEvent } from "react";
import { Shield, Users } from "lucide-react";

export type AbaAcesso = "perfis" | "usuarios";

const ABAS: { value: AbaAcesso; label: string }[] = [
  { value: "perfis", label: "Perfis de acesso" },
  { value: "usuarios", label: "Usuários" },
];

type AcessoTabsProps = {
  tab: AbaAcesso;
  onChange: (tab: AbaAcesso) => void;
  onKeyDown: (event: KeyboardEvent<HTMLButtonElement>) => void;
};

export function AcessoTabs({ tab, onChange, onKeyDown }: AcessoTabsProps) {
  return (
    <div className="tabs" role="tablist" aria-label="Configurações de acesso">
      {ABAS.map(({ value, label }) => (
        <button
          type="button"
          key={value}
          className={`tab ${tab === value ? "active" : ""}`}
          id={`access-tab-${value}`}
          role="tab"
          aria-selected={tab === value}
          aria-controls={`access-panel-${value}`}
          tabIndex={tab === value ? 0 : -1}
          onClick={() => onChange(value)}
          onKeyDown={onKeyDown}
        >
          {value === "perfis" ? <Shield size={17} /> : <Users size={17} />}
          {label}
        </button>
      ))}
    </div>
  );
}
