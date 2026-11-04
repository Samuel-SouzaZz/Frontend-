import type { Status } from "./types";

export type OfertaExistente = {
  id: number;
  conveniado_id: number;
  status: Status;
};

export type PassoOferta =
  | { tipo: "criar"; conveniado_id: number }
  | { tipo: "status"; id: number; status: "ATIVO" | "INATIVO" };

export function planejarOfertas(
  existentes: OfertaExistente[],
  desejados: number[],
): PassoOferta[] {
  const passos: PassoOferta[] = [];
  const escolhidos = new Set(desejados);
  for (const conveniadoId of escolhidos) {
    const atual = existentes.find((oferta) => oferta.conveniado_id === conveniadoId);
    if (!atual) passos.push({ tipo: "criar", conveniado_id: conveniadoId });
    else if (atual.status !== "ATIVO")
      passos.push({ tipo: "status", id: atual.id, status: "ATIVO" });
  }
  for (const oferta of existentes) {
    if (oferta.status === "ATIVO" && !escolhidos.has(oferta.conveniado_id))
      passos.push({ tipo: "status", id: oferta.id, status: "INATIVO" });
  }
  return passos;
}
