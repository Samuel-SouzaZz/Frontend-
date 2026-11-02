import type { FormEvent } from "react";
import { Field, FormModal, Select, type SelectOption } from "../ui";

export type ItemCampanhaForm = {
  nome: string;
  descricao: string;
  tipo_beneficio: string;
  valor: string;
  quantidade_maxima_utilizacoes: string;
  status: string;
};

const TIPOS: SelectOption[] = [
  { value: "PERCENTUAL", label: "Percentual (%)" },
  { value: "VALOR_FIXO", label: "Valor fixo (R$)" },
];

const STATUS: SelectOption[] = [
  { value: "ATIVO", label: "Ativo" },
  { value: "INATIVO", label: "Inativo" },
];

type ItemCampanhaFormModalProps = {
  campanhaNome: string;
  form: ItemCampanhaForm;
  onChange: (form: ItemCampanhaForm) => void;
  editing: boolean;
  saving: boolean;
  error: string;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onClose: () => void;
};

export function ItemCampanhaFormModal({
  campanhaNome,
  form,
  onChange,
  editing,
  saving,
  error,
  onSubmit,
  onClose,
}: ItemCampanhaFormModalProps) {
  const update = (patch: Partial<ItemCampanhaForm>) =>
    onChange({ ...form, ...patch });
  const percentual = form.tipo_beneficio === "PERCENTUAL";
  return (
    <FormModal
      title={editing ? "Editar item promocional" : "Adicionar item promocional"}
      description={campanhaNome}
      submitting={saving}
      submitLabel="Salvar item"
      submittingLabel="Salvando…"
      error={error}
      onSubmit={onSubmit}
      onClose={onClose}
    >
      <div className="full-width">
        <Field label="Nome do item" required>
          <input
            required
            maxLength={150}
            value={form.nome}
            onChange={(event) => update({ nome: event.target.value })}
          />
        </Field>
      </div>
      <Field label="Tipo de benefício" required>
        <Select
          value={form.tipo_beneficio}
          options={TIPOS}
          onChange={(value) => update({ tipo_beneficio: value })}
        />
      </Field>
      <Field label={percentual ? "Percentual" : "Valor (R$)"} required>
        <input
          type="number"
          required
          min="0.01"
          max={percentual ? 100 : undefined}
          step="0.01"
          value={form.valor}
          onChange={(event) => update({ valor: event.target.value })}
        />
      </Field>
      <Field label="Limite de utilizações" hint="Vazio para não definir limite.">
        <input
          type="number"
          min="1"
          step="1"
          value={form.quantidade_maxima_utilizacoes}
          onChange={(event) =>
            update({ quantidade_maxima_utilizacoes: event.target.value })
          }
        />
      </Field>
      <Field label="Status">
        <Select
          value={form.status}
          options={STATUS}
          onChange={(value) => update({ status: value })}
        />
      </Field>
      <div className="full-width">
        <Field label="Descrição">
          <textarea
            rows={3}
            value={form.descricao}
            onChange={(event) => update({ descricao: event.target.value })}
          />
        </Field>
      </div>
    </FormModal>
  );
}
