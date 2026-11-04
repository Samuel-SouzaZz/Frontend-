import { formatDate, parseDate } from "./formatters";
import type { Campanha, CampanhaStatus, CampanhaTipo } from "./types";

const NOME_DO_TIPO: Record<CampanhaTipo, string> = {
    CAMPANHA: "Campanha",
    EVENTO_INTERNO: "Evento interno",
    EVENTO_PATROCINADO: "Evento patrocinado",
    VOUCHER: "Voucher",
    CORTESIA: "Cortesia",
};

export const nomeDoTipo = (tipo: CampanhaTipo) => NOME_DO_TIPO[tipo] ?? tipo;

export const ehEvento = (tipo: CampanhaTipo) => tipo.startsWith("EVENTO");

export function statusPelasDatas(inicio: string, fim: string, hoje: string): CampanhaStatus {
    if (fim < hoje) return "ENCERRADA";
    if (inicio > hoje) return "PLANEJADA";
    return "ATIVA";
}

export function statusEfetivo(campanha: Campanha, hoje: string): CampanhaStatus {
    if (campanha.status === "CANCELADA" || campanha.status === "ENCERRADA") return campanha.status;
    return statusPelasDatas(campanha.data_inicio.slice(0, 10), campanha.data_fim.slice(0, 10), hoje);
}

export function duracaoEmDias(inicio: string, fim: string) {
    if (!inicio || !fim || fim < inicio) return 0;
    const dia = 24 * 60 * 60 * 1000;
    return Math.round((parseDate(fim).getTime() - parseDate(inicio).getTime()) / dia) + 1;
}

export function descreverPeriodo(inicio: string, fim: string) {
    if (!inicio || !fim) return "Período a definir";
    if (inicio === fim) return `Em ${formatDate(inicio)}`;
    return `De ${formatDate(inicio)} a ${formatDate(fim)}`;
}
