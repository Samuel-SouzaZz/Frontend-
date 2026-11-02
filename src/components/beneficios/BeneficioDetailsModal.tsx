import { Link2, Pencil } from "lucide-react";
import { Badge, DetailList, Modal, ModalFooter } from "../ui";
import { formatDate } from "../../models/formatters";
import type { Beneficio } from "../../models/types";
import { ruleSummary, valueSummary } from "../../viewmodels/useBeneficiosVM";

type BeneficioDetailsModalProps = {
  beneficio: Beneficio;
  activeOfferCount: number;
  onClose: () => void;
  onManagePartners: () => void;
  onEdit: () => void;
};

export function BeneficioDetailsModal({
  beneficio,
  activeOfferCount,
  onClose,
  onManagePartners,
  onEdit,
}: BeneficioDetailsModalProps) {
  const calendarioFixo = beneficio.tipo_janela === "CALENDARIO_FIXO";
  return (
    <Modal
      title="Detalhes do benefício"
      description={beneficio.nome}
      onClose={onClose}
    >
      <DetailList
        items={[
          { label: "Status", value: <Badge status={beneficio.status} /> },
          {
            label: "Descrição",
            value: beneficio.descricao || "Não informada",
          },
          { label: "Condição", value: valueSummary(beneficio) },
          { label: "Limite e renovação", value: ruleSummary(beneficio) },
          {
            label: "Tipo de janela",
            value: calendarioFixo ? "Calendário fixo" : "Janela móvel",
          },
          calendarioFixo
            ? {
                label: "Data de reset",
                value: beneficio.dia_reset
                  ? formatDate(beneficio.dia_reset)
                  : "Não definida",
              }
            : {
                label: "Referência da contagem",
                value:
                  beneficio.referencia_contagem === "ULTIMA_UTILIZACAO"
                    ? "Última utilização"
                    : "Data de admissão do colaborador",
              },
          { label: "Conveniados vinculados", value: activeOfferCount },
        ]}
      />
      <ModalFooter>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={onManagePartners}
        >
          <Link2 size={16} /> Conveniados
        </button>
        <button type="button" className="btn btn-primary" onClick={onEdit}>
          <Pencil size={16} /> Editar benefício
        </button>
      </ModalFooter>
    </Modal>
  );
}
