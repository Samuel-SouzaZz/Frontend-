import { Eye, RotateCcw } from "lucide-react";
import { Badge, DataTable, IconAction, RowActions } from "../ui";
import { formatDate, formatMoney } from "../../models/formatters";
import type { Utilizacao } from "../../models/types";
import { referenciaUtilizacao, type DescricaoUtilizacao } from "./descricao";

type UtilizacoesTableProps<T extends Utilizacao> = {
  rows: T[];
  descricao: DescricaoUtilizacao;
  onView: (uso: T) => void;
  onReverse: (uso: T) => void;
};

export function UtilizacoesTable<T extends Utilizacao>({
  rows,
  descricao,
  onView,
  onReverse,
}: UtilizacoesTableProps<T>) {
  return (
    <DataTable
      rows={rows}
      getRowKey={(row) => row.id}
      columns={[
        {
          key: "data",
          label: "Data e registro",
          render: (row) => (
            <>
              <span className="cell-title">
                {formatDate(row.data_solicitacao, true)}
              </span>
              <span className="cell-subtitle">
                {referenciaUtilizacao(row.id)}
              </span>
            </>
          ),
        },
        {
          key: "colaborador",
          label: "Colaborador",
          render: (row) => (
            <span className="cell-title">{descricao.colaborador(row)}</span>
          ),
        },
        {
          key: "beneficio",
          label: "Benefício",
          render: (row) => (
            <>
              <span className="cell-title">
                {descricao.beneficio(row) ?? "Benefício não encontrado"}
              </span>
              <span className="cell-subtitle">
                {row.beneficio_campanha_conveniado_id
                  ? "Item de campanha"
                  : "Benefício regular"}
              </span>
            </>
          ),
        },
        {
          key: "parceiro",
          label: "Conveniado",
          render: (row) => descricao.conveniado(row) ?? "Não encontrado",
        },
        {
          key: "valor",
          label: "Valor aplicado",
          render: (row) => formatMoney(Number(row.valor_aplicado)),
        },
        {
          key: "status",
          label: "Status",
          render: (row) => <Badge status={row.status} />,
        },
        {
          key: "acoes",
          label: "Ações",
          render: (row) => (
            <RowActions>
              <IconAction
                icon={Eye}
                title="Ver detalhes"
                label={`Ver utilização ${row.id}`}
                onClick={() => onView(row)}
              />
              {row.status === "APROVADA" && (
                <IconAction
                  icon={RotateCcw}
                  danger
                  title="Estornar"
                  label={`Estornar utilização ${row.id}`}
                  onClick={() => onReverse(row)}
                />
              )}
            </RowActions>
          ),
        },
      ]}
    />
  );
}
