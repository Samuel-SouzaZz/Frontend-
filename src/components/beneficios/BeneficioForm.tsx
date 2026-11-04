import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { InlineForm, PartnerChips, SField, ValueInput } from "../simple/Simple";
import { fraseDaRegra } from "../../models/beneficioDraft";
import type { Beneficio, UnidadeCiclo } from "../../models/types";
import { useBeneficioForm } from "../../viewmodels/useBeneficioForm";

type Frequencia = UnidadeCiclo | "INTERVALO";

const FREQUENCIAS: { value: Frequencia; label: string }[] = [
  { value: "SEMANA", label: "por semana" },
  { value: "MES", label: "por mês" },
  { value: "ANO", label: "por ano" },
  { value: "INTERVALO", label: "a cada…" },
];

export function BeneficioForm({
  beneficio,
  onFechar,
  onSalvo,
  onSujo,
}: {
  beneficio?: Beneficio;
  onFechar: () => void;
  onSalvo: (id: number) => void;
  onSujo?: (sujo: boolean) => void;
}) {
  const vm = useBeneficioForm({ beneficio, aoSalvar: onSalvo });
  const { draft } = vm;
  useEffect(() => {
    onSujo?.(vm.sujo && !vm.enviando);
  }, [vm.sujo, vm.enviando, onSujo]);
  useEffect(() => () => onSujo?.(false), [onSujo]);
  const [descricao, setDescricao] = useState(Boolean(beneficio?.descricao));
  const frequencia: Frequencia = draft.tipo_janela === "JANELA_MOVEL" ? "INTERVALO" : draft.unidade_ciclo;

  function escolherFrequencia(valor: Frequencia) {
    if (valor === "INTERVALO") vm.atualizar({ tipo_janela: "JANELA_MOVEL" });
    else vm.atualizar({ tipo_janela: "CALENDARIO_FIXO", unidade_ciclo: valor });
  }

  return (
    <InlineForm
      titulo={beneficio ? `Editar ${beneficio.nome}` : "Novo benefício"}
      erros={vm.erros}
      enviando={vm.enviando}
      labelSalvar={beneficio ? "Salvar alterações" : "Cadastrar benefício"}
      onCancelar={onFechar}
      onSalvar={() => void vm.salvar()}
    >
      <div className="s-row">
        <SField label="Nome">
          <input
            value={draft.nome}
            maxLength={150}
            placeholder="Ex.: Desconto em farmácia"
            onChange={(event) => vm.atualizar({ nome: event.target.value })}
          />
        </SField>
        <SField label="Quanto vale" largura="medio">
          <ValueInput
            tipo={draft.tipo_beneficio}
            valor={draft.valor}
            onTipo={(tipo_beneficio) => vm.atualizar({ tipo_beneficio })}
            onValor={(valor) => vm.atualizar({ valor })}
          />
        </SField>
      </div>

      <div className="s-section">
        <p className="s-section-title">Quantas vezes cada colaborador pode usar</p>
        <div className="s-sentence">
          <input
            className="s-number"
            inputMode="numeric"
            aria-label="Quantidade de vezes"
            value={draft.quantidade}
            onChange={(event) => vm.atualizar({ quantidade: event.target.value.replace(/\D/g, "") })}
          />
          <span>{Number(draft.quantidade) === 1 ? "vez" : "vezes"}</span>
          <span className="s-toggle" role="radiogroup" aria-label="Com que frequência">
            {FREQUENCIAS.map((opcao) => (
              <button
                key={opcao.value}
                type="button"
                role="radio"
                aria-checked={frequencia === opcao.value}
                className={frequencia === opcao.value ? "is-active" : undefined}
                onClick={() => escolherFrequencia(opcao.value)}
              >
                {opcao.label}
              </button>
            ))}
          </span>
          {frequencia === "INTERVALO" && (
            <>
              <input
                className="s-number"
                inputMode="numeric"
                aria-label="Intervalo"
                value={draft.intervalo_valor}
                onChange={(event) => vm.atualizar({ intervalo_valor: event.target.value.replace(/\D/g, "") })}
              />
              <span className="s-toggle" role="radiogroup" aria-label="Unidade">
                {(["DIA", "MES"] as const).map((unidade) => (
                  <button
                    key={unidade}
                    type="button"
                    role="radio"
                    aria-checked={draft.intervalo_unidade === unidade}
                    className={draft.intervalo_unidade === unidade ? "is-active" : undefined}
                    onClick={() => vm.atualizar({ intervalo_unidade: unidade })}
                  >
                    {unidade === "DIA" ? "dias" : "meses"}
                  </button>
                ))}
              </span>
            </>
          )}
        </div>
        <p className="s-hint">{fraseDaRegra(draft)}</p>
      </div>

      <div className="s-section">
        <p className="s-section-title">Onde o colaborador usa</p>
        <PartnerChips
          conveniados={vm.conveniados}
          selecionados={draft.conveniados}
          onChange={(conveniados) => vm.atualizar({ conveniados })}
        />
      </div>

      {descricao ? (
        <SField label="Descrição (opcional)">
          <input
            value={draft.descricao}
            placeholder="Ex.: Vale para medicamentos e higiene"
            onChange={(event) => vm.atualizar({ descricao: event.target.value })}
          />
        </SField>
      ) : (
        <button type="button" className="s-link-button" onClick={() => setDescricao(true)}>
          <Plus size={15} aria-hidden="true" /> Descrição (opcional)
        </button>
      )}
    </InlineForm>
  );
}
