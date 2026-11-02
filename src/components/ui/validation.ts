import { createContext } from "react";

export const ValidationContext = createContext<string[]>([]);

type FormControl = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;

export function invalidFields(form: HTMLFormElement) {
  form.querySelectorAll(".field").forEach((field) => {
    if (field.querySelector("em"))
      field
        .querySelectorAll<FormControl>("input,select,textarea")
        .forEach((input) => {
          input.required = true;
        });
  });
  const controls = [
    ...form.querySelectorAll<FormControl>("input,select,textarea"),
  ];
  const labels = controls
    .filter(
      (input) =>
        input.willValidate &&
        (!input.validity.valid ||
          (input.required && !input.value.trim()) ||
          (input.inputMode === "numeric" &&
            input.value.replace(/\D/g, "").length !== 14)),
    )
    .map(
      (input) =>
        input
          .closest(".field")
          ?.querySelector("span")
          ?.textContent?.replace("*", "")
          .trim() || "Campo obrigatório",
    );
  return [...new Set(labels)];
}
