import { useState, type FormEvent } from "react";
import { usePortal } from "./PortalContext";
import { formatCnpj } from "../models/selectors";
import type { Conveniado } from "../models/types";
import { usePagination } from "../hooks/usePagination";
import { useUrlFilters } from "../hooks/useUrlFilters";
import { useAsyncAction } from "../hooks/useAsyncAction";

const PAGE_SIZE = 8;
const FILTER_KEYS = ["buscar", "status", "categoria"] as const;

export type ConveniadoForm = {
  usuario_id: string;
  nome_fantasia: string;
  razao_social: string;
  categoria: string;
  cnpj: string;
  endereco: string;
  status: Conveniado["status"];
};

const blankForm = (): ConveniadoForm => ({
  usuario_id: "",
  nome_fantasia: "",
  razao_social: "",
  categoria: "",
  cnpj: "",
  endereco: "",
  status: "EM_ANALISE",
});

export function useConveniadosVM() {
  const { data, save, loading } = usePortal();
  const { running: submitting, run } = useAsyncAction();
  const { values: filters, setter } = useUrlFilters(FILTER_KEYS);
  const { buscar: search, status, categoria: category } = filters;
  const setSearch = setter("buscar");
  const setStatus = setter("status");
  const setCategory = setter("categoria");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Conveniado>();
  const [details, setDetails] = useState<Conveniado>();
  const [inactivating, setInactivating] = useState<Conveniado>();
  const [form, setForm] = useState<ConveniadoForm>(blankForm);
  const [formError, setFormError] = useState("");
  const categories = [
    ...new Set(data.conveniados.map((item) => item.categoria)),
  ].sort();

  const availableUsers = data.usuarios.filter(
    (user) =>
      (user.id === editing?.usuario_id ||
        data.perfis.find((profile) => profile.id === user.perfil_id)?.escopo ===
          "CONVENIADO") &&
      !data.conveniados.some(
        (item) => item.usuario_id === user.id && item.id !== editing?.id,
      ),
  );

  const filtered = data.conveniados.filter((item) => {
    const text =
      `${item.nome_fantasia} ${item.razao_social} ${item.cnpj} ${formatCnpj(item.cnpj)} ${item.categoria} ${item.endereco}`.toLocaleLowerCase(
        "pt-BR",
      );
    return (
      (!status || item.status === status) &&
      (!category || item.categoria === category) &&
      text.includes(search.trim().toLocaleLowerCase("pt-BR"))
    );
  });

  const {
    page: currentPage,
    setPage,
    start,
    end,
  } = usePagination(
    filtered.length,
    PAGE_SIZE,
    JSON.stringify([search, status, category]),
  );

  const visibleRows = filtered.slice(start, end);

  const activeOfferCount = (id: number) =>
    data.ofertas.filter(
      (item) => item.conveniado_id === id && item.status === "ATIVO",
    ).length;

  function openForm(item?: Conveniado) {
    setEditing(item);
    setForm(
      item
        ? {
            usuario_id: String(item.usuario_id),
            nome_fantasia: item.nome_fantasia,
            razao_social: item.razao_social,
            categoria: item.categoria,
            cnpj: formatCnpj(item.cnpj),
            endereco: item.endereco,
            status: item.status,
          }
        : blankForm(),
    );
    setFormError("");
    setFormOpen(true);
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError("");
    const cnpj = form.cnpj.replace(/\D/g, "");
    if (!form.usuario_id) {
      setFormError("Selecione o usuário responsável por este conveniado.");
      return;
    }
    if (cnpj.length !== 14) {
      setFormError("Informe um CNPJ com 14 dígitos.");
      return;
    }
    if (
      [
        form.nome_fantasia,
        form.razao_social,
        form.categoria,
        form.endereco,
      ].some((value) => !value.trim())
    ) {
      setFormError("Preencha os campos obrigatórios com dados válidos.");
      return;
    }
    if (
      data.conveniados.some(
        (item) =>
          item.id !== editing?.id && item.cnpj.replace(/\D/g, "") === cnpj,
      )
    ) {
      setFormError("Este CNPJ já está cadastrado.");
      return;
    }
    await run(
      () =>
        save("conveniados", editing?.id, {
          ...form,
          usuario_id: Number(form.usuario_id),
          nome_fantasia: form.nome_fantasia.trim(),
          razao_social: form.razao_social.trim(),
          categoria: form.categoria.trim(),
          cnpj,
          endereco: form.endereco.trim(),
        }),
      {
        success: editing ? "Conveniado atualizado." : "Conveniado cadastrado.",
        fallbackError: "Não foi possível salvar o conveniado.",
        onSuccess: () => setFormOpen(false),
        onError: setFormError,
      },
    );
  }

  async function inactivate() {
    if (!inactivating) return;
    await run(
      () => save("conveniados", inactivating.id, { status: "INATIVO" }),
      {
        success: "Conveniado inativado. O histórico foi preservado.",
        fallbackError: "Não foi possível inativar.",
        onSuccess: () => setInactivating(undefined),
      },
    );
  }

  return {
    data,
    loading,
    PAGE_SIZE,
    search,
    setSearch,
    status,
    setStatus,
    category,
    setCategory,
    page: currentPage,
    setPage,
    categories,
    filtered,
    currentPage,
    visibleRows,
    availableUsers,
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
    details,
    setDetails,
    inactivating,
    setInactivating,
    inactivate,
  };
}
