const SEPARADOR = "|";

export function valoresFiltro(filtro: string): string[] {
  return filtro ? filtro.split(SEPARADOR).filter(Boolean) : [];
}

export function juntarFiltro(valores: string[]): string {
  return valores.filter(Boolean).join(SEPARADOR);
}

export function passaNoFiltro(filtro: string, valor: string | number | null | undefined): boolean {
  if (!filtro) return true;
  if (valor === null || valor === undefined) return false;
  return valoresFiltro(filtro).includes(String(valor));
}
