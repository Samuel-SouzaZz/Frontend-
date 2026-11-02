import { Eye, Pencil, UserMinus } from "lucide-react";
import { Badge, CellStack, DataTable, IconAction, RowActions } from "../ui";
import { formatDate } from "../../models/formatters";
import type { Colaborador } from "../../models/types";

type ColaboradoresTableProps = {
  rows: Colaborador[];
  nomeDe: (item: Colaborador) => string;
  onView: (item: Colaborador) => void;
  onEdit: (item: Colaborador) => void;
  onInactivate: (item: Colaborador) => void;
};

export function ColaboradoresTable({
  rows,
  nomeDe,
  onView,
  onEdit,
  onInactivate,
}: ColaboradoresTableProps) {
  return (
    <DataTable
      rows={rows}
      getRowKey={(item) => item.id}
      columns={[
        {
          key: "nome",
          label: "Colaborador",
          render: (item) => (
            <CellStack title={nomeDe(item)} subtitle={item.cargo} />
          ),
        },
        {
          key: "matricula",
          label: "Matrícula",
          render: (item) => (
            <span className="cell-title">{item.matricula}</span>
          ),
        },
        { key: "setor", label: "Setor", render: (item) => item.setor },
        {
          key: "admissao",
          label: "Admissão",
          render: (item) => formatDate(item.data_admissao),
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
                title="Visualizar colaborador"
                label={`Visualizar ${nomeDe(item)}`}
                onClick={() => onView(item)}
              />
              <IconAction
                icon={Pencil}
                title="Editar colaborador"
                label={`Editar ${nomeDe(item)}`}
                onClick={() => onEdit(item)}
              />
              {item.status !== "INATIVO" && (
                <IconAction
                  icon={UserMinus}
                  title="Inativar colaborador"
                  label={`Inativar ${nomeDe(item)}`}
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
