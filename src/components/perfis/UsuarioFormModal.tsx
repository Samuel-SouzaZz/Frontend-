import type { FormEvent } from "react";
import { Field, FormModal, Select, type SelectOption } from "../ui";
import { capitalizeFirstLetter } from "../../models/formatters";
import { SENHA_MINIMA } from "../../models/rules";
import type { Perfil, Usuario } from "../../models/types";

export type UsuarioForm = {
  nome: string;
  email: string;
  perfil_id: string;
  status: Usuario["status"];
  senha: string;
};

const STATUS: SelectOption[] = [
  { value: "ATIVO", label: "Ativo" },
  { value: "INATIVO", label: "Inativo" },
];

type UsuarioFormModalProps = {
  form: UsuarioForm;
  onChange: (form: UsuarioForm) => void;
  profiles: Perfil[];
  editing: boolean;
  editingSelf: boolean;
  submitting: boolean;
  error: string;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onClose: () => void;
};

export function UsuarioFormModal({
  form,
  onChange,
  profiles,
  editing,
  editingSelf,
  submitting,
  error,
  onSubmit,
  onClose,
}: UsuarioFormModalProps) {
  const update = (patch: Partial<UsuarioForm>) =>
    onChange({ ...form, ...patch });
  return (
    <FormModal
      wide
      title={editing ? "Editar usuário" : "Novo usuário"}
      description="Cadastre a conta e escolha o perfil que define sua visão na plataforma."
      submitting={submitting}
      submitLabel={editing ? "Salvar alterações" : "Cadastrar usuário"}
      submitDisabled={!profiles.length}
      error={error}
      onSubmit={onSubmit}
      onClose={onClose}
    >
      <Field label="Nome completo" required>
        <input
          required
          maxLength={150}
          autoComplete="name"
          value={form.nome}
          onChange={(event) =>
            update({ nome: capitalizeFirstLetter(event.currentTarget.value) })
          }
          placeholder="Nome do usuário"
        />
      </Field>
      <Field label="E-mail" required>
        <input
          type="email"
          required
          maxLength={150}
          autoComplete="email"
          value={form.email}
          onChange={(event) => update({ email: event.currentTarget.value })}
          placeholder="nome@exemplo.com.br"
        />
      </Field>
      <Field label="Perfil de acesso" required>
        <Select
          disabled={editingSelf}
          value={form.perfil_id}
          onChange={(value) => update({ perfil_id: value })}
          placeholder="Selecione o perfil"
          options={[
            { value: "", label: "Selecione o perfil" },
            ...profiles.map((profile) => ({
              value: String(profile.id),
              label: `${profile.nome}${profile.status === "INATIVO" ? " (inativo)" : ""}`,
            })),
          ]}
        />
      </Field>
      <Field label="Status" required>
        <Select
          disabled={editingSelf}
          value={form.status}
          options={STATUS}
          onChange={(value) => update({ status: value as Usuario["status"] })}
        />
      </Field>
      <div className="full-width">
        <Field
          label={editing ? "Nova senha" : "Senha"}
          required={!editing}
          hint={
            editing
              ? `Deixe em branco para manter a senha. Se alterar, use pelo menos ${SENHA_MINIMA} caracteres.`
              : `Use pelo menos ${SENHA_MINIMA} caracteres.`
          }
        >
          <input
            type="password"
            required={!editing}
            minLength={SENHA_MINIMA}
            autoComplete="new-password"
            value={form.senha}
            onChange={(event) =>
              update({ senha: event.currentTarget.value.replace(/^\s+/, "") })
            }
            placeholder={
              editing ? "Preencha somente para alterar" : "Crie a senha de acesso"
            }
          />
        </Field>
      </div>
      {editingSelf && (
        <p className="full-width inline-notice">
          Você está editando sua própria conta. Seu perfil e status ficam
          protegidos durante esta sessão.
        </p>
      )}
    </FormModal>
  );
}
