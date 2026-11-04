import { formatDate, parseDate } from "./formatters";
import type {
  Campanha,
  CampanhaStatus,
  CampanhaTipo,
  ItemCampanha,
  OfertaCampanha,
  TipoBeneficio,
} from "./types";
import { erroValor } from "./valorBeneficio";

export type ItemDraft = {
  chave: string;
  id?: number;
  nome: string;
  descricao: string;
  tipo_beneficio: TipoBeneficio;
  valor: string;
  limite: string;
  conveniados: number[];
};

export type CampanhaDraft = {
  tipo: CampanhaTipo;
  nome: string;
  descricao: string;
  data_inicio: string;
  data_fim: string;
  criterio_elegibilidade: string;
  patrocinador: string;
  itens: ItemDraft[];
};

export const TIPOS_INICIATIVA: {
  value: CampanhaTipo;
  titulo: string;
  descricao: string;
}[] = [
  {
    value: "CAMPANHA",
    titulo: "Campanha",
    descricao: "Ação com começo e fim, como Outubro Rosa ou Semana da Saúde.",
  },
  {
    value: "EVENTO_INTERNO",
    titulo: "Evento interno",
    descricao: "Encontro organizado pela Fundação para os colaboradores.",
  },
  {
    value: "EVENTO_PATROCINADO",
    titulo: "Evento patrocinado",
    descricao: "Evento que tem o apoio de uma empresa parceira.",
  },
  {
    value: "VOUCHER",
    titulo: "Voucher",
    descricao: "Vale com desconto para usar em um parceiro.",
  },
  {
    value: "CORTESIA",
    titulo: "Cortesia",
    descricao: "Brinde ou serviço gratuito para quem participa.",
  },
];

export const ehEvento = (tipo: CampanhaTipo) => tipo.startsWith("EVENTO");

export const nomeDoTipo = (tipo: CampanhaTipo) =>
  TIPOS_INICIATIVA.find((item) => item.value === tipo)?.titulo ?? tipo;

export function novoItem(chave: string): ItemDraft {
  return {
    chave,
    nome: "",
    descricao: "",
    tipo_beneficio: "PERCENTUAL",
    valor: "",
    limite: "",
    conveniados: [],
  };
}

export function campanhaVazia(): CampanhaDraft {
  return {
    tipo: "CAMPANHA",
    nome: "",
    descricao: "",
    data_inicio: "",
    data_fim: "",
    criterio_elegibilidade: "",
    patrocinador: "",
    itens: [],
  };
}

export function draftDaCampanha(
  campanha: Campanha,
  itens: ItemCampanha[],
  ofertas: OfertaCampanha[],
): CampanhaDraft {
  return {
    tipo: campanha.tipo,
    nome: campanha.nome,
    descricao: campanha.descricao ?? "",
    data_inicio: campanha.data_inicio.slice(0, 10),
    data_fim: campanha.data_fim.slice(0, 10),
    criterio_elegibilidade: campanha.criterio_elegibilidade ?? "",
    patrocinador: campanha.patrocinador ?? "",
    itens: itens
      .filter((item) => item.campanha_id === campanha.id && item.status === "ATIVO")
      .map((item) => ({
        chave: `item-${item.id}`,
        id: item.id,
        nome: item.nome,
        descricao: item.descricao ?? "",
        tipo_beneficio: item.tipo_beneficio,
        valor: String(item.valor),
        limite:
          item.quantidade_maxima_utilizacoes == null
            ? ""
            : String(item.quantidade_maxima_utilizacoes),
        conveniados: ofertas
          .filter(
            (oferta) =>
              oferta.beneficio_campanha_id === item.id && oferta.status === "ATIVO",
          )
          .map((oferta) => oferta.conveniado_id),
      })),
  };
}

export function statusPelasDatas(
  inicio: string,
  fim: string,
  hoje: string,
): CampanhaStatus {
  if (fim < hoje) return "ENCERRADA";
  if (inicio > hoje) return "PLANEJADA";
  return "ATIVA";
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

export function errosDaIniciativa(draft: CampanhaDraft): string[] {
  const erros: string[] = [];
  if (!draft.nome.trim()) erros.push("Dê um nome.");
  if (!draft.data_inicio) erros.push("Informe quando começa.");
  if (!draft.data_fim) erros.push("Informe quando termina.");
  if (draft.data_inicio && draft.data_fim && draft.data_fim < draft.data_inicio)
    erros.push("A data de término precisa ser igual ou depois do começo.");
  if (draft.tipo === "EVENTO_PATROCINADO" && !draft.patrocinador.trim())
    erros.push("Informe quem patrocina o evento.");
  return erros;
}

export function errosDosItens(draft: CampanhaDraft): string[] {
  const erros: string[] = [];
  draft.itens.forEach((item, indice) => {
    const nome = item.nome.trim() || `Benefício ${indice + 1}`;
    if (!item.nome.trim()) erros.push(`Dê um nome para o benefício ${indice + 1}.`);
    const valor = erroValor(item.tipo_beneficio, item.valor);
    if (valor) erros.push(`${nome}: ${valor.charAt(0).toLowerCase()}${valor.slice(1)}`);
    if (item.limite && (!Number.isInteger(Number(item.limite)) || Number(item.limite) < 1))
      erros.push(`${nome}: o limite de usos precisa ser um número inteiro a partir de 1.`);
    if (!item.conveniados.length)
      erros.push(`${nome}: escolha pelo menos um parceiro onde o colaborador vai usar.`);
  });
  return erros;
}

export function situacaoDoPeriodo(inicio: string, fim: string, hoje: string) {
  const ate = (data: string) => duracaoEmDias(hoje, data) - 1;
  if (inicio > hoje) {
    const dias = ate(inicio);
    return dias === 1 ? "Começa amanhã" : `Começa em ${dias} dias`;
  }
  if (fim < hoje) return `Terminou em ${formatDate(fim)}`;
  const restantes = ate(fim);
  if (restantes === 0) return "Termina hoje";
  return restantes === 1 ? "Falta 1 dia para terminar" : `Faltam ${restantes} dias para terminar`;
}

export function progressoDoPeriodo(inicio: string, fim: string, hoje: string) {
  if (hoje < inicio) return 0;
  if (hoje > fim) return 100;
  const total = duracaoEmDias(inicio, fim);
  const passados = duracaoEmDias(inicio, hoje);
  return total ? Math.round((passados / total) * 100) : 100;
}

export function statusEfetivo(campanha: Campanha, hoje: string): CampanhaStatus {
  if (campanha.status === "CANCELADA" || campanha.status === "ENCERRADA") return campanha.status;
  return statusPelasDatas(campanha.data_inicio.slice(0, 10), campanha.data_fim.slice(0, 10), hoje);
}
