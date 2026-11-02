import type { FormEvent } from "react";
import { Field, FormModal, Select, type SelectOption } from "../ui";
import { capitalizeFirstLetter } from "../../models/formatters";
import type { Usuario } from "../../models/types";
import type { ColaboradorForm } from "../../viewmodels/useColaboradoresVM";

const STATUS: SelectOption[] = [
  { value: "ATIVO", label: "Ativo" },
  { value: "AFASTADO", label: "Afastado" },
  { value: "INATIVO", label: "Inativo" },
];

type ColaboradorFormModalProps = {
  form: ColaboradorForm;
  onChange: (form: ColaboradorForm) => void;
  availableUsers: Usuario[];
  editing: boolean;
  submitting: boolean;
  error: string;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onClose: () => void;
};

export function ColaboradorFormModal({
  form,
  onChange,
  availableUsers,
  editing,
  submitting,
  error,
  onSubmit,
  onClose,
}: ColaboradorFormModalProps) {
  const update = (patch: Partial<ColaboradorForm>) =>
    onChange({ ...form, ...patch });
  const semUsuarios = !availableUsers.length;
  return (
    <FormModal
      title={editing ? "Editar colaborador" : "Novo colaborador"}
      description="Vincule uma conta existente e preencha os dados de trabalho."
      wide
      submitting={submitting}
      submitLabel={editing ? "Salvar alterações" : "Cadastrar colaborador"}
      submitDisabled={semUsuarios}
      error={error}
      onSubmit={onSubmit}
      onClose={onClose}
    >
      <Field
        label="Usuário vinculado"
        required
        hint="Selecione uma conta do perfil Colaborador que ainda não possua vínculo."
      >
        <Select
          value={form.usuario_id}
          onChange={(value) => update({ usuario_id: value })}
          placeholder="Selecione o usuário"
          options={[
            { value: "", label: "Selecione o usuário" },
            ...availableUsers.map((user) => ({
              value: String(user.id),
              label: `${capitalizeFirstLetter(user.nome)} · ${user.email}`,
            })),
          ]}
        />
      </Field>
      <Field label="Matrícula" required>
        <input
          required
          maxLength={30}
          value={form.matricula}
          onChange={(event) => update({ matricula: event.target.value })}
          placeholder="Ex.: FCV-0124"
        />
      </Field>
      <Field label="Setor" required>
        <input
          required
          maxLength={100}
          value={form.setor}
          onChange={(event) => update({ setor: event.target.value })}
          placeholder="Ex.: Enfermagem"
        />
      </Field>
      <Field label="Cargo" required>
        <input
          required
          maxLength={100}
          value={form.cargo}
          onChange={(event) => update({ cargo: event.target.value })}
          placeholder="Ex.: Enfermeiro(a)"
        />
      </Field>
      <Field label="Data de admissão" required>
        <input
          type="date"
          required
          value={form.data_admissao}
          onChange={(event) => update({ data_admissao: event.target.value })}
        />
      </Field>
      <Field label="Telefone">
        <input
          type="tel"
          maxLength={20}
          value={form.telefone}
          onChange={(event) =>
            update({
              telefone: event.currentTarget.value.replace(/[^\d+()\s-]/g, ""),
            })
          }
          placeholder="(32) 99999-9999"
        />
      </Field>
      <Field label="Status" required>
        <Select
          value={form.status}
          options={STATUS}
          onChange={(value) =>
            update({ status: value as ColaboradorForm["status"] })
          }
        />
      </Field>
      {semUsuarios && (
        <p className="full-width inline-notice">
          Não há uma conta do perfil Colaborador sem vínculo. Solicite ao
          administrador o cadastro em Perfis e usuários.
        </p>
      )}
    </FormModal>
  );
}
