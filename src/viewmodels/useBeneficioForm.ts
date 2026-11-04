import { useRef, useState } from "react";
import { usePortal } from "./PortalContext";
import { useToast } from "./ToastContext";
import { errorMessage } from "../hooks/useAsyncAction";
import {
  beneficioVazio,
  draftDoBeneficio,
  errosDasRegras,
  errosDoSobre,
  errosDosParceiros,
  type BeneficioDraft,
} from "../models/beneficioDraft";
import type { Beneficio } from "../models/types";
import { salvarBeneficio } from "./salvarCadastros";

export function useBeneficioForm({
  beneficio,
  aoSalvar,
}: {
  beneficio?: Beneficio;
  aoSalvar: (id: number) => void;
}) {
  const portal = usePortal();
  const { notify } = useToast();
  const idSalvo = useRef<number | undefined>(beneficio?.id);
  const [enviando, setEnviando] = useState(false);
  const [erros, setErros] = useState<string[]>([]);
  const [sujo, setSujo] = useState(false);
  const [draft, setDraft] = useState<BeneficioDraft>(() =>
    beneficio ? draftDoBeneficio(beneficio, portal.data.ofertas) : beneficioVazio(),
  );

  const atualizar = (patch: Partial<BeneficioDraft>) => {
    setErros([]);
    setSujo(true);
    setDraft((atual) => ({ ...atual, ...patch }));
  };

  async function salvar() {
    if (enviando) return;
    const encontrados = [...errosDoSobre(draft), ...errosDasRegras(draft), ...errosDosParceiros(draft)];
    setErros(encontrados);
    if (encontrados.length) return;
    setEnviando(true);
    try {
      const salvo = await salvarBeneficio(portal, draft, idSalvo.current, (id) => {
        idSalvo.current = id;
      });
      notify(beneficio ? "Alterações salvas." : `“${salvo.nome}” foi cadastrado.`, "success");
      aoSalvar(salvo.id);
    } catch (erro) {
      const mensagem = errorMessage(erro, "Não foi possível salvar.");
      setErros([
        idSalvo.current && !beneficio
          ? `Foi cadastrado, mas os parceiros não salvaram todos: ${mensagem} Clique em salvar de novo.`
          : mensagem,
      ]);
    } finally {
      setEnviando(false);
    }
  }

  return { conveniados: portal.data.conveniados, draft, atualizar, erros, enviando, salvar, sujo };
}
