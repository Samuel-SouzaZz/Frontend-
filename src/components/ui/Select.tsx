import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import { ChevronDown } from "lucide-react";
import { useFieldState } from "./fieldContext";

export type SelectOption = {
  value: string;
  label: string;
  disabled?: boolean;
  group?: string;
};

type SelectProps = {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  "aria-label"?: string;
};

export function Select({
  value,
  onChange,
  options,
  placeholder = "Selecione uma opção",
  disabled = false,
  required,
  className,
  "aria-label": ariaLabel,
}: SelectProps) {
  const field = useFieldState();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const listId = useId();
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const selectedIndex = options.findIndex((option) => option.value === value);
  const selectedOption = options[selectedIndex];
  const invalid = Boolean(field?.invalid);
  const isRequired = required ?? Boolean(field?.required);

  const placeMenu = useCallback(() => {
    const trigger = wrapperRef.current?.querySelector("button");
    const menu = menuRef.current;
    if (!trigger || !menu) return;
    const area = trigger.getBoundingClientRect();
    const width = Math.max(area.width, menu.scrollWidth > area.width ? Math.min(menu.scrollWidth, 320) : 0);
    menu.style.width = `${width}px`;
    const real = menu.offsetWidth;
    const alignRight = area.left + real > window.innerWidth - 8;
    const left = Math.max(8, alignRight ? area.right - real : area.left);
    const below = window.innerHeight - area.bottom - 15;
    const above = area.top - 15;
    const height = Math.min(menu.scrollHeight, 280);
    const upward = height > below && above > below;
    menu.style.left = `${left}px`;
    menu.style.maxHeight = `${Math.max(120, Math.min(280, upward ? above : below))}px`;
    menu.style.top = upward ? "auto" : `${area.bottom + 7}px`;
    menu.style.bottom = upward ? `${window.innerHeight - area.top + 7}px` : "auto";
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
    const closeOnOutsidePointer = (event: PointerEvent) => {
      if (!wrapperRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", closeOnOutsidePointer);
    window.addEventListener("resize", placeMenu);
    window.addEventListener("scroll", placeMenu, true);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutsidePointer);
      window.removeEventListener("resize", placeMenu);
      window.removeEventListener("scroll", placeMenu, true);
    };
  }, [open, placeMenu]);

  const enabledIndexes = options
    .map((option, index) => (option.disabled ? -1 : index))
    .filter((index) => index >= 0);

  function choose(index: number) {
    const option = options[index];
    if (!option || option.disabled) return;
    if (option.value !== value) onChange(option.value);
    setOpen(false);
  }

  function openList() {
    setActiveIndex(selectedIndex);
    setOpen(true);
  }

  function move(direction: -1 | 1) {
    if (!enabledIndexes.length) return;
    const position = enabledIndexes.indexOf(activeIndex);
    const next =
      position < 0
        ? direction === 1
          ? 0
          : enabledIndexes.length - 1
        : (position + direction + enabledIndexes.length) %
          enabledIndexes.length;
    setActiveIndex(enabledIndexes[next]);
  }

  function onKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      if (open) move(event.key === "ArrowDown" ? 1 : -1);
      else openList();
    } else if (event.key === "Home" || event.key === "End") {
      event.preventDefault();
      setActiveIndex(
        event.key === "Home"
          ? (enabledIndexes[0] ?? -1)
          : (enabledIndexes.at(-1) ?? -1),
      );
      setOpen(true);
    } else if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      if (open) choose(activeIndex);
      else openList();
    } else if (event.key === "Escape" && open) {
      event.preventDefault();
      event.stopPropagation();
      setOpen(false);
    } else if (event.key === "Tab" && open) {
      setOpen(false);
    }
  }

  return (
    <div
      className={`field-select${className ? ` ${className}` : ""}`}
      ref={wrapperRef}
    >
      <button
        type="button"
        className={`field-select-trigger${invalid ? " is-invalid" : ""}`}
        role="combobox"
        aria-label={ariaLabel ?? field?.label}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={`${listId}-options`}
        aria-activedescendant={
          open && activeIndex >= 0
            ? `${listId}-option-${activeIndex}`
            : undefined
        }
        aria-required={isRequired || undefined}
        aria-invalid={invalid || undefined}
        data-select-value={value}
        data-required={isRequired ? "true" : undefined}
        disabled={disabled}
        onClick={(event) => {
          event.preventDefault();
          event.currentTarget.focus();
          if (open) setOpen(false);
          else openList();
        }}
        onKeyDown={onKeyDown}
      >
        <span className={selectedOption ? "" : "is-placeholder"}>
          {selectedOption?.label ?? placeholder}
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
          aria-label={ariaLabel ?? field?.label}
        >
          {options.map((option, index) => {
            const selected = option.value === value;
            const startsGroup =
              option.group &&
              (index === 0 || options[index - 1].group !== option.group);
            return (
              <div key={`${option.group ?? ""}-${option.value}-${index}`}>
                {startsGroup && (
                  <div className="field-select-group">{option.group}</div>
                )}
                <button
                  id={`${listId}-option-${index}`}
                  type="button"
                  tabIndex={-1}
                  className={`field-select-option${
                    selected ? " is-selected" : ""
                  }${activeIndex === index ? " is-active" : ""}`}
                  role="option"
                  aria-selected={selected}
                  aria-disabled={option.disabled || undefined}
                  disabled={option.disabled}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={(event) => {
                    event.preventDefault();
                    choose(index);
                  }}
                >
                  <span>{option.label}</span>
                  {selected && (
                    <span className="field-select-check" aria-hidden="true">
                      ✓
                    </span>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
