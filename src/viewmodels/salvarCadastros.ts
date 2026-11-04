import type { usePortal } from "./PortalContext";
import { statusPelasDatas, type CampanhaDraft } from "../models/campanhaDraft";
import { payloadDoBeneficio, type BeneficioDraft } from "../models/beneficioDraft";
import { planejarOfertas } from "../models/ofertasSync";
import { numeroDoTexto } from "../models/valorBeneficio";
import type { Campanha } from "../models/types";

type Portal = ReturnType<typeof usePortal>;

export async function salvarCampanha(
  portal: Pick<Portal, "data" | "save">,
  draft: CampanhaDraft,
  existente: Campanha | undefined,
  hoje: string,
  aoCriar: (campanhaId: number) => void,
  aoCriarItem: (chave: string, itemId: number) => void,
) {
  const { data, save } = portal;
  const status =
    existente?.status === "CANCELADA" ? "CANCELADA" : statusPelasDatas(draft.data_inicio, draft.data_fim, hoje);
  const salva = await save("campanhas", existente?.id, {
    tipo: draft.tipo,
    nome: draft.nome.trim(),
    descricao: draft.descricao.trim() || null,
    data_inicio: draft.data_inicio,
    data_fim: draft.data_fim,
    criterio_elegibilidade: draft.criterio_elegibilidade.trim() || null,
    patrocinador: draft.tipo === "EVENTO_PATROCINADO" ? draft.patrocinador.trim() || null : null,
    status,
  });
  if (!existente) aoCriar(salva.id);

  const mantidos = new Set<number>();
  for (const item of draft.itens) {
    const itemSalvo = await save("itensCampanha", item.id, {
      campanha_id: salva.id,
      nome: item.nome.trim(),
      descricao: item.descricao.trim() || null,
      tipo_beneficio: item.tipo_beneficio,
      valor: numeroDoTexto(item.valor),
      quantidade_maxima_utilizacoes: item.limite ? Number(item.limite) : null,
      status: "ATIVO",
    });
    mantidos.add(itemSalvo.id);
    if (!item.id) aoCriarItem(item.chave, itemSalvo.id);
    const existentes = data.ofertasCampanha.filter((oferta) => oferta.beneficio_campanha_id === itemSalvo.id);
    for (const passo of planejarOfertas(existentes, item.conveniados)) {
      if (passo.tipo === "criar")
        await save("ofertasCampanha", undefined, {
          beneficio_campanha_id: itemSalvo.id,
          conveniado_id: passo.conveniado_id,
          status: "ATIVO",
        });
      else await save("ofertasCampanha", passo.id, { status: passo.status });
    }
  }

  const removidos = data.itensCampanha.filter(
    (item) => item.campanha_id === salva.id && item.status === "ATIVO" && !mantidos.has(item.id),
  );
  for (const item of removidos) await save("itensCampanha", item.id, { status: "INATIVO" });
  return salva;
}

export async function salvarBeneficio(
  portal: Pick<Portal, "data" | "save">,
  draft: BeneficioDraft,
  id: number | undefined,
  aoCriar: (beneficioId: number) => void,
) {
  const { data, save } = portal;
  const salvo = await save("beneficios", id, payloadDoBeneficio(draft));
  if (!id) aoCriar(salvo.id);
  const existentes = data.ofertas.filter((oferta) => oferta.beneficio_id === salvo.id);
  for (const passo of planejarOfertas(existentes, draft.conveniados)) {
    if (passo.tipo === "criar")
      await save("ofertas", undefined, {
        beneficio_id: salvo.id,
        conveniado_id: passo.conveniado_id,
        status: "ATIVO",
      });
    else await save("ofertas", passo.id, { status: passo.status });
  }
  return salvo;
}
