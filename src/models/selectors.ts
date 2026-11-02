import type {
  Beneficio,
  Colaborador,
  Conveniado,
  ItemCampanha,
  Oferta,
  OfertaCampanha,
  PortalData,
  Usuario,
  Utilizacao,
} from "./types";

export * from "./formatters";
export * from "./rules";

export interface DataIndexes {
  usuarios: Map<number, Usuario>;
  colaboradores: Map<number, Colaborador>;
  conveniados: Map<number, Conveniado>;
  beneficios: Map<number, Beneficio>;
  itensCampanha: Map<number, ItemCampanha>;
  ofertas: Map<number, Oferta>;
  ofertasCampanha: Map<number, OfertaCampanha>;
}

export function createDataIndexes(data: PortalData): DataIndexes {
  return {
    usuarios: new Map(data.usuarios.map((u) => [u.id, u])),
    colaboradores: new Map(data.colaboradores.map((c) => [c.id, c])),
    conveniados: new Map(data.conveniados.map((c) => [c.id, c])),
    beneficios: new Map(data.beneficios.map((b) => [b.id, b])),
    itensCampanha: new Map(data.itensCampanha.map((i) => [i.id, i])),
    ofertas: new Map(data.ofertas.map((o) => [o.id, o])),
    ofertasCampanha: new Map(data.ofertasCampanha.map((o) => [o.id, o])),
  };
}

export function colaboradorNome(data: PortalData, colaboradorId: number): string {
  const colaborador = data.colaboradores.find((c) => c.id === colaboradorId);
  if (!colaborador) return `Colaborador #${colaboradorId}`;
  const usuario = data.usuarios.find((u) => u.id === colaborador.usuario_id);
  return usuario?.nome ?? `Colaborador #${colaboradorId}`;
}

export function colaboradorNomeIndexed(
  indexes: DataIndexes,
  colaboradorId: number,
): string {
  const colaborador = indexes.colaboradores.get(colaboradorId);
  if (!colaborador) return `Colaborador #${colaboradorId}`;
  const usuario = indexes.usuarios.get(colaborador.usuario_id);
  return usuario?.nome ?? `Colaborador #${colaboradorId}`;
}

export function conveniadoNome(data: PortalData, conveniadoId: number): string {
  const conveniado = data.conveniados.find((c) => c.id === conveniadoId);
  return conveniado?.nome_fantasia || conveniado?.razao_social || `Conveniado #${conveniadoId}`;
}

export function conveniadoNomeIndexed(
  indexes: DataIndexes,
  conveniadoId: number,
): string {
  const conveniado = indexes.conveniados.get(conveniadoId);
  return conveniado?.nome_fantasia || conveniado?.razao_social || `Conveniado #${conveniadoId}`;
}

export function beneficioDaUtilizacao(
  data: PortalData,
  uso: Utilizacao,
): Beneficio | ItemCampanha | undefined {
  if (uso.beneficio_conveniado_id) {
    const oferta = data.ofertas.find((o) => o.id === uso.beneficio_conveniado_id);
    return oferta ? data.beneficios.find((b) => b.id === oferta.beneficio_id) : undefined;
  }
  if (uso.beneficio_campanha_conveniado_id) {
    const ofertaCampanha = data.ofertasCampanha.find(
      (o) => o.id === uso.beneficio_campanha_conveniado_id,
    );
    return ofertaCampanha
      ? data.itensCampanha.find((b) => b.id === ofertaCampanha.beneficio_campanha_id)
      : undefined;
  }
  return undefined;
}

export function beneficioDaUtilizacaoIndexed(
  indexes: DataIndexes,
  uso: Utilizacao,
): Beneficio | ItemCampanha | undefined {
  if (uso.beneficio_conveniado_id) {
    const oferta = indexes.ofertas.get(uso.beneficio_conveniado_id);
    return oferta ? indexes.beneficios.get(oferta.beneficio_id) : undefined;
  }
  if (uso.beneficio_campanha_conveniado_id) {
    const ofertaCampanha = indexes.ofertasCampanha.get(
      uso.beneficio_campanha_conveniado_id,
    );
    return ofertaCampanha
      ? indexes.itensCampanha.get(ofertaCampanha.beneficio_campanha_id)
      : undefined;
  }
  return undefined;
}

export function conveniadoDaUtilizacao(
  data: PortalData,
  uso: Utilizacao,
): Conveniado | undefined {
  if (uso.beneficio_conveniado_id) {
    const oferta = data.ofertas.find((o) => o.id === uso.beneficio_conveniado_id);
    return oferta ? data.conveniados.find((c) => c.id === oferta.conveniado_id) : undefined;
  }
  if (uso.beneficio_campanha_conveniado_id) {
    const ofertaCampanha = data.ofertasCampanha.find(
      (o) => o.id === uso.beneficio_campanha_conveniado_id,
    );
    return ofertaCampanha
      ? data.conveniados.find((c) => c.id === ofertaCampanha.conveniado_id)
      : undefined;
  }
  return undefined;
}

export function conveniadoDaUtilizacaoIndexed(
  indexes: DataIndexes,
  uso: Utilizacao,
): Conveniado | undefined {
  if (uso.beneficio_conveniado_id) {
    const oferta = indexes.ofertas.get(uso.beneficio_conveniado_id);
    return oferta ? indexes.conveniados.get(oferta.conveniado_id) : undefined;
  }
  if (uso.beneficio_campanha_conveniado_id) {
    const ofertaCampanha = indexes.ofertasCampanha.get(
      uso.beneficio_campanha_conveniado_id,
    );
    return ofertaCampanha
      ? indexes.conveniados.get(ofertaCampanha.conveniado_id)
      : undefined;
  }
  return undefined;
}

