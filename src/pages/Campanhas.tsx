import { CalendarDays, Megaphone, Plus } from "lucide-react";
import { ConfirmModal, EmptyState, PageHeader } from "../components/ui";
import { CampanhaDetailsModal } from "../components/campanhas/CampanhaDetailsModal";
import { CampanhaFormModal } from "../components/campanhas/CampanhaFormModal";
import {
  CampanhasFilters,
  type FiltrosCampanha,
} from "../components/campanhas/CampanhasFilters";
import { CampanhasStats } from "../components/campanhas/CampanhasStats";
import { IniciativasList } from "../components/campanhas/IniciativasList";
import { ItemCampanhaFormModal } from "../components/campanhas/ItemCampanhaFormModal";
import { PromocionaisTable } from "../components/campanhas/PromocionaisTable";
import { VincularConveniadoModal } from "../components/campanhas/VincularConveniadoModal";
import { colaboradorNome } from "../models/selectors";
import { useCampanhasVM } from "../viewmodels/useCampanhasVM";

export default function Campanhas() {
  const {
    data,
    PAGE_SIZE,
    search,
    setSearch,
    tipo,
    setTipo,
    status,
    setStatus,
    inicio,
    setInicio,
    fim,
    setFim,
    setCampaignPage,
    setEventPage,
    periodoInvalido,
    rows,
    campaigns,
    events,
    campaignList,
    eventList,
    selected,
    setSelectedId,
    campanhaItems,
    usosCampanha,
    participantes,
    today,
    editing,
    showForm,
    setShowForm,
    form,
    setForm,
    abrirForm,
    submitCampanha,
    itemEditing,
    showItemForm,
    setShowItemForm,
    itemForm,
    setItemForm,
    abrirItem,
    submitItem,
    linkItem,
    setLinkItem,
    partnerId,
    setPartnerId,
    submitLink,
    cancelTarget,
    setCancelTarget,
    saving,
    formError,
    setFormError,
    toggleOfertaCampanha,
    cancelarCampanha,
  } = useCampanhasVM();

  const filtros: FiltrosCampanha = { search, tipo, status, inicio, fim };
  const setters: Record<keyof FiltrosCampanha, (value: string) => void> = {
    search: setSearch,
    tipo: setTipo,
    status: setStatus,
    inicio: setInicio,
    fim: setFim,
  };

  const itemCount = (campanhaId: number) =>
    data.itensCampanha.filter((item) => item.campanha_id === campanhaId).length;

  const acoesLista = {
    pageSize: PAGE_SIZE,
    itemCount,
    onView: (item: { id: number }) => setSelectedId(item.id),
    onEdit: abrirForm,
    onCancel: setCancelTarget,
  };

  const ultimoUso = [...usosCampanha].sort((a, b) =>
    b.data_solicitacao.localeCompare(a.data_solicitacao),
  )[0];

  const conveniadosDisponiveis = linkItem
    ? data.conveniados.filter(
        (parceiro) =>
          parceiro.status === "ATIVO" &&
          !data.ofertasCampanha.some(
            (oferta) =>
              oferta.beneficio_campanha_id === linkItem.id &&
              oferta.conveniado_id === parceiro.id &&
              oferta.status === "ATIVO",
          ),
      )
    : [];

  return (
    <>
      <PageHeader
        eyebrow="RELACIONAMENTO"
        icon={Megaphone}
        title="Campanhas e eventos"
        description="Organize iniciativas e benefícios promocionais para os colaboradores."
        actions={
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => abrirForm()}
          >
            <Plus size={18} /> Nova campanha ou evento
          </button>
        }
      />
      <CampanhasStats
        campanhas={data.campanhas}
        itens={data.itensCampanha}
        participantes={participantes}
        today={today}
      />
      <section className="panel campaign-panel">
        <div className="panel-header">
          <div>
            <h2>Iniciativas da fundação</h2>
            <p className="text-muted">
              Campanhas, eventos, vouchers e cortesias em um só lugar.
            </p>
          </div>
          <span className="result-count">{rows.length} iniciativas</span>
        </div>
        <CampanhasFilters
          filtros={filtros}
          periodoInvalido={periodoInvalido}
          onChange={(campo, valor) => setters[campo](valor)}
        />
        <div className="campaign-overview">
          {campaigns.length > 0 && (
            <IniciativasList
              {...acoesLista}
              title="Campanhas"
              icon={<Megaphone size={20} />}
              singular="campanha"
              plural="campanhas"
              total={campaigns.length}
              rows={campaignList.rows}
              page={campaignList.current}
              onPageChange={setCampaignPage}
            />
          )}
          {events.length > 0 && (
            <IniciativasList
              {...acoesLista}
              title="Eventos"
              icon={<CalendarDays size={20} />}
              singular="evento"
              plural="eventos"
              total={events.length}
              rows={eventList.rows}
              page={eventList.current}
              onPageChange={setEventPage}
            />
          )}
          {!rows.length && (
            <EmptyState
              title="Nenhuma iniciativa encontrada"
              description="Ajuste os filtros ou cadastre uma campanha ou evento."
            />
          )}
          <PromocionaisTable
            itens={data.itensCampanha.filter((item) =>
              rows.some((campanha) => campanha.id === item.campanha_id),
            )}
            campanhas={data.campanhas}
            onManage={(item) => setSelectedId(item.campanha_id)}
          />
        </div>
      </section>
      {selected && !showForm && !showItemForm && !linkItem && (
        <CampanhaDetailsModal
          campanha={selected}
          itens={campanhaItems}
          ofertas={data.ofertasCampanha}
          conveniados={data.conveniados}
          usos={usosCampanha}
          ultimoParticipante={
            ultimoUso
              ? colaboradorNome(data, ultimoUso.colaborador_id)
              : undefined
          }
          saving={saving}
          onClose={() => setSelectedId(null)}
          onEdit={() => abrirForm(selected)}
          onAddItem={() => abrirItem()}
          onEditItem={abrirItem}
          onLinkPartner={(item) => {
            setFormError("");
            setLinkItem(item);
            setPartnerId("");
          }}
          onToggleOffer={toggleOfertaCampanha}
        />
      )}
      {showForm && (
        <CampanhaFormModal
          form={form}
          onChange={setForm}
          editing={Boolean(editing)}
          saving={saving}
          error={formError}
          onSubmit={submitCampanha}
          onClose={() => setShowForm(false)}
        />
      )}
      {showItemForm && selected && (
        <ItemCampanhaFormModal
          campanhaNome={selected.nome}
          form={itemForm}
          onChange={setItemForm}
          editing={Boolean(itemEditing)}
          saving={saving}
          error={formError}
          onSubmit={submitItem}
          onClose={() => setShowItemForm(false)}
        />
      )}
      {linkItem && (
        <VincularConveniadoModal
          itemNome={linkItem.nome}
          conveniados={conveniadosDisponiveis}
          partnerId={partnerId}
          onPartnerChange={setPartnerId}
          saving={saving}
          error={formError}
          onSubmit={submitLink}
          onClose={() => setLinkItem(null)}
        />
      )}
      {cancelTarget && (
        <ConfirmModal
          title="Cancelar campanha ou evento"
          description="O cadastro e o histórico de resgates serão preservados."
          onClose={() => {
            if (!saving) setCancelTarget(null);
          }}
          onConfirm={cancelarCampanha}
          confirming={saving}
          confirmLabel="Confirmar cancelamento"
          confirmingLabel="Cancelando…"
        >
          <p>
            Confirma o cancelamento de <strong>{cancelTarget.nome}</strong>?
          </p>
        </ConfirmModal>
      )}
    </>
  );
}
