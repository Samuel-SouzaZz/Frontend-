import { formatMoney } from "./formatters";
import type { TipoBeneficio } from "./types";

export function descreverValor(tipo: TipoBeneficio, valor: string | number) {
  const numero = Number(valor);
  if (!Number.isFinite(numero) || numero <= 0) return "Valor a definir";
  if (tipo === "PERCENTUAL") {
    if (numero >= 100) return "Gratuito";
    return `${numero.toLocaleString("pt-BR")}% de desconto`;
  }
  return `${formatMoney(numero)} de desconto`;
}

export function erroValor(tipo: TipoBeneficio, valor: string) {
  const numero = Number(valor.replace(",", "."));
  if (!valor.trim() || !Number.isFinite(numero) || numero <= 0)
    return tipo === "PERCENTUAL"
      ? "Informe quantos por cento de desconto."
      : "Informe o valor do desconto em reais.";
  if (tipo === "PERCENTUAL" && numero > 100)
    return "O desconto não pode passar de 100%.";
  return "";
}

export const numeroDoTexto = (valor: string) => Number(valor.replace(",", "."));

export const vezes = (quantidade: number) =>
  `${quantidade} ${quantidade === 1 ? "vez" : "vezes"}`;
