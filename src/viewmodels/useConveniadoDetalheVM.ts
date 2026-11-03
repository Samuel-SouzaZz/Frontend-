import { useState } from "react";

import { useAsyncAction } from "../hooks/useAsyncAction";

import { toLocalDateString } from "../models/formatters";

import { colaboradorNome } from "../models/selectors";

import type { ItemCampanha } from "../models/types";

import { usePortal } from "./PortalContext";

import { useConveniadosVM } from "./useConveniadosVM";

export type AbaConveniado =
  | "historico"
  | "beneficios"
  | "dados";

export function useConveniadoDetalheVM(id: number) {
  const vm = useConveniadosVM();

  const { data } = vm;

  const { save } = usePortal();

  const aprovacao = useAsyncAction();

  const [aba, setAba] =
    useState<AbaConveniado>("historico");

  const [aprovando, setAprovando] = useState(false);

  const conveniado = data.conveniados.find(
    (item) => item.id === id
  );

  // BENEFÍCIOS OFERECIDOS PELO CONVENIADO

  const ofertas = data.ofertas.filter(
    (oferta) => oferta.conveniado_id === id
  );

  const ofertasCampanha = data.ofertasCampanha.filter(
    (oferta) => oferta.conveniado_id === id
  );

  const beneficios = ofertas
    .filter((oferta) => oferta.status === "ATIVO")
    .map((oferta) =>
      data.beneficios.find(
        (item) => item.id === oferta.beneficio_id
      )
    )
    .filter((item) => item !== undefined);

  // ITENS DE CAMPANHAS OFERECIDOS

  const itensCampanha = ofertasCampanha
    .filter((oferta) => oferta.status === "ATIVO")
    .map((oferta) =>
      data.itensCampanha.find(
        (item) =>
          item.id === oferta.beneficio_campanha_id
      )
    )
    .filter(
      (item): item is ItemCampanha =>
        item?.status === "ATIVO"
    )
    .map((item) => ({
      ...item,

      campanha:
        data.campanhas.find(
          (campanha) =>
            campanha.id === item.campanha_id
        )?.nome ?? "Campanha",
    }));

  // HISTÓRICO DE UTILIZAÇÕES

  const historico = data.utilizacoes
    .filter(
      (uso) =>
        ofertas.some(
          (oferta) =>
            oferta.id === uso.beneficio_conveniado_id
        ) ||
        ofertasCampanha.some(
          (oferta) =>
            oferta.id ===
            uso.beneficio_campanha_conveniado_id
        )
    )
    .sort((a, b) =>
      b.data_solicitacao.localeCompare(
        a.data_solicitacao
      )
    )
    .map((uso) => {
      const oferta = ofertas.find(
        (item) =>
          item.id === uso.beneficio_conveniado_id
      );

      const ofertaCampanha = ofertasCampanha.find(
        (item) =>
          item.id ===
          uso.beneficio_campanha_conveniado_id
      );

      const beneficio = oferta
        ? data.beneficios.find(
            (item) =>
              item.id === oferta.beneficio_id
          )?.nome
        : data.itensCampanha.find(
            (item) =>
              item.id ===
              ofertaCampanha?.beneficio_campanha_id
          )?.nome;

      return {
        ...uso,

        beneficio: beneficio ?? "um benefício",

        colaborador: colaboradorNome(
          data,
          uso.colaborador_id
        ),
      };
    });

  // INDICADORES

  const aprovadas = historico.filter(
    (uso) => uso.status === "APROVADA"
  );

  const mes = toLocalDateString().slice(0, 7);

  // FUNÇÃO DE APROVAÇÃO DO CONVENIADO

  async function aprovar() {
    if (!conveniado) {
      return;
    }

    await aprovacao.run(
      () =>
        save("conveniados", conveniado.id, {
          status: "ATIVO",
        }),
      {
        success:
          "Parceiro aprovado. Agora ele pode receber benefícios.",

        fallbackError:
          "Não foi possível aprovar.",

        onSuccess: () => setAprovando(false),
      }
    );
  }

  // DADOS ENTREGUES PARA A TELA

  return {
    ...vm,

    aba,
    setAba,

    conveniado,

    responsavel: data.usuarios.find(
      (user) =>
        user.id === conveniado?.usuario_id
    ),

    beneficios,
    itensCampanha,
    historico,

    numeros: {
      usosNoMes: aprovadas.filter(
        (uso) =>
          uso.data_solicitacao.slice(0, 7) === mes
      ).length,

      aprovadas: aprovadas.length,

      oferecidos:
        beneficios.length + itensCampanha.length,
    },

    aprovando,
    setAprovando,
    aprovar,

    aprovandoAgora: aprovacao.running,
  };
}