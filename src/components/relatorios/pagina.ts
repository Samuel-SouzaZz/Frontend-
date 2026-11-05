import type { Ordenacao } from "../../hooks/useOrdenacao";

export type PaginaRelatorio<T> = {
  current: number;
  rows: T[];
  ordenacao?: Ordenacao;
};
