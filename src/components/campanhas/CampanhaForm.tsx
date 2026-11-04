import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { DateField } from "../ui";
import { InlineForm, PartnerChips, SField, ValueInput } from "../simple/Simple";
import { duracaoEmDias } from "../../models/campanhaDraft";
import type { Campanha, CampanhaTipo } from "../../models/types";
import { useCampanhaForm } from "../../viewmodels/useCampanhaForm";

const TIPOS: { value: CampanhaTipo; label: string }[] = [
  { value: "CAMPANHA", label: "Campanha" },
  { value: "EVENTO_INTERNO", label: "Evento interno" },
  { value: "EVENTO_PATROCINADO", label: "Evento com patrocínio" },
  { value: "VOUCHER", label: "Voucher" },
  { value: "CORTESIA", label: "Cortesia" },
];

export function CampanhaForm({
  campanha,
  inicio,
  onFechar,
  onSalvo,
  onSujo,
}: {
  campanha?: Campanha;
  inicio?: string;
  onFechar: () => void;
  onSalvo: (id: number) => void;
  onSujo?: (sujo: boolean) => void;
}) {
  const vm = useCampanhaForm({
    campanha,
    tipoInicial: "CAMPANHA",
    inicioSugerido: inicio,
    aoSalvar: onSalvo,
  });
  const { draft } = vm;
  useEffect(() => {
    onSujo?.(vm.sujo && !vm.enviando);
  }, [vm.sujo, vm.enviando, onSujo]);
  useEffect(() => () => onSujo?.(false), [onSujo]);
  const [maisDetalhes, setMaisDetalhes] = useState(
    Boolean(campanha?.descricao || campanha?.criterio_elegibilidade),
  );
  const evento = draft.tipo.startsWith("EVENTO");
  const dias = duracaoEmDias(draft.data_inicio, draft.data_fim);
  const palavra = evento ? "evento" : "campanha";

  return (
    <InlineForm
      titulo={campanha ? `Editar ${campanha.nome}` : "Nova campanha ou evento"}
      erros={vm.erros}
      enviando={vm.enviando}
      labelSalvar={campanha ? "Salvar alterações" : evento ? "Criar evento" : "Criar campanha"}
      onCancelar={onFechar}
      onSalvar={() => void vm.salvar()}
    >
      <div className="s-row">
        <SField label="Nome">
          <input
            value={draft.nome}
            maxLength={150}
            placeholder={evento ? "Ex.: Confraternização de fim de ano" : "Ex.: Novembro Azul"}
            onChange={(event) => vm.atualizar({ nome: event.target.value })}
          />
        </SField>
      </div>
      <div className="s-row">
        <SField label="Tipo">
          <span className="s-toggle" role="radiogroup" aria-label="Tipo">
            {TIPOS.map((tipo) => (
              <button
                key={tipo.value}
                type="button"
                role="radio"
                aria-checked={draft.tipo === tipo.value}
                className={draft.tipo === tipo.value ? "is-active" : undefined}
                onClick={() => vm.atualizar({ tipo: tipo.value })}
              >
                {tipo.label}
              </button>
            ))}
          </span>
        </SField>
      </div>
      <div className="s-row">
        <SField label="Começa em" largura="curto">
          <DateField
            fimDoPeriodo={draft.data_fim}
            value={draft.data_inicio}
            onChange={(valor) => vm.atualizar({ data_inicio: valor })}
          />
        </SField>
        <SField
          label="Termina em"
          largura="curto"
          dica={dias ? `${dias === 1 ? "1 dia" : `${dias} dias`}` : evento ? "Se for um dia só, repita a data." : undefined}
        >
          <DateField
            inicioDoPeriodo={draft.data_inicio}
            value={draft.data_fim}
            min={draft.data_inicio || undefined}
            onChange={(valor) => vm.atualizar({ data_fim: valor })}
          />
        </SField>
        {draft.tipo === "EVENTO_PATROCINADO" && (
          <SField label="Quem patrocina">
            <input
              value={draft.patrocinador}
              maxLength={150}
              placeholder="Ex.: Academia FitLife"
              onChange={(event) => vm.atualizar({ patrocinador: event.target.value })}
            />
          </SField>
        )}
      </div>

      <div className="s-section">
        <p className="s-section-title">
          O que o colaborador ganha
          {evento && <small> (opcional)</small>}
        </p>
        {draft.itens.map((item, indice) => (
          <div key={item.chave} className="s-item">
            <div className="s-item-line">
              <input
                className="s-item-name"
                value={item.nome}
                maxLength={150}
                aria-label={`Nome do benefício ${indice + 1}`}
                placeholder="Ex.: Exame com desconto"
                onChange={(event) => vm.atualizarItem(item.chave, { nome: event.target.value })}
              />
              <ValueInput
                tipo={item.tipo_beneficio}
                valor={item.valor}
                onTipo={(tipo_beneficio) => vm.atualizarItem(item.chave, { tipo_beneficio })}
                onValor={(valor) => vm.atualizarItem(item.chave, { valor })}
              />
              <button
                type="button"
                className="s-icon-button"
                aria-label={`Tirar ${item.nome || `benefício ${indice + 1}`}`}
                title="Tirar"
                onClick={() => vm.removerItem(item.chave)}
              >
                <Trash2 size={16} />
              </button>
            </div>
            <div className="s-item-partners">
              <span>Onde usar:</span>
              <PartnerChips
                conveniados={vm.conveniados}
                selecionados={item.conveniados}
                onChange={(conveniados) => vm.atualizarItem(item.chave, { conveniados })}
              />
            </div>
          </div>
        ))}
        <button type="button" className="s-link-button" onClick={vm.adicionarItem}>
          <Plus size={15} aria-hidden="true" />
          {draft.itens.length ? "Adicionar outro benefício" : "Adicionar benefício"}
        </button>
      </div>

      {maisDetalhes ? (
        <div className="s-row">
          <SField label="Descrição (opcional)">
            <input
              value={draft.descricao}
              placeholder={`Uma frase sobre a ${palavra}`}
              onChange={(event) => vm.atualizar({ descricao: event.target.value })}
            />
          </SField>
          <SField label="Quem pode participar (opcional)">
            <input
              value={draft.criterio_elegibilidade}
              placeholder="Vazio = todos os colaboradores"
              onChange={(event) => vm.atualizar({ criterio_elegibilidade: event.target.value })}
            />
          </SField>
        </div>
      ) : (
        <button type="button" className="s-link-button" onClick={() => setMaisDetalhes(true)}>
          <Plus size={15} aria-hidden="true" /> Descrição e quem pode participar (opcional)
        </button>
      )}
    </InlineForm>
  );
}
