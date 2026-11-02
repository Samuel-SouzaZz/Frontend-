import { Eye, LockKeyhole, Pencil, Power } from "lucide-react";
import { Badge, CellStack, DataTable, IconAction, RowActions } from "../ui";
import type { Perfil } from "../../models/types";
import {
  permissionLabel,
  protectedProfile,
  scopeLabels,
} from "../../viewmodels/usePerfisVM";

type PerfisTableProps = {
  rows: Perfil[];
  userCount: (perfilId: number) => number;
  onView: (item: Perfil) => void;
  onEdit: (item: Perfil) => void;
  onInactivate: (item: Perfil) => void;
};

export function PerfisTable({
  rows,
  userCount,
  onView,
  onEdit,
  onInactivate,
}: PerfisTableProps) {
  return (
    <DataTable
      rows={rows}
      getRowKey={(item) => item.id}
      columns={[
        {
          key: "nome",
          label: "Perfil de acesso",
          render: (item) => (
            <CellStack
              title={item.nome}
              subtitle={item.descricao || "Sem descrição"}
            />
          ),
        },
        {
          key: "escopo",
          label: "Escopo",
          render: (item) => scopeLabels[item.escopo],
        },
        {
          key: "usuarios",
          label: "Usuários vinculados",
          render: (item) => userCount(item.id),
        },
        {
          key: "permissoes",
          label: "Permissões",
          render: (item) => (
            <span className="cell-subtitle">
              {item.permissoes?.length
                ? item.permissoes.map(permissionLabel).join(" · ")
                : "Nenhuma cadastrada"}
            </span>
          ),
        },
        {
          key: "status",
          label: "Status",
          render: (item) => <Badge status={item.status} />,
        },
        {
          key: "acoes",
          label: "Ações",
          render: (item) => {
            const protegido = protectedProfile(item);
            return (
              <RowActions>
                <IconAction
                  icon={Eye}
                  title="Visualizar perfil"
                  label={`Visualizar perfil ${item.nome}`}
                  onClick={() => onView(item)}
                />
                <IconAction
                  icon={Pencil}
                  title="Editar perfil"
                  label={`Editar perfil ${item.nome}`}
                  onClick={() => onEdit(item)}
                />
                {item.status === "ATIVO" && !protegido && (
                  <IconAction
                    icon={Power}
                    title="Inativar perfil"
                    label={`Inativar perfil ${item.nome}`}
                    onClick={() => onInactivate(item)}
                  />
                )}
                {protegido && (
                  <span
                    className="text-muted"
                    title="Perfil administrador protegido"
                  >
                    <LockKeyhole size={16} aria-label="Perfil protegido" />
                  </span>
                )}
              </RowActions>
            );
          },
        },
      ]}
    />
  );
}
