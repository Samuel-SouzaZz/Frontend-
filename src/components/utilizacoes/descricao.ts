import type { Utilizacao } from "../../models/types";

export type DescricaoUtilizacao = {
  colaborador: (uso: Utilizacao) => string;
  beneficio: (uso: Utilizacao) => string | undefined;
  conveniado: (uso: Utilizacao) => string | undefined;
};

export const referenciaUtilizacao = (id: number) =>
  `#${String(id).padStart(5, "0")}`;

export const canalValidacaoLabel = (canal: Utilizacao["canal_validacao"]) =>
  canal === "APP_CONVENIADO"
    ? "Aplicativo do conveniado"
    : canal === "TERMINAL_IOT"
      ? "Terminal IoT"
      : "Não registrado";
