import { useState, type FormEvent } from "react";
import { usePortal } from "./PortalContext";
import { formatCnpj } from "../models/selectors";
import type { Conveniado } from "../models/types";
import { usePagination } from "../hooks/usePagination";
import { useOrdenacao } from "../hooks/useOrdenacao";
import { useUrlFilters } from "../hooks/useUrlFilters";
import { useAsyncAction } from "../hooks/useAsyncAction";
import { useSessionUser } from "../hooks/useSessionUser";
import { isAdministrador } from "../models/rules";
import { contaLimpa, erroDaContaNova, type ModoConta } from "../models/contaNova";
import { nomesCategorias, temCategoria } from "../models/categorias";
import { passaNoFiltro, valoresFiltro } from "../models/filtros";

const PAGE_SIZE = 8;
const FILTER_KEYS = ["buscar", "status", "categoria"] as const;

export type ConveniadoForm = {
  modo: ModoConta;
  nome: string;
  email: string;
  senha: string;
  usuario_id: string;
  nome_fantasia: string;
  razao_social: string;
  categorias: number[];
  cnpj: string;
  endereco: string;
  status: Conveniado["status"];
};

const blankForm = (modo: ModoConta): ConveniadoForm => ({
  modo,
  nome: "",
  email: "",
  senha: "",
  usuario_id: "",
  nome_fantasia: "",
  razao_social: "",
  categorias: [],
  cnpj: "",
  endereco: "",
  status: "EM_ANALISE",
});

export function useConveniadosVM() {
  const { data, save, cadastrarComConta, loading } = usePortal();
  const sessao = useSessionUser();
  const podeCriarConta = isAdministrador(sessao, data);
  const { running: submitting, run } = useAsyncAction();
  const { values: filters, setter } = useUrlFilters(FILTER_KEYS);
  const { buscar: search, status, categoria: category } = filters;
  const setSearch = setter("buscar");
  const setStatus = setter("status");
  const setCategory = setter("categoria");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Conveniado>();
  const [inactivating, setInactivating] = useState<Conveniado>();
  const [form, setForm] = useState<ConveniadoForm>(() => blankForm("existente"));
  const [formError, setFormError] = useState("");
  const categories = [...data.categorias].sort((a, b) =>
  a.nome.localeCompare(b.nome, "pt-BR")
);

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
    `${item.nome_fantasia} ${item.razao_social} ${item.cnpj} ${formatCnpj(item.cnpj)} ${nomesCategorias(item)} ${item.endereco}`.toLocaleLowerCase(
      "pt-BR",
    );

  return (
    passaNoFiltro(status, item.status) &&
    (!category || valoresFiltro(category).some((id) => temCategoria(item, Number(id)))) &&
    text.includes(search.trim().toLocaleLowerCase("pt-BR"))
  );
});

  const activeOfferCount = (id: number) =>
    data.ofertas.filter(
      (item) => item.conveniado_id === id && item.status === "ATIVO",
    ).length;

  const { ordenadas, ordem, alternar, chave } = useOrdenacao(filtered, {
    nome: (item) => item.nome_fantasia,
    cnpj: (item) => item.cnpj,
    categoria: (item) => nomesCategorias(item),
    endereco: (item) => item.endereco,
    ofertas: (item) => activeOfferCount(item.id),
  });

  const {
    page: currentPage,
    setPage,
    start,
    end,
  } = usePagination(
    filtered.length,
    PAGE_SIZE,
    JSON.stringify([search, status, category, chave]),
  );

  const visibleRows = ordenadas.slice(start, end);


  function openForm(item?: Conveniado) {
    setEditing(item);
    setForm(
      item
        ? {
            modo: "existente",
            nome: "",
            email: "",
            senha: "",
            usuario_id: String(item.usuario_id),
            nome_fantasia: item.nome_fantasia,
            razao_social: item.razao_social,
            categorias: item.categorias.map((categoria) => categoria.id),
            cnpj: formatCnpj(item.cnpj),
            endereco: item.endereco,
            status: item.status,
          }
        : blankForm(podeCriarConta ? "nova" : "existente"),
    );
    setFormError("");
    setFormOpen(true);
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError("");
    const cnpj = form.cnpj.replace(/\D/g, "");
    const contaNova = !editing && form.modo === "nova";
    const erroConta = contaNova ? erroDaContaNova(form, data.usuarios) : "";
    if (erroConta) return setFormError(erroConta);
    if (!contaNova && !form.usuario_id) {
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
    form.endereco,
  ].some((value) => !value.trim())
) {
  setFormError("Preencha os campos obrigatórios com dados válidos.");
  return;
}

if (!form.categorias.length) {
  setFormError("Escolha ao menos uma categoria para o conveniado.");
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
    const estabelecimento = {
  nome_fantasia: form.nome_fantasia.trim(),
  razao_social: form.razao_social.trim(),
  categorias: form.categorias,
  cnpj,
  endereco: form.endereco.trim(),
  status: form.status,
};
    await run(
      () =>
        contaNova
          ? cadastrarComConta("conveniados", contaLimpa(form), estabelecimento)
          : save("conveniados", editing?.id, { ...estabelecimento, usuario_id: Number(form.usuario_id) }),
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
    ordenacao: { ordem, alternar },
    availableUsers,
    podeCriarConta,
    contaAtual: editing ? data.usuarios.find((user) => user.id === editing.usuario_id) : undefined,
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
  };
}
