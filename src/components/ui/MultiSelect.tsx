import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState, type KeyboardEvent } from "react";
import { Check, ChevronDown } from "lucide-react";
import { posicionarMenu } from "./posicionarMenu";

type MultiSelectOption = { value: number; label: string };

type MultiSelectProps = {
  values: number[];
  onChange: (values: number[]) => void;
  options: MultiSelectOption[];
  allLabel: string;
  plural: string;
  "aria-label": string;
};

export function MultiSelect({ values, onChange, options, allLabel, plural, "aria-label": ariaLabel }: MultiSelectProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const listId = useId();
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const escolhidas = options.filter((option) => values.includes(option.value));

  const resumo =
    escolhidas.length === 0
      ? allLabel
      : escolhidas.length <= 2
        ? escolhidas.map((option) => option.label).join(", ")
        : `${escolhidas.length} ${plural}`;

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

  function alternar(value: number) {
    onChange(values.includes(value) ? values.filter((item) => item !== value) : [...values, value]);
  }

  function onKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      if (!open) {
        setOpen(true);
        return;
      }
      const passo = event.key === "ArrowDown" ? 1 : -1;
      setActiveIndex((atual) => (atual + passo + options.length) % options.length);
    } else if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      if (open && options[activeIndex]) alternar(options[activeIndex].value);
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
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={`${listId}-options`}
        aria-activedescendant={open ? `${listId}-option-${activeIndex}` : undefined}
        onClick={(event) => {
          event.currentTarget.focus();
          setOpen((atual) => !atual);
        }}
        onKeyDown={onKeyDown}
      >
        <span className="multi-select-resumo">
          {resumo}
          {escolhidas.length > 0 && <span className="multi-select-badge">{escolhidas.length}</span>}
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
          aria-label={ariaLabel}
        >
          {options.map((option, index) => {
            const marcada = values.includes(option.value);
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
                onClick={() => alternar(option.value)}
              >
                <span className="multi-select-caixa" aria-hidden="true">
                  {marcada && <Check size={12} strokeWidth={3} />}
                </span>
                <span>{option.label}</span>
              </button>
            );
          })}
          {values.length > 0 && (
            <button
              type="button"
              tabIndex={-1}
              className="multi-select-limpar"
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => onChange([])}
            >
              Limpar seleção
            </button>
          )}
        </div>
      )}
    </div>
  );
}
