import type { ReactNode } from "react";
import { CircleX, Eye, Pencil } from "lucide-react";
import { Badge, DataTable, IconAction, Pagination, RowActions } from "../ui";
import { formatDate } from "../../models/formatters";
import type { Campanha } from "../../models/types";
import { TIPOS } from "../../viewmodels/useCampanhasVM";
import { encerrada } from "./opcoes";

type IniciativasListProps = {
  title: string;
  icon: ReactNode;
  singular: string;
  plural: string;
  total: number;
  rows: Campanha[];
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  itemCount: (campanhaId: number) => number;
  onView: (item: Campanha) => void;
  onEdit: (item: Campanha) => void;
  onCancel: (item: Campanha) => void;
};

export function IniciativasList({
  title,
  icon,
  singular,
  plural,
  total,
  rows,
  page,
  pageSize,
  onPageChange,
  itemCount,
  onView,
  onEdit,
  onCancel,
}: IniciativasListProps) {
  return (
    <section className="panel campaign-list">
      <div className="panel-header">
        <h2>
          {icon} {title}
        </h2>
        <span className="campaign-count">
          {total} {total === 1 ? singular : plural}
        </span>
      </div>
      <DataTable
        rows={rows}
        getRowKey={(item) => item.id}
        columns={[
          {
            key: "name",
            label: "Título",
            render: (item) => (
              <div>
                <strong className="cell-title">{item.nome}</strong>
                <p className="cell-subtitle">
                  {item.descricao || TIPOS[item.tipo]}
                </p>
              </div>
            ),
          },
          {
            key: "period",
            label: "Período",
            render: (item) => (
              <span>
                {formatDate(item.data_inicio)} a {formatDate(item.data_fim)}
              </span>
            ),
          },
          {
            key: "benefits",
            label: "Benefícios",
            render: (item) => itemCount(item.id),
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
              <RowActions>
                <IconAction
                  icon={Eye}
                  size={16}
                  label={`Ver detalhes de ${item.nome}`}
                  onClick={() => onView(item)}
                />
                <IconAction
                  icon={Pencil}
                  size={16}
                  label={`Editar ${item.nome}`}
                  onClick={() => onEdit(item)}
                />
                {!encerrada(item.status) && (
                  <IconAction
                    icon={CircleX}
                    size={16}
                    danger
                    label={`Cancelar ${item.nome}`}
                    onClick={() => onCancel(item)}
                  />
                )}
              </RowActions>
            ),
          },
        ]}
      />
      <Pagination
        page={page}
        total={total}
        pageSize={pageSize}
        onChange={onPageChange}
      />
    </section>
  );
}
