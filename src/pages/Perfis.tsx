import { Plus, Settings, ShieldCheck } from "lucide-react";
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
import { AcessoTabs } from "../components/perfis/AcessoTabs";
import { PerfilDetailsModal } from "../components/perfis/PerfilDetailsModal";
import { PerfilFormModal } from "../components/perfis/PerfilFormModal";
import { PerfisStats } from "../components/perfis/PerfisStats";
import { PerfisTable } from "../components/perfis/PerfisTable";
import { UsuarioDetailsModal } from "../components/perfis/UsuarioDetailsModal";
import { UsuarioFormModal } from "../components/perfis/UsuarioFormModal";
import { UsuariosTable } from "../components/perfis/UsuariosTable";
import { isLocalDemoUser } from "../local-demo/localDemo";
import { capitalizeFirstLetter } from "../models/selectors";
import { usePerfisVM } from "../viewmodels/usePerfisVM";

const STATUS_FILTRO: SelectOption[] = [
  { value: "", label: "Todos os status" },
  { value: "ATIVO", label: "Ativos" },
  { value: "INATIVO", label: "Inativos" },
];

const ESCOPO_FILTRO: SelectOption[] = [
  { value: "", label: "Todos os escopos" },
  { value: "FCV", label: "Equipe FCV" },
  { value: "COLABORADOR", label: "Colaborador" },
  { value: "CONVENIADO", label: "Conveniado" },
];

export default function Perfis() {
  const {
    user,
    data,
    loading,
    PAGE_SIZE,
    tab,
    changeTab,
    tabKey,
    search,
    setSearch,
    status,
    setStatus,
    scope,
    setScope,
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
  } = usePerfisVM();

  const filtrar = (setter: (value: string) => void) => (value: string) => {
    setter(value);
    setPage(1);
  };
  const usuariosDoPerfil = (perfilId: number) =>
    data.usuarios.filter((item) => item.perfil_id === perfilId).length;
  const pagina = <T,>(rows: T[]) => rows.slice(start, start + PAGE_SIZE);
  const nomeInativando = inactivating
    ? inactivating.type === "usuario"
      ? capitalizeFirstLetter(inactivating.item.nome)
      : inactivating.item.nome
    : "";

  return (
    <>
      <PageHeader
        eyebrow="CONFIGURAÇÕES"
        icon={Settings}
        title="Perfis e usuários"
        description="Organize os acessos e mantenha as contas da plataforma atualizadas."
        actions={
          <button
            type="button"
            className="btn btn-primary"
            disabled={loading}
            onClick={() => (tab === "perfis" ? openProfile() : openUser())}
          >
            <Plus size={18} />{" "}
            {tab === "perfis" ? "Novo perfil" : "Novo usuário"}
          </button>
        }
      />
      {isLocalDemoUser(user) && (
        <p className="inline-notice" role="status">
          Você está usando a demonstração local. Cadastros feitos aqui não são
          enviados à API nem gravados no banco de dados; eles são reiniciados
          quando a página é atualizada.
        </p>
      )}
      <PerfisStats
        perfis={data.perfis}
        usuarios={data.usuarios}
        profileFor={profileFor}
      />
      <div className="access-notice">
        <ShieldCheck size={22} />
        <div>
          <strong>O administrador herda as funções do operador.</strong>
          <p>
            Somente o administrador FCV pode gerenciar usuários e perfis.
            Colaboradores e conveniados acessam suas próprias visões no
            aplicativo.
          </p>
        </div>
      </div>
      <AcessoTabs tab={tab} onChange={changeTab} onKeyDown={tabKey} />
      <section
        className="panel"
        role="tabpanel"
        id={`access-panel-${tab}`}
        aria-labelledby={`access-tab-${tab}`}
      >
        <FilterBar>
          <SearchField
            value={search}
            onChange={filtrar(setSearch)}
            placeholder={
              tab === "perfis"
                ? "Buscar por nome ou descrição do perfil..."
                : "Buscar por nome, e-mail ou perfil..."
            }
          />
          <Select
            aria-label="Filtrar por status"
            value={status}
            options={STATUS_FILTRO}
            onChange={filtrar(setStatus)}
          />
          <Select
            aria-label="Filtrar por escopo de acesso"
            value={scope}
            options={ESCOPO_FILTRO}
            onChange={filtrar(setScope)}
          />
        </FilterBar>
        {tab === "perfis" ? (
          filteredProfiles.length ? (
            <PerfisTable
              rows={pagina(filteredProfiles)}
              userCount={usuariosDoPerfil}
              onView={setProfileDetails}
              onEdit={openProfile}
              onInactivate={(item) => setInactivating({ type: "perfil", item })}
            />
          ) : (
            <EmptyState
              title={loading ? "Carregando perfis..." : "Nenhum perfil encontrado"}
              description="Ajuste os filtros ou cadastre um novo perfil."
            />
          )
        ) : filteredUsers.length ? (
          <UsuariosTable
            rows={pagina(filteredUsers)}
            currentUserId={user?.id}
            profileFor={profileFor}
            onView={setUserDetails}
            onEdit={openUser}
            onInactivate={(item) => setInactivating({ type: "usuario", item })}
          />
        ) : (
          <EmptyState
            title={loading ? "Carregando usuários..." : "Nenhum usuário encontrado"}
            description="Ajuste os filtros ou cadastre uma nova conta."
          />
        )}
        <Pagination
          page={currentPage}
          total={total}
          pageSize={PAGE_SIZE}
          onChange={setPage}
        />
      </section>
      {profileFormOpen && (
        <PerfilFormModal
          form={profileForm}
          onChange={setProfileForm}
          editing={Boolean(editingProfile)}
          protegido={editingProtected}
          submitting={submitting}
          error={formError}
          onSubmit={submitProfile}
          onClose={() => setProfileFormOpen(false)}
        />
      )}
      {userFormOpen && (
        <UsuarioFormModal
          form={userForm}
          onChange={setUserForm}
          profiles={availableProfiles}
          editing={Boolean(editingUser)}
          editingSelf={editingSelf}
          submitting={submitting}
          error={formError}
          onSubmit={submitUser}
          onClose={closeUser}
        />
      )}
      {profileDetails && (
        <PerfilDetailsModal
          perfil={profileDetails}
          usuarios={usuariosDoPerfil(profileDetails.id)}
          onClose={() => setProfileDetails(undefined)}
          onEdit={() => {
            openProfile(profileDetails);
            setProfileDetails(undefined);
          }}
        />
      )}
      {userDetails && (
        <UsuarioDetailsModal
          usuario={userDetails}
          perfil={profileFor(userDetails.perfil_id)}
          matricula={
            data.colaboradores.find(
              (item) => item.usuario_id === userDetails.id,
            )?.matricula
          }
          conveniado={
            data.conveniados.find((item) => item.usuario_id === userDetails.id)
              ?.nome_fantasia
          }
          onClose={() => setUserDetails(undefined)}
          onEdit={() => {
            openUser(userDetails);
            setUserDetails(undefined);
          }}
        />
      )}
      {inactivating && (
        <ConfirmModal
          title={`Inativar ${inactivating.type === "perfil" ? "perfil" : "usuário"}`}
          description={`Deseja inativar ${nomeInativando}? ${
            inactivating.type === "perfil"
              ? "O perfil deixará de estar disponível para novas contas. Os vínculos existentes serão preservados."
              : "O login desta conta será bloqueado. Os cadastros e históricos vinculados serão preservados."
          }`}
          onClose={() => {
            if (!submitting) setInactivating(undefined);
          }}
          onConfirm={inactivate}
          confirming={submitting}
          confirmLabel="Confirmar inativação"
          confirmingLabel="Inativando..."
        />
      )}
    </>
  );
}
