import { useCallback, useMemo, useState } from "react";
import {
  ordenarLinhas,
  proximaOrdem,
  type Ordem,
  type Ordenadores,
} from "../models/ordenacao";

export function useOrdenacao<T>(linhas: T[], ordenadores: Ordenadores<T>) {
  const [ordem, setOrdem] = useState<Ordem>(null);

  const ordenadas = useMemo(
    () => ordenarLinhas(linhas, ordem, ordenadores),
    [linhas, ordem, ordenadores],
  );

  const alternar = useCallback(
    (coluna: string) => setOrdem((atual) => proximaOrdem(atual, coluna)),
    [],
  );

  const chave = ordem ? `${ordem.coluna}:${ordem.direcao}` : "";

  return { ordenadas, ordem, alternar, chave };
}

export type Ordenacao = { ordem: Ordem; alternar: (coluna: string) => void };
