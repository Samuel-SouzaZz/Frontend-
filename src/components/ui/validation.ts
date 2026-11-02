import { createContext } from "react";

export const ValidationContext = createContext<string[]>([]);

type NativeControl = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;

const CONTROLS = "input, select, textarea, [data-select-value]";
const FALLBACK_LABEL = "Campo obrigatório";

function isNativeControl(element: Element): element is NativeControl {
  return (
    element instanceof HTMLInputElement ||
    element instanceof HTMLSelectElement ||
    element instanceof HTMLTextAreaElement
  );
}

function isActive(element: Element) {
  if (isNativeControl(element)) return element.willValidate;
  return element instanceof HTMLButtonElement && !element.disabled;
}

function isRequired(element: Element) {
  const field = element.closest<HTMLElement>(".field");
  if (field?.dataset.required === "true") return true;
  if (element instanceof HTMLElement && element.dataset.required === "true")
    return true;
  return isNativeControl(element) && element.required;
}

function currentValue(element: Element) {
  if (element instanceof HTMLElement && element.dataset.selectValue !== undefined)
    return element.dataset.selectValue;
  return isNativeControl(element) ? element.value : "";
}

function hasError(element: Element) {
  if (isNativeControl(element) && !element.validity.valid) return true;
  return isRequired(element) && !currentValue(element).trim();
}

function labelOf(element: Element) {
  const field = element.closest<HTMLElement>(".field");
  return (
    field?.dataset.fieldLabel ??
    element.getAttribute("aria-label") ??
    FALLBACK_LABEL
  );
}

export function invalidFields(form: HTMLFormElement) {
  const labels = [...form.querySelectorAll(CONTROLS)]
    .filter((element) => isActive(element) && hasError(element))
    .map(labelOf);
  return [...new Set(labels)];
}
