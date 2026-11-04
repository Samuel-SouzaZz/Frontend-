import { useState, type FormEvent, type KeyboardEvent } from "react";
import { usePortal } from "./PortalContext";
import { useToast } from "./ToastContext";
import { isAdministrador } from "../models/selectors";
import { PERFIL_ADMINISTRADOR, SENHA_MINIMA } from "../models/rules";
import type { Escopo, Perfil, Usuario } from "../models/types";
import { usePagination } from "../hooks/usePagination";
import { useUrlFilters } from "../hooks/useUrlFilters";
import { useAsyncAction } from "../hooks/useAsyncAction";
import { useSessionUser } from "../hooks/useSessionUser";

const PAGE_SIZE = 8;
const FILTER_KEYS = ["buscar", "status", "escopo"] as const;

export const permissions = [
  { value: "cadastros", label: "Cadastros" },
  { value: "campanhas", label: "Campanhas e eventos" },
  { value: "utilizacoes", label: "Utilizações" },
  { value: "relatorios", label: "Relatórios" },
  { value: "tudo", label: "Todas as permissões" },
];

export const scopeLabels: Record<Escopo, string> = {
  FCV: "Equipe FCV · Portal web",
  COLABORADOR: "Colaborador · Aplicativo",
  CONVENIADO: "Conveniado · Aplicativo",
};

type ProfileForm = {
  nome: string;
  escopo: Escopo;
  descricao: string;
  permissoes: string[];
  status: Perfil["status"];
};

type UserForm = {
  nome: string;
  email: string;
  perfil_id: string;
  status: Usuario["status"];
  senha: string;
};

const blankProfile = (): ProfileForm => ({
  nome: "",
  escopo: "FCV",
  descricao: "",
  permissoes: ["cadastros"],
  status: "ATIVO",
});

const blankUser = (): UserForm => ({
  nome: "",
  email: "",
  perfil_id: "",
  status: "ATIVO",
  senha: "",
});

export const protectedProfile = (profile: Perfil) =>
  profile.nome === PERFIL_ADMINISTRADOR;

export const permissionLabel = (permission: string) =>
  permissions.find((item) => item.value === permission)?.label ??
  (
    {
      carteira: "Carteira de benefícios",
      qrcode: "QR de resgate",
      historico: "Histórico pessoal",
      validar: "Validação de resgates",
      historico_estabelecimento: "Histórico do estabelecimento",
    } as Record<string, string>
  )[permission] ??
  permission;

export function usePerfisVM() {
  const user = useSessionUser();
  const { data, save, loading } = usePortal();
  const { notify } = useToast();
  const { running: submitting, run } = useAsyncAction();
  const admin = isAdministrador(user, data);
  const [tab, setTab] = useState<"perfis" | "usuarios">("perfis");
  const { values: filters, setter, clear: clearFilters } = useUrlFilters(FILTER_KEYS);
  const { buscar: search, status, escopo: scope } = filters;
  const setSearch = setter("buscar");
  const setStatus = setter("status");
  const setScope = setter("escopo");
  const [profileFormOpen, setProfileFormOpen] = useState(false);
  const [userFormOpen, setUserFormOpen] = useState(false);
  const [editingProfile, setEditingProfile] = useState<Perfil>();
  const [editingUser, setEditingUser] = useState<Usuario>();
  const [profileDetails, setProfileDetails] = useState<Perfil>();
  const [userDetails, setUserDetails] = useState<Usuario>();
  const [inactivating, setInactivating] = useState<
    { type: "perfil"; item: Perfil } | { type: "usuario"; item: Usuario }
  >();
  const [profileForm, setProfileForm] = useState<ProfileForm>(blankProfile);
  const [userForm, setUserForm] = useState<UserForm>(blankUser);
  const [formError, setFormError] = useState("");
  const editingProtected =
    editingProfile !== undefined && protectedProfile(editingProfile);
  const editingSelf = editingUser?.id === user?.id;

  const profileFor = (id: number) =>
    data.perfis.find((profile) => profile.id === id);

  const filteredProfiles = data.perfis.filter(
    (item) =>
      (!status || item.status === status) &&
      (!scope || item.escopo === scope) &&
      `${item.nome} ${item.descricao ?? ""}`
        .toLocaleLowerCase("pt-BR")
        .includes(search.trim().toLocaleLowerCase("pt-BR")),
  );

  const filteredUsers = data.usuarios.filter(
    (item) =>
      (!status || item.status === status) &&
      (!scope || profileFor(item.perfil_id)?.escopo === scope) &&
      `${item.nome} ${item.email} ${profileFor(item.perfil_id)?.nome ?? ""}`
        .toLocaleLowerCase("pt-BR")
        .includes(search.trim().toLocaleLowerCase("pt-BR")),
  );

  const total =
  tab === "perfis" ? filteredProfiles.length : filteredUsers.length;

  const { page: currentPage, setPage, start } = usePagination(
    total,
    PAGE_SIZE,
    JSON.stringify([tab, search, status, scope]),
  );

  const availableProfiles = data.perfis.filter(
    (profile) =>
      profile.status === "ATIVO" || profile.id === editingUser?.perfil_id,
  );

 function changeTab(next: "perfis" | "usuarios") {
  setTab(next);
  clearFilters();
}

  function tabKey(event: KeyboardEvent<HTMLButtonElement>) {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key))
      return;
    event.preventDefault();
    const next =
      event.key === "Home"
        ? "perfis"
        : event.key === "End"
          ? "usuarios"
          : tab === "perfis"
            ? "usuarios"
            : "perfis";
    changeTab(next);
    document.getElementById(`access-tab-${next}`)?.focus();
  }

  function openProfile(item?: Perfil) {
    if (!admin) return;
    setEditingProfile(item);
    setProfileForm(
      item
        ? {
            nome: item.nome,
            escopo: item.escopo,
            descricao: item.descricao ?? "",
            permissoes: [...(item.permissoes ?? [])],
            status: item.status,
          }
        : blankProfile(),
    );
    setFormError("");
    setProfileFormOpen(true);
  }

  function openUser(item?: Usuario) {
    if (!admin) return;
    setEditingUser(item);
    setUserForm(
      item
        ? {
            nome: item.nome,
            email: item.email,
            perfil_id: String(item.perfil_id),
            status: item.status,
            senha: "",
          }
        : blankUser(),
    );
    setFormError("");
    setUserFormOpen(true);
  }

  function closeUser() {
    if (!submitting) {
      setUserFormOpen(false);
      setUserForm(blankUser());
    }
  }

  async function submitProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError("");
    if (!admin) {
      setFormError("Somente o administrador FCV pode alterar perfis.");
      return;
    }
    const name = profileForm.nome.trim();
    if (!name) {
      setFormError("Informe o nome do perfil.");
      return;
    }
    if (
      data.perfis.some(
        (item) =>
          item.id !== editingProfile?.id &&
          item.nome.toLocaleLowerCase("pt-BR") ===
            name.toLocaleLowerCase("pt-BR"),
      )
    ) {
      setFormError("Já existe um perfil com este nome.");
      return;
    }
    if (
      editingProtected &&
      (name !== editingProfile?.nome ||
        profileForm.escopo !== editingProfile?.escopo ||
        profileForm.status !== editingProfile?.status)
    ) {
      setFormError(
        "O nome, escopo e status do perfil administrador são protegidos.",
      );
      return;
    }
    await run(
      () =>
        save(
          "perfis",
          editingProfile?.id,
          editingProtected
            ? { descricao: profileForm.descricao.trim() || null }
            : {
                ...profileForm,
                nome: name,
                descricao: profileForm.descricao.trim() || null,
                permissoes: [...new Set(profileForm.permissoes)],
              },
        ),
      {
        success: editingProfile ? "Perfil atualizado." : "Perfil cadastrado.",
        fallbackError: "Não foi possível salvar o perfil.",
        onSuccess: () => setProfileFormOpen(false),
        onError: setFormError,
      },
    );
  }

  async function submitUser(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError("");
    if (!admin) {
      setFormError("Somente o administrador FCV pode alterar usuários.");
      return;
    }
    const name = userForm.nome.trim();
    const email = userForm.email.trim().toLocaleLowerCase("pt-BR");
    if (!name || !email || !userForm.perfil_id) {
      setFormError("Preencha nome, e-mail e perfil de acesso.");
      return;
    }
    if (
      data.usuarios.some(
        (item) =>
          item.id !== editingUser?.id &&
          item.email.toLocaleLowerCase("pt-BR") === email,
      )
    ) {
      setFormError("Este e-mail já está cadastrado.");
      return;
    }
    if (
      (!editingUser || userForm.senha.length > 0) &&
      userForm.senha.length < SENHA_MINIMA
    ) {
      setFormError(`A senha deve ter pelo menos ${SENHA_MINIMA} caracteres.`);
      return;
    }
    if (
      editingSelf &&
      (Number(userForm.perfil_id) !== editingUser?.perfil_id ||
        userForm.status !== editingUser?.status)
    ) {
      setFormError(
        "Você não pode alterar seu próprio perfil ou status nesta sessão.",
      );
      return;
    }
    const selectedProfile = profileFor(Number(userForm.perfil_id));
    if (
      !selectedProfile ||
      (selectedProfile.status !== "ATIVO" &&
        selectedProfile.id !== editingUser?.perfil_id)
    ) {
      setFormError("Selecione um perfil ativo.");
      return;
    }
    const payload: Partial<Usuario> = {
      nome: name,
      email,
      ...(editingSelf
        ? {}
        : { perfil_id: Number(userForm.perfil_id), status: userForm.status }),
      ...(userForm.senha ? { senha: userForm.senha } : {}),
    };
    await run(() => save("usuarios", editingUser?.id, payload), {
      success: editingUser ? "Usuário atualizado." : "Usuário cadastrado.",
      fallbackError: "Não foi possível salvar o usuário.",
      onSuccess: () => {
        setUserFormOpen(false);
        setUserForm(blankUser());
      },
      onError: setFormError,
    });
  }

  async function inactivate() {
    if (!inactivating || !admin) return;
    if (
      inactivating.type === "perfil" &&
      protectedProfile(inactivating.item)
    ) {
      notify("O perfil administrador é protegido.", "error");
      return;
    }
    if (inactivating.type === "usuario" && inactivating.item.id === user?.id) {
      notify("Você não pode inativar sua própria conta.", "error");
      return;
    }
    const target = inactivating;
    await run(
      () =>
        target.type === "perfil"
          ? save("perfis", target.item.id, { status: "INATIVO" })
          : save("usuarios", target.item.id, { status: "INATIVO" }),
      {
        success: `${target.type === "perfil" ? "Perfil" : "Usuário"} inativado. Os vínculos foram preservados.`,
        fallbackError: "Não foi possível inativar o registro.",
        onSuccess: () => setInactivating(undefined),
      },
    );
  }

  return {
    user,
    data,
    loading,
    admin,
    PAGE_SIZE,
    tab,
    setTab,
    changeTab,
    tabKey,
    search,
    setSearch,
    status,
    setStatus,
    scope,
    setScope,
    page: currentPage,
    setPage,
    filteredProfiles,
    filteredUsers,
    total,
    currentPage,
    start,
    profileFor,
    availableProfiles,
    editingProtected,
    editingSelf,
    profileFormOpen,
    setProfileFormOpen,
    editingProfile,
    profileForm,
    setProfileForm,
    openProfile,
    submitProfile,
    profileDetails,
    setProfileDetails,
    userFormOpen,
    setUserFormOpen,
    editingUser,
    userForm,
    setUserForm,
    openUser,
    closeUser,
    submitUser,
    userDetails,
    setUserDetails,
    inactivating,
    setInactivating,
    inactivate,
    formError,
    submitting,
  };
}
