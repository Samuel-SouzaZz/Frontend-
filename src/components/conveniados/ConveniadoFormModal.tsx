import type { FormEvent } from "react";
import { Field, FormModal, Select, type SelectOption } from "../ui";
import { capitalizeFirstLetter } from "../../models/formatters";
import type { Usuario } from "../../models/types";
import type { ConveniadoForm } from "../../viewmodels/useConveniadosVM";

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
  editing,
  submitting,
  error,
  onSubmit,
  onClose,
}: ConveniadoFormModalProps) {
  const update = (patch: Partial<ConveniadoForm>) =>
    onChange({ ...form, ...patch });
  const semUsuarios = !availableUsers.length;
  return (
    <FormModal
      title={editing ? "Editar conveniado" : "Cadastrar conveniado"}
      description="Preencha os dados do estabelecimento e vincule o usuário responsável."
      wide
      submitting={submitting}
      submitLabel={editing ? "Salvar alterações" : "Cadastrar conveniado"}
      submitDisabled={semUsuarios}
      error={error}
      onSubmit={onSubmit}
      onClose={onClose}
    >
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
      {semUsuarios && (
        <p className="full-width inline-notice">
          Não há uma conta do perfil Conveniado sem vínculo. Solicite ao
          administrador o cadastro em Perfis e usuários.
        </p>
      )}
    </FormModal>
  );
}
