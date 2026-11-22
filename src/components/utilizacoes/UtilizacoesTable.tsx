import { Link } from "react-router-dom";
import { Eye, RotateCcw } from "lucide-react";
import { Badge, DataTable, IconAction, RowActions } from "../ui";
import { formatDate, formatMoney } from "../../models/formatters";
import type { Utilizacao } from "../../models/types";
import type { Ordenacao } from "../../hooks/useOrdenacao";
import { referenciaUtilizacao, type DescricaoUtilizacao } from "./descricao";

type UtilizacoesTableProps<T extends Utilizacao> = {
  rows: T[];
  descricao: DescricaoUtilizacao;
  onView: (uso: T) => void;
  onReverse: (uso: T) => void;
  ordenacao: Ordenacao;
};

export function UtilizacoesTable<T extends Utilizacao>({
  rows,
  descricao,
  onView,
  onReverse,
  ordenacao,
}: UtilizacoesTableProps<T>) {
  return (
    <DataTable
      rows={rows}
      getRowKey={(row) => row.id}
      onRowClick={onView}
      rowLabel={(row) => `Abrir utilização ${referenciaUtilizacao(row.id)}`}
      ordenacao={ordenacao}
      columns={[
        {
          key: "data",
          ordenavel: true,
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
          ordenavel: true,
          label: "Colaborador",
          render: (row) => (
            <Link className="cell-title cell-link" to={descricao.links(row).colaborador}>
              {descricao.colaborador(row)}
            </Link>
          ),
        },
        {
          key: "beneficio",
          ordenavel: true,
          label: "Benefício",
          render: (row) => (
            <>
              {descricao.links(row).beneficio ? (
                <Link className="cell-title cell-link" to={descricao.links(row).beneficio ?? ""}>
                  {descricao.beneficio(row)}
                </Link>
              ) : (
                <span className="cell-title">Benefício não encontrado</span>
              )}
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
          ordenavel: true,
          label: "Conveniado",
          render: (row) => {
            const para = descricao.links(row).conveniado;
            const nome = descricao.conveniado(row) ?? "Não encontrado";
            return para ? (
              <Link className="cell-link" to={para}>
                {nome}
              </Link>
            ) : (
              nome
            );
          },
        },
        {
          key: "valor",
          ordenavel: true,
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
