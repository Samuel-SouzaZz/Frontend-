import { Pencil } from "lucide-react";
import { Badge, DetailList, Modal, ModalFooter } from "../ui";
import { formatDate } from "../../models/formatters";
import type { Colaborador } from "../../models/types";

type ColaboradorDetailsModalProps = {
  colaborador: Colaborador;
  nome: string;
  email?: string;
  utilizacoes: number;
  onClose: () => void;
  onEdit: () => void;
};

export function ColaboradorDetailsModal({
  colaborador,
  nome,
  email,
  utilizacoes,
  onClose,
  onEdit,
}: ColaboradorDetailsModalProps) {
  return (
    <Modal
      title="Detalhes do colaborador"
      description={nome}
      onClose={onClose}
    >
      <DetailList
        items={[
          { label: "Status", value: <Badge status={colaborador.status} /> },
          { label: "Matrícula", value: colaborador.matricula },
          { label: "Setor", value: colaborador.setor },
          { label: "Cargo", value: colaborador.cargo },
          { label: "Admissão", value: formatDate(colaborador.data_admissao) },
          {
            label: "Telefone",
            value: colaborador.telefone || "Não informado",
          },
          { label: "E-mail", value: email || "Usuário não disponível" },
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
