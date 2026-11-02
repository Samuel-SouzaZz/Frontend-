import { Field, FilterBar, SearchField, Select } from "../ui";
import { STATUS_OPCOES, TIPO_OPCOES } from "./opcoes";

export type FiltrosCampanha = {
  search: string;
  tipo: string;
  status: string;
  inicio: string;
  fim: string;
};

type CampanhasFiltersProps = {
  filtros: FiltrosCampanha;
  periodoInvalido: boolean;
  onChange: (campo: keyof FiltrosCampanha, valor: string) => void;
};

export function CampanhasFilters({
  filtros,
  periodoInvalido,
  onChange,
}: CampanhasFiltersProps) {
  return (
    <>
      <FilterBar className="campaign-filter-row">
        <SearchField
          value={filtros.search}
          onChange={(value) => onChange("search", value)}
          placeholder="Buscar campanha, descrição ou patrocinador"
        />
        <Field label="Tipo">
          <Select
            value={filtros.tipo}
            options={[{ value: "", label: "Todos os tipos" }, ...TIPO_OPCOES]}
            onChange={(value) => onChange("tipo", value)}
          />
        </Field>
        <Field label="Status">
          <Select
            value={filtros.status}
            options={[{ value: "", label: "Todos os status" }, ...STATUS_OPCOES]}
            onChange={(value) => onChange("status", value)}
          />
        </Field>
      </FilterBar>
      <FilterBar className="campaign-filter-dates">
        <Field label="Vigente a partir de">
          <input
            type="date"
            value={filtros.inicio}
            onChange={(event) => onChange("inicio", event.target.value)}
          />
        </Field>
        <Field
          label="Vigente até"
          error={
            periodoInvalido
              ? "A data final deve ser posterior à inicial."
              : undefined
          }
        >
          <input
            type="date"
            min={filtros.inicio || undefined}
            value={filtros.fim}
            onChange={(event) => onChange("fim", event.target.value)}
          />
        </Field>
        <p className="filter-hint">
          O filtro mostra iniciativas cujo período coincide com as datas
          selecionadas.
        </p>
      </FilterBar>
    </>
  );
}
