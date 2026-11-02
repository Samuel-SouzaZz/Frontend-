import { Eye, Gift } from "lucide-react";
import { Badge, DataTable, IconAction } from "../ui";
import { formatMoney } from "../../models/formatters";
import type { Campanha, ItemCampanha } from "../../models/types";

type PromocionaisTableProps = {
  itens: ItemCampanha[];
  campanhas: Campanha[];
  onManage: (item: ItemCampanha) => void;
};

export function PromocionaisTable({
  itens,
  campanhas,
  onManage,
}: PromocionaisTableProps) {
  return (
    <section className="panel promotional-table">
      <div className="panel-header">
        <h2>
          <Gift size={20} /> Benefícios promocionais
        </h2>
      </div>
      <DataTable
        rows={itens}
        getRowKey={(item) => item.id}
        columns={[
          {
            key: "name",
            label: "Benefício",
            render: (item) => <strong className="cell-title">{item.nome}</strong>,
          },
          {
            key: "campaign",
            label: "Campanha / evento",
            render: (item) =>
              campanhas.find((campanha) => campanha.id === item.campanha_id)
                ?.nome,
          },
          {
            key: "value",
            label: "Desconto / condição",
            render: (item) =>
              item.tipo_beneficio === "PERCENTUAL"
                ? `${Number(item.valor)}%`
                : formatMoney(item.valor),
          },
          {
            key: "status",
            label: "Status",
            render: (item) => <Badge status={item.status} />,
          },
          {
            key: "actions",
            label: "Ações",
            render: (item) => (
              <IconAction
                icon={Eye}
                size={16}
                label={`Gerenciar ${item.nome}`}
                onClick={() => onManage(item)}
              />
            ),
          },
        ]}
      />
    </section>
  );
}
