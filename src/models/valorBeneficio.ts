import { formatMoney } from "./formatters";
import type { TipoBeneficio } from "./types";

export function descreverValor(
  tipo: TipoBeneficio,
  valor: string | number
) {
  const numero = Number(valor);

  if (!Number.isFinite(numero) || numero <= 0) {
    return "Valor a definir";
  }

  if (tipo === "PERCENTUAL") {
    if (numero >= 100) {
      return "Gratuito";
    }

    return `${numero.toLocaleString("pt-BR")}% de desconto`;
  }

  return `${formatMoney(numero)} de desconto`;
}