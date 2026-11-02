import { createContext, useContext } from "react";

export type FieldState = {
  label: string;
  required: boolean;
  invalid: boolean;
};

export const FieldContext = createContext<FieldState | null>(null);

export const useFieldState = () => useContext(FieldContext);
