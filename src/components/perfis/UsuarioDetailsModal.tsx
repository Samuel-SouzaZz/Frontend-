import { Pencil } from "lucide-react";
import { Badge, DetailList, Modal, ModalFooter } from "../ui";
import { capitalizeFirstLetter, formatDate } from "../../models/formatters";
import type { Perfil, Usuario } from "../../models/types";
import { scopeLabels } from "../../viewmodels/usePerfisVM";

type UsuarioDetailsModalProps = {
  usuario: Usuario;
  perfil?: Perfil;
  matricula?: string;
  conveniado?: string;
  onClose: () => void;
  onEdit: () => void;
};

export function UsuarioDetailsModal({
  usuario,
  perfil,
  matricula,
  conveniado,
  onClose,
  onEdit,
}: UsuarioDetailsModalProps) {
  return (
    <Modal
      title="Detalhes do usuário"
      description={capitalizeFirstLetter(usuario.nome)}
      onClose={onClose}
    >
      <DetailList
        items={[
          { label: "E-mail", value: usuario.email },
          { label: "Status", value: <Badge status={usuario.status} /> },
          { label: "Perfil", value: perfil?.nome || "Perfil não disponível" },
          {
            label: "Escopo",
            value: perfil ? scopeLabels[perfil.escopo] : "Não disponível",
          },
          { label: "Cadastro", value: formatDate(usuario.data_criacao) },
          { label: "Colaborador vinculado", value: matricula || "Sem vínculo" },
          { label: "Conveniado vinculado", value: conveniado || "Sem vínculo" },
        ]}
      />
      <ModalFooter>
        <button type="button" className="btn btn-secondary" onClick={onClose}>
          Fechar
        </button>
        <button type="button" className="btn btn-primary" onClick={onEdit}>
          <Pencil size={16} /> Editar usuário
        </button>
      </ModalFooter>
    </Modal>
  );
}
