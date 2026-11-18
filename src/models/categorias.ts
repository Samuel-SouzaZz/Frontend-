import type { Categoria } from "./types";

type ComCategorias = {
  categorias: Categoria[];
};

export function nomesCategorias(
  conveniado: ComCategorias
): string {
  return (
    conveniado.categorias
      .map((categoria) => categoria.nome)
      .join(", ") || "Sem categoria"
  );
}

export function temCategoria(
  conveniado: ComCategorias,
  categoriaId: number
): boolean {
  return conveniado.categorias.some(
    (categoria) => categoria.id === categoriaId
  );
}

export function categoriasParaEscolher(
  todas: Categoria[],
  marcadas: number[]
): Categoria[] {
  return todas
    .filter(
      (categoria) =>
        categoria.status === "ATIVO" ||
        marcadas.includes(categoria.id)
    )
    .sort((a, b) =>
      a.nome.localeCompare(b.nome, "pt-BR")
    );
}