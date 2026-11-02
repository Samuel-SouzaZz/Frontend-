import type { SelectOption } from "../ui";
import { statusLabel } from "../../models/formatters";
import { TIPOS } from "../../viewmodels/useCampanhasVM";

export const TIPO_OPCOES: SelectOption[] = Object.entries(TIPOS).map(
  ([value, label]) => ({ value, label }),
);

export const STATUS_OPCOES: SelectOption[] = [
  "PLANEJADA",
  "ATIVA",
  "ENCERRADA",
  "CANCELADA",
].map((value) => ({ value, label: statusLabel(value) }));

export const encerrada = (status: string) =>
  status === "CANCELADA" || status === "ENCERRADA";
