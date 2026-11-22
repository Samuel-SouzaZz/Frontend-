import type { Utilizacao } from "./types";

export function agoraLocal(data: Date = new Date()): string {
  const dois = (n: number) => String(n).padStart(2, "0");
  return `${data.getFullYear()}-${dois(data.getMonth() + 1)}-${dois(data.getDate())} ${dois(data.getHours())}:${dois(data.getMinutes())}:${dois(data.getSeconds())}`;
}

const semT = (texto: string) => texto.replace("T", " ").slice(0, 19);

export function venceu(uso: Pick<Utilizacao, "status" | "data_expiracao">, agora: string): boolean {
  return uso.status === "PENDENTE" && Boolean(uso.data_expiracao) && semT(uso.data_expiracao) <= semT(agora);
}

export function comStatusPelaData<T extends Utilizacao>(lista: T[], agora: string): T[] {
  return lista.map((uso) => (venceu(uso, agora) ? { ...uso, status: "EXPIRADA" } : uso));
}

export function semConveniado(uso: Pick<Utilizacao, "status">): string {
  return uso.status === "PENDENTE" ? "Aguardando validação" : "Não validado";
}
