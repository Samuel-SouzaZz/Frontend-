import type { FormEvent } from "react";
import { Field, FormModal, Select, type SelectOption } from "../ui";
import type { Escopo, Perfil } from "../../models/types";
import {
  permissionLabel,
  permissions,
  scopeLabels,
} from "../../viewmodels/usePerfisVM";

export type PerfilForm = {
  nome: string;
  escopo: Escopo;
  descricao: string;
  permissoes: string[];
  status: Perfil["status"];
};

const ESCOPOS: SelectOption[] = Object.entries(scopeLabels).map(
  ([value, label]) => ({ value, label }),
);

const STATUS: SelectOption[] = [
  { value: "ATIVO", label: "Ativo" },
  { value: "INATIVO", label: "Inativo" },
];

const conhecida = (value: string) =>
  permissions.some((item) => item.value === value);

type PerfilFormModalProps = {
  form: PerfilForm;
  onChange: (form: PerfilForm) => void;
  editing: boolean;
  protegido: boolean;
  submitting: boolean;
  error: string;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onClose: () => void;
};

export function PerfilFormModal({
  form,
  onChange,
  editing,
  protegido,
  submitting,
  error,
  onSubmit,
  onClose,
}: PerfilFormModalProps) {
  const update = (patch: Partial<PerfilForm>) => onChange({ ...form, ...patch });
  const extras = form.permissoes.filter((value) => !conhecida(value));
  const alternar = (value: string, marcado: boolean) =>
    update({
      permissoes: marcado
        ? [...form.permissoes, value]
        : form.permissoes.filter((item) => item !== value),
    });
  return (
    <FormModal
      wide
      title={editing ? "Editar perfil" : "Novo perfil de acesso"}
      description="Defina o escopo e as permissões do perfil."
      submitting={submitting}
      submitLabel={editing ? "Salvar alterações" : "Cadastrar perfil"}
      error={error}
      onSubmit={onSubmit}
      onClose={onClose}
    >
      {protegido && (
        <p className="full-width inline-notice">
          O perfil administrador é protegido. Nome, escopo, permissões e status
          são mantidos para preservar o acesso à gestão.
        </p>
      )}
      <Field label="Nome do perfil" required>
        <input
          required
          maxLength={50}
          disabled={protegido}
          value={form.nome}
          onChange={(event) => update({ nome: event.target.value })}
          placeholder="Ex.: FCV_RELATORIOS"
        />
      </Field>
      <Field label="Escopo de acesso" required>
        <Select
          disabled={protegido}
          value={form.escopo}
          options={ESCOPOS}
          onChange={(value) => update({ escopo: value as Escopo })}
        />
      </Field>
      <div className="full-width">
        <Field label="Descrição">
          <textarea
            rows={2}
            maxLength={255}
            value={form.descricao}
            onChange={(event) => update({ descricao: event.target.value })}
            placeholder="Descreva a finalidade deste perfil."
          />
        </Field>
      </div>
      <fieldset className="permissions-fieldset full-width">
        <legend>Permissões</legend>
        <div className="permissions-grid">
          {permissions.map((item) => (
            <label className="permission-option" key={item.value}>
              <input
                type="checkbox"
                disabled={protegido}
                checked={form.permissoes.includes(item.value)}
                onChange={(event) => alternar(item.value, event.target.checked)}
              />
              <span>{item.label}</span>
            </label>
          ))}
        </div>
        {extras.length > 0 && (
          <p className="text-muted">
            Permissões existentes do aplicativo, mantidas neste cadastro:{" "}
            {extras.map(permissionLabel).join(", ")}.
          </p>
        )}
      </fieldset>
      <Field label="Status" required>
        <Select
          disabled={protegido}
          value={form.status}
          options={STATUS}
          onChange={(value) => update({ status: value as Perfil["status"] })}
        />
      </Field>
    </FormModal>
  );
}
