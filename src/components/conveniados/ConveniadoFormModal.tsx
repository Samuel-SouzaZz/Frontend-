import type { FormEvent } from "react";
import { Field, FormModal, Select, type SelectOption } from "../ui";
import { capitalizeFirstLetter } from "../../models/formatters";
import type { Usuario } from "../../models/types";
import type { ConveniadoForm } from "../../viewmodels/useConveniadosVM";
import { ContaNovaCampos } from "../conta/ContaNovaCampos";

const STATUS: SelectOption[] = [
  { value: "EM_ANALISE", label: "Em análise" },
  { value: "ATIVO", label: "Ativo" },
  { value: "INATIVO", label: "Inativo" },
];

const CNPJ_PATTERN = "(\\D*\\d){14}\\D*";

type ConveniadoFormModalProps = {
  form: ConveniadoForm;
  onChange: (form: ConveniadoForm) => void;
  categories: string[];
  availableUsers: Usuario[];
  podeCriarConta: boolean;
  contaAtual?: Usuario;
  editing: boolean;
  submitting: boolean;
  error: string;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onClose: () => void;
};

export function ConveniadoFormModal({
  form,
  onChange,
  categories,
  availableUsers,
  podeCriarConta,
  contaAtual,
  editing,
  submitting,
  error,
  onSubmit,
  onClose,
}: ConveniadoFormModalProps) {
  const update = (patch: Partial<ConveniadoForm>) =>
    onChange({ ...form, ...patch });
  const semUsuarios = !availableUsers.length;
  const contaNova = !editing && form.modo === "nova";
  return (
    <FormModal
      title={editing ? "Editar conveniado" : "Cadastrar conveniado"}
      description={
        editing
          ? "Atualize os dados do estabelecimento."
          : contaNova
            ? "Crie a conta de acesso do parceiro e os dados do estabelecimento de uma vez."
            : "Vincule uma conta que já existe e preencha os dados do estabelecimento."
      }
      wide
      submitting={submitting}
      submitLabel={editing ? "Salvar alterações" : "Cadastrar conveniado"}
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
        rotuloNome="Nome do responsável"
        exemploNome="Quem vai usar o app no parceiro"
        exemploEmail="contato@parceiro.com"
        tituloDados="Dados do estabelecimento"
      />
      <Field label="Nome fantasia" required>
        <input
          required
          maxLength={150}
          value={form.nome_fantasia}
          onChange={(event) => update({ nome_fantasia: event.target.value })}
          placeholder="Nome do estabelecimento"
        />
      </Field>
      <Field label="Razão social" required>
        <input
          required
          maxLength={150}
          value={form.razao_social}
          onChange={(event) => update({ razao_social: event.target.value })}
          placeholder="Razão social registrada"
        />
      </Field>
      <Field
        label="CNPJ"
        required
        hint="Informe os 14 dígitos, com ou sem pontuação."
      >
        <input
          required
          maxLength={18}
          inputMode="numeric"
          pattern={CNPJ_PATTERN}
          value={form.cnpj}
          onChange={(event) =>
            update({ cnpj: event.currentTarget.value.replace(/[^\d./-]/g, "") })
          }
          placeholder="00.000.000/0000-00"
        />
      </Field>
      <Field label="Categoria" required>
        <input
          required
          maxLength={60}
          list="categorias-conveniados"
          value={form.categoria}
          onChange={(event) => update({ categoria: event.target.value })}
          placeholder="Ex.: Alimentação"
        />
        <datalist id="categorias-conveniados">
          {categories.map((value) => (
            <option key={value} value={value} />
          ))}
        </datalist>
      </Field>
      {!editing && !contaNova && (
        <Field
          label="Usuário responsável"
          required
          hint="Selecione uma conta do perfil Conveniado que ainda não possua vínculo."
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
      <Field label="Status" required>
        <Select
          value={form.status}
          options={STATUS}
          onChange={(value) =>
            update({ status: value as ConveniadoForm["status"] })
          }
        />
      </Field>
      <div className="full-width">
        <Field label="Endereço completo" required>
          <input
            required
            maxLength={255}
            value={form.endereco}
            onChange={(event) => update({ endereco: event.target.value })}
            placeholder="Rua, número, bairro, cidade e estado"
          />
        </Field>
      </div>
      {!editing && !contaNova && semUsuarios && (
        <p className="full-width inline-notice">
          Não há conta do perfil Conveniado sem vínculo.{" "}
          {podeCriarConta
            ? "Use a opção Pessoa nova para criar a conta junto."
            : "Peça ao administrador para cadastrar o parceiro."}
        </p>
      )}
    </FormModal>
  );
}
