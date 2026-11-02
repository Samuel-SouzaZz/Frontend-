import { ClipboardList } from "lucide-react";
import { EmptyState, PageHeader, Pagination } from "../components/ui";
import { EstornoModal } from "../components/utilizacoes/EstornoModal";
import { UtilizacaoDetailsModal } from "../components/utilizacoes/UtilizacaoDetailsModal";
import {
  UtilizacoesFilters,
  type FiltrosUtilizacao,
} from "../components/utilizacoes/UtilizacoesFilters";
import { UtilizacoesStats } from "../components/utilizacoes/UtilizacoesStats";
import { UtilizacoesTable } from "../components/utilizacoes/UtilizacoesTable";
import type { DescricaoUtilizacao } from "../components/utilizacoes/descricao";
import {
  beneficioDaUtilizacao,
  colaboradorNome,
  conveniadoDaUtilizacao,
} from "../models/selectors";
import type { Utilizacao } from "../models/types";
import { useUtilizacoesVM } from "../viewmodels/useUtilizacoesVM";

export default function Utilizacoes() {
  const {
    data,
    PAGE_SIZE,
    search,
    setSearch,
    status,
    setStatus,
    inicio,
    setInicio,
    fim,
    setFim,
    colaborador,
    setColaborador,
    conveniado,
    setConveniado,
    beneficio,
    setBeneficio,
    periodoInvalido,
    limparFiltros,
    rows,
    aprovadas,
    currentPage,
    visibleRows,
    setPage,
    selected,
    setSelected,
    closeDetails,
    reversal,
    setReversal,
    motivo,
    setMotivo,
    saving,
    estornar,
  } = useUtilizacoesVM();

  const descricao: DescricaoUtilizacao = {
    colaborador: (uso) => colaboradorNome(data, uso.colaborador_id),
    beneficio: (uso) => beneficioDaUtilizacao(data, uso)?.nome,
    conveniado: (uso) => {
      const item = conveniadoDaUtilizacao(data, uso);
      return item?.nome_fantasia || item?.razao_social || undefined;
    },
  };

  const filtros: FiltrosUtilizacao = {
    search,
    status,
    inicio,
    fim,
    colaborador,
    conveniado,
    beneficio,
  };

  const setters: Record<keyof FiltrosUtilizacao, (value: string) => void> = {
    search: setSearch,
    status: setStatus,
    inicio: setInicio,
    fim: setFim,
    colaborador: setColaborador,
    conveniado: setConveniado,
    beneficio: setBeneficio,
  };

  const abrirEstorno = (uso: Utilizacao) => {
    setReversal(uso);
    setMotivo("");
  };

  return (
    <>
      <PageHeader
        eyebrow="ACOMPANHAMENTO"
        icon={ClipboardList}
        title="Utilizações"
        description="Acompanhe os resgates e consulte o histórico de benefícios da fundação."
      />
      <UtilizacoesStats total={rows.length} aprovadas={aprovadas} />
      <section className="panel">
        <div className="panel-header">
          <div>
            <h2>Histórico de utilizações</h2>
            <p className="text-muted">
              Consulte os registros e seus detalhes. Resgates decididos são
              preservados.
            </p>
          </div>
        </div>
        <UtilizacoesFilters
          filtros={filtros}
          periodoInvalido={periodoInvalido}
          colaboradores={data.colaboradores.map((item) => ({
            value: String(item.id),
            label: colaboradorNome(data, item.id),
          }))}
          conveniados={data.conveniados.map((item) => ({
            value: String(item.id),
            label: item.nome_fantasia || item.razao_social,
          }))}
          beneficios={[
            ...data.beneficios.map((item) => ({
              value: `beneficio:${item.id}`,
              label: item.nome,
              group: "Benefícios regulares",
            })),
            ...data.itensCampanha.map((item) => ({
              value: `campanha:${item.id}`,
              label: item.nome,
              group: "Itens de campanhas",
            })),
          ]}
          onChange={(campo, valor) => setters[campo](valor)}
          onClear={limparFiltros}
        />
        {rows.length ? (
          <UtilizacoesTable
            rows={visibleRows}
            descricao={descricao}
            onView={setSelected}
            onReverse={abrirEstorno}
          />
        ) : (
          <EmptyState
            title="Nenhuma utilização encontrada"
            description="Ajuste os filtros ou aguarde novos registros de resgate."
            action={
              <button
                type="button"
                className="btn btn-secondary"
                onClick={limparFiltros}
              >
                Limpar filtros
              </button>
            }
          />
        )}
        <Pagination
          page={currentPage}
          total={rows.length}
          pageSize={PAGE_SIZE}
          onChange={setPage}
        />
      </section>
      {selected && (
        <UtilizacaoDetailsModal
          uso={selected}
          descricao={descricao}
          onClose={closeDetails}
          onReverse={() => {
            abrirEstorno(selected);
            setSelected(null);
          }}
        />
      )}
      {reversal && (
        <EstornoModal
          uso={reversal}
          descricao={descricao}
          motivo={motivo}
          onMotivoChange={setMotivo}
          saving={saving}
          onConfirm={estornar}
          onClose={() => setReversal(null)}
        />
      )}
    </>
  );
}
