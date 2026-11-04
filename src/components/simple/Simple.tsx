import { useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { DrawerContext } from "../board/Drawer";
import { Check, ChevronDown, Search } from "lucide-react";
import type { Conveniado, TipoBeneficio } from "../../models/types";

export function SimpleHeader({
  titulo,
  descricao,
  acao,
}: {
  titulo: string;
  descricao: string;
  acao?: ReactNode;
}) {
  return (
    <header className="s-header">
      <div>
        <h1>{titulo}</h1>
        <p>{descricao}</p>
      </div>
      {acao}
    </header>
  );
}

export function SimpleTabs<T extends string>({
  value,
  options,
  onChange,
  children,
}: {
  value: T;
  options: { value: T; label: string; total?: number }[];
  onChange: (value: T) => void;
  children?: ReactNode;
}) {
  return (
    <div className="s-tabs-bar">
      <div className="s-tabs" role="tablist">
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            role="tab"
            aria-selected={option.value === value}
            className={option.value === value ? "is-active" : undefined}
            onClick={() => onChange(option.value)}
          >
            {option.label}
            {option.total !== undefined && <span>{option.total}</span>}
          </button>
        ))}
      </div>
      {children}
    </div>
  );
}

export function SimpleSearch({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <label className="s-search">
      <Search size={16} aria-hidden="true" />
      <input
        type="search"
        value={value}
        placeholder={placeholder}
        aria-label={placeholder}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}

const TOM: Record<string, string> = {
  ATIVA: "verde",
  ATIVO: "verde",
  APROVADA: "verde",
  PLANEJADA: "azul",
  PENDENTE: "amarelo",
  EM_ANALISE: "amarelo",
  INATIVO: "cinza",
  ENCERRADA: "cinza",
  DESCONTINUADO: "cinza",
  ESTORNADA: "cinza",
  CANCELADA: "vermelho",
  REPROVADA: "vermelho",
};

export function StatusDot({ status, label }: { status: string; label: string }) {
  return (
    <span className={`s-status s-status-${TOM[status] ?? "cinza"}`}>
      <span aria-hidden="true" />
      {label}
    </span>
  );
}

export function InlineForm({
  titulo,
  erros,
  enviando,
  labelSalvar,
  onCancelar,
  onSalvar,
  children,
}: {
  titulo: string;
  erros: string[];
  enviando: boolean;
  labelSalvar: string;
  onCancelar: () => void;
  onSalvar: () => void;
  children: ReactNode;
}) {
  const fecharDrawer = useContext(DrawerContext);
  const ref = useRef<HTMLFormElement>(null);
  const avisoRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    ref.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    ref.current?.querySelector<HTMLInputElement>("input:not([type=checkbox]):not([type=radio])")?.focus({
      preventScroll: true,
    });
  }, []);
  useEffect(() => {
    if (!erros.length) return;
    avisoRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    avisoRef.current?.focus({ preventScroll: true });
  }, [erros]);
  return (
    <form
      ref={ref}
      className="s-form"
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        onSalvar();
      }}
    >
      <h2>{titulo}</h2>
      {erros.length > 0 && (
        <div className="s-form-errors" role="alert" tabIndex={-1} ref={avisoRef}>
          <strong>Falta arrumar antes de salvar:</strong>
          {erros.map((erro) => (
            <p key={erro}>{erro}</p>
          ))}
        </div>
      )}
      {children}
      <div className="s-form-actions">
        <button type="button" className="btn btn-secondary" disabled={enviando} onClick={fecharDrawer ?? onCancelar}>
          Cancelar
        </button>
        <button type="submit" className="btn btn-primary" disabled={enviando}>
          {enviando ? "Salvando…" : labelSalvar}
        </button>
      </div>
    </form>
  );
}

export function SField({
  label,
  dica,
  children,
  largura,
}: {
  label: string;
  dica?: string;
  children: ReactNode;
  largura?: "curto" | "medio";
}) {
  return (
    <label className={`s-field${largura ? ` s-field-${largura}` : ""}`}>
      <span>{label}</span>
      {children}
      {dica && <small>{dica}</small>}
    </label>
  );
}

export function ValueInput({
  tipo,
  valor,
  onTipo,
  onValor,
}: {
  tipo: TipoBeneficio;
  valor: string;
  onTipo: (tipo: TipoBeneficio) => void;
  onValor: (valor: string) => void;
}) {
  return (
    <span className="s-value">
      <input
        inputMode="decimal"
        value={valor}
        aria-label="Valor do desconto"
        placeholder={tipo === "PERCENTUAL" ? "15" : "50,00"}
        onChange={(event) => onValor(event.target.value.replace(/[^\d,.]/g, ""))}
      />
      <span className="s-value-toggle" role="radiogroup" aria-label="Tipo de desconto">
        {(["PERCENTUAL", "VALOR_FIXO"] as const).map((opcao) => (
          <button
            key={opcao}
            type="button"
            role="radio"
            aria-checked={tipo === opcao}
            className={tipo === opcao ? "is-active" : undefined}
            onClick={() => onTipo(opcao)}
          >
            {opcao === "PERCENTUAL" ? "%" : "R$"}
          </button>
        ))}
      </span>
    </span>
  );
}

const normalizar = (texto: string) =>
  texto
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLocaleLowerCase("pt-BR");

export function PartnerChips({
  conveniados,
  selecionados,
  onChange,
}: {
  conveniados: Conveniado[];
  selecionados: number[];
  onChange: (ids: number[]) => void;
}) {
  const [busca, setBusca] = useState("");
  const [todos, setTodos] = useState(false);
  const visiveis = conveniados.filter(
    (parceiro) => parceiro.status === "ATIVO" || selecionados.includes(parceiro.id),
  );
  const filtrados = visiveis.filter((parceiro) =>
    normalizar(`${parceiro.nome_fantasia} ${parceiro.categoria}`).includes(normalizar(busca.trim())),
  );
  const limite = 10;
  const mostrados = todos || busca ? filtrados : filtrados.slice(0, limite);
  if (!visiveis.length) return <p className="s-muted">Nenhum parceiro ativo cadastrado.</p>;
  return (
    <div className="s-chips-wrap">
      {visiveis.length > limite && (
        <input
          className="s-chips-search"
          type="search"
          value={busca}
          placeholder="Buscar parceiro"
          aria-label="Buscar parceiro"
          onChange={(event) => setBusca(event.target.value)}
        />
      )}
      <div className="s-chips" role="group" aria-label="Parceiros">
        {mostrados.map((parceiro) => {
          const marcado = selecionados.includes(parceiro.id);
          return (
            <button
              key={parceiro.id}
              type="button"
              aria-pressed={marcado}
              className={marcado ? "is-active" : undefined}
              onClick={() =>
                onChange(
                  marcado ? selecionados.filter((id) => id !== parceiro.id) : [...selecionados, parceiro.id],
                )
              }
            >
              {marcado && <Check size={13} aria-hidden="true" />}
              {parceiro.nome_fantasia || parceiro.razao_social}
            </button>
          );
        })}
        {!busca && !todos && filtrados.length > limite && (
          <button type="button" className="s-chips-more" onClick={() => setTodos(true)}>
            mais {filtrados.length - limite} <ChevronDown size={13} aria-hidden="true" />
          </button>
        )}
      </div>
    </div>
  );
}

export function SimpleEmpty({ titulo, texto, acao }: { titulo: string; texto: string; acao?: ReactNode }) {
  return (
    <div className="s-empty">
      <strong>{titulo}</strong>
      <p>{texto}</p>
      {acao}
    </div>
  );
}
