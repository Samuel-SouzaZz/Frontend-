import { useNavigate } from "react-router-dom";

import { Handshake, Plus } from "lucide-react";

import {
  ConfirmModal,
  EmptyState,
  FilterBar,
  PageHeader,
  Pagination,
  SearchField,
  Select,
  type SelectOption,
} from "../components/ui";

import { ConveniadoFormModal } from "../components/conveniados/ConveniadoFormModal";

import { ConveniadosStats } from "../components/conveniados/ConveniadosStats";

import { ConveniadosTable } from "../components/conveniados/ConveniadosTable";

import { useConveniadosVM } from "../viewmodels/useConveniadosVM";

const STATUS_FILTRO: SelectOption[] = [
  { value: "", label: "Todos os status" },
  { value: "ATIVO", label: "Ativos" },
  { value: "EM_ANALISE", label: "Em análise" },
  { value: "INATIVO", label: "Inativos" },
];

export default function Conveniados() {
  const {
    data,
    loading,
    PAGE_SIZE,
    search,
    setSearch,
    status,
    setStatus,
    category,
    setCategory,
    setPage,
    categories,
    filtered,
    currentPage,
    visibleRows,
    availableUsers,
    podeCriarConta,
    contaAtual,
    activeOfferCount,
    formOpen,
    setFormOpen,
    editing,
    form,
    setForm,
    formError,
    submitting,
    openForm,
    submit,
    inactivating,
    setInactivating,
    inactivate,
  } = useConveniadosVM();

  const navigate = useNavigate();



  return (
    <>
      {/* CABEÇALHO */}

      <PageHeader
        eyebrow="REDE DE PARCEIROS"
        icon={Handshake}
        title="Conveniados"
        description="Gerencie os estabelecimentos que fazem parte da nossa rede."
        actions={
          <button
            type="button"
            className="btn btn-primary"
            disabled={loading}
            onClick={() => openForm()}
          >
            <Plus size={18} />
            Cadastrar conveniado
          </button>
        }
      />

      {/* INDICADORES */}

      <ConveniadosStats
        conveniados={data.conveniados}
      />

      {/* LISTA */}

      <section
        className="panel"
        aria-label="Lista de conveniados"
      >
        <FilterBar>
          <SearchField
            value={search}
            onChange={setSearch}
            placeholder="Buscar por nome, CNPJ, categoria ou endereço..."
          />

          <Select
            aria-label="Filtrar conveniados por status"
            value={status}
            options={STATUS_FILTRO}
            onChange={setStatus}
          />

          <Select
            aria-label="Filtrar conveniados por categoria"
            value={category}
            onChange={setCategory}
            options={[
              {
                value: "",
                label: "Todas as categorias",
              },
              ...categories.map((value) => ({
                value,
                label: value,
              })),
            ]}
          />
        </FilterBar>

        {/* TABELA OU ESTADO VAZIO */}

        {filtered.length ? (
          <ConveniadosTable
            rows={visibleRows}
            activeOfferCount={activeOfferCount}
            onView={(item) =>
              navigate(`/conveniados/${item.id}`)
            }
            onEdit={openForm}
            onInactivate={setInactivating}
          />
        ) : (
          <EmptyState
            title={
              loading
                ? "Carregando conveniados..."
                : "Nenhum conveniado encontrado"
            }
            description="Ajuste os filtros ou cadastre um novo estabelecimento."
          />
        )}

        {/* PAGINAÇÃO */}

        <Pagination
          page={currentPage}
          total={filtered.length}
          pageSize={PAGE_SIZE}
          onChange={setPage}
        />
      </section>

      {/* MODAL DE CADASTRO E EDIÇÃO */}

      {formOpen && (
        <ConveniadoFormModal
          form={form}
          onChange={setForm}
          categories={categories}
          availableUsers={availableUsers}
          podeCriarConta={podeCriarConta}
          contaAtual={contaAtual}
          editing={Boolean(editing)}
          submitting={submitting}
          error={formError}
          onSubmit={submit}
          onClose={() => setFormOpen(false)}
        />
      )}

      {/* MODAL DE INATIVAÇÃO */}

      {inactivating && (
        <ConfirmModal
          title="Inativar conveniado"
          description={`Deseja inativar ${inactivating.nome_fantasia}? O estabelecimento deixará de registrar resgates. As ofertas e utilizações anteriores serão preservadas.`}
          onClose={() => {
            if (!submitting) {
              setInactivating(undefined);
            }
          }}
          onConfirm={inactivate}
          confirming={submitting}
          confirmLabel="Confirmar inativação"
          confirmingLabel="Inativando..."
        />
      )}
    </>
  );
}