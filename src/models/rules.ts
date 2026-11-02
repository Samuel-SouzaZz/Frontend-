import type { PortalData, Utilizacao } from "./types";
import { parseDate } from "./formatters";

export const PERFIL_ADMINISTRADOR = "FCV_ADMINISTRADOR";
export const SENHA_MINIMA = 6;

export function isAdministrador(
  user: { perfil?: string; perfil_id?: number },
  data?: PortalData,
): boolean {
  const perfilNome =
    user.perfil ??
    (data && user.perfil_id !== undefined
      ? data.perfis.find((p) => p.id === user.perfil_id)?.nome
      : undefined);

  return perfilNome === PERFIL_ADMINISTRADOR;
}

export function canEstornar(uso: Utilizacao): boolean {
  return uso.status === "APROVADA";
}

export function withinPeriod(value: string, days: number, now = new Date()): boolean {
  const date = parseDate(value);
  if (Number.isNaN(date.getTime()) || date > now) return false;
  if (days === 0) return true;

  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - days);
  return date >= start && date <= now;
}
