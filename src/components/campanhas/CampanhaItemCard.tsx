import { Link2, Pencil } from "lucide-react";
import { Badge } from "../ui";
import { formatMoney } from "../../models/formatters";
import type {
  Conveniado,
  ItemCampanha,
  OfertaCampanha,
} from "../../models/types";

type CampanhaItemCardProps = {
  item: ItemCampanha;
  ofertas: OfertaCampanha[];
  conveniados: Conveniado[];
  campanhaEncerrada: boolean;
  saving: boolean;
  onEdit: () => void;
  onLinkPartner: () => void;
  onToggleOffer: (oferta: OfertaCampanha) => void;
};

function condicao(item: ItemCampanha) {
  const valor =
    item.tipo_beneficio === "PERCENTUAL"
      ? `${Number(item.valor)}% de desconto`
      : `${formatMoney(Number(item.valor))} de benefício`;
  const limite =
    item.quantidade_maxima_utilizacoes != null
      ? ` · Limite de ${item.quantidade_maxima_utilizacoes} utilizações`
      : " · Sem limite cadastrado";
  return valor + limite;
}

export function CampanhaItemCard({
  item,
  ofertas,
  conveniados,
  campanhaEncerrada,
  saving,
  onEdit,
  onLinkPartner,
  onToggleOffer,
}: CampanhaItemCardProps) {
  return (
    <article className="campaign-item">
      <div className="panel-header">
        <div>
          <h4>{item.nome}</h4>
          <p className="text-muted">{condicao(item)}</p>
        </div>
        <div className="table-actions">
          <Badge status={item.status} />
          <button
            type="button"
            className="icon-button"
            aria-label={`Editar item ${item.nome}`}
            onClick={onEdit}
          >
            <Pencil size={16} />
          </button>
        </div>
      </div>
      <p>{item.descricao}</p>
      <div className="linked-partners">
        {ofertas.map((oferta) => {
          const parceiro = conveniados.find(
            (conveniado) => conveniado.id === oferta.conveniado_id,
          );
          const ativa = oferta.status === "ATIVO";
          const bloqueada =
            !ativa &&
            (parceiro?.status !== "ATIVO" ||
              item.status !== "ATIVO" ||
              campanhaEncerrada);
          return (
            <div className="linked-partner" key={oferta.id}>
              <span>
                {parceiro?.nome_fantasia ||
                  parceiro?.razao_social ||
                  `Conveniado #${oferta.conveniado_id}`}
              </span>
              <Badge status={oferta.status} />
              <button
                type="button"
                className="btn btn-secondary btn-small"
                disabled={saving || bloqueada}
                onClick={() => onToggleOffer(oferta)}
              >
                {ativa ? "Desvincular" : "Reativar"}
              </button>
            </div>
          );
        })}
        {!ofertas.length && (
          <p className="text-muted">Nenhum conveniado vinculado a este item.</p>
        )}
      </div>
      <button
        type="button"
        className="btn btn-secondary btn-small"
        disabled={item.status !== "ATIVO" || campanhaEncerrada}
        onClick={onLinkPartner}
      >
        <Link2 size={15} /> Vincular conveniado
      </button>
    </article>
  );
}
