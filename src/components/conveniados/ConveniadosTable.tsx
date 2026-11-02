import { Eye, Pencil, Power } from "lucide-react";
import { Badge, CellStack, DataTable, IconAction, RowActions } from "../ui";
import { formatCnpj } from "../../models/formatters";
import type { Conveniado } from "../../models/types";

type ConveniadosTableProps = {
  rows: Conveniado[];
  activeOfferCount: (id: number) => number;
  onView: (item: Conveniado) => void;
  onEdit: (item: Conveniado) => void;
  onInactivate: (item: Conveniado) => void;
};

export function ConveniadosTable({
  rows,
  activeOfferCount,
  onView,
  onEdit,
  onInactivate,
}: ConveniadosTableProps) {
  return (
    <DataTable
      rows={rows}
      getRowKey={(item) => item.id}
      columns={[
        {
          key: "nome",
          label: "Conveniado",
          render: (item) => (
            <CellStack title={item.nome_fantasia} subtitle={item.razao_social} />
          ),
        },
        {
          key: "cnpj",
          label: "CNPJ",
          render: (item) => formatCnpj(item.cnpj),
        },
        {
          key: "categoria",
          label: "Categoria",
          render: (item) => item.categoria,
        },
        {
          key: "endereco",
          label: "Endereço",
          render: (item) => (
            <span className="cell-subtitle">{item.endereco}</span>
          ),
        },
        {
          key: "ofertas",
          label: "Ofertas ativas",
          render: (item) => activeOfferCount(item.id),
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
                title="Visualizar conveniado"
                label={`Visualizar ${item.nome_fantasia}`}
                onClick={() => onView(item)}
              />
              <IconAction
                icon={Pencil}
                title="Editar conveniado"
                label={`Editar ${item.nome_fantasia}`}
                onClick={() => onEdit(item)}
              />
              {item.status !== "INATIVO" && (
                <IconAction
                  icon={Power}
                  title="Inativar conveniado"
                  label={`Inativar ${item.nome_fantasia}`}
                  onClick={() => onInactivate(item)}
                />
              )}
            </RowActions>
          ),
        },
      ]}
    />
  );
}
