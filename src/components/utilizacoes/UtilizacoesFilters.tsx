import { RotateCcw } from "lucide-react";
import { DateField, Field, FilterBar, SearchField, MultiSelect, type SelectOption } from "../ui";
import { statusLabel } from "../../models/formatters";

export type FiltrosUtilizacao = {
  search: string;
  status: string;
  inicio: string;
  fim: string;
  colaborador: string;
  conveniado: string;
  beneficio: string;
};

const STATUS: SelectOption[] = [
  { value: "", label: "Todos os status" },
  ...["PENDENTE", "APROVADA", "REPROVADA", "ESTORNADA", "EXPIRADA", "CANCELADA"].map((value) => ({
    value,
    label: statusLabel(value),
  })),
];

type UtilizacoesFiltersProps = {
  filtros: FiltrosUtilizacao;
  periodoInvalido: boolean;
  colaboradores: SelectOption[];
  conveniados: SelectOption[];
  beneficios: SelectOption[];
  onChange: (campo: keyof FiltrosUtilizacao, valor: string) => void;
  onClear: () => void;
};

export function UtilizacoesFilters({
  filtros,
  periodoInvalido,
  colaboradores,
  conveniados,
  beneficios,
  onChange,
  onClear,
}: UtilizacoesFiltersProps) {
  return (
    <>
      <FilterBar>
        <SearchField
          value={filtros.search}
          onChange={(value) => onChange("search", value)}
          placeholder="Buscar por nome, benefício, parceiro ou número"
        />
        <Field label="Status">
          <MultiSelect
            plural="status"
            value={filtros.status}
            options={STATUS}
            onChange={(value) => onChange("status", value)}
          />
        </Field>
        <Field label="De">
          <DateField
            fimDoPeriodo={filtros.fim}
            value={filtros.inicio}
            onChange={(valor) => onChange("inicio", valor)}
          />
        </Field>
        <Field
          label="Até"
          error={
            periodoInvalido
              ? "A data final deve ser igual ou posterior à inicial."
              : undefined
          }
        >
          <DateField
            inicioDoPeriodo={filtros.inicio}
            value={filtros.fim}
            min={filtros.inicio || undefined}
            onChange={(valor) => onChange("fim", valor)}
          />
        </Field>
      </FilterBar>
      <FilterBar>
        <Field label="Colaborador">
          <MultiSelect
            plural="colaboradores"
            value={filtros.colaborador}
            options={[{ value: "", label: "Todos os colaboradores" }, ...colaboradores]}
            onChange={(value) => onChange("colaborador", value)}
          />
        </Field>
        <Field label="Conveniado">
          <MultiSelect
            plural="conveniados"
            value={filtros.conveniado}
            options={[{ value: "", label: "Todos os conveniados" }, ...conveniados]}
            onChange={(value) => onChange("conveniado", value)}
          />
        </Field>
        <Field label="Benefício ou item">
          <MultiSelect
            plural="benefícios"
            value={filtros.beneficio}
            options={[{ value: "", label: "Todos os benefícios" }, ...beneficios]}
            onChange={(value) => onChange("beneficio", value)}
          />
        </Field>
        <button type="button" className="btn btn-secondary" onClick={onClear}>
          <RotateCcw size={16} /> Limpar filtros
        </button>
      </FilterBar>
    </>
  );
}
