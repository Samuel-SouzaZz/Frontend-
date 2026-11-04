import { useMemo } from "react";
import { toLocalDateString } from "../models/formatters";
import { montarPendencias, totalDePendencias } from "../models/pendencias";
import { usePortal } from "./PortalContext";

export function usePendenciasVM() {
  const { data, loading } = usePortal();
  const grupos = useMemo(
    () => montarPendencias(data, toLocalDateString()),
    [data],
  );
  return {
    carregando: loading,
    grupos,
    comItens: grupos.filter((grupo) => grupo.itens.length),
    total: totalDePendencias(grupos),
  };
}
