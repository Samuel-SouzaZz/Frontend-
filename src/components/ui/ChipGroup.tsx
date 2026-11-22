import { useId, type ReactNode } from "react";
import { Check } from "lucide-react";

type ChipOption = { value: number; label: string };

type ChipGroupProps = {
  label: string;
  options: ChipOption[];
  selected: number[];
  onToggle: (value: number) => void;
  required?: boolean;
  hint?: string;
  empty?: ReactNode;
};

export function ChipGroup({ label, options, selected, onToggle, required = false, hint, empty }: ChipGroupProps) {
  const labelId = useId();
  const total = selected.length;
  return (
    <div className="field chip-field full-width">
      <div className="chip-field-head">
        <span id={labelId}>
          {label}
          {required && <em aria-hidden="true"> *</em>}
        </span>
        {options.length > 0 && (
          <small className="chip-count">
            {total === 0 ? "Nenhuma escolhida" : total === 1 ? "1 escolhida" : `${total} escolhidas`}
          </small>
        )}
      </div>
      {options.length > 0 ? (
        <div className="chip-group" role="group" aria-labelledby={labelId}>
          {options.map((option) => {
            const ativo = selected.includes(option.value);
            return (
              <button
                key={option.value}
                type="button"
                className={`chip${ativo ? " is-on" : ""}`}
                aria-pressed={ativo}
                onClick={() => onToggle(option.value)}
              >
                {ativo && <Check size={14} strokeWidth={2.5} aria-hidden="true" />}
                {option.label}
              </button>
            );
          })}
        </div>
      ) : (
        empty
      )}
      {hint && <small>{hint}</small>}
    </div>
  );
}
