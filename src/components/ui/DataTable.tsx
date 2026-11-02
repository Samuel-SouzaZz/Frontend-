import type { ReactNode } from "react";
import { EmptyState } from "./EmptyState";

export type Column<T> = {
  key: string;
  label: ReactNode;
  render: (row: T) => ReactNode;
};

export function DataTable<T>({
  columns,
  rows,
  getRowKey,
}: {
  columns: Column<T>[];
  rows: T[];
  getRowKey: (row: T) => string | number;
}) {
  return (
    <div className="table-scroll">
      <table>
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.key} scope="col">
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length ? (
            rows.map((row) => (
              <tr key={getRowKey(row)}>
                {columns.map((column) => (
                  <td key={column.key}>{column.render(row)}</td>
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
