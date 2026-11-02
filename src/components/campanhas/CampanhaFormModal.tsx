import type { FormEvent } from "react";
import { Field, FormModal, Select } from "../ui";
import { STATUS_OPCOES, TIPO_OPCOES } from "./opcoes";

export type CampanhaForm = {
  nome: string;
  tipo: string;
  descricao: string;
  data_inicio: string;
  data_fim: string;
  criterio_elegibilidade: string;
  patrocinador: string;
  status: string;
};

type CampanhaFormModalProps = {
  form: CampanhaForm;
  onChange: (form: CampanhaForm) => void;
  editing: boolean;
  saving: boolean;
  error: string;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onClose: () => void;
};

export function CampanhaFormModal({
  form,
  onChange,
  editing,
  saving,
  error,
  onSubmit,
  onClose,
}: CampanhaFormModalProps) {
  const update = (patch: Partial<CampanhaForm>) =>
    onChange({ ...form, ...patch });
  return (
    <FormModal
      wide
      title={editing ? "Editar campanha ou evento" : "Nova campanha ou evento"}
      description="Informe os dados da iniciativa e seu período de vigência."
      submitting={saving}
      submitLabel={editing ? "Salvar alterações" : "Cadastrar iniciativa"}
      submittingLabel="Salvando…"
      error={error}
      onSubmit={onSubmit}
      onClose={onClose}
    >
      <Field label="Nome" required>
        <input
          required
          maxLength={150}
          value={form.nome}
          onChange={(event) => update({ nome: event.target.value })}
        />
      </Field>
      <Field label="Tipo" required>
        <Select
          value={form.tipo}
          options={TIPO_OPCOES}
          onChange={(value) => update({ tipo: value })}
        />
      </Field>
      <Field label="Data de início" required>
        <input
          required
          type="date"
          value={form.data_inicio}
          onChange={(event) => update({ data_inicio: event.target.value })}
        />
      </Field>
      <Field label="Data de término" required>
        <input
          required
          type="date"
          min={form.data_inicio || undefined}
          value={form.data_fim}
          onChange={(event) => update({ data_fim: event.target.value })}
        />
      </Field>
      <Field label="Status" required>
        <Select
          value={form.status}
          options={STATUS_OPCOES}
          onChange={(value) => update({ status: value })}
        />
      </Field>
      <Field label="Patrocinador">
        <input
          maxLength={150}
          value={form.patrocinador}
          onChange={(event) => update({ patrocinador: event.target.value })}
          placeholder="Opcional"
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
      <div className="full-width">
        <Field
          label="Critérios de elegibilidade"
          hint="Descreva quem pode participar da iniciativa."
        >
          <textarea
            rows={2}
            value={form.criterio_elegibilidade}
            onChange={(event) =>
              update({ criterio_elegibilidade: event.target.value })
            }
          />
        </Field>
      </div>
    </FormModal>
  );
}
