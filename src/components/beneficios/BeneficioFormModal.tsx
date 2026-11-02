import type { FormEvent } from "react";
import { Field, FormModal, Select, type SelectOption } from "../ui";
import type { BeneficioForm } from "../../viewmodels/useBeneficiosVM";

const TIPOS: SelectOption[] = [
  { value: "PERCENTUAL", label: "Desconto percentual" },
  { value: "VALOR_FIXO", label: "Valor fixo" },
];

const STATUS: SelectOption[] = [
  { value: "ATIVO", label: "Ativo" },
  { value: "INATIVO", label: "Inativo" },
  { value: "DESCONTINUADO", label: "Descontinuado" },
];

const JANELAS: SelectOption[] = [
  { value: "CALENDARIO_FIXO", label: "Calendário fixo" },
  { value: "JANELA_MOVEL", label: "Janela móvel" },
];

const CICLOS: SelectOption[] = [
  { value: "SEMANA", label: "Semana" },
  { value: "MES", label: "Mês" },
  { value: "ANO", label: "Ano" },
];

const INTERVALOS: SelectOption[] = [
  { value: "DIA", label: "Dias" },
  { value: "MES", label: "Meses" },
];

const REFERENCIAS: SelectOption[] = [
  { value: "ULTIMA_UTILIZACAO", label: "Última utilização" },
  { value: "DATA_ADMISSAO_COLABORADOR", label: "Data de admissão do colaborador" },
];

type BeneficioFormModalProps = {
  form: BeneficioForm;
  onChange: (form: BeneficioForm) => void;
  editing: boolean;
  submitting: boolean;
  error: string;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onClose: () => void;
};

export function BeneficioFormModal({
  form,
  onChange,
  editing,
  submitting,
  error,
  onSubmit,
  onClose,
}: BeneficioFormModalProps) {
  const update = (patch: Partial<BeneficioForm>) =>
    onChange({ ...form, ...patch });
  const percentual = form.tipo_beneficio === "PERCENTUAL";
  return (
    <FormModal
      title={editing ? "Editar benefício" : "Cadastrar benefício"}
      description="Defina a condição e as regras de concessão usadas pela plataforma."
      wide
      submitting={submitting}
      submitLabel={editing ? "Salvar alterações" : "Cadastrar benefício"}
      error={error}
      onSubmit={onSubmit}
      onClose={onClose}
    >
      <div className="full-width">
        <Field label="Nome do benefício" required>
          <input
            required
            maxLength={150}
            value={form.nome}
            onChange={(event) => update({ nome: event.target.value })}
            placeholder="Ex.: Bem-estar e saúde"
          />
        </Field>
      </div>
      <div className="full-width">
        <Field label="Descrição">
          <textarea
            rows={3}
            value={form.descricao}
            onChange={(event) => update({ descricao: event.target.value })}
            placeholder="Descreva as condições do benefício."
          />
        </Field>
      </div>
      <Field label="Tipo de benefício" required>
        <Select
          value={form.tipo_beneficio}
          options={TIPOS}
          onChange={(value) =>
            update({ tipo_beneficio: value as BeneficioForm["tipo_beneficio"] })
          }
        />
      </Field>
      <Field label={percentual ? "Percentual (%)" : "Valor (R$)"} required>
        <input
          type="number"
          required
          min="0.01"
          max={percentual ? 100 : undefined}
          step="0.01"
          value={form.valor}
          onChange={(event) => update({ valor: event.target.value })}
          placeholder={percentual ? "20" : "50,00"}
        />
      </Field>
      <Field label="Limite de utilizações por ciclo" required>
        <input
          type="number"
          required
          min="1"
          step="1"
          value={form.quantidade_maxima_utilizacoes}
          onChange={(event) =>
            update({ quantidade_maxima_utilizacoes: event.target.value })
          }
        />
      </Field>
      <Field label="Status" required>
        <Select
          value={form.status}
          options={STATUS}
          onChange={(value) =>
            update({ status: value as BeneficioForm["status"] })
          }
        />
      </Field>
      <div className="full-width">
        <Field
          label="Tipo de renovação"
          required
          hint="Calendário fixo usa ciclos definidos. Janela móvel conta um intervalo a partir da referência escolhida."
        >
          <Select
            value={form.tipo_janela}
            options={JANELAS}
            onChange={(value) =>
              update({ tipo_janela: value as BeneficioForm["tipo_janela"] })
            }
          />
        </Field>
      </div>
      {form.tipo_janela === "CALENDARIO_FIXO" ? (
        <>
          <Field label="Unidade do ciclo" required>
            <Select
              value={form.unidade_ciclo}
              options={CICLOS}
              onChange={(value) =>
                update({
                  unidade_ciclo: value as BeneficioForm["unidade_ciclo"],
                })
              }
            />
          </Field>
          <Field
            label="Data de reset"
            hint="Opcional. Data em que o ciclo de utilizações recomeça."
          >
            <input
              type="date"
              value={form.dia_reset}
              onChange={(event) => update({ dia_reset: event.target.value })}
            />
          </Field>
        </>
      ) : (
        <>
          <Field label="Intervalo" required>
            <input
              type="number"
              min="1"
              step="1"
              required
              value={form.intervalo_valor}
              onChange={(event) =>
                update({ intervalo_valor: event.target.value })
              }
            />
          </Field>
          <Field label="Unidade do intervalo" required>
            <Select
              value={form.intervalo_unidade}
              options={INTERVALOS}
              onChange={(value) =>
                update({
                  intervalo_unidade: value as BeneficioForm["intervalo_unidade"],
                })
              }
            />
          </Field>
          <div className="full-width">
            <Field label="Referência de contagem" required>
              <Select
                value={form.referencia_contagem}
                options={REFERENCIAS}
                onChange={(value) =>
                  update({
                    referencia_contagem:
                      value as BeneficioForm["referencia_contagem"],
                  })
                }
              />
            </Field>
          </div>
        </>
      )}
    </FormModal>
  );
}
