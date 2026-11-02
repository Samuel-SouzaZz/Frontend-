import { useMemo, useState, type FormEvent } from "react";
import { usePortal } from "./PortalContext";
import { toLocalDateString } from "../models/selectors";
import { usePagination } from "../hooks/usePagination";
import { useUrlFilters } from "../hooks/useUrlFilters";
import { useAsyncAction } from "../hooks/useAsyncAction";

export type PortalData = ReturnType<typeof usePortal>["data"];
export type Campanha = PortalData["campanhas"][number];
export type Item = PortalData["itensCampanha"][number];
export type OfertaCampanha = PortalData["ofertasCampanha"][number];

export const TIPOS: Record<string, string> = {
  CAMPANHA: "Campanha",
  EVENTO_INTERNO: "Evento interno",
  EVENTO_PATROCINADO: "Evento patrocinado",
  VOUCHER: "Voucher",
  CORTESIA: "Cortesia",
};

const EMPTY = {
  nome: "",
  tipo: "CAMPANHA",
  descricao: "",
  data_inicio: "",
  data_fim: "",
  criterio_elegibilidade: "",
  patrocinador: "",
  status: "PLANEJADA",
};

const EMPTY_ITEM = {
  nome: "",
  descricao: "",
  tipo_beneficio: "PERCENTUAL",
  valor: "",
  quantidade_maxima_utilizacoes: "",
  status: "ATIVO",
};

const PAGE_SIZE = 6;
const FILTER_KEYS = ["buscar", "tipo", "status", "inicio", "fim"] as const;

export function useCampanhasVM() {
  const { data, save } = usePortal();
  const { running: saving, run } = useAsyncAction();
  const { values: filters, setter } = useUrlFilters(FILTER_KEYS);
  const { buscar: search, tipo, status, inicio, fim } = filters;
  const setSearch = setter("buscar");
  const setTipo = setter("tipo");
  const setStatus = setter("status");
  const setInicio = setter("inicio");
  const setFim = setter("fim");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [editing, setEditing] = useState<Campanha | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ ...EMPTY });
  const [itemEditing, setItemEditing] = useState<Item | null>(null);
  const [showItemForm, setShowItemForm] = useState(false);
  const [itemForm, setItemForm] = useState({ ...EMPTY_ITEM });
  const [linkItem, setLinkItem] = useState<Item | null>(null);
  const [partnerId, setPartnerId] = useState("");
  const [cancelTarget, setCancelTarget] = useState<Campanha | null>(null);
  const [formError, setFormError] = useState("");

  const selected = data.campanhas.find((item) => item.id === selectedId);
  const periodoInvalido = !!inicio && !!fim && fim < inicio;

  const rows = useMemo(
    () =>
      data.campanhas.filter(
        (item) =>
          !periodoInvalido &&
          `${item.nome} ${item.descricao ?? ""} ${item.patrocinador ?? ""}`
            .toLocaleLowerCase("pt-BR")
            .includes(search.trim().toLocaleLowerCase("pt-BR")) &&
          (!tipo || item.tipo === tipo) &&
          (!status || item.status === status) &&
          (!inicio || item.data_fim.slice(0, 10) >= inicio) &&
          (!fim || item.data_inicio.slice(0, 10) <= fim),
      ),
    [data.campanhas, search, tipo, status, inicio, fim, periodoInvalido],
  );

  const campaigns = rows
    .filter((item) => !item.tipo.startsWith("EVENTO"))
    .sort((a, b) => b.data_inicio.localeCompare(a.data_inicio));
  const events = rows
    .filter((item) => item.tipo.startsWith("EVENTO"))
    .sort((a, b) => b.data_inicio.localeCompare(a.data_inicio));

  const filterKey = JSON.stringify([search, tipo, status, inicio, fim]);
  const campaignPagination = usePagination(
    campaigns.length,
    PAGE_SIZE,
    filterKey,
  );
  const eventPagination = usePagination(events.length, PAGE_SIZE, filterKey);

  const campaignList = {
    current: campaignPagination.page,
    rows: campaigns.slice(campaignPagination.start, campaignPagination.end),
  };
  const eventList = {
    current: eventPagination.page,
    rows: events.slice(eventPagination.start, eventPagination.end),
  };

  const campanhaItems = data.itensCampanha.filter(
    (item) => item.campanha_id === selectedId,
  );

  const usosCampanha = data.utilizacoes.filter(
    (uso) =>
      uso.status === "APROVADA" &&
      data.ofertasCampanha.some(
        (oferta) =>
          oferta.id === uso.beneficio_campanha_conveniado_id &&
          data.itensCampanha.some(
            (item) =>
              item.id === oferta.beneficio_campanha_id &&
              item.campanha_id === selectedId,
          ),
      ),
  );

  const participantes = new Set(
    data.utilizacoes
      .filter(
        (uso) =>
          uso.status === "APROVADA" && uso.beneficio_campanha_conveniado_id,
      )
      .map((uso) => uso.colaborador_id),
  ).size;

  const today = toLocalDateString();

  function abrirForm(item?: Campanha) {
    setFormError("");
    setEditing(item ?? null);
    setForm(
      item
        ? {
            nome: item.nome,
            tipo: item.tipo,
            descricao: item.descricao ?? "",
            data_inicio: item.data_inicio.slice(0, 10),
            data_fim: item.data_fim.slice(0, 10),
            criterio_elegibilidade: item.criterio_elegibilidade ?? "",
            patrocinador: item.patrocinador ?? "",
            status: item.status,
          }
        : { ...EMPTY },
    );
    setShowForm(true);
  }

  function abrirItem(item?: Item) {
    setFormError("");
    setItemEditing(item ?? null);
    setItemForm(
      item
        ? {
            nome: item.nome,
            descricao: item.descricao ?? "",
            tipo_beneficio: item.tipo_beneficio,
            valor: String(item.valor),
            quantidade_maxima_utilizacoes:
              item.quantidade_maxima_utilizacoes == null
                ? ""
                : String(item.quantidade_maxima_utilizacoes),
            status: item.status,
          }
        : { ...EMPTY_ITEM },
    );
    setShowItemForm(true);
  }

  function execute(
    action: () => Promise<unknown>,
    message: string,
    after?: () => void,
    onError?: (message: string) => void,
  ) {
    return run(action, {
      success: message,
      fallbackError: "Não foi possível salvar. Tente novamente.",
      onSuccess: after,
      onError,
    });
  }

  function toggleOfertaCampanha(oferta: OfertaCampanha) {
    const ativa = oferta.status === "ATIVO";
    return execute(
      () =>
        save("ofertasCampanha", oferta.id, {
          status: ativa ? "INATIVO" : "ATIVO",
        }),
      ativa ? "Vínculo inativado. Histórico preservado." : "Vínculo reativado.",
    );
  }

  function cancelarCampanha() {
    if (!cancelTarget) return;
    const alvo = cancelTarget;
    return execute(
      () => save("campanhas", alvo.id, { status: "CANCELADA" }),
      "Iniciativa cancelada. Histórico preservado.",
      () => setCancelTarget(null),
    );
  }

  async function submitCampanha(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError("");
    if (form.data_fim < form.data_inicio) {
      setFormError("A data final deve ser igual ou posterior à inicial.");
      return;
    }
    if (!form.nome.trim()) {
      setFormError("Informe o nome da campanha ou evento.");
      return;
    }
    await execute(
      () =>
        save("campanhas", editing?.id, {
          ...form,
          tipo: form.tipo as Campanha["tipo"],
          status: form.status as Campanha["status"],
          nome: form.nome.trim(),
          descricao: form.descricao.trim() || null,
          criterio_elegibilidade: form.criterio_elegibilidade.trim() || null,
          patrocinador: form.patrocinador.trim() || null,
        }),
      editing
        ? "Campanha ou evento atualizado."
        : "Campanha ou evento cadastrado.",
      () => setShowForm(false),
      setFormError,
    );
  }

  async function submitItem(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError("");
    if (!selected) return;
    if (!itemForm.nome.trim()) {
      setFormError("Informe o nome do item promocional.");
      return;
    }
    const valor = Number(itemForm.valor);
    if (
      valor <= 0 ||
      (itemForm.tipo_beneficio === "PERCENTUAL" && valor > 100)
    ) {
      setFormError("Informe um valor válido. Percentuais devem ficar entre 0 e 100.");
      return;
    }
    await execute(
      () =>
        save("itensCampanha", itemEditing?.id, {
          ...itemForm,
          tipo_beneficio: itemForm.tipo_beneficio as Item["tipo_beneficio"],
          status: itemForm.status as Item["status"],
          nome: itemForm.nome.trim(),
          campanha_id: selected.id,
          descricao: itemForm.descricao.trim() || null,
          valor,
          quantidade_maxima_utilizacoes: itemForm.quantidade_maxima_utilizacoes
            ? Number(itemForm.quantidade_maxima_utilizacoes)
            : null,
        }),
      itemEditing ? "Item atualizado." : "Item adicionado à campanha.",
      () => setShowItemForm(false),
      setFormError,
    );
  }

  async function submitLink(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError("");
    if (!linkItem || !partnerId) return;
    const existing = data.ofertasCampanha.find(
      (item) =>
        item.beneficio_campanha_id === linkItem.id &&
        item.conveniado_id === Number(partnerId),
    );
    await execute(
      () =>
        save("ofertasCampanha", existing?.id, {
          beneficio_campanha_id: linkItem.id,
          conveniado_id: Number(partnerId),
          status: "ATIVO",
        }),
      "Conveniado vinculado ao item.",
      () => {
        setLinkItem(null);
        setPartnerId("");
      },
      setFormError,
    );
  }

  return {
    data,
    PAGE_SIZE,
    TIPOS,
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
    campaignPage: campaignPagination.page,
    setCampaignPage: campaignPagination.setPage,
    eventPage: eventPagination.page,
    setEventPage: eventPagination.setPage,
    periodoInvalido,
    rows,
    campaigns,
    events,
    campaignList,
    eventList,
    selected,
    selectedId,
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
    cancelarCampanha,
    toggleOfertaCampanha,
    saving,
    formError,
    setFormError,
  };
}
