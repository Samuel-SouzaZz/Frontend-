import { useState } from "react";

import { toLocalDateString } from "../models/formatters";

import {
  beneficioDaUtilizacao,
  colaboradorNome,
  conveniadoDaUtilizacao,
} from "../models/selectors";

import { useColaboradoresVM } from "./useColaboradoresVM";

export type AbaColaborador = "historico" | "dados";

export function useColaboradorDetalheVM(id: number) {
  const vm = useColaboradoresVM();

  const { data } = vm;

  const [aba, setAba] = useState<AbaColaborador>("historico");

  const colaborador = data.colaboradores.find(
    (item) => item.id === id
  );

  const usos = data.utilizacoes
    .filter((uso) => uso.colaborador_id === id)
    .sort((a, b) =>
      b.data_solicitacao.localeCompare(a.data_solicitacao)
    );

  const historico = usos.map((uso) => {
    const parceiro = conveniadoDaUtilizacao(data, uso);

    return {
      id: uso.id,

      beneficio:
        beneficioDaUtilizacao(data, uso)?.nome ??
        "um benefício",

      parceiro: parceiro
        ? parceiro.nome_fantasia || parceiro.razao_social
        : undefined,

      quando: uso.data_solicitacao,

      status: uso.status,
    };
  });

  const aprovadas = usos.filter(
    (uso) => uso.status === "APROVADA"
  );

  const mes = toLocalDateString().slice(0, 7);

  return {
    ...vm,

    aba,
    setAba,

    colaborador,

    nome: colaborador
      ? colaboradorNome(data, colaborador.id)
      : "",

    email: data.usuarios.find(
      (user) => user.id === colaborador?.usuario_id
    )?.email,

    historico,

    numeros: {
      usosNoMes: aprovadas.filter(
        (uso) => uso.data_solicitacao.slice(0, 7) === mes
      ).length,

      aprovadas: aprovadas.length,

      ultimoUso: aprovadas[0]?.data_solicitacao,
    },
  };
}