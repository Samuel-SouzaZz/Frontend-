import { Pencil, Power, Trash2 } from "lucide-react";
import {
  Badge,
  DataTable,
  IconAction,
  RowActions,
} from "../ui";

import type { Categoria } from "../../models/types";

import type {
  ColunaOrdenacaoCategoria,
  OrdenacaoCategoria,
} from "../../viewmodels/useCategoriasVM";

type CategoriasTableProps = {
  rows: Categoria[];
  totalConveniados: (id: number) => number;
  onEdit: (item: Categoria) => void;
  onToggle: (item: Categoria) => void;
  onDelete: (item: Categoria) => void;
  ordenacao: OrdenacaoCategoria;
  onSort: (coluna: ColunaOrdenacaoCategoria) => void;
};

export function CategoriasTable({
  rows,
  totalConveniados,
  onEdit,
  onToggle,
  onDelete,
  ordenacao,
  onSort,
}: CategoriasTableProps) {
  const cabecalho = (
    coluna: ColunaOrdenacaoCategoria,
    texto: string
  ) => (
    <button
      type="button"
      onClick={() => onSort(coluna)}
      aria-label={`Ordenar por ${texto}`}
      style={{
        background: "transparent",
        border: 0,
        padding: 0,
        font: "inherit",
        color: "inherit",
        cursor: "pointer",
      }}
    >
      {texto}{" "}
      {ordenacao?.coluna === coluna
        ? ordenacao.direcao === "asc"
          ? "↑"
          : "↓"
        : "↕"}
    </button>
  );

  return (
    <DataTable<Categoria>
      rows={rows}
      getRowKey={(item) => item.id}
      columns={[
        {
          key: "nome",
          label: cabecalho("nome", "Categoria"),
          render: (item) => (
            <span className="cell-title">{item.nome}</span>
          ),
        },
        {
          key: "conveniados",
          label: cabecalho("conveniados", "Conveniados"),
          render: (item) => totalConveniados(item.id),
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
                icon={Pencil}
                label={`Editar ${item.nome}`}
                title="Editar"
                onClick={() => onEdit(item)}
              />

              <IconAction
                icon={Power}
                label={`${
                  item.status === "ATIVO"
                    ? "Inativar"
                    : "Ativar"
                } ${item.nome}`}
                title={
                  item.status === "ATIVO"
                    ? "Inativar"
                    : "Ativar"
                }
                onClick={() => onToggle(item)}
              />

              {totalConveniados(item.id) === 0 && (
                <IconAction
                  icon={Trash2}
                  label={`Excluir ${item.nome}`}
                  title="Excluir"
                  danger
                  onClick={() => onDelete(item)}
                />
              )}
            </RowActions>
          ),
        },
      ]}
    />
  );
}