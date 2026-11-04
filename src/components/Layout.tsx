import { NavLink, Outlet, Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Gift,
  Handshake,
  ClipboardList,
  Megaphone,
  ChartNoAxesCombined,
  ShieldCheck,
  LogOut,
  HelpCircle,
  ChevronsLeft,
  Menu,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "../viewmodels/AuthContext";
import { useSessionUser } from "../hooks/useSessionUser";
import { usePortal } from "../viewmodels/PortalContext";
import { useToast } from "../viewmodels/ToastContext";
import {
  capitalizeFirstLetter,
  initials,
  isAdministrador,
} from "../models/selectors";
import Brand from "./Brand";
import PortalSearch from "./PortalSearch";
import NotificationCenter from "./NotificationCenter";
import type { Resource } from "../models/types";
const navigation = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/colaboradores", label: "Colaboradores", icon: Users },
  { to: "/beneficios", label: "Benefícios", icon: Gift },
  { to: "/conveniados", label: "Conveniados", icon: Handshake },
  { to: "/utilizacoes", label: "Utilizações", icon: ClipboardList },
  { to: "/campanhas", label: "Campanhas e eventos", icon: Megaphone },
  { to: "/relatorios", label: "Relatórios", icon: ChartNoAxesCombined },
  { to: "/perfis", label: "Configurações", icon: ShieldCheck },
];
const resourceLabels: Record<Resource, string> = {
  usuarios: "Usuários",
  perfis: "Perfis",
  colaboradores: "Colaboradores",
  conveniados: "Conveniados",
  beneficios: "Benefícios",
  ofertas: "Ofertas",
  campanhas: "Campanhas",
  itensCampanha: "Itens de campanha",
  ofertasCampanha: "Ofertas de campanha",
  utilizacoes: "Utilizações",
};
const helpByPage: Record<string, string> = {
  "/": "Confira os indicadores e ajuste o período para comparar utilizações.",
  "/colaboradores": "Consulte colaboradores e mantenha seus dados e vínculos atualizados.",
  "/beneficios": "Cadastre benefícios e confira quais conveniados estão associados.",
  "/conveniados": "Mantenha os dados dos estabelecimentos e seus usuários responsáveis.",
  "/utilizacoes": "Acompanhe as solicitações e confira os detalhes antes de agir.",
  "/campanhas": "Consulte campanhas e eventos, seus benefícios e respectivos status.",
  "/relatorios": "Use os filtros disponíveis para consultar os dados do período desejado.",
  "/perfis": "Gerencie usuários e permissões. A criação de contas é restrita ao administrador.",
  "/meu-perfil": "Confira os dados da sua conta e o perfil de acesso atual.",
};
export default function Layout() {
  const { logout } = useAuth();
  const user = useSessionUser();
  const location = useLocation();
  const { loading, refreshing, error, resourceErrors, reload, data } =
    usePortal();
  const failedResources = (Object.keys(resourceErrors) as Resource[]).map(
    (resource) => resourceLabels[resource],
  );
  const { toast } = useToast();
  const pageHelp =
    helpByPage[location.pathname] ??
    "Use o menu para acessar cadastros, utilizações e relatórios do portal.";
  const [open, setOpen] = useState(false),
    [collapsed, setCollapsed] = useState(false),
    [help, setHelp] = useState(false),
    [desktop, setDesktop] = useState(() =>
      window.matchMedia("(min-width: 801px)").matches,
    );
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const moveFocus = useRef(false);
  const sidebarVisible = desktop ? !collapsed : open;
  useEffect(() => {
    if (!moveFocus.current) return;
    moveFocus.current = false;
    (sidebarVisible ? closeButtonRef : menuButtonRef).current?.focus();
  }, [sidebarVisible]);
  const toggleSidebar = (show: boolean) => {
    moveFocus.current = true;
    if (desktop) setCollapsed(!show);
    else setOpen(show);
  };
  useEffect(() => {
    const media = window.matchMedia("(min-width: 801px)");
    const updateDesktop = () => setDesktop(media.matches);
    media.addEventListener("change", updateDesktop);
    return () => media.removeEventListener("change", updateDesktop);
  }, []);
  const admin = isAdministrador(user, data);
  return (
    <div className={`app-shell ${collapsed ? "sidebar-collapsed" : ""}`}>
      <a className="skip-link" href="#main">
        Pular para conteúdo
      </a>
      {open && (
        <button
          className="sidebar-scrim"
          type="button"
          aria-label="Fechar menu lateral"
          onClick={() => setOpen(false)}
        />
      )}
      <aside
        id="main-sidebar"
        className={`sidebar ${open ? "open" : ""}`}
        inert={desktop && collapsed}
      >
        <Link to="/" className="brand-link" onClick={() => setOpen(false)}>
          <Brand compact />
        </Link>
        <div className="workspace-label">Gestão</div>
        <nav className="main-navigation" aria-label="Menu principal">
          {navigation
            .filter((item) => item.to !== "/perfis" || admin)
            .map(({ to, label, icon: Icon }) => (
              <NavLink
                to={to}
                key={to}
                end={to === "/"}
                onClick={() => {
                  setOpen(false);
                  setHelp(false);
                }}
                className={({ isActive }) =>
                  `nav-link ${isActive ? "active" : ""}`
                }
              >
                <Icon size={20} />
                <span>{label}</span>
                {to === "/campanhas" && (
                  <span className="nav-count" aria-hidden="true">
                    {data.campanhas.filter((c) => c.status === "ATIVA").length}
                  </span>
                )}
              </NavLink>
            ))}
          <button
            type="button"
            className={`nav-link nav-help${help ? " is-open" : ""}`}
            aria-expanded={help}
            aria-controls="page-help"
            onClick={() => setHelp(!help)}
          >
            <HelpCircle size={20} />
            <span>Ajuda</span>
          </button>
        </nav>
        <div className="sidebar-bottom">
          <div className="sidebar-user">
            <Link to="/meu-perfil" className="sidebar-profile-link" aria-label="Abrir meu perfil" aria-current={location.pathname === "/meu-perfil" ? "page" : undefined} onClick={() => { setOpen(false); setHelp(false); }}>
              <span className="avatar" aria-hidden="true">{initials(user.nome)}</span>
              <div><strong>{capitalizeFirstLetter(user.nome)}</strong><small>{admin ? "Administrador FCV" : "Operador FCV"}</small></div>
            </Link>
            <button
              className="icon-button"
              aria-label="Sair da conta"
              onClick={logout}
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </aside>
      {sidebarVisible && (
        <button
          ref={closeButtonRef}
          type="button"
          className="sidebar-close"
          aria-label="Recolher menu lateral"
          aria-controls="main-sidebar"
          onClick={() => toggleSidebar(false)}
        >
          <ChevronsLeft size={16} aria-hidden="true" />
          <span className="menu-toggle-tooltip" aria-hidden="true">
            Recolher menu
          </span>
        </button>
      )}
      <div className="main-shell">
        <header className="topbar">
          <div className="topbar-left">
            {!sidebarVisible && (
              <button
                ref={menuButtonRef}
                type="button"
                className="icon-button menu-toggle"
                aria-label="Mostrar menu lateral"
                aria-controls="main-sidebar"
                aria-expanded={false}
                onClick={() => toggleSidebar(true)}
              >
                <Menu />
                <span className="menu-toggle-tooltip" aria-hidden="true">
                  Mostrar menu lateral
                </span>
              </button>
            )}
            <PortalSearch />
          </div>
          <div className="topbar-right">
            <NotificationCenter />
            <Link to="/meu-perfil" className="profile-link" aria-label="Abrir meu perfil" aria-current={location.pathname === "/meu-perfil" ? "page" : undefined}>
              <span className="avatar small" aria-hidden="true">{initials(user.nome)}</span>
              <div className="topbar-identity"><strong>{capitalizeFirstLetter(user.nome)}</strong><small>{admin ? "Administrador" : "Operador"}</small></div>
            </Link>
          </div>
        </header>
        <main id="main" className="page-content" tabIndex={-1}>
          <section
            id="page-help"
            className="inline-notice"
            aria-label="Ajuda desta página"
            hidden={!help}
          >
            <h2>Ajuda desta página</h2>
            <p>{pageHelp}</p>
            <button className="button-link" onClick={() => setHelp(false)}>
              Fechar orientação
            </button>
          </section>
          {loading ? (
            <div className="loading-state" role="status">
              <span className="spinner" />
              <h2>Carregando seu portal</h2>
              <p>Estamos organizando as informações para você.</p>
            </div>
          ) : error ? (
            <div className="error-state" role="alert">
              <AlertCircle size={32} />
              <h2>Não foi possível carregar os dados</h2>
              <p>{error}</p>
              <button className="btn btn-primary" onClick={() => void reload()}>
                Tentar novamente
              </button>
            </div>
          ) : (
            <>
              {failedResources.length > 0 && (
                <section className="inline-notice" role="alert">
                  <h2>Alguns dados não foram carregados</h2>
                  <p>{failedResources.join(", ")}.</p>
                  <button
                    className="button-link"
                    type="button"
                    disabled={refreshing}
                    onClick={() => void reload()}
                  >
                    {refreshing ? "Carregando…" : "Tentar novamente"}
                  </button>
                </section>
              )}
              <Outlet />
            </>
          )}
          <footer className="page-footer">
            <span>Fundação Cristiano Varella · Pela vida.</span>
            <span>Portal de benefícios e relacionamento</span>
          </footer>
        </main>
      </div>
      {toast && (
        <div
          className={`toast toast-${toast.type}`}
          role={toast.type === "error" ? "alert" : "status"}
        >
          {toast.type === "error" ? (
            <AlertCircle size={19} />
          ) : (
            <CheckCircle2 size={19} />
          )}
          <span>{toast.message}</span>
        </div>
      )}
    </div>
  );
}
