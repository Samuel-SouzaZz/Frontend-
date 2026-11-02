import { Pencil } from "lucide-react";
import { Badge, DetailList, Modal, ModalFooter } from "../ui";
import type { Perfil } from "../../models/types";
import { permissionLabel, scopeLabels } from "../../viewmodels/usePerfisVM";

type PerfilDetailsModalProps = {
  perfil: Perfil;
  usuarios: number;
  onClose: () => void;
  onEdit: () => void;
};

export function PerfilDetailsModal({
  perfil,
  usuarios,
  onClose,
  onEdit,
}: PerfilDetailsModalProps) {
  return (
    <Modal
      title="Detalhes do perfil"
      description={perfil.nome}
      onClose={onClose}
    >
      <DetailList
        items={[
          { label: "Status", value: <Badge status={perfil.status} /> },
          { label: "Escopo", value: scopeLabels[perfil.escopo] },
          { label: "Descrição", value: perfil.descricao || "Não informada" },
          {
            label: "Permissões",
            value: perfil.permissoes?.length
              ? perfil.permissoes.map(permissionLabel).join(", ")
              : "Nenhuma cadastrada",
          },
          { label: "Usuários vinculados", value: usuarios },
        ]}
      />
      <ModalFooter>
        <button type="button" className="btn btn-secondary" onClick={onClose}>
          Fechar
        </button>
        <button type="button" className="btn btn-primary" onClick={onEdit}>
          <Pencil size={16} /> Editar perfil
        </button>
      </ModalFooter>
    </Modal>
  );
}
