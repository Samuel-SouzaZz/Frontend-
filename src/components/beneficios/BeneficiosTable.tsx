import { Eye, Link2, Pencil, Power } from "lucide-react";
import { Badge, CellStack, DataTable, IconAction, RowActions } from "../ui";
import type { Beneficio } from "../../models/types";
import { ruleSummary, valueSummary } from "../../viewmodels/useBeneficiosVM";

type BeneficiosTableProps = {
  rows: Beneficio[];
  activeOfferCount: (id: number) => number;
  onView: (item: Beneficio) => void;
  onEdit: (item: Beneficio) => void;
  onManagePartners: (item: Beneficio) => void;
  onDiscontinue: (item: Beneficio) => void;
};

export function BeneficiosTable({
  rows,
  activeOfferCount,
  onView,
  onEdit,
  onManagePartners,
  onDiscontinue,
}: BeneficiosTableProps) {
  return (
    <DataTable
      rows={rows}
      getRowKey={(item) => item.id}
      columns={[
        {
          key: "nome",
          label: "Benefício",
          render: (item) => (
            <CellStack
              title={item.nome}
              subtitle={
                item.tipo_beneficio === "PERCENTUAL"
                  ? "Desconto percentual"
                  : "Valor fixo"
              }
            />
          ),
        },
        {
          key: "valor",
          label: "Condição",
          render: (item) => (
            <span className="cell-title">{valueSummary(item)}</span>
          ),
        },
        {
          key: "renovacao",
          label: "Limite e renovação",
          render: (item) => (
            <div>
              <div>{ruleSummary(item)}</div>
              <div className="cell-subtitle">
                {item.tipo_janela === "CALENDARIO_FIXO"
                  ? "Calendário fixo"
                  : "Janela móvel"}
              </div>
            </div>
          ),
        },
        {
          key: "conveniados",
          label: "Conveniados",
          render: (item) => {
            const total = activeOfferCount(item.id);
            return (
              <button
                type="button"
                className="button-link"
                onClick={() => onManagePartners(item)}
              >
                {total} {total === 1 ? "vinculado" : "vinculados"}
              </button>
            );
          },
        },
        {
          key: "status",
          label: "Status",
          render: (item) => <Badge status={item.status} />,
        },
        {
          key: "acoes",
          label: "Ações",
          render: (item) => (
            <RowActions>
              <IconAction
                icon={Eye}
                title="Visualizar benefício"
                label={`Visualizar ${item.nome}`}
                onClick={() => onView(item)}
              />
              <IconAction
                icon={Pencil}
                title="Editar benefício"
                label={`Editar ${item.nome}`}
                onClick={() => onEdit(item)}
              />
              <IconAction
                icon={Link2}
                title="Gerenciar conveniados"
                label={`Gerenciar conveniados de ${item.nome}`}
                onClick={() => onManagePartners(item)}
              />
              {item.status !== "DESCONTINUADO" && (
                <IconAction
                  icon={Power}
                  title="Descontinuar benefício"
                  label={`Descontinuar ${item.nome}`}
                  onClick={() => onDiscontinue(item)}
                />
              )}
            </RowActions>
          ),
        },
      ]}
    />
  );
}
