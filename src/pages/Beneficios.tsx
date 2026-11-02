import { Gift, Plus } from "lucide-react";
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
import { BeneficioDetailsModal } from "../components/beneficios/BeneficioDetailsModal";
import { BeneficioFormModal } from "../components/beneficios/BeneficioFormModal";
import { BeneficioOffersModal } from "../components/beneficios/BeneficioOffersModal";
import { BeneficiosStats } from "../components/beneficios/BeneficiosStats";
import { BeneficiosTable } from "../components/beneficios/BeneficiosTable";
import type { Beneficio } from "../models/types";
import { useBeneficiosVM } from "../viewmodels/useBeneficiosVM";

const STATUS_FILTRO: SelectOption[] = [
  { value: "", label: "Todos os status" },
  { value: "ATIVO", label: "Ativos" },
  { value: "INATIVO", label: "Inativos" },
  { value: "DESCONTINUADO", label: "Descontinuados" },
];

const RENOVACAO_FILTRO: SelectOption[] = [
  { value: "", label: "Todas as renovações" },
  { value: "CALENDARIO_FIXO", label: "Calendário fixo" },
  { value: "JANELA_MOVEL", label: "Janela móvel" },
];

export default function Beneficios() {
  const {
    data,
    loading,
    PAGE_SIZE,
    search,
    setSearch,
    status,
    setStatus,
    windowType,
    setWindowType,
    setPage,
    filtered,
    currentPage,
    visibleRows,
    activeOffers,
    linkedOffers,
    availablePartners,
    formOpen,
    setFormOpen,
    editing,
    form,
    setForm,
    formError,
    setFormError,
    submitting,
    openForm,
    submit,
    details,
    setDetails,
    discontinuing,
    setDiscontinuing,
    discontinue,
    linking,
    setLinking,
    selectedPartner,
    setSelectedPartner,
    linkPartner,
    changeOffer,
  } = useBeneficiosVM();

  const filtrar = (setter: (value: string) => void) => (value: string) => {
    setter(value);
    setPage(1);
  };

  const gerenciarConveniados = (item: Beneficio) => {
    setLinking(item);
    setSelectedPartner("");
    setFormError("");
  };

  return (
    <>
      <PageHeader
        eyebrow="CATÁLOGO DE BENEFÍCIOS"
        icon={Gift}
        title="Benefícios"
        description="Configure as condições, a renovação e os conveniados de cada benefício."
        actions={
          <button
            type="button"
            className="btn btn-primary"
            disabled={loading}
            onClick={() => openForm()}
          >
            <Plus size={18} /> Cadastrar benefício
          </button>
        }
      />
      <BeneficiosStats beneficios={data.beneficios} ofertas={data.ofertas} />
      <section className="panel" aria-label="Lista de benefícios">
        <FilterBar>
          <SearchField
            value={search}
            onChange={filtrar(setSearch)}
            placeholder="Buscar por nome ou descrição do benefício..."
          />
          <Select
            aria-label="Filtrar benefícios por status"
            value={status}
            options={STATUS_FILTRO}
            onChange={filtrar(setStatus)}
          />
          <Select
            aria-label="Filtrar por tipo de renovação"
            value={windowType}
            options={RENOVACAO_FILTRO}
            onChange={filtrar(setWindowType)}
          />
        </FilterBar>
        {filtered.length ? (
          <BeneficiosTable
            rows={visibleRows}
            activeOfferCount={(id) => activeOffers(id).length}
            onView={setDetails}
            onEdit={openForm}
            onManagePartners={gerenciarConveniados}
            onDiscontinue={setDiscontinuing}
          />
        ) : (
          <EmptyState
            title={
              loading ? "Carregando benefícios..." : "Nenhum benefício encontrado"
            }
            description="Ajuste os filtros ou cadastre um novo benefício."
          />
        )}
        <Pagination
          page={currentPage}
          total={filtered.length}
          pageSize={PAGE_SIZE}
          onChange={setPage}
        />
      </section>
      {formOpen && (
        <BeneficioFormModal
          form={form}
          onChange={setForm}
          editing={Boolean(editing)}
          submitting={submitting}
          error={formError}
          onSubmit={submit}
          onClose={() => setFormOpen(false)}
        />
      )}
      {details && (
        <BeneficioDetailsModal
          beneficio={details}
          activeOfferCount={activeOffers(details.id).length}
          onClose={() => setDetails(undefined)}
          onManagePartners={() => {
            gerenciarConveniados(details);
            setDetails(undefined);
          }}
          onEdit={() => {
            openForm(details);
            setDetails(undefined);
          }}
        />
      )}
      {linking && (
        <BeneficioOffersModal
          beneficio={linking}
          offers={linkedOffers}
          conveniados={data.conveniados}
          availablePartners={availablePartners}
          selectedPartner={selectedPartner}
          onSelectPartner={setSelectedPartner}
          submitting={submitting}
          error={formError}
          onLink={linkPartner}
          onChangeOffer={changeOffer}
          onClose={() => setLinking(undefined)}
        />
      )}
      {discontinuing && (
        <ConfirmModal
          title="Descontinuar benefício"
          description={`Deseja descontinuar ${discontinuing.nome}? O benefício deixará de estar disponível para novos resgates. As ofertas e utilizações anteriores serão preservadas.`}
          onClose={() => {
            if (!submitting) setDiscontinuing(undefined);
          }}
          onConfirm={discontinue}
          confirming={submitting}
          confirmLabel="Confirmar descontinuação"
          confirmingLabel="Descontinuando..."
        />
      )}
    </>
  );
}
