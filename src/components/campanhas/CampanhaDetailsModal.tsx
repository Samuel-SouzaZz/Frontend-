import { Pencil, Plus } from "lucide-react";
import {
  Badge,
  DetailList,
  EmptyState,
  Modal,
  ModalFooter,
} from "../ui";
import { formatDate } from "../../models/formatters";
import type {
  Campanha,
  Conveniado,
  ItemCampanha,
  OfertaCampanha,
  Utilizacao,
} from "../../models/types";
import { TIPOS } from "../../viewmodels/useCampanhasVM";
import { CampanhaItemCard } from "./CampanhaItemCard";
import { encerrada } from "./opcoes";

type CampanhaDetailsModalProps = {
  campanha: Campanha;
  itens: ItemCampanha[];
  ofertas: OfertaCampanha[];
  conveniados: Conveniado[];
  usos: Utilizacao[];
  ultimoParticipante?: string;
  saving: boolean;
  onClose: () => void;
  onEdit: () => void;
  onAddItem: () => void;
  onEditItem: (item: ItemCampanha) => void;
  onLinkPartner: (item: ItemCampanha) => void;
  onToggleOffer: (oferta: OfertaCampanha) => void;
};

export function CampanhaDetailsModal({
  campanha,
  itens,
  ofertas,
  conveniados,
  usos,
  ultimoParticipante,
  saving,
  onClose,
  onEdit,
  onAddItem,
  onEditItem,
  onLinkPartner,
  onToggleOffer,
}: CampanhaDetailsModalProps) {
  const fechada = encerrada(campanha.status);
  const participantes = new Set(usos.map((uso) => uso.colaborador_id)).size;
  return (
    <Modal
      wide
      title={campanha.nome}
      description={TIPOS[campanha.tipo]}
      onClose={onClose}
    >
      <div className="detail-status">
        <Badge status={campanha.status} />
      </div>
      <DetailList
        items={[
          {
            label: "Período",
            value: `${formatDate(campanha.data_inicio)} a ${formatDate(campanha.data_fim)}`,
          },
          { label: "Descrição", value: campanha.descricao || "Não informada" },
          {
            label: "Elegibilidade",
            value: campanha.criterio_elegibilidade || "Não informada",
          },
          {
            label: "Patrocinador",
            value: campanha.patrocinador || "Não informado",
          },
          { label: "Resgates aprovados", value: usos.length },
          { label: "Participantes únicos", value: participantes },
        ]}
      />
      <div className="panel-header detail-section">
        <div>
          <h3>Itens e conveniados</h3>
          <p className="text-muted">
            Defina as condições e os parceiros que oferecem cada item.
          </p>
        </div>
        <button
          type="button"
          className="btn btn-primary btn-small"
          disabled={fechada}
          onClick={onAddItem}
        >
          <Plus size={15} /> Adicionar item
        </button>
      </div>
      {itens.length ? (
        <div className="item-list">
          {itens.map((item) => (
            <CampanhaItemCard
              key={item.id}
              item={item}
              ofertas={ofertas.filter(
                (oferta) => oferta.beneficio_campanha_id === item.id,
              )}
              conveniados={conveniados}
              campanhaEncerrada={fechada}
              saving={saving}
              onEdit={() => onEditItem(item)}
              onLinkPartner={() => onLinkPartner(item)}
              onToggleOffer={onToggleOffer}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          title="Esta iniciativa ainda não tem itens"
          description="Adicione um benefício promocional e vincule os conveniados que o oferecem."
        />
      )}
      {ultimoParticipante && (
        <p className="text-muted detail-section">
          Último participante registrado: {ultimoParticipante}.
        </p>
      )}
      <ModalFooter>
        <button type="button" className="btn btn-secondary" onClick={onClose}>
          Fechar
        </button>
        <button type="button" className="btn btn-primary" onClick={onEdit}>
          <Pencil size={16} /> Editar iniciativa
        </button>
      </ModalFooter>
    </Modal>
  );
}
