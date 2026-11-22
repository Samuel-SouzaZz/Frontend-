import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ChevronRight, RotateCcw } from "lucide-react";
import { Badge, Modal, ModalFooter } from "../ui";
import { formatDate, formatMoney, initials } from "../../models/formatters";
import type { Utilizacao } from "../../models/types";
import { canalValidacaoLabel, referenciaUtilizacao, type DescricaoUtilizacao } from "./descricao";

type UtilizacaoDetailsModalProps = {
  uso: Utilizacao;
  descricao: DescricaoUtilizacao;
  onClose: () => void;
  onReverse: () => void;
};

function CartaoLigado({ rotulo, nome, para, vazio }: { rotulo: string; nome: string; para?: string; vazio?: boolean }) {
  const conteudo: ReactNode = (
    <>
      <span className={`uso-avatar${vazio ? " is-vazio" : ""}`} aria-hidden="true">
        {vazio ? "–" : initials(nome)}
      </span>
      <span className="uso-cartao-texto">
        <small>{rotulo}</small>
        <strong>{nome}</strong>
      </span>
      {para && <ChevronRight size={16} className="uso-cartao-seta" aria-hidden="true" />}
    </>
  );
  return para ? (
    <Link to={para} className="uso-cartao is-link">
      {conteudo}
    </Link>
  ) : (
    <div className={`uso-cartao${vazio ? " is-vazio" : ""}`}>{conteudo}</div>
  );
}

export function UtilizacaoDetailsModal({ uso, descricao, onClose, onReverse }: UtilizacaoDetailsModalProps) {
  const links = descricao.links(uso);
  const beneficio = descricao.beneficio(uso) ?? "Benefício não encontrado";
  const validada = Boolean(uso.data_validacao);
  const venceu = uso.status === "EXPIRADA";
  const etapas = [
    { rotulo: "Pedido no app", valor: formatDate(uso.data_solicitacao, true), feita: true },
    {
      rotulo: venceu ? "Prazo venceu" : "Prazo para validar",
      valor: uso.data_expiracao ? formatDate(uso.data_expiracao, true) : "Sem prazo",
      feita: validada || venceu,
      alerta: venceu,
    },
    {
      rotulo: validada ? `Validado · ${canalValidacaoLabel(uso.canal_validacao)}` : "Validação",
      valor: validada && uso.data_validacao ? formatDate(uso.data_validacao, true) : "Ainda não validado",
      feita: validada,
    },
  ];

  return (
    <Modal title={`Utilização ${referenciaUtilizacao(uso.id)}`} description="Dados registrados no histórico de resgates." onClose={onClose}>
      <div className="uso-resumo">
        <div className="uso-resumo-texto">
          {links.beneficio ? (
            <Link to={links.beneficio} className="uso-beneficio">
              {beneficio}
              <ChevronRight size={16} aria-hidden="true" />
            </Link>
          ) : (
            <span className="uso-beneficio">{beneficio}</span>
          )}
          <small>{uso.beneficio_campanha_conveniado_id ? "Item de campanha" : "Benefício regular"}</small>
        </div>
        <div className="uso-resumo-valor">
          <strong>{formatMoney(Number(uso.valor_aplicado))}</strong>
          <Badge status={uso.status} />
        </div>
      </div>

      <div className="uso-cartoes">
        <CartaoLigado rotulo="Colaborador" nome={descricao.colaborador(uso)} para={links.colaborador} />
        <CartaoLigado
          rotulo="Conveniado"
          nome={descricao.conveniado(uso) ?? "Não encontrado"}
          para={links.conveniado}
          vazio={!links.conveniado}
        />
      </div>

      <ol className="uso-linha">
        {etapas.map((etapa) => (
          <li key={etapa.rotulo} className={`${etapa.feita ? "is-feita" : ""}${etapa.alerta ? " is-alerta" : ""}`}>
            <span className="uso-linha-ponto" aria-hidden="true" />
            <span className="uso-linha-rotulo">{etapa.rotulo}</span>
            <span className="uso-linha-valor">{etapa.valor}</span>
          </li>
        ))}
      </ol>

      <dl className="uso-extra">
        <div>
          <dt>Código de validação</dt>
          <dd>{uso.codigo_validacao ? <code className="uso-codigo">{uso.codigo_validacao}</code> : "Não informado"}</dd>
        </div>
        <div>
          <dt>Observações</dt>
          <dd>{uso.observacoes || "Sem observações"}</dd>
        </div>
      </dl>

      <ModalFooter>
        <button type="button" className="btn btn-secondary" onClick={onClose}>
          Fechar
        </button>
        {uso.status === "APROVADA" && (
          <button type="button" className="btn btn-danger" onClick={onReverse}>
            <RotateCcw size={16} /> Estornar utilização
          </button>
        )}
      </ModalFooter>
    </Modal>
  );
}
