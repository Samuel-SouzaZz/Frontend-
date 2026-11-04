import { useSearchParams } from "react-router-dom";
import { usePortal } from "./PortalContext";
import { useAsyncAction } from "../hooks/useAsyncAction";
import { usePagination } from "../hooks/usePagination";
import { toLocalDateString } from "../models/formatters";
import { statusEfetivo } from "../models/campanhaDraft";
import { colaboradorNome, conveniadoNome } from "../models/selectors";
import { descreverValor } from "../models/valorBeneficio";
import type { Campanha, CampanhaStatus } from "../models/types";

export type ResumoCampanha = {
  campanha: Campanha;
  status: ReturnType<typeof statusEfetivo>;
  beneficios: { id: number; nome: string; valor: string; parceiros: string[] }[];
  participantes: number;
  usos: { id: number; quem: string; oque: string; onde: string; quando: string; status: string }[];
};

const PAGE_SIZE = 10;

const ORDEM: Record<CampanhaStatus, number> = {
  ATIVA: 0,
  PLANEJADA: 1,
  ENCERRADA: 2,
  CANCELADA: 3,
};

const normalizar = (texto: string) =>
  texto
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLocaleLowerCase("pt-BR");

export function useCampanhasVM() {
  const { data, save, loading } = usePortal();
  const { running: salvando, run } = useAsyncAction();
  const [params, setParams] = useSearchParams();
  const hoje = toLocalDateString();

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

  function resumir(campanha: Campanha): ResumoCampanha {
    const itens = data.itensCampanha.filter((item) => item.campanha_id === campanha.id);
    const ofertas = data.ofertasCampanha.filter((oferta) =>
      itens.some((item) => item.id === oferta.beneficio_campanha_id),
    );
    const usos = data.utilizacoes
      .filter((uso) => ofertas.some((oferta) => oferta.id === uso.beneficio_campanha_conveniado_id))
      .sort((a, b) => b.data_solicitacao.localeCompare(a.data_solicitacao));
    return {
      campanha,
      status: statusEfetivo(campanha, hoje),
      beneficios: itens
        .filter((item) => item.status === "ATIVO")
        .map((item) => ({
          id: item.id,
          nome: item.nome,
          valor: descreverValor(item.tipo_beneficio, item.valor),
          parceiros: ofertas
            .filter((oferta) => oferta.beneficio_campanha_id === item.id && oferta.status === "ATIVO")
            .map((oferta) => conveniadoNome(data, oferta.conveniado_id)),
        })),
      participantes: new Set(usos.filter((uso) => uso.status === "APROVADA").map((uso) => uso.colaborador_id)).size,
      usos: usos.slice(0, 5).map((uso) => {
        const oferta = ofertas.find((item) => item.id === uso.beneficio_campanha_conveniado_id);
        const item = itens.find((atual) => atual.id === oferta?.beneficio_campanha_id);
        return {
          id: uso.id,
          quem: colaboradorNome(data, uso.colaborador_id),
          oque: item?.nome ?? "Benefício",
          onde: oferta ? conveniadoNome(data, oferta.conveniado_id) : "",
          quando: uso.data_solicitacao,
          status: uso.status,
        };
      }),
    };
  }

  const termo = normalizar(busca.trim());
  const todas = data.campanhas.map(resumir);
  const linhas = todas
    .filter((item) => !situacao || item.status === situacao)
    .filter((item) =>
      normalizar(`${item.campanha.nome} ${item.campanha.descricao ?? ""} ${item.campanha.patrocinador ?? ""}`).includes(termo),
    )
    .sort(
      (a, b) =>
        ORDEM[a.status] - ORDEM[b.status] ||
        (a.status === "ENCERRADA" || a.status === "CANCELADA"
          ? b.campanha.data_fim.localeCompare(a.campanha.data_fim)
          : a.campanha.data_inicio.localeCompare(b.campanha.data_inicio)),
    );

  const contagem = (status: CampanhaStatus) => todas.filter((item) => item.status === status).length;

  const paginacao = usePagination(linhas.length, PAGE_SIZE, `${termo}|${situacao}`);

  async function cancelar(id: number) {
    await run(() => save("campanhas", id, { status: "CANCELADA" }), {
      success: "Cancelada. O histórico foi guardado.",
      fallbackError: "Não foi possível cancelar.",
    });
  }

  const fechar = { novo: undefined, editar: undefined, abrir: undefined };

  return {
    carregando: loading,
    hoje,
    busca,
    setBusca: (valor: string) => mudar({ buscar: valor }),
    situacao,
    setSituacao: (valor: string) => mudar({ situacao: valor }),
    contagem,
    total: data.campanhas.length,
    linhas: linhas.slice(paginacao.start, paginacao.end),
    totalFiltrado: linhas.length,
    pagina: paginacao.page,
    setPagina: paginacao.setPage,
    PAGE_SIZE,
    aberta: abrirId && !editarId ? data.campanhas.find((item) => item.id === abrirId) : undefined,
    resumir,
    emEdicao: editarId ? data.campanhas.find((item) => item.id === editarId) : undefined,
    criando,
    abrir: (id: number) => mudar({ ...fechar, abrir: String(id) }),
    novo: () => mudar({ ...fechar, novo: "1" }),
    editar: (id: number) => mudar({ ...fechar, editar: String(id) }),
    fecharPainel: () => mudar(fechar),
    aoSalvar: (id: number) => mudar({ ...fechar, abrir: String(id) }),
    cancelar,
    salvando,
  };
}
