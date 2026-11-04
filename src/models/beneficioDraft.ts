import type {
  Beneficio,
  IntervaloUnidade,
  Oferta,
  ReferenciaContagem,
  TipoBeneficio,
  TipoJanela,
  UnidadeCiclo,
} from "./types";
import { erroValor, numeroDoTexto, vezes } from "./valorBeneficio";

export type BeneficioDraft = {
  nome: string;
  descricao: string;
  tipo_beneficio: TipoBeneficio;
  valor: string;
  quantidade: string;
  tipo_janela: TipoJanela;
  unidade_ciclo: UnidadeCiclo;
  dia_reset: string;
  intervalo_valor: string;
  intervalo_unidade: IntervaloUnidade;
  referencia_contagem: ReferenciaContagem;
  status: Beneficio["status"];
  conveniados: number[];
};

export function beneficioVazio(): BeneficioDraft {
  return {
    nome: "",
    descricao: "",
    tipo_beneficio: "PERCENTUAL",
    valor: "",
    quantidade: "1",
    tipo_janela: "CALENDARIO_FIXO",
    unidade_ciclo: "MES",
    dia_reset: "",
    intervalo_valor: "30",
    intervalo_unidade: "DIA",
    referencia_contagem: "ULTIMA_UTILIZACAO",
    status: "ATIVO",
    conveniados: [],
  };
}

export function draftDoBeneficio(item: Beneficio, ofertas: Oferta[]): BeneficioDraft {
  return {
    nome: item.nome,
    descricao: item.descricao ?? "",
    tipo_beneficio: item.tipo_beneficio,
    valor: String(item.valor),
    quantidade: String(item.quantidade_maxima_utilizacoes),
    tipo_janela: item.tipo_janela,
    unidade_ciclo: item.unidade_ciclo ?? "MES",
    dia_reset: item.dia_reset?.slice(0, 10) ?? "",
    intervalo_valor: String(item.intervalo_valor ?? 30),
    intervalo_unidade: item.intervalo_unidade ?? "DIA",
    referencia_contagem: item.referencia_contagem ?? "ULTIMA_UTILIZACAO",
    status: item.status,
    conveniados: ofertas
      .filter((oferta) => oferta.beneficio_id === item.id && oferta.status === "ATIVO")
      .map((oferta) => oferta.conveniado_id),
  };
}

const PERIODO: Record<UnidadeCiclo, { por: string; inicio: string }> = {
  SEMANA: { por: "por semana", inicio: "toda segunda-feira" },
  MES: { por: "por mês", inicio: "no dia 1 de cada mês" },
  ANO: { por: "por ano", inicio: "em 1º de janeiro" },
};

export function fraseDaRegra(draft: BeneficioDraft) {
  const quantidade = Number(draft.quantidade);
  const usos = Number.isInteger(quantidade) && quantidade > 0 ? vezes(quantidade) : "algumas vezes";
  if (draft.tipo_janela === "CALENDARIO_FIXO") {
    const periodo = PERIODO[draft.unidade_ciclo];
    return `Cada colaborador pode usar ${usos} ${periodo.por}. O saldo volta ${periodo.inicio}.`;
  }
  const intervalo = Number(draft.intervalo_valor) || 0;
  const unidade =
    draft.intervalo_unidade === "MES"
      ? intervalo === 1
        ? "mês"
        : "meses"
      : intervalo === 1
        ? "dia"
        : "dias";
  const contagem =
    draft.referencia_contagem === "ULTIMA_UTILIZACAO"
      ? "contando a partir do último uso"
      : "contando a partir da data de admissão do colaborador";
  return `Cada colaborador pode usar ${usos} a cada ${intervalo} ${unidade}, ${contagem}.`;
}

export function resumoCurto(draft: BeneficioDraft) {
  const quantidade = Number(draft.quantidade) || 0;
  if (draft.tipo_janela === "CALENDARIO_FIXO")
    return `${vezes(quantidade)} ${PERIODO[draft.unidade_ciclo].por}`;
  const unidade = draft.intervalo_unidade === "MES" ? "meses" : "dias";
  return `${vezes(quantidade)} a cada ${draft.intervalo_valor} ${unidade}`;
}

export function errosDoSobre(draft: BeneficioDraft): string[] {
  const erros: string[] = [];
  if (!draft.nome.trim()) erros.push("Dê um nome para o benefício.");
  const valor = erroValor(draft.tipo_beneficio, draft.valor);
  if (valor) erros.push(valor);
  return erros;
}

export function errosDasRegras(draft: BeneficioDraft): string[] {
  const erros: string[] = [];
  const quantidade = Number(draft.quantidade);
  if (!Number.isInteger(quantidade) || quantidade < 1)
    erros.push("Informe quantas vezes o colaborador pode usar (a partir de 1).");
  if (draft.tipo_janela === "JANELA_MOVEL") {
    const intervalo = Number(draft.intervalo_valor);
    if (!Number.isInteger(intervalo) || intervalo < 1)
      erros.push("Informe de quanto em quanto tempo o saldo volta (a partir de 1).");
  }
  return erros;
}

export function errosDosParceiros(draft: BeneficioDraft): string[] {
  return draft.conveniados.length
    ? []
    : ["Escolha pelo menos um parceiro onde o colaborador vai usar."];
}

export function payloadDoBeneficio(draft: BeneficioDraft) {
  const fixo = draft.tipo_janela === "CALENDARIO_FIXO";
  return {
    nome: draft.nome.trim(),
    descricao: draft.descricao.trim() || null,
    status: draft.status,
    tipo_beneficio: draft.tipo_beneficio,
    valor: numeroDoTexto(draft.valor),
    quantidade_maxima_utilizacoes: Number(draft.quantidade),
    tipo_janela: draft.tipo_janela,
    unidade_ciclo: fixo ? draft.unidade_ciclo : null,
    dia_reset: fixo && draft.dia_reset ? draft.dia_reset : null,
    intervalo_valor: fixo ? null : Number(draft.intervalo_valor),
    intervalo_unidade: fixo ? null : draft.intervalo_unidade,
    referencia_contagem: fixo ? null : draft.referencia_contagem,
  };
}
