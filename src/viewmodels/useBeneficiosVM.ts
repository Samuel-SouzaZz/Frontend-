import { useSearchParams } from "react-router-dom";
import { usePortal } from "./PortalContext";
import { useAsyncAction } from "../hooks/useAsyncAction";
import { usePagination } from "../hooks/usePagination";
import { colaboradorNome, conveniadoNome } from "../models/selectors";
import type { Beneficio } from "../models/types";

export type ResumoBeneficio = {
  beneficio: Beneficio;
  parceiros: string[];
  usosAprovados: number;
  colaboradores: number;
  usos: { id: number; quem: string; onde: string; quando: string; status: string }[];
};

const PAGE_SIZE = 10;

const ORDEM: Record<Beneficio["status"], number> = { ATIVO: 0, INATIVO: 1, DESCONTINUADO: 2 };

const normalizar = (texto: string) =>
  texto
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLocaleLowerCase("pt-BR");

const MENSAGEM: Record<Beneficio["status"], string> = {
  ATIVO: "Benefício reativado.",
  INATIVO: "Benefício pausado. Ele some do app até ser reativado.",
  DESCONTINUADO: "Benefício encerrado. O histórico foi guardado.",
};

export function useBeneficiosVM() {
  const { data, save, loading } = usePortal();
  const { running: salvando, run } = useAsyncAction();
  const [params, setParams] = useSearchParams();

  const abrirId = Number(params.get("abrir")) || undefined;
  const editarId = Number(params.get("editar")) || undefined;
  const criando = params.get("novo") === "1";
  const busca = params.get("buscar") ?? "";
  const situacao = params.get("situacao") ?? "";

  function mudar(patch: Record<string, string | undefined>) {
    setParams(
      (atual) => {
        const proximo = new URLSearchParams(atual);
        for (const [chave, valor] of Object.entries(patch)) {
          if (valor) proximo.set(chave, valor);
          else proximo.delete(chave);
        }
        return proximo;
      },
      { replace: true },
    );
  }

  function resumir(beneficio: Beneficio): ResumoBeneficio {
    const ofertas = data.ofertas.filter((oferta) => oferta.beneficio_id === beneficio.id);
    const usos = data.utilizacoes
      .filter((uso) => ofertas.some((oferta) => oferta.id === uso.beneficio_conveniado_id))
      .sort((a, b) => b.data_solicitacao.localeCompare(a.data_solicitacao));
    const aprovados = usos.filter((uso) => uso.status === "APROVADA");
    return {
      beneficio,
      parceiros: ofertas
        .filter((oferta) => oferta.status === "ATIVO")
        .map((oferta) => conveniadoNome(data, oferta.conveniado_id)),
      usosAprovados: aprovados.length,
      colaboradores: new Set(aprovados.map((uso) => uso.colaborador_id)).size,
      usos: usos.slice(0, 5).map((uso) => {
        const oferta = ofertas.find((item) => item.id === uso.beneficio_conveniado_id);
        return {
          id: uso.id,
          quem: colaboradorNome(data, uso.colaborador_id),
          onde: oferta ? conveniadoNome(data, oferta.conveniado_id) : "",
          quando: uso.data_solicitacao,
          status: uso.status,
        };
      }),
    };
  }

  const termo = normalizar(busca.trim());
  const todos = data.beneficios.map(resumir);
  const linhas = todos
    .filter((item) => !situacao || item.beneficio.status === situacao)
    .filter((item) => normalizar(`${item.beneficio.nome} ${item.beneficio.descricao ?? ""}`).includes(termo))
    .sort(
      (a, b) =>
        ORDEM[a.beneficio.status] - ORDEM[b.beneficio.status] ||
        a.beneficio.nome.localeCompare(b.beneficio.nome, "pt-BR"),
    );

  const contagem = (status: Beneficio["status"]) => todos.filter((item) => item.beneficio.status === status).length;

  const paginacao = usePagination(linhas.length, PAGE_SIZE, `${termo}|${situacao}`);

  async function mudarStatus(id: number, status: Beneficio["status"]) {
    await run(() => save("beneficios", id, { status }), {
      success: MENSAGEM[status],
      fallbackError: "Não foi possível mudar a situação.",
    });
  }

  const fechar = { novo: undefined, editar: undefined, abrir: undefined };

  return {
    carregando: loading,
    busca,
    setBusca: (valor: string) => mudar({ buscar: valor }),
    situacao,
    setSituacao: (valor: string) => mudar({ situacao: valor }),
    contagem,
    total: data.beneficios.length,
    linhas: linhas.slice(paginacao.start, paginacao.end),
    totalFiltrado: linhas.length,
    pagina: paginacao.page,
    setPagina: paginacao.setPage,
    PAGE_SIZE,
    aberto: abrirId && !editarId ? data.beneficios.find((item) => item.id === abrirId) : undefined,
    resumir,
    emEdicao: editarId ? data.beneficios.find((item) => item.id === editarId) : undefined,
    criando,
    abrir: (id: number) => mudar({ ...fechar, abrir: String(id) }),
    novo: () => mudar({ ...fechar, novo: "1" }),
    editar: (id: number) => mudar({ ...fechar, editar: String(id) }),
    fecharPainel: () => mudar(fechar),
    aoSalvar: (id: number) => mudar({ ...fechar, abrir: String(id) }),
    mudarStatus,
    salvando,
  };
}
