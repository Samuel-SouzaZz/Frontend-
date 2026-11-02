import {
  Children,
  cloneElement,
  isValidElement,
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactElement,
  type ReactNode,
  type SelectHTMLAttributes,
} from "react";
import { ChevronDown } from "lucide-react";

type SelectOption = {
  value: string;
  label: string;
  disabled: boolean;
  group?: string;
};

type OptionProps = {
  value?: string | number;
  children?: ReactNode;
  disabled?: boolean;
};

type OptionGroupProps = {
  label?: string;
  children?: ReactNode;
};

function optionLabel(children: ReactNode) {
  return Children.toArray(children)
    .map((child) =>
      typeof child === "string" || typeof child === "number"
        ? String(child)
        : "",
    )
    .join("")
    .trim();
}

function readOptions(children: ReactNode): SelectOption[] {
  const options: SelectOption[] = [];
  Children.toArray(children).forEach((child) => {
    if (!isValidElement<OptionProps | OptionGroupProps>(child)) return;
    if (child.type === "option") {
      const props = child.props as OptionProps;
      const label = optionLabel(props.children);
      options.push({
        value: String(props.value ?? label),
        label,
        disabled: Boolean(props.disabled),
      });
      return;
    }
    if (child.type === "optgroup") {
      const props = child.props as OptionGroupProps;
      const group = props.label ?? "";
      Children.toArray(props.children).forEach((option) => {
        if (!isValidElement<OptionProps>(option) || option.type !== "option")
          return;
        const optionProps = option.props;
        const label = optionLabel(optionProps.children);
        options.push({
          value: String(optionProps.value ?? label),
          label,
          disabled: Boolean(optionProps.disabled),
          group,
        });
      });
    }
  });
  return options;
}

export function FormSelect({
  element,
  invalid,
  label,
}: {
  element: ReactElement<SelectHTMLAttributes<HTMLSelectElement>>;
  invalid: boolean;
  label: string;
}) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const listId = useId();
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [uncontrolledValue, setUncontrolledValue] = useState(
    String(element.props.defaultValue ?? ""),
  );
  const options = readOptions(element.props.children);
  const selectedValue = String(element.props.value ?? uncontrolledValue);
  const selectedOption = options.find(
    (option) => option.value === selectedValue,
  );
  const selectedIndex = options.findIndex(
    (option) => option.value === selectedValue,
  );
  const disabled = Boolean(element.props.disabled);

  useEffect(() => {
    if (!open) return;
    const closeOnOutsidePointer = (event: PointerEvent) => {
      if (!wrapperRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", closeOnOutsidePointer);
    return () =>
      document.removeEventListener("pointerdown", closeOnOutsidePointer);
  }, [open]);

  function chooseOption(option: SelectOption) {
    const select = wrapperRef.current?.querySelector("select");
    if (option.disabled || !select) return;
    const valueSetter = Object.getOwnPropertyDescriptor(
      HTMLSelectElement.prototype,
      "value",
    )?.set;
    if (!valueSetter) {
      throw new Error("Não foi possível atualizar o campo de seleção.");
    }
    valueSetter.call(select, option.value);
    if (element.props.value === undefined) {
      setUncontrolledValue(option.value);
    }
    select.dispatchEvent(new Event("change", { bubbles: true }));
    setOpen(false);
  }

  function enabledIndexes() {
    return options
      .map((option, index) => (option.disabled ? -1 : index))
      .filter((index) => index >= 0);
  }

  function moveActiveIndex(direction: -1 | 1) {
    const enabled = enabledIndexes();
    if (!enabled.length) return;
    const position = enabled.indexOf(activeIndex);
    const nextPosition =
      position < 0
        ? direction === 1
          ? 0
          : enabled.length - 1
        : (position + direction + enabled.length) % enabled.length;
    setActiveIndex(enabled[nextPosition]);
  }

  function onTriggerKeyDown(event: ReactKeyboardEvent<HTMLButtonElement>) {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      if (!open) {
        setActiveIndex(selectedIndex);
        setOpen(true);
      } else {
        moveActiveIndex(event.key === "ArrowDown" ? 1 : -1);
      }
    } else if (event.key === "Home" || event.key === "End") {
      event.preventDefault();
      const enabled = enabledIndexes();
      setActiveIndex(
        event.key === "Home" ? (enabled[0] ?? -1) : (enabled.at(-1) ?? -1),
      );
      setOpen(true);
    } else if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      if (open) {
        const activeOption = options[activeIndex];
        if (activeOption) chooseOption(activeOption);
      } else {
        setActiveIndex(selectedIndex);
        setOpen(true);
      }
    } else if (event.key === "Escape" && open) {
      event.preventDefault();
      setOpen(false);
    }
  }

  const nativeSelect = cloneElement(element, {
    id: listId,
    className: `${element.props.className ?? ""} field-select-native`.trim(),
    "aria-hidden": true,
    tabIndex: -1,
  });

  return (
    <div className="field-select" ref={wrapperRef}>
      {nativeSelect}
      <button
        type="button"
        className={`field-select-trigger${invalid ? " is-invalid" : ""}`}
        role="combobox"
        aria-label={element.props["aria-label"] ?? label}
        aria-labelledby={element.props["aria-labelledby"]}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId + "-options"}
        aria-activedescendant={
          open && activeIndex >= 0
            ? `${listId}-option-${activeIndex}`
            : undefined
        }
        aria-required={element.props.required || undefined}
        aria-invalid={invalid || undefined}
        disabled={disabled}
        onMouseDown={(event) => event.preventDefault()}
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          if (disabled) return;
          setActiveIndex(selectedIndex);
          setOpen((current) => !current);
        }}
        onKeyDown={onTriggerKeyDown}
      >
        <span className={selectedOption ? "" : "is-placeholder"}>
          {selectedOption?.label ?? "Selecione uma opção"}
        </span>
        <ChevronDown size={17} aria-hidden="true" />
      </button>
      {open && (
        <div
          id={listId + "-options"}
          className="field-select-menu"
          role="listbox"
          aria-labelledby={element.props["aria-labelledby"]}
        >
          {options.map((option, index) => (
            <div key={`${option.group ?? ""}-${option.value}-${index}`}>
              {option.group &&
                (index === 0 ||
                  options[index - 1].group !== option.group) && (
                  <div className="field-select-group">{option.group}</div>
                )}
              <button
                id={`${listId}-option-${index}`}
                type="button"
                className={`field-select-option${
                  selectedValue === option.value ? " is-selected" : ""
                }${activeIndex === index ? " is-active" : ""}`}
                role="option"
                aria-selected={selectedValue === option.value}
                aria-disabled={option.disabled || undefined}
                disabled={option.disabled}
                onMouseDown={(event) => event.preventDefault()}
                onClick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  chooseOption(option);
                }}
              >
                <span>{option.label}</span>
                {selectedValue === option.value && (
                  <span className="field-select-check" aria-hidden="true">
                    ✓
                  </span>
                )}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
