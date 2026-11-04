import { useRef, useState } from "react";
import { usePortal } from "./PortalContext";
import { useToast } from "./ToastContext";
import { errorMessage } from "../hooks/useAsyncAction";
import { toLocalDateString } from "../models/formatters";
import {
  campanhaVazia,
  draftDaCampanha,
  errosDaIniciativa,
  errosDosItens,
  novoItem,
  type CampanhaDraft,
  type ItemDraft,
} from "../models/campanhaDraft";
import type { Campanha, CampanhaTipo } from "../models/types";
import { salvarCampanha } from "./salvarCadastros";

export function useCampanhaForm({
  campanha,
  tipoInicial,
  inicioSugerido,
  aoSalvar,
}: {
  campanha?: Campanha;
  tipoInicial: CampanhaTipo;
  inicioSugerido?: string;
  aoSalvar: (id: number) => void;
}) {
  const portal = usePortal();
  const { notify } = useToast();
  const contador = useRef(0);
  const idSalvo = useRef<number | undefined>(campanha?.id);
  const [enviando, setEnviando] = useState(false);
  const [erros, setErros] = useState<string[]>([]);
  const [sujo, setSujo] = useState(false);
  const [draft, setDraft] = useState<CampanhaDraft>(() => {
    if (campanha) return draftDaCampanha(campanha, portal.data.itensCampanha, portal.data.ofertasCampanha);
    const vazio = { ...campanhaVazia(), tipo: tipoInicial, data_inicio: inicioSugerido ?? "" };
    return tipoInicial.startsWith("EVENTO") ? vazio : { ...vazio, itens: [novoItem("novo-0")] };
  });

  const atualizar = (patch: Partial<CampanhaDraft>) => {
    setErros([]);
    setSujo(true);
    setDraft((atual) => ({ ...atual, ...patch }));
  };

  const atualizarItem = (chave: string, patch: Partial<ItemDraft>) => {
    if (!("id" in patch)) {
      setErros([]);
      setSujo(true);
    }
    setDraft((atual) => ({
      ...atual,
      itens: atual.itens.map((item) => (item.chave === chave ? { ...item, ...patch } : item)),
    }));
  };

  function adicionarItem() {
    setSujo(true);
    contador.current += 1;
    setDraft((atual) => ({ ...atual, itens: [...atual.itens, novoItem(`novo-${contador.current}`)] }));
  }

  const removerItem = (chave: string) => {
    setSujo(true);
    setDraft((atual) => ({ ...atual, itens: atual.itens.filter((item) => item.chave !== chave) }));
  };

  async function salvar() {
    if (enviando) return;
    const encontrados = [...errosDaIniciativa(draft), ...errosDosItens(draft)];
    setErros(encontrados);
    if (encontrados.length) return;
    setEnviando(true);
    try {
      const existente = idSalvo.current
        ? portal.data.campanhas.find((item) => item.id === idSalvo.current)
        : undefined;
      const salva = await salvarCampanha(
        portal,
        draft,
        existente,
        toLocalDateString(),
        (id) => {
          idSalvo.current = id;
        },
        (chave, itemId) => atualizarItem(chave, { id: itemId }),
      );
      notify(campanha ? "Alterações salvas." : `“${salva.nome}” foi criada.`, "success");
      aoSalvar(salva.id);
    } catch (erro) {
      const mensagem = errorMessage(erro, "Não foi possível salvar.");
      setErros([
        idSalvo.current && !campanha
          ? `Foi criada, mas uma parte não salvou: ${mensagem} Clique em salvar de novo.`
          : mensagem,
      ]);
    } finally {
      setEnviando(false);
    }
  }

  return {
    conveniados: portal.data.conveniados,
    draft,
    atualizar,
    atualizarItem,
    adicionarItem,
    removerItem,
    erros,
    enviando,
    salvar,
    sujo,
  };
}
