import { RotateCcw } from "lucide-react";
import { Badge, DetailList, Modal, ModalFooter } from "../ui";
import { formatDate, formatMoney } from "../../models/formatters";
import type { Utilizacao } from "../../models/types";
import {
  canalValidacaoLabel,
  referenciaUtilizacao,
  type DescricaoUtilizacao,
} from "./descricao";

type UtilizacaoDetailsModalProps = {
  uso: Utilizacao;
  descricao: DescricaoUtilizacao;
  onClose: () => void;
  onReverse: () => void;
};

export function UtilizacaoDetailsModal({
  uso,
  descricao,
  onClose,
  onReverse,
}: UtilizacaoDetailsModalProps) {
  return (
    <Modal
      title={`Utilização ${referenciaUtilizacao(uso.id)}`}
      description="Dados registrados no histórico de resgates."
      onClose={onClose}
    >
      <div className="detail-status">
        <Badge status={uso.status} />
      </div>
      <DetailList
        items={[
          { label: "Colaborador", value: descricao.colaborador(uso) },
          {
            label: "Benefício / item",
            value: descricao.beneficio(uso) ?? "Não encontrado",
          },
          {
            label: "Conveniado",
            value: descricao.conveniado(uso) ?? "Não encontrado",
          },
          {
            label: "Solicitado em",
            value: formatDate(uso.data_solicitacao, true),
          },
          {
            label: "Decidido em",
            value: uso.data_confirmacao
              ? formatDate(uso.data_confirmacao, true)
              : "Ainda não decidido",
          },
          {
            label: "Valor aplicado",
            value: formatMoney(Number(uso.valor_aplicado)),
          },
          {
            label: "Canal de validação",
            value: canalValidacaoLabel(uso.canal_validacao),
          },
          { label: "Observações", value: uso.observacoes || "Sem observações" },
        ]}
      />
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
