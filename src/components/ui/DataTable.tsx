import type { ReactNode } from "react";
import { ArrowDown, ArrowUp, ChevronsUpDown } from "lucide-react";
import type { Ordenacao } from "../../hooks/useOrdenacao";
import { EmptyState } from "./EmptyState";

export type Column<T> = {
  key: string;
  label: ReactNode;
  render: (row: T) => ReactNode;
  ordenavel?: boolean;
};

function CabecalhoOrdenavel({
  coluna,
  label,
  ordenacao,
}: {
  coluna: string;
  label: ReactNode;
  ordenacao: Ordenacao;
}) {
  const ativa = ordenacao.ordem?.coluna === coluna ? ordenacao.ordem : null;
  const Icone = !ativa
    ? ChevronsUpDown
    : ativa.direcao === "asc"
      ? ArrowUp
      : ArrowDown;

  return (
    <th
      scope="col"
      aria-sort={
        !ativa ? "none" : ativa.direcao === "asc" ? "ascending" : "descending"
      }
    >
      <button
        type="button"
        className={`th-sort${ativa ? " is-active" : ""}`}
        onClick={() => ordenacao.alternar(coluna)}
      >
        {label}
        <Icone size={13} strokeWidth={2.4} aria-hidden="true" />
      </button>
    </th>
  );
}

export function DataTable<T>({
  columns,
  rows,
  getRowKey,
  onRowClick,
  rowLabel,
  ordenacao,
}: {
  columns: Column<T>[];
  rows: T[];
  getRowKey: (row: T) => string | number;
  onRowClick?: (row: T) => void;
  rowLabel?: (row: T) => string;
  ordenacao?: Ordenacao;
}) {
  return (
    <div className="table-scroll">
      <table>
        <thead>
          <tr>
            {columns.map((column) =>
              column.ordenavel && ordenacao ? (
                <CabecalhoOrdenavel
                  key={column.key}
                  coluna={column.key}
                  label={column.label}
                  ordenacao={ordenacao}
                />
              ) : (
                <th key={column.key} scope="col">
                  {column.label}
                </th>
              ),
            )}
          </tr>
        </thead>

        <tbody>
          {rows.length ? (
            rows.map((row) => (
              <tr
                key={getRowKey(row)}
                className={onRowClick ? "is-clickable" : undefined}
                tabIndex={onRowClick ? 0 : undefined}
                aria-label={
                  onRowClick && rowLabel
                    ? rowLabel(row)
                    : undefined
                }
                onClick={
                  onRowClick
                    ? (event) => {
                        if (
                          (event.target as HTMLElement).closest(
                            "button, a, input"
                          )
                        ) {
                          return;
                        }

                        onRowClick(row);
                      }
                    : undefined
                }
                onKeyDown={
                  onRowClick
                    ? (event) => {
                        if (
                          event.key === "Enter" &&
                          event.target === event.currentTarget
                        ) {
                          onRowClick(row);
                        }
                      }
                    : undefined
                }
              >
                {columns.map((column) => (
                  <td key={column.key}>
                    {column.render(row)}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={columns.length}>
                <EmptyState
                  title="Nenhum resultado encontrado"
                  description="Tente ajustar a busca ou os filtros."
                />
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
