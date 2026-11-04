import type { FormEvent } from "react";
import { DateField, Field, FormModal, Select, type SelectOption } from "../ui";
import { capitalizeFirstLetter } from "../../models/formatters";
import type { Usuario } from "../../models/types";
import type { ColaboradorForm } from "../../viewmodels/useColaboradoresVM";
import { ContaNovaCampos } from "../conta/ContaNovaCampos";

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
      <ContaNovaCampos
        modo={form.modo}
        onModo={(modo) => update({ modo })}
        conta={form}
        onConta={update}
        editing={editing}
        podeCriarConta={podeCriarConta}
        contaAtual={contaAtual}
        rotuloNome="Nome completo"
        exemploNome="Ex.: Carla Souza"
        exemploEmail="nome@fcv.org.br"
        tituloDados="Dados de trabalho"
      />
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
