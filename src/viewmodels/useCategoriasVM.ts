import { useState, type FormEvent } from "react";
import { usePortal } from "./PortalContext";
import { temCategoria } from "../models/categorias";
import type { Categoria } from "../models/types";
import { useAsyncAction } from "../hooks/useAsyncAction";

export type CategoriaForm = {
  nome: string;
  status: Categoria["status"];
};

export type ColunaOrdenacaoCategoria = "nome" | "conveniados";

export type OrdenacaoCategoria = {
  coluna: ColunaOrdenacaoCategoria;
  direcao: "asc" | "desc";
} | null;

const formVazio = (): CategoriaForm => ({
  nome: "",
  status: "ATIVO",
});

export function useCategoriasVM() {
  const { data, loading, save, excluirCategoria } = usePortal();
  const { running: submitting, run } = useAsyncAction();

  const [busca, setBusca] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Categoria>();
  const [form, setForm] = useState<CategoriaForm>(formVazio);
  const [formError, setFormError] = useState("");
  const [excluindo, setExcluindo] = useState<Categoria>();

  const [ordenacao, setOrdenacao] =
    useState<OrdenacaoCategoria>(null);

  const totalConveniados = (id: number) =>
    data.conveniados.filter((conveniado) =>
      temCategoria(conveniado, id)
    ).length;

  const filtradas = data.categorias.filter((categoria) =>
    categoria.nome
      .toLocaleLowerCase("pt-BR")
      .includes(busca.trim().toLocaleLowerCase("pt-BR"))
  );

  const linhas = [...filtradas].sort((a, b) => {
    const porNome = a.nome.localeCompare(b.nome, "pt-BR");

    if (!ordenacao) return porNome;

    const comparacao =
      ordenacao.coluna === "nome"
        ? porNome
        : totalConveniados(a.id) - totalConveniados(b.id);

    const resultado = comparacao || porNome;

    return ordenacao.direcao === "asc"
      ? resultado
      : -resultado;
  });

  function alternar(coluna: ColunaOrdenacaoCategoria) {
    setOrdenacao((atual) => {
      if (atual?.coluna !== coluna) {
        return { coluna, direcao: "asc" };
      }

      return {
        coluna,
        direcao: atual.direcao === "asc" ? "desc" : "asc",
      };
    });
  }

  function abrirForm(categoria?: Categoria) {
    setEditing(categoria);

    setForm(
      categoria
        ? {
            nome: categoria.nome,
            status: categoria.status,
          }
        : formVazio()
    );

    setFormError("");
    setFormOpen(true);
  }

  async function salvar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError("");

    const nome = form.nome.trim();

    if (!nome) {
      setFormError("Informe o nome da categoria.");
      return;
    }

    if (nome.length > 60) {
      setFormError(
        "O nome não pode ultrapassar 60 caracteres."
      );
      return;
    }

    const repetida = data.categorias.some(
      (item) =>
        item.id !== editing?.id &&
        item.nome.toLocaleLowerCase("pt-BR") ===
          nome.toLocaleLowerCase("pt-BR")
    );

    if (repetida) {
      setFormError("Já existe uma categoria com esse nome.");
      return;
    }

    await run(
      () =>
        save("categorias", editing?.id, {
          nome,
          status: form.status,
        }),
      {
        success: editing
          ? "Categoria atualizada."
          : "Categoria cadastrada.",
        fallbackError: "Não foi possível salvar a categoria.",
        onSuccess: () => setFormOpen(false),
        onError: setFormError,
      }
    );
  }

  async function confirmarExclusao() {
    if (!excluindo) return;

    await run(() => excluirCategoria(excluindo.id), {
      success: "Categoria excluída.",
      fallbackError: "Não foi possível excluir a categoria.",
      onSuccess: () => setExcluindo(undefined),
    });
  }

  async function alternarStatus(categoria: Categoria) {
    const status =
      categoria.status === "ATIVO" ? "INATIVO" : "ATIVO";

    await run(
      () => save("categorias", categoria.id, { status }),
      {
        success:
          status === "ATIVO"
            ? "Categoria ativada."
            : "Categoria inativada. Os vínculos foram mantidos.",
        fallbackError:
          "Não foi possível alterar a categoria.",
      }
    );
  }

  return {
    loading,
    busca,
    setBusca,
    linhas,
    total: data.categorias.length,
    ordenacao,
    alternar,
    totalConveniados,
    formOpen,
    setFormOpen,
    editing,
    form,
    setForm,
    formError,
    submitting,
    abrirForm,
    salvar,
    excluindo,
    setExcluindo,
    confirmarExclusao,
    alternarStatus,
  };
}