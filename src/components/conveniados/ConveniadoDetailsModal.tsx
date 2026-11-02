import { Pencil } from "lucide-react";
import { Badge, DetailList, Modal, ModalFooter } from "../ui";
import { formatCnpj } from "../../models/formatters";
import type { Conveniado } from "../../models/types";

type ConveniadoDetailsModalProps = {
  conveniado: Conveniado;
  responsavel?: string;
  ofertasAtivas: number;
  utilizacoes: number;
  onClose: () => void;
  onEdit: () => void;
};

export function ConveniadoDetailsModal({
  conveniado,
  responsavel,
  ofertasAtivas,
  utilizacoes,
  onClose,
  onEdit,
}: ConveniadoDetailsModalProps) {
  return (
    <Modal
      title="Detalhes do conveniado"
      description={conveniado.nome_fantasia}
      onClose={onClose}
    >
      <DetailList
        items={[
          { label: "Status", value: <Badge status={conveniado.status} /> },
          { label: "Razão social", value: conveniado.razao_social },
          { label: "CNPJ", value: formatCnpj(conveniado.cnpj) },
          { label: "Categoria", value: conveniado.categoria },
          { label: "Endereço", value: conveniado.endereco },
          {
            label: "Usuário responsável",
            value: responsavel || "Usuário não disponível",
          },
          { label: "Ofertas ativas", value: ofertasAtivas },
          { label: "Registros de utilização", value: utilizacoes },
        ]}
      />
      <ModalFooter>
        <button type="button" className="btn btn-secondary" onClick={onClose}>
          Fechar
        </button>
        <button type="button" className="btn btn-primary" onClick={onEdit}>
          <Pencil size={16} /> Editar cadastro
        </button>
      </ModalFooter>
    </Modal>
  );
}
