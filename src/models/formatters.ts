const moneyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

export const formatMoney = (value: number) =>
  moneyFormatter.format(Number(value) || 0);

/**
 * Normaliza e faz o parse seguro de strings de data (ISO ou SQL 'YYYY-MM-DD HH:mm:ss').
 * Previne erros de 'Invalid Date' no Safari ao lidar com datas do MySQL com espaço.
 */
export function parseDate(value: string): Date {
  const normalized = value.length === 10 ? `${value}T12:00:00` : value.replace(" ", "T");
  return new Date(normalized);
}

/**
 * Retorna uma data no formato local 'YYYY-MM-DD', evitando a divergência UTC de toISOString().
 */
export function toLocalDateString(date = new Date()): string {
  return date.toLocaleDateString("sv-SE");
}

export function formatDate(value?: string | null, time = false): string {
  if (!value) return "Não informado";
  const date = parseDate(value);
  if (Number.isNaN(date.getTime())) return "Data inválida";
  return (
    date.toLocaleDateString("pt-BR") +
    (time
      ? ` · ${date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`
      : "")
  );
}

export const formatCnpj = (value: string): string =>
  value
    .replace(/\D/g, "")
    .replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, "$1.$2.$3/$4-$5");

export const capitalizeFirstLetter = (value: string): string =>
  value.replace(/\p{L}/u, (letter) => letter.toLocaleUpperCase("pt-BR"));

const labels: Record<string, string> = {
  ATIVO: "Ativo",
  INATIVO: "Inativo",
  AFASTADO: "Afastado",
  EM_ANALISE: "Em análise",
  DESCONTINUADO: "Descontinuado",
  PLANEJADA: "Planejada",
  ATIVA: "Ativa",
  ENCERRADA: "Encerrada",
  CANCELADA: "Cancelada",
  PENDENTE: "Pendente",
  APROVADA: "Aprovada",
  REPROVADA: "Reprovada",
  ESTORNADA: "Estornada",
  FCV: "Fundação",
  COLABORADOR: "Colaborador",
  CONVENIADO: "Conveniado",
  CAMPANHA: "Campanha",
  EVENTO_INTERNO: "Evento interno",
  EVENTO_PATROCINADO: "Evento patrocinado",
  VOUCHER: "Voucher",
  CORTESIA: "Cortesia",
};

export const statusLabel = (status: string): string => labels[status] ?? status;

export const initials = (name: string): string =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();
