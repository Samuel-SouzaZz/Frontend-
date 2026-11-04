import {
  useId,
  useMemo,
  useState,
  type ChangeEvent,
  type KeyboardEvent,
} from "react";

import { Link, useNavigate } from "react-router-dom";

import { Search, X } from "lucide-react";

import { usePortal } from "../viewmodels/PortalContext";

export default function PortalSearch() {
  const { data } = usePortal();

  const navigate = useNavigate();

  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const resultsId = useId();

  // PREPARAR OS REGISTROS DA BUSCA

  const records = useMemo(() => {
    const usuariosMap = new Map(
      data.usuarios.map((u) => [u.id, u.nome])
    );

    return [
      ...data.colaboradores.map((item) => ({
        name:
          usuariosMap.get(item.usuario_id) ??
          `Colaborador #${item.id}`,
        type: "Colaborador",
        path: `/colaboradores/${item.id}`,
      })),

      ...data.beneficios.map((item) => ({
        name: item.nome,
        type: "Benefício",
        path: `/beneficios?abrir=${item.id}`,
      })),

      ...data.conveniados.map((item) => ({
        name:
          item.nome_fantasia ||
          item.razao_social,
        type: "Conveniado",
        path: `/conveniados/${item.id}`,
      })),

      ...data.campanhas.map((item) => ({
        name: item.nome,
        type: "Campanha / evento",
        path: `/campanhas?abrir=${item.id}`,
      })),
    ];
  }, [data]);

  // FILTRAR RESULTADOS DA BUSCA

  const term = query.trim().toLocaleLowerCase("pt-BR");

  const matches = term
    ? records
        .filter((item) =>
          item.name
            .toLocaleLowerCase("pt-BR")
            .includes(term)
        )
        .slice(0, 8)
    : [];

  const expanded = open && Boolean(term);

  // ESCOLHER UM RESULTADO PELO TECLADO

  function choose(index: number) {
    const item = matches[index];

    if (!item) return;

    navigate(item.path);

    setOpen(false);
    setQuery("");
    setActiveIndex(-1);
  }

  // CONTROLES DO TECLADO

  function handleKeyDown(
    event: KeyboardEvent<HTMLInputElement>
  ) {
    if (event.key === "Escape") {
      setOpen(false);
      setActiveIndex(-1);
      return;
    }

    if (!expanded || !matches.length) return;

    if (event.key === "ArrowDown") {
      event.preventDefault();

      setActiveIndex(
        (index) => (index + 1) % matches.length
      );
    } else if (event.key === "ArrowUp") {
      event.preventDefault();

      setActiveIndex((index) =>
        index <= 0
          ? matches.length - 1
          : index - 1
      );
    } else if (
      event.key === "Enter" &&
      activeIndex >= 0
    ) {
      event.preventDefault();
      choose(activeIndex);
    }
  }

  // ATUALIZAR O TEXTO DIGITADO

  function handleQueryChange(
    event: ChangeEvent<HTMLInputElement>
  ) {
    setQuery(event.target.value);
    setOpen(true);
    setActiveIndex(-1);
  }

  // LIMPAR A BUSCA

  function clearSearch() {
    setQuery("");
    setOpen(false);
    setActiveIndex(-1);
  }

  // INTERFACE DA BUSCA

  return (
    <div
      role="search"
      aria-label="Buscar no portal"
      className="portal-search"
      onBlur={(event) => {
        if (
          !event.currentTarget.contains(
            event.relatedTarget as Node
          )
        ) {
          setOpen(false);
        }
      }}
    >
      <Search
        size={19}
        aria-hidden="true"
      />

      <input
        role="combobox"
        aria-label="Buscar por colaborador, benefício, conveniado ou campanha"
        aria-autocomplete="list"
        aria-expanded={expanded}
        aria-controls={resultsId}
        aria-activedescendant={
          activeIndex >= 0 && expanded
            ? `${resultsId}-option-${activeIndex}`
            : undefined
        }
        placeholder="Buscar por colaborador, benefício, conveniado…"
        value={query}
        onChange={handleQueryChange}
        onFocus={() => setOpen(true)}
        onKeyDown={handleKeyDown}
      />

      {/* BOTÃO PARA LIMPAR A BUSCA */}

      {query && (
        <button
          type="button"
          className="icon-button"
          aria-label="Limpar busca do portal"
          onClick={clearSearch}
        >
          <X size={16} />
        </button>
      )}

      {/* RESULTADOS */}

      {expanded && (
        <div
          id={resultsId}
          className="portal-search-results"
        >
          {matches.length ? (
            <div
              role="listbox"
              aria-label="Resultados da busca"
            >
              {matches.map((item, index) => (
                <Link
                  id={`${resultsId}-option-${index}`}
                  key={`${item.path}-${item.name}-${index}`}
                  role="option"
                  aria-selected={activeIndex === index}
                  tabIndex={-1}
                  className={
                    activeIndex === index
                      ? "active"
                      : undefined
                  }
                  to={item.path}
                  onClick={() => {
                    setOpen(false);
                    setQuery("");
                    setActiveIndex(-1);
                  }}
                >
                  <span>{item.name}</span>
                  <small>{item.type}</small>
                </Link>
              ))}
            </div>
          ) : (
            <p
              role="status"
              aria-live="polite"
            >
              Nenhum registro encontrado.
            </p>
          )}
        </div>
      )}
    </div>
  );
}