import type { FormEvent } from "react";
import { DateField, Field, FormModal, Select, type SelectOption } from "../ui";
import { capitalizeFirstLetter } from "../../models/formatters";
import { SENHA_MINIMA } from "../../models/rules";
import type { Usuario } from "../../models/types";
import type { ColaboradorForm, ModoConta } from "../../viewmodels/useColaboradoresVM";

const STATUS: SelectOption[] = [
  { value: "ATIVO", label: "Ativo" },
  { value: "AFASTADO", label: "Afastado" },
  { value: "INATIVO", label: "Inativo" },
];

type ColaboradorFormModalProps = {
  form: ColaboradorForm;
  onChange: (form: ColaboradorForm) => void;
  availableUsers: Usuario[];
  podeCriarConta: boolean;
  contaAtual?: Usuario;
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
  podeCriarConta,
  contaAtual,
  editing,
  submitting,
  error,
  onSubmit,
  onClose,
}: ColaboradorFormModalProps) {
  const update = (patch: Partial<ColaboradorForm>) =>
    onChange({ ...form, ...patch });
  const semUsuarios = !availableUsers.length;
  const contaNova = !editing && form.modo === "nova";
  const MODOS: { value: ModoConta; label: string }[] = [
    { value: "nova", label: "Pessoa nova" },
    { value: "existente", label: "Já tem conta" },
  ];
  return (
    <FormModal
      title={editing ? "Editar colaborador" : "Novo colaborador"}
      description={
        editing
          ? "Atualize os dados de trabalho do colaborador."
          : contaNova
            ? "Crie a conta de acesso e os dados de trabalho de uma vez."
            : "Vincule uma conta que já existe e preencha os dados de trabalho."
      }
      wide
      submitting={submitting}
      submitLabel={editing ? "Salvar alterações" : "Cadastrar colaborador"}
      submitDisabled={!editing && !contaNova && semUsuarios}
      error={error}
      onSubmit={onSubmit}
      onClose={onClose}
    >
      {!editing && podeCriarConta && (
        <div className="full-width colab-modo">
          <span className="s-toggle" role="radiogroup" aria-label="Como cadastrar">
            {MODOS.map((modo) => (
              <button
                key={modo.value}
                type="button"
                role="radio"
                aria-checked={form.modo === modo.value}
                className={form.modo === modo.value ? "is-active" : undefined}
                onClick={() => update({ modo: modo.value })}
              >
                {modo.label}
              </button>
            ))}
          </span>
        </div>
      )}
      {editing && contaAtual && (
        <p className="full-width colab-conta">
          Conta de acesso: <strong>{capitalizeFirstLetter(contaAtual.nome)}</strong> · {contaAtual.email}
        </p>
      )}
      {contaNova && (
        <>
          <p className="full-width colab-secao">Conta de acesso</p>
          <Field label="Nome completo" required>
            <input
              required
              maxLength={150}
              autoComplete="off"
              value={form.nome}
              onChange={(event) => update({ nome: event.target.value })}
              placeholder="Ex.: Carla Souza"
            />
          </Field>
          <Field label="E-mail" required>
            <input
              required
              type="email"
              maxLength={150}
              autoComplete="off"
              value={form.email}
              onChange={(event) => update({ email: event.target.value })}
              placeholder="nome@fcv.org.br"
            />
          </Field>
          <Field label="Senha inicial" required hint={`Mínimo de ${SENHA_MINIMA} caracteres. A pessoa usa para entrar no app.`}>
            <input
              required
              type="password"
              minLength={SENHA_MINIMA}
              autoComplete="new-password"
              value={form.senha}
              onChange={(event) => update({ senha: event.target.value })}
            />
          </Field>
          <p className="full-width colab-secao">Dados de trabalho</p>
        </>
      )}
      {!editing && !contaNova && (
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
      )}
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
        <DateField
          required
          value={form.data_admissao}
          onChange={(valor) => update({ data_admissao: valor })}
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
      {!editing && !contaNova && semUsuarios && (
        <p className="full-width inline-notice">
          Não há conta do perfil Colaborador sem vínculo.{" "}
          {podeCriarConta
            ? "Use a opção Pessoa nova para criar a conta junto."
            : "Peça ao administrador para cadastrar a pessoa."}
        </p>
      )}
    </FormModal>
  );
}
