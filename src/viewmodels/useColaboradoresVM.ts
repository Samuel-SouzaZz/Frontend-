import { useMemo, useState, type FormEvent } from "react";
import { usePortal } from "./PortalContext";
import type { Colaborador } from "../models/types";
import { usePagination } from "../hooks/usePagination";
import { useUrlFilters } from "../hooks/useUrlFilters";
import { useAsyncAction } from "../hooks/useAsyncAction";
import { useSessionUser } from "../hooks/useSessionUser";
import { isAdministrador, SENHA_MINIMA } from "../models/rules";

const PAGE_SIZE = 8;
const FILTER_KEYS = ["buscar", "status", "setor"] as const;

export type ModoConta = "nova" | "existente";

export type ColaboradorForm = {
  modo: ModoConta;
  nome: string;
  email: string;
  senha: string;
  usuario_id: string;
  matricula: string;
  setor: string;
  cargo: string;
  data_admissao: string;
  telefone: string;
  status: Colaborador["status"];
};

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const blankForm = (modo: ModoConta): ColaboradorForm => ({
  modo,
  nome: "",
  email: "",
  senha: "",
  usuario_id: "",
  matricula: "",
  setor: "",
  cargo: "",
  data_admissao: "",
  telefone: "",
  status: "ATIVO",
});

export function useColaboradoresVM() {
  const { data, save, cadastrarColaborador, loading } = usePortal();
  const sessao = useSessionUser();
  const podeCriarConta = isAdministrador(sessao, data);
  const { running: submitting, run } = useAsyncAction();
  const { values: filters, setter } = useUrlFilters(FILTER_KEYS);
  const { buscar: search, status, setor } = filters;
  const setSearch = setter("buscar");
  const setStatus = setter("status");
  const setSetor = setter("setor");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Colaborador>();
  const [inactivating, setInactivating] = useState<Colaborador>();
  const [form, setForm] = useState<ColaboradorForm>(() => blankForm("existente"));
  const [formError, setFormError] = useState("");

  const sectors = useMemo(
    () =>
      [...new Set(data.colaboradores.map((item) => item.setor).filter(Boolean))].sort(),
    [data.colaboradores],
  );

  const availableUsers = useMemo(
    () =>
      data.usuarios.filter(
        (user) =>
          (user.id === editing?.usuario_id ||
            data.perfis.find((profile) => profile.id === user.perfil_id)?.escopo ===
              "COLABORADOR") &&
          !data.colaboradores.some(
            (item) => item.usuario_id === user.id && item.id !== editing?.id,
          ),
      ),
    [data.usuarios, data.perfis, data.colaboradores, editing?.id, editing?.usuario_id],
  );

  const usuariosMap = useMemo(
    () => new Map(data.usuarios.map((u) => [u.id, u])),
    [data.usuarios],
  );

  const filtered = useMemo(
    () =>
      data.colaboradores.filter((item) => {
        const user = usuariosMap.get(item.usuario_id);
        const nome = user?.nome ?? `Colaborador #${item.id}`;
        const text =
          `${nome} ${user?.email ?? ""} ${item.matricula} ${item.setor} ${item.cargo}`.toLocaleLowerCase(
            "pt-BR",
          );
        return (
          (!status || item.status === status) &&
          (!setor || item.setor === setor) &&
          text.includes(search.trim().toLocaleLowerCase("pt-BR"))
        );
      }),
    [data.colaboradores, usuariosMap, status, setor, search],
  );

  const {
    page: currentPage,
    setPage,
    start,
    end,
  } = usePagination(
    filtered.length,
    PAGE_SIZE,
    JSON.stringify([search, status, setor]),
  );

  const visibleRows = useMemo(
    () => filtered.slice(start, end),
    [filtered, start, end],
  );

  function openForm(item?: Colaborador) {
    setEditing(item);
    setForm(
      item
        ? {
            modo: "existente",
            nome: "",
            email: "",
            senha: "",
            usuario_id: String(item.usuario_id),
            matricula: item.matricula,
            setor: item.setor,
            cargo: item.cargo,
            data_admissao: item.data_admissao.slice(0, 10),
            telefone: item.telefone ?? "",
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
    const contaNova = !editing && form.modo === "nova";
    if (contaNova) {
      const email = form.email.trim().toLocaleLowerCase("pt-BR");
      if (!form.nome.trim()) return setFormError("Informe o nome completo.");
      if (!EMAIL.test(email)) return setFormError("Informe um e-mail válido.");
      if (data.usuarios.some((user) => user.email.toLocaleLowerCase("pt-BR") === email))
        return setFormError("Já existe uma conta com este e-mail. Use a opção Já tem conta.");
      if (form.senha.length < SENHA_MINIMA)
        return setFormError(`A senha inicial precisa ter pelo menos ${SENHA_MINIMA} caracteres.`);
    } else if (!form.usuario_id) {
      setFormError("Selecione um usuário para vincular ao colaborador.");
      return;
    }
    if (
      [form.matricula, form.setor, form.cargo].some((value) => !value.trim())
    ) {
      setFormError("Preencha os campos obrigatórios com dados válidos.");
      return;
    }
    if (
      data.colaboradores.some(
        (item) =>
          item.id !== editing?.id &&
          item.matricula.toLocaleLowerCase("pt-BR") ===
            form.matricula.trim().toLocaleLowerCase("pt-BR"),
      )
    ) {
      setFormError("Esta matrícula já está cadastrada.");
      return;
    }
    const trabalho = {
      matricula: form.matricula.trim(),
      setor: form.setor.trim(),
      cargo: form.cargo.trim(),
      data_admissao: form.data_admissao,
      telefone: form.telefone.trim() || null,
      status: form.status,
    };
    await run(
      () =>
        contaNova
          ? cadastrarColaborador(
              { nome: form.nome.trim(), email: form.email.trim().toLocaleLowerCase("pt-BR"), senha: form.senha },
              trabalho,
            )
          : save("colaboradores", editing?.id, { ...trabalho, usuario_id: Number(form.usuario_id) }),
      {
        success: editing ? "Colaborador atualizado." : "Colaborador cadastrado.",
        fallbackError: "Não foi possível salvar o colaborador.",
        onSuccess: () => setFormOpen(false),
        onError: setFormError,
      },
    );
  }

  async function inactivate() {
    if (!inactivating) return;
    await run(
      () => save("colaboradores", inactivating.id, { status: "INATIVO" }),
      {
        success: "Colaborador inativado. O histórico foi preservado.",
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
    setor,
    setSetor,
    page: currentPage,
    setPage,
    sectors,
    filtered,
    currentPage,
    visibleRows,
    availableUsers,
    podeCriarConta,
    contaAtual: editing ? usuariosMap.get(editing.usuario_id) : undefined,
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
