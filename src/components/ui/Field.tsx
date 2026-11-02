import { useContext, type ReactNode } from "react";
import { FieldContext } from "./fieldContext";
import { ValidationContext } from "./validation";

export function Field({
  label,
  children,
  hint,
  error,
  required = false,
}: {
  label: string;
  children: ReactNode;
  hint?: string;
  error?: string;
  required?: boolean;
}) {
  const invalid = useContext(ValidationContext).includes(label);
  return (
    <FieldContext.Provider value={{ label, required, invalid }}>
      <label
        className={`field ${invalid ? "field-invalid" : ""}`}
        data-field-label={label}
        data-required={required ? "true" : undefined}
      >
        <span>
          {label}
          {required && <em aria-hidden="true"> *</em>}
        </span>
        {children}
        {hint && <small>{hint}</small>}
        {error && <small className="form-error">{error}</small>}
        {invalid && (
          <small className="field-validation-error">
            Preencha ou corrija este campo.
          </small>
        )}
      </label>
    </FieldContext.Provider>
  );
}
