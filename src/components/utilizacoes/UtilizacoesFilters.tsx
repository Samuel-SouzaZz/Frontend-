import { RotateCcw } from "lucide-react";
import { Field, FilterBar, SearchField, Select, type SelectOption } from "../ui";
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
  ...["PENDENTE", "APROVADA", "REPROVADA", "ESTORNADA"].map((value) => ({
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
          <Select
            value={filtros.status}
            options={STATUS}
            onChange={(value) => onChange("status", value)}
          />
        </Field>
        <Field label="De">
          <input
            type="date"
            value={filtros.inicio}
            onChange={(event) => onChange("inicio", event.target.value)}
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
          <input
            type="date"
            value={filtros.fim}
            min={filtros.inicio || undefined}
            onChange={(event) => onChange("fim", event.target.value)}
          />
        </Field>
      </FilterBar>
      <FilterBar>
        <Field label="Colaborador">
          <Select
            value={filtros.colaborador}
            options={[{ value: "", label: "Todos os colaboradores" }, ...colaboradores]}
            onChange={(value) => onChange("colaborador", value)}
          />
        </Field>
        <Field label="Conveniado">
          <Select
            value={filtros.conveniado}
            options={[{ value: "", label: "Todos os conveniados" }, ...conveniados]}
            onChange={(value) => onChange("conveniado", value)}
          />
        </Field>
        <Field label="Benefício ou item">
          <Select
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
