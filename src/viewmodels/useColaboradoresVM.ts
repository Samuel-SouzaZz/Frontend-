import { useMemo, useState, type FormEvent } from "react";
import { usePortal } from "./PortalContext";
import type { Colaborador } from "../models/types";
import { usePagination } from "../hooks/usePagination";
import { useUrlFilters } from "../hooks/useUrlFilters";
import { useAsyncAction } from "../hooks/useAsyncAction";

const PAGE_SIZE = 8;
const FILTER_KEYS = ["buscar", "status", "setor"] as const;

export type ColaboradorForm = {
  usuario_id: string;
  matricula: string;
  setor: string;
  cargo: string;
  data_admissao: string;
  telefone: string;
  status: Colaborador["status"];
};

const blankForm = (): ColaboradorForm => ({
  usuario_id: "",
  matricula: "",
  setor: "",
  cargo: "",
  data_admissao: "",
  telefone: "",
  status: "ATIVO",
});

export function useColaboradoresVM() {
  const { data, save, loading } = usePortal();
  const { running: submitting, run } = useAsyncAction();
  const { values: filters, setter } = useUrlFilters(FILTER_KEYS);
  const { buscar: search, status, setor } = filters;
  const setSearch = setter("buscar");
  const setStatus = setter("status");
  const setSetor = setter("setor");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Colaborador>();
  const [inactivating, setInactivating] = useState<Colaborador>();
  const [form, setForm] = useState<ColaboradorForm>(blankForm);
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
            usuario_id: String(item.usuario_id),
            matricula: item.matricula,
            setor: item.setor,
            cargo: item.cargo,
            data_admissao: item.data_admissao.slice(0, 10),
            telefone: item.telefone ?? "",
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
    if (!form.usuario_id) {
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
    await run(
      () =>
        save("colaboradores", editing?.id, {
          ...form,
          usuario_id: Number(form.usuario_id),
          matricula: form.matricula.trim(),
          setor: form.setor.trim(),
          cargo: form.cargo.trim(),
          telefone: form.telefone.trim() || null,
        }),
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
