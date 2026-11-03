import { DateField, Field, FilterBar } from "../ui";

type ReportPeriodProps = {
  inicio: string;
  fim: string;
  valid: boolean;
  onInicioChange: (value: string) => void;
  onFimChange: (value: string) => void;
};

export function ReportPeriod({
  inicio,
  fim,
  valid,
  onInicioChange,
  onFimChange,
}: ReportPeriodProps) {
  return (
    <section className="panel report-period">
      <div>
        <h2>Período de análise</h2>
        <p className="text-muted">
          O intervalo considera a data da solicitação e o status atual do
          registro.
        </p>
      </div>
      <FilterBar>
        <Field label="De" required>
          <DateField
            fimDoPeriodo={fim}
            value={inicio}
            onChange={(valor) => onInicioChange(valor)}
          />
        </Field>
        <Field
          label="Até"
          required
          error={valid ? undefined : "Informe um período válido."}
        >
          <DateField
            inicioDoPeriodo={inicio}
            min={inicio || undefined}
            value={fim}
            onChange={(valor) => onFimChange(valor)}
          />
        </Field>
      </FilterBar>
    </section>
  );
}
