import { useState, type FormEvent } from "react";
import { usePortal } from "./PortalContext";
import { conveniadoNome, formatMoney } from "../models/selectors";
import type { Beneficio } from "../models/types";
import { usePagination } from "../hooks/usePagination";
import { useUrlFilters } from "../hooks/useUrlFilters";
import { useAsyncAction } from "../hooks/useAsyncAction";

const PAGE_SIZE = 8;
const FILTER_KEYS = ["buscar", "status", "renovacao"] as const;

export type BeneficioForm = {
  nome: string;
  descricao: string;
  status: Beneficio["status"];
  tipo_beneficio: Beneficio["tipo_beneficio"];
  valor: string;
  quantidade_maxima_utilizacoes: string;
  tipo_janela: Beneficio["tipo_janela"];
  unidade_ciclo: NonNullable<Beneficio["unidade_ciclo"]>;
  dia_reset: string;
  intervalo_valor: string;
  intervalo_unidade: NonNullable<Beneficio["intervalo_unidade"]>;
  referencia_contagem: NonNullable<Beneficio["referencia_contagem"]>;
};

const blankForm = (): BeneficioForm => ({
  nome: "",
  descricao: "",
  status: "ATIVO",
  tipo_beneficio: "PERCENTUAL",
  valor: "",
  quantidade_maxima_utilizacoes: "1",
  tipo_janela: "CALENDARIO_FIXO",
  unidade_ciclo: "MES",
  dia_reset: "",
  intervalo_valor: "30",
  intervalo_unidade: "DIA",
  referencia_contagem: "ULTIMA_UTILIZACAO",
});

export function ruleSummary(item: Beneficio) {
  const count = `${item.quantidade_maxima_utilizacoes} ${item.quantidade_maxima_utilizacoes === 1 ? "utilização" : "utilizações"}`;
  if (item.tipo_janela === "CALENDARIO_FIXO")
    return `${count} por ${item.unidade_ciclo === "ANO" ? "ano" : item.unidade_ciclo === "SEMANA" ? "semana" : "mês"}`;
  const unit =
    item.intervalo_unidade === "MES"
      ? item.intervalo_valor === 1
        ? "mês"
        : "meses"
      : item.intervalo_valor === 1
        ? "dia"
        : "dias";
  return `${count} a cada ${item.intervalo_valor} ${unit}`;
}

export function valueSummary(item: Beneficio) {
  return item.tipo_beneficio === "PERCENTUAL"
    ? `${Number(item.valor).toLocaleString("pt-BR")}%`
    : formatMoney(Number(item.valor));
}

export function useBeneficiosVM() {
  const { data, save, loading } = usePortal();
  const { running: submitting, run } = useAsyncAction();

  // ── Filtros ──
  const { values: filters, setter } = useUrlFilters(FILTER_KEYS);
  const { buscar: search, status, renovacao: windowType } = filters;
  const setSearch = setter("buscar");
  const setStatus = setter("status");
  const setWindowType = setter("renovacao");


  // ── Modais / formulário ──
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Beneficio>();
  const [details, setDetails] = useState<Beneficio>();
  const [discontinuing, setDiscontinuing] = useState<Beneficio>();
  const [linking, setLinking] = useState<Beneficio>();
  const [selectedPartner, setSelectedPartner] = useState("");
  const [form, setForm] = useState<BeneficioForm>(blankForm);
  const [formError, setFormError] = useState("");

  // ── Dados derivados ──
  const filtered = data.beneficios.filter(
    (item) =>
      (!status || item.status === status) &&
      (!windowType || item.tipo_janela === windowType) &&
      `${item.nome} ${item.descricao ?? ""}`
        .toLocaleLowerCase("pt-BR")
        .includes(search.trim().toLocaleLowerCase("pt-BR")),
  );

const {
  page: currentPage,
  setPage,
  start,
  end,
} = usePagination(
  filtered.length,
  PAGE_SIZE,
  JSON.stringify([search, status, windowType]),
);

const visibleRows = filtered.slice(start, end);

  const activeOffers = (id: number) =>
    data.ofertas.filter(
      (item) => item.beneficio_id === id && item.status === "ATIVO",
    );

  const linkedOffers = linking
    ? data.ofertas.filter((item) => item.beneficio_id === linking.id)
    : [];

  const availablePartners = data.conveniados.filter(
    (partner) =>
      partner.status === "ATIVO" &&
      !linkedOffers.some(
        (item) => item.conveniado_id === partner.id && item.status === "ATIVO",
      ),
  );

  // ── Ações ──
  function openForm(item?: Beneficio) {
    setEditing(item);
    setForm(
      item
        ? {
            nome: item.nome,
            descricao: item.descricao ?? "",
            status: item.status,
            tipo_beneficio: item.tipo_beneficio,
            valor: String(item.valor),
            quantidade_maxima_utilizacoes: String(
              item.quantidade_maxima_utilizacoes,
            ),
            tipo_janela: item.tipo_janela,
            unidade_ciclo: item.unidade_ciclo ?? "MES",
            dia_reset: item.dia_reset?.slice(0, 10) ?? "",
            intervalo_valor: String(item.intervalo_valor ?? 30),
            intervalo_unidade: item.intervalo_unidade ?? "DIA",
            referencia_contagem:
              item.referencia_contagem ?? "ULTIMA_UTILIZACAO",
          }
        : blankForm(),
    );
    setFormError("");
    setFormOpen(true);
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError("");
    const value = Number(form.valor);
    const count = Number(form.quantidade_maxima_utilizacoes);
    const interval = Number(form.intervalo_valor);
    if (!form.nome.trim()) {
      setFormError("Informe o nome do benefício.");
      return;
    }
    if (
      !Number.isFinite(value) ||
      value <= 0 ||
      (form.tipo_beneficio === "PERCENTUAL" && value > 100)
    ) {
      setFormError(
        "Informe um valor maior que zero. O desconto percentual deve ser de até 100%.",
      );
      return;
    }
    if (!Number.isInteger(count) || count < 1) {
      setFormError(
        "O limite de utilizações deve ser um número inteiro maior que zero.",
      );
      return;
    }
    if (
      form.tipo_janela === "JANELA_MOVEL" &&
      (!Number.isInteger(interval) || interval < 1)
    ) {
      setFormError(
        "O intervalo de renovação deve ser um número inteiro maior que zero.",
      );
      return;
    }
    const fixed = form.tipo_janela === "CALENDARIO_FIXO";
    await run(
      () =>
        save("beneficios", editing?.id, {
          nome: form.nome.trim(),
          descricao: form.descricao.trim() || null,
          status: form.status,
          tipo_beneficio: form.tipo_beneficio,
          valor: value,
          quantidade_maxima_utilizacoes: count,
          tipo_janela: form.tipo_janela,
          unidade_ciclo: fixed ? form.unidade_ciclo : null,
          dia_reset: fixed && form.dia_reset ? form.dia_reset : null,
          intervalo_valor: fixed ? null : interval,
          intervalo_unidade: fixed ? null : form.intervalo_unidade,
          referencia_contagem: fixed ? null : form.referencia_contagem,
        }),
      {
        success: editing
          ? "Benefício atualizado."
          : "Benefício cadastrado. Vincule os conveniados para disponibilizar as ofertas.",
        fallbackError: "Não foi possível salvar o benefício.",
        onSuccess: () => setFormOpen(false),
        onError: setFormError,
      },
    );
  }

  async function discontinue() {
    if (!discontinuing) return;
    await run(
      () =>
        save("beneficios", discontinuing.id, { status: "DESCONTINUADO" }),
      {
        success:
          "Benefício descontinuado. As ofertas e o histórico foram preservados.",
        fallbackError: "Não foi possível descontinuar.",
        onSuccess: () => setDiscontinuing(undefined),
      },
    );
  }

  async function linkPartner(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!linking || !selectedPartner) return;
    setFormError("");
    const existing = linkedOffers.find(
      (item) => item.conveniado_id === Number(selectedPartner),
    );
    await run(
      () =>
        save("ofertas", existing?.id, {
          beneficio_id: linking.id,
          conveniado_id: Number(selectedPartner),
          status: "ATIVO",
        }),
      {
        success: existing
          ? "Oferta reativada para o conveniado."
          : "Conveniado vinculado ao benefício.",
        fallbackError: "Não foi possível vincular o conveniado.",
        onSuccess: () => setSelectedPartner(""),
        onError: setFormError,
      },
    );
  }

  async function changeOffer(id: number, nextStatus: "ATIVO" | "INATIVO") {
    setFormError("");
    await run(() => save("ofertas", id, { status: nextStatus }), {
      success:
        nextStatus === "ATIVO"
          ? "Oferta reativada."
          : "Conveniado desvinculado. O histórico da oferta foi preservado.",
      fallbackError: "Não foi possível atualizar a oferta.",
      onError: setFormError,
    });
  }

  return {
    // contexto
    data,
    loading,
    PAGE_SIZE,

    // filtros
    search,
    setSearch,
    status,
    setStatus,
    windowType,
    setWindowType,
    page: currentPage,
    setPage,

    // dados derivados
    filtered,
    currentPage,
    visibleRows,
    activeOffers,
    linkedOffers,
    availablePartners,

    // formulário
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

    // detalhes
    details,
    setDetails,

    // descontinuação
    discontinuing,
    setDiscontinuing,
    discontinue,

    // conveniados
    linking,
    setLinking,
    selectedPartner,
    setSelectedPartner,
    linkPartner,
    changeOffer,

    // helpers
    conveniadoNome,
  };
}
