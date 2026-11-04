import { duracaoEmDias, ehEvento, statusEfetivo } from "./periodo";
import {
  beneficioDaUtilizacao,
  colaboradorNome,
  conveniadoDaUtilizacao,
} from "./selectors";
import type { PortalData } from "./types";
export type Pendencia = {
  chave: string;
  titulo: string;
  descricao: string;
  link: string;
  acao: string;
  urgente?: boolean;
};
export type GrupoDePendencias = {
  id: string;
  titulo: string;
  explicacao: string;
  itens: Pendencia[];
};
const DIAS_PARA_URGENTE = 2;
function parceirosEmAnalise(data: PortalData): Pendencia[] {
  return data.conveniados
    .filter((item) => item.status === "EM_ANALISE")
    .map((item) => ({
      chave: `conveniado-${item.id}`,
      titulo: item.nome_fantasia || item.razao_social,
      descricao: `${item.categoria} · cadastro aguardando aprovação`,
      link: `/conveniados/${item.id}`,
      acao: "Analisar",
    }));
}
function usosParados(data: PortalData, hoje: string): Pendencia[] {
  return data.utilizacoes
    .filter((item) => item.status === "PENDENTE")
    .sort((a, b) => a.data_solicitacao.localeCompare(b.data_solicitacao))
    .map((item) => {
      const dias = duracaoEmDias(item.data_solicitacao.slice(0, 10), hoje) - 1;
      const parceiro = conveniadoDaUtilizacao(data, item);
      const quando =
        dias <= 0 ? "pedido hoje" : dias === 1 ? "há 1 dia" : `há ${dias} dias`;
      return {
        chave: `utilizacao-${item.id}`,
        titulo: `${colaboradorNome(data, item.colaborador_id)} · ${beneficioDaUtilizacao(data, item)?.nome ?? "Benefício"}`,
        descricao: `Esperando ${parceiro?.nome_fantasia ?? "o parceiro"} confirmar · ${quando}`,
        link: "/utilizacoes?status=PENDENTE",
        acao: "Ver utilização",
        urgente: dias >= DIAS_PARA_URGENTE,
      };
    });
}
function beneficiosSemParceiro(data: PortalData): Pendencia[] {
  return data.beneficios
    .filter(
      (item) =>
        item.status === "ATIVO" &&
        !data.ofertas.some(
          (oferta) =>
            oferta.beneficio_id === item.id && oferta.status === "ATIVO",
        ),
    )
    .map((item) => ({
      chave: `beneficio-${item.id}`,
      titulo: item.nome,
      descricao:
        "Está ativo, mas nenhum parceiro aceita. O colaborador não tem onde usar.",
      link: `/beneficios?editar=${item.id}`,
      acao: "Escolher parceiros",
    }));
}
function campanhasSemBeneficio(data: PortalData, hoje: string): Pendencia[] {
  return data.campanhas
    .filter((item) =>
      ["ATIVA", "PLANEJADA"].includes(statusEfetivo(item, hoje)),
    )
    .filter(
      (item) =>
        !ehEvento(item.tipo) &&
        !data.itensCampanha.some(
          (atual) => atual.campanha_id === item.id && atual.status === "ATIVO",
        ),
    )
    .map((item) => ({
      chave: `campanha-${item.id}`,
      titulo: item.nome,
      descricao: "Campanha sem nenhum benefício cadastrado.",
      link: `/campanhas?editar=${item.id}`,
      acao: "Adicionar benefício",
    }));
}
export function montarPendencias(
  data: PortalData,
  hoje: string,
): GrupoDePendencias[] {
  return [
    {
      id: "parceiros",
      titulo: "Parceiros aguardando aprovação",
      explicacao:
        "Novos conveniados só aparecem para os colaboradores depois de aprovados.",
      itens: parceirosEmAnalise(data),
    },
    {
      id: "utilizacoes",
      titulo: "Utilizações esperando o parceiro",
      explicacao:
        "O colaborador gerou o QR Code e o parceiro ainda não aprovou nem recusou.",
      itens: usosParados(data, hoje),
    },
    {
      id: "beneficios",
      titulo: "Benefícios sem onde usar",
      explicacao:
        "Benefício ativo sem parceiro aparece no app, mas não dá para usar.",
      itens: beneficiosSemParceiro(data),
    },
    {
      id: "campanhas",
      titulo: "Campanhas sem benefício",
      explicacao: "A campanha está no ar, mas não oferece nada ao colaborador.",
      itens: campanhasSemBeneficio(data, hoje),
    },
  ];
}
export const totalDePendencias = (grupos: GrupoDePendencias[]) =>
  grupos.reduce((soma, grupo) => soma + grupo.itens.length, 0);
