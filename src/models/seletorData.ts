export const MESES = [
  "janeiro",
  "fevereiro",
  "março",
  "abril",
  "maio",
  "junho",
  "julho",
  "agosto",
  "setembro",
  "outubro",
  "novembro",
  "dezembro",
];

export const DIAS_DA_SEMANA = [
  { curto: "D", nome: "domingo" },
  { curto: "S", nome: "segunda" },
  { curto: "T", nome: "terça" },
  { curto: "Q", nome: "quarta" },
  { curto: "Q", nome: "quinta" },
  { curto: "S", nome: "sexta" },
  { curto: "S", nome: "sábado" },
];

export type Mes = { ano: number; mes: number };

export type DiaDoCalendario = {
  iso: string;
  dia: number;
  doMes: boolean;
};

const dois = (numero: number) => String(numero).padStart(2, "0");

export function paraIso(ano: number, mes: number, dia: number) {
  return `${String(ano).padStart(4, "0")}-${dois(mes + 1)}-${dois(dia)}`;
}

export function lerIso(iso: string): { ano: number; mes: number; dia: number } | null {
  const partes = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!partes) return null;
  const ano = Number(partes[1]);
  const mes = Number(partes[2]) - 1;
  const dia = Number(partes[3]);
  if (mes < 0 || mes > 11 || dia < 1 || dia > diasNoMes(ano, mes)) return null;
  return { ano, mes, dia };
}

export function diasNoMes(ano: number, mes: number) {
  return new Date(Date.UTC(ano, mes + 1, 0)).getUTCDate();
}

export function hojeIso(agora = new Date()) {
  return paraIso(agora.getFullYear(), agora.getMonth(), agora.getDate());
}

export function mesDe(iso: string, reserva: string): Mes {
  const data = lerIso(iso) ?? lerIso(reserva);
  return data ? { ano: data.ano, mes: data.mes } : { ano: 2000, mes: 0 };
}

export function somarMeses({ ano, mes }: Mes, quantos: number): Mes {
  const total = ano * 12 + mes + quantos;
  return { ano: Math.floor(total / 12), mes: ((total % 12) + 12) % 12 };
}

export function somarDias(iso: string, quantos: number) {
  const data = lerIso(iso);
  if (!data) return iso;
  const nova = new Date(Date.UTC(data.ano, data.mes, data.dia + quantos));
  return paraIso(nova.getUTCFullYear(), nova.getUTCMonth(), nova.getUTCDate());
}

export function gradeDoMes({ ano, mes }: Mes): DiaDoCalendario[] {
  const primeiroDia = new Date(Date.UTC(ano, mes, 1)).getUTCDay();
  const inicio = paraIso(ano, mes, 1);
  return Array.from({ length: 42 }, (_, indice) => {
    const iso = somarDias(inicio, indice - primeiroDia);
    const data = lerIso(iso);
    return { iso, dia: data?.dia ?? 0, doMes: data?.mes === mes };
  });
}

export function foraDoLimite(iso: string, min?: string, max?: string) {
  return Boolean((min && iso < min) || (max && iso > max));
}

export function formatarData(iso: string) {
  const data = lerIso(iso);
  return data ? `${dois(data.dia)}/${dois(data.mes + 1)}/${data.ano}` : "";
}

export function mascararData(texto: string) {
  const digitos = texto.replace(/\D/g, "").slice(0, 8);
  if (digitos.length <= 2) return digitos;
  if (digitos.length <= 4) return `${digitos.slice(0, 2)}/${digitos.slice(2)}`;
  return `${digitos.slice(0, 2)}/${digitos.slice(2, 4)}/${digitos.slice(4)}`;
}

export function lerTextoDaData(texto: string) {
  const partes = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(texto);
  if (!partes) return null;
  const iso = `${partes[3]}-${partes[2]}-${partes[1]}`;
  return lerIso(iso) ? iso : null;
}

export function dataPorExtenso(iso: string) {
  const data = lerIso(iso);
  return data ? `${data.dia} de ${MESES[data.mes]} de ${data.ano}` : "";
}

export function anosAoRedor(ano: number, min?: string, max?: string) {
  const primeiro = lerIso(min ?? "")?.ano ?? Math.min(ano, new Date().getFullYear()) - 80;
  const ultimo = lerIso(max ?? "")?.ano ?? Math.max(ano, new Date().getFullYear()) + 10;
  return Array.from({ length: ultimo - primeiro + 1 }, (_, indice) => primeiro + indice);
}

export function diasEntre(inicio: string, fim: string) {
  const a = lerIso(inicio);
  const b = lerIso(fim);
  if (!a || !b) return 0;
  const diferenca = (Date.UTC(b.ano, b.mes, b.dia) - Date.UTC(a.ano, a.mes, a.dia)) / 86400000;
  return diferenca < 0 ? 0 : diferenca + 1;
}
