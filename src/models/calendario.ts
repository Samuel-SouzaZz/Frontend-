import type { Campanha } from "./types";

export type DiaDoCalendario = { data: string; dia: number; doMes: boolean };

const doisDigitos = (numero: number) => String(numero).padStart(2, "0");

export const chaveDoDia = (data: Date) =>
    `${data.getFullYear()}-${doisDigitos(data.getMonth() + 1)}-${doisDigitos(data.getDate())}`;

export function mesDaChave(chave: string) {
    const [ano, mes] = chave.split("-").map(Number);
    return new Date(ano, mes - 1, 1, 12);
}

export const mudarMes = (mes: Date, delta: number) =>
    new Date(mes.getFullYear(), mes.getMonth() + delta, 1, 12);

export function diasDoMes(mes: Date): DiaDoCalendario[] {
    const primeiro = new Date(mes.getFullYear(), mes.getMonth(), 1, 12);
    const ultimo = new Date(mes.getFullYear(), mes.getMonth() + 1, 0, 12);
    const total = Math.ceil((primeiro.getDay() + ultimo.getDate()) / 7) * 7;
    return Array.from({ length: total }, (_, indice) => {
        const data = new Date(mes.getFullYear(), mes.getMonth(), 1 - primeiro.getDay() + indice, 12);
        return { data: chaveDoDia(data), dia: data.getDate(), doMes: data.getMonth() === mes.getMonth() };
    });
}

export function campanhasDoDia(campanhas: Campanha[], dia: string) {
    return campanhas
        .filter((item) => item.data_inicio.slice(0, 10) <= dia && item.data_fim.slice(0, 10) >= dia)
        .sort((a, b) => a.data_inicio.localeCompare(b.data_inicio) || a.nome.localeCompare(b.nome, "pt-BR"));
}

export function nomeDoMes(mes: Date) {
    const texto = mes.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
    return texto.charAt(0).toUpperCase() + texto.slice(1);
}