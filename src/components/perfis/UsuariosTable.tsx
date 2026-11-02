import { Eye, Pencil, Power } from "lucide-react";
import { Badge, CellStack, DataTable, IconAction, RowActions } from "../ui";
import { capitalizeFirstLetter } from "../../models/formatters";
import type { Perfil, Usuario } from "../../models/types";
import { scopeLabels } from "../../viewmodels/usePerfisVM";

type UsuariosTableProps = {
  rows: Usuario[];
  currentUserId?: number;
  profileFor: (id: number) => Perfil | undefined;
  onView: (item: Usuario) => void;
  onEdit: (item: Usuario) => void;
  onInactivate: (item: Usuario) => void;
};

export function UsuariosTable({
  rows,
  currentUserId,
  profileFor,
  onView,
  onEdit,
  onInactivate,
}: UsuariosTableProps) {
  return (
    <DataTable
      rows={rows}
      getRowKey={(item) => item.id}
      columns={[
        {
          key: "nome",
          label: "Usuário",
          render: (item) => (
            <CellStack
              title={`${capitalizeFirstLetter(item.nome)}${item.id === currentUserId ? " · Você" : ""}`}
              subtitle={item.email}
            />
          ),
        },
        {
          key: "perfil",
          label: "Perfil de acesso",
          render: (item) => (
            <span className="cell-title">
              {profileFor(item.perfil_id)?.nome || `Perfil #${item.perfil_id}`}
            </span>
          ),
        },
        {
          key: "escopo",
          label: "Escopo",
          render: (item) => {
            const profile = profileFor(item.perfil_id);
            return profile ? scopeLabels[profile.escopo] : "Não disponível";
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
          render: (item) => {
            const nome = capitalizeFirstLetter(item.nome);
            return (
              <RowActions>
                <IconAction
                  icon={Eye}
                  title="Visualizar usuário"
                  label={`Visualizar usuário ${nome}`}
                  onClick={() => onView(item)}
                />
                <IconAction
                  icon={Pencil}
                  title="Editar usuário"
                  label={`Editar usuário ${nome}`}
                  onClick={() => onEdit(item)}
                />
                {item.status === "ATIVO" && item.id !== currentUserId && (
                  <IconAction
                    icon={Power}
                    title="Inativar usuário"
                    label={`Inativar usuário ${nome}`}
                    onClick={() => onInactivate(item)}
                  />
                )}
              </RowActions>
            );
          },
        },
      ]}
    />
  );
}
