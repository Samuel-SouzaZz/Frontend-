import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState, type KeyboardEvent } from "react";
import { Check, ChevronDown } from "lucide-react";
import { juntarFiltro, valoresFiltro } from "../../models/filtros";
import { useFieldState } from "./fieldContext";
import { posicionarMenu } from "./posicionarMenu";
import type { SelectOption } from "./Select";

type MultiSelectProps = {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  plural: string;
  "aria-label"?: string;
};

export function MultiSelect({ value, onChange, options, plural, "aria-label": ariaLabel }: MultiSelectProps) {
  const field = useFieldState();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const listId = useId();
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const rotulo = ariaLabel ?? field?.label;
  const todos = options.find((option) => option.value === "")?.label ?? "Todos";
  const escolhas = options.filter((option) => option.value !== "");
  const valores = valoresFiltro(value);
  const marcadas = escolhas.filter((option) => valores.includes(option.value));

  const resumo =
    marcadas.length === 0
      ? todos
      : marcadas.length === 1
        ? marcadas[0].label
        : plural.charAt(0).toUpperCase() + plural.slice(1);

  const placeMenu = useCallback(() => {
    const trigger = wrapperRef.current?.querySelector("button");
    const menu = menuRef.current;
    if (trigger && menu) posicionarMenu(trigger, menu);
  }, []);

  useLayoutEffect(() => {
    const menu = menuRef.current;
    if (!open || !menu) return;
    if (!menu.matches(":popover-open")) menu.showPopover();
    placeMenu();
    return () => {
      if (menu.matches(":popover-open")) menu.hidePopover();
    };
  }, [open, placeMenu]);

  useEffect(() => {
    if (!open) return;
    const fecharFora = (event: PointerEvent) => {
      const alvo = event.target as Node;
      if (!wrapperRef.current?.contains(alvo) && !menuRef.current?.contains(alvo)) setOpen(false);
    };
    document.addEventListener("pointerdown", fecharFora);
    window.addEventListener("resize", placeMenu);
    window.addEventListener("scroll", placeMenu, true);
    return () => {
      document.removeEventListener("pointerdown", fecharFora);
      window.removeEventListener("resize", placeMenu);
      window.removeEventListener("scroll", placeMenu, true);
    };
  }, [open, placeMenu]);

  function alternar(opcao: string) {
    onChange(juntarFiltro(valores.includes(opcao) ? valores.filter((item) => item !== opcao) : [...valores, opcao]));
  }

  function onKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      if (!open) {
        setOpen(true);
        return;
      }
      const passo = event.key === "ArrowDown" ? 1 : -1;
      setActiveIndex((atual) => (atual + passo + escolhas.length) % escolhas.length);
    } else if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      if (open && escolhas[activeIndex]) alternar(escolhas[activeIndex].value);
      else setOpen(true);
    } else if (event.key === "Escape" && open) {
      event.preventDefault();
      event.stopPropagation();
      setOpen(false);
    } else if (event.key === "Tab" && open) {
      setOpen(false);
    }
  }

  return (
    <div className="field-select" ref={wrapperRef}>
      <button
        type="button"
        className="field-select-trigger"
        role="combobox"
        aria-label={rotulo}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={`${listId}-options`}
        aria-activedescendant={open ? `${listId}-option-${activeIndex}` : undefined}
        onClick={(event) => {
          event.preventDefault();
          event.currentTarget.focus();
          setOpen((atual) => !atual);
        }}
        onKeyDown={onKeyDown}
      >
        <span className="multi-select-resumo">
          <span className="multi-select-texto">{resumo}</span>
          {marcadas.length > 1 && <span className="multi-select-badge">{marcadas.length}</span>}
        </span>
        <ChevronDown size={17} aria-hidden="true" />
      </button>
      {open && (
        <div
          ref={menuRef}
          popover="manual"
          id={`${listId}-options`}
          className="field-select-menu"
          role="listbox"
          aria-multiselectable="true"
          aria-label={rotulo}
        >
          {escolhas.map((option, index) => {
            const marcada = valores.includes(option.value);
            return (
              <button
                key={option.value}
                id={`${listId}-option-${index}`}
                type="button"
                tabIndex={-1}
                role="option"
                aria-selected={marcada}
                className={`field-select-option multi-select-option${marcada ? " is-selected" : ""}${activeIndex === index ? " is-active" : ""}`}
                onMouseDown={(event) => event.preventDefault()}
                onClick={(event) => {
                  event.preventDefault();
                  alternar(option.value);
                }}
              >
                <span className="multi-select-caixa" aria-hidden="true">
                  {marcada && <Check size={12} strokeWidth={3} />}
                </span>
                <span>{option.label}</span>
              </button>
            );
          })}
          {marcadas.length > 0 && (
            <button
              type="button"
              tabIndex={-1}
              className="multi-select-limpar"
              onMouseDown={(event) => event.preventDefault()}
              onClick={(event) => {
                event.preventDefault();
                onChange("");
              }}
            >
              Limpar seleção
            </button>
          )}
        </div>
      )}
    </div>
  );
}
