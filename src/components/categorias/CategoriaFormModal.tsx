import type { FormEvent } from "react";
import {
  Field,
  FormModal,
  Select,
  type SelectOption,
} from "../ui";

import type {
  CategoriaForm,
} from "../../viewmodels/useCategoriasVM";

const STATUS: SelectOption[] = [
  { value: "ATIVO", label: "Ativa" },
  { value: "INATIVO", label: "Inativa" },
];

type CategoriaFormModalProps = {
  form: CategoriaForm;
  onChange: (form: CategoriaForm) => void;
  editing: boolean;
  submitting: boolean;
  error: string;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onClose: () => void;
};

export function CategoriaFormModal({
  form,
  onChange,
  editing,
  submitting,
  error,
  onSubmit,
  onClose,
}: CategoriaFormModalProps) {
  return (
    <FormModal
      title={editing ? "Editar categoria" : "Nova categoria"}
      description="As categorias aparecem no cadastro do conveniado e nos filtros do aplicativo."
      submitting={submitting}
      submitLabel={
        editing ? "Salvar alterações" : "Cadastrar categoria"
      }
      error={error}
      onSubmit={onSubmit}
      onClose={onClose}
    >
      <Field label="Nome" required>
        <input
          required
          maxLength={60}
          value={form.nome}
          onChange={(event) =>
            onChange({
              ...form,
              nome: event.target.value,
            })
          }
          placeholder="Ex.: Alimentação"
        />
      </Field>

      <Field
        label="Status"
        required
        hint="Categoria inativa some do cadastro, mas continua nos conveniados que já têm."
      >
        <Select
          value={form.status}
          options={STATUS}
          onChange={(value) =>
            onChange({
              ...form,
              status: value as CategoriaForm["status"],
            })
          }
        />
      </Field>
    </FormModal>
  );
}