export type Direcao = "asc" | "desc";

export type Ordem = { coluna: string; direcao: Direcao } | null;

export type ValorOrdenavel = string | number | null | undefined;

export type Ordenadores<T> = Record<string, (linha: T) => ValorOrdenavel>;

export function proximaOrdem(atual: Ordem, coluna: string): Ordem {
  if (!atual || atual.coluna !== coluna) return { coluna, direcao: "asc" };
  if (atual.direcao === "asc") return { coluna, direcao: "desc" };
  return null;
}

function vazio(valor: ValorOrdenavel) {
  return valor === null || valor === undefined || valor === "";
}

export function compararValores(a: ValorOrdenavel, b: ValorOrdenavel) {
  if (typeof a === "number" && typeof b === "number") return a - b;
  return String(a).localeCompare(String(b), "pt-BR", {
    numeric: true,
    sensitivity: "base",
  });
}

export function ordenarLinhas<T>(
  linhas: T[],
  ordem: Ordem,
  ordenadores: Ordenadores<T>,
): T[] {
  const valorDe = ordem ? ordenadores[ordem.coluna] : undefined;
  if (!ordem || !valorDe) return linhas;
  const sinal = ordem.direcao === "asc" ? 1 : -1;

  return linhas
    .map((linha, indice) => ({ linha, indice, valor: valorDe(linha) }))
    .sort((a, b) => {
      const aVazio = vazio(a.valor);
      const bVazio = vazio(b.valor);
      if (aVazio || bVazio) {
        if (aVazio && bVazio) return a.indice - b.indice;
        return aVazio ? 1 : -1;
      }
      return compararValores(a.valor, b.valor) * sinal || a.indice - b.indice;
    })
    .map((item) => item.linha);
}
