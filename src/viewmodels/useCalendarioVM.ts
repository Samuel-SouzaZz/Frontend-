import { useState } from "react";
import { toLocalDateString } from "../models/formatters";
import { campanhasDoDia, diasDoMes, mesDaChave, mudarMes, nomeDoMes } from "../models/calendario";
import { usePortal } from "./PortalContext";

export function useCalendarioVM() {
    const { data } = usePortal();
    const hoje = toLocalDateString();
    const [mes, setMes] = useState(() => mesDaChave(hoje));
    const [diaEscolhido, setDiaEscolhido] = useState(hoje);
    const campanhas = data.campanhas.filter((item) => item.status !== "CANCELADA");

    const dias = diasDoMes(mes).map((dia) => ({
        ...dia,
        hoje: dia.data === hoje,
        escolhido: dia.data === diaEscolhido,
        campanhas: campanhasDoDia(campanhas, dia.data),
}));

function irParaHoje() {
    setMes(mesDaChave(hoje));
    setDiaEscolhido(hoje);
}

return {
    hoje,
    titulo: nomeDoMes(mes),
    dias,
    diaEscolhido,
    escolherDia: setDiaEscolhido,
    doDiaEscolhido: campanhasDoDia(campanhas, diaEscolhido),
    irParaHoje,
    mesAnterior: () => setMes(mudarMes(mes, -1)),
    proximoMes: () => setMes(mudarMes(mes, 1)),
    };
}
