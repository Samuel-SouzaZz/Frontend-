import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import { CalendarDays, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { useFieldState } from "./fieldContext";
import {
  DIAS_DA_SEMANA,
  MESES,
  anosAoRedor,
  diasEntre,
  dataPorExtenso,
  foraDoLimite,
  formatarData,
  gradeDoMes,
  hojeIso,
  lerIso,
  lerTextoDaData,
  mascararData,
  mesDe,
  paraIso,
  somarDias,
  somarMeses,
  type Mes,
} from "../../models/seletorData";

type Vista = "dias" | "meses" | "anos";

type DateFieldProps = {
  value: string;
  onChange: (value: string) => void;
  min?: string;
  inicioDoPeriodo?: string;
  fimDoPeriodo?: string;
  max?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  "aria-label"?: string;
};

const LARGURA = 304;
const MARGEM = 8;

export function DateField({
  value,
  onChange,
  min,
  inicioDoPeriodo,
  fimDoPeriodo,
  max,
  required,
  disabled = false,
  className,
  "aria-label": ariaLabel,
}: DateFieldProps) {
  const field = useFieldState();
  const id = useId();
  const caixaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const janelaRef = useRef<HTMLDivElement>(null);
  const gradeRef = useRef<HTMLDivElement>(null);
  const focarDia = useRef(false);
  const [texto, setTexto] = useState(() => formatarData(value));
  const [valorVisto, setValorVisto] = useState(value);
  const [aberto, setAberto] = useState(false);
  const [vista, setVista] = useState<Vista>("dias");
  const [mes, setMes] = useState<Mes>(() => mesDe(value, hojeIso()));
  const [sobre, setSobre] = useState("");
  const [foco, setFoco] = useState(() => value || hojeIso());
  const hoje = hojeIso();
  const rotulo = ariaLabel ?? field?.label ?? "Data";
  const invalid = Boolean(field?.invalid);
  const obrigatorio = required ?? Boolean(field?.required);

  if (value !== valorVisto) {
    setValorVisto(value);
    setTexto(formatarData(value));
  }

  const posicionar = useCallback(() => {
    const caixa = caixaRef.current;
    const janela = janelaRef.current;
    if (!caixa || !janela) return;
    const area = caixa.getBoundingClientRect();
    const altura = janela.offsetHeight;
    const largura = Math.min(LARGURA, window.innerWidth - MARGEM * 2);
    const esquerda = Math.min(Math.max(area.left, MARGEM), window.innerWidth - largura - MARGEM);
    const cabeEmbaixo = area.bottom + 6 + altura <= window.innerHeight - MARGEM;
    const topo = cabeEmbaixo || area.top < altura + 6 ? area.bottom + 6 : area.top - altura - 6;
    janela.style.width = `${largura}px`;
    janela.style.left = `${esquerda}px`;
    janela.style.top = `${Math.max(MARGEM, topo)}px`;
  }, []);

  useLayoutEffect(() => {
    const janela = janelaRef.current;
    if (!aberto || !janela) return;
    if (!janela.matches(":popover-open")) janela.showPopover();
    posicionar();
    return () => {
      if (janela.matches(":popover-open")) janela.hidePopover();
    };
  }, [aberto, posicionar]);

  useLayoutEffect(() => {
    if (aberto) posicionar();
  }, [aberto, vista, mes, posicionar]);

  useEffect(() => {
    if (!aberto) return;
    const fecharFora = (event: PointerEvent) => {
      const alvo = event.target as Node;
      if (caixaRef.current?.contains(alvo) || janelaRef.current?.contains(alvo)) return;
      setAberto(false);
    };
    document.addEventListener("pointerdown", fecharFora);
    window.addEventListener("resize", posicionar);
    window.addEventListener("scroll", posicionar, true);
    return () => {
      document.removeEventListener("pointerdown", fecharFora);
      window.removeEventListener("resize", posicionar);
      window.removeEventListener("scroll", posicionar, true);
    };
  }, [aberto, posicionar]);

  useEffect(() => {
    if (!aberto || vista !== "dias" || !focarDia.current) return;
    focarDia.current = false;
    gradeRef.current?.querySelector<HTMLButtonElement>(`[data-dia="${foco}"]`)?.focus();
  }, [aberto, vista, foco]);

  useEffect(() => {
    if (!aberto || vista === "dias") return;
    const atual = janelaRef.current?.querySelector<HTMLButtonElement>('[role="option"][aria-selected="true"]');
    if (vista === "anos") atual?.scrollIntoView({ block: "center" });
    atual?.focus();
  }, [aberto, vista]);

  useEffect(() => {
    const input = inputRef.current;
    if (!input) return;
    const incompleto = texto !== "" && !lerTextoDaData(texto);
    const foraDoPeriodo = Boolean(value) && foraDoLimite(value, min, max);
    input.setCustomValidity(incompleto ? "Data incompleta." : foraDoPeriodo ? "Data fora do período." : "");
  }, [texto, value, min, max]);

  function abrir(comTeclado: boolean) {
    if (disabled) return;
    const base = value || (min && hoje < min ? min : hoje);
    setMes(mesDe(base, hoje));
    setFoco(base);
    setVista("dias");
    focarDia.current = comTeclado;
    setSobre("");
    setAberto(true);
  }

  function fechar(voltarAoCampo: boolean) {
    setAberto(false);
    if (voltarAoCampo) inputRef.current?.focus();
  }

  function escolher(iso: string) {
    if (foraDoLimite(iso, min, max)) return;
    if (iso !== value) onChange(iso);
    setTexto(formatarData(iso));
    fechar(true);
  }

  function digitar(bruto: string) {
    const novo = mascararData(bruto);
    setTexto(novo);
    if (!novo) {
      if (value) onChange("");
      return;
    }
    const iso = lerTextoDaData(novo);
    if (!iso) return;
    if (iso !== value) onChange(iso);
    setMes(mesDe(iso, hoje));
    setFoco(iso);
  }

  function moverFoco(novo: string) {
    focarDia.current = true;
    setFoco(novo);
    const data = lerIso(novo);
    if (data && (data.mes !== mes.mes || data.ano !== mes.ano)) setMes({ ano: data.ano, mes: data.mes });
  }

  function voltarParaDias() {
    focarDia.current = true;
    setVista("dias");
  }

  function trocarMes(quantos: number) {
    const novo = somarMeses(mes, quantos);
    setMes(novo);
    const data = lerIso(foco);
    const dia = Math.min(data?.dia ?? 1, new Date(Date.UTC(novo.ano, novo.mes + 1, 0)).getUTCDate());
    setFoco(paraIso(novo.ano, novo.mes, dia));
  }

  function teclaNoCampo(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      if (!aberto) abrir(true);
      else gradeRef.current?.querySelector<HTMLButtonElement>(`[data-dia="${foco}"]`)?.focus();
    } else if (event.key === "Escape" && aberto) {
      event.preventDefault();
      event.stopPropagation();
      fechar(false);
    }
  }

  function teclaNaGrade(event: KeyboardEvent<HTMLDivElement>) {
    const passos: Record<string, number> = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 };
    const diaDaSemana = new Date(`${foco}T12:00:00`).getDay();
    if (event.key in passos) moverFoco(somarDias(foco, passos[event.key]));
    else if (event.key === "Home") moverFoco(somarDias(foco, -diaDaSemana));
    else if (event.key === "End") moverFoco(somarDias(foco, 6 - diaDaSemana));
    else if (event.key === "PageUp" || event.key === "PageDown") {
      focarDia.current = true;
      trocarMes(event.key === "PageUp" ? -1 : 1);
    } else if (event.key === "Enter" || event.key === " ") escolher(foco);
    else return;
    event.preventDefault();
  }

  function teclaNaJanela(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key !== "Escape") return;
    event.preventDefault();
    event.stopPropagation();
    if (vista === "dias") fechar(true);
    else voltarParaDias();
  }

  const nomeDoMes = MESES[mes.mes];
  const tituloDoMes = `${nomeDoMes.charAt(0).toUpperCase()}${nomeDoMes.slice(1)} de ${mes.ano}`;
  const hojeBloqueado = foraDoLimite(hoje, min, max);
  const marcado = sobre || value;
  const temPeriodo = inicioDoPeriodo !== undefined || fimDoPeriodo !== undefined;
  const inicioDaFaixa = inicioDoPeriodo ?? marcado;
  const fimDaFaixa = fimDoPeriodo ?? marcado;
  const faixaValida = temPeriodo && Boolean(inicioDaFaixa && fimDaFaixa) && inicioDaFaixa <= fimDaFaixa;
  const duracao = faixaValida ? diasEntre(inicioDaFaixa ?? "", fimDaFaixa ?? "") : 0;

  return (
    <div className={`date-field${className ? ` ${className}` : ""}`} ref={caixaRef}>
      <input
        ref={inputRef}
        className={invalid ? "is-invalid" : undefined}
        inputMode="numeric"
        autoComplete="off"
        placeholder="dd/mm/aaaa"
        aria-label={ariaLabel}
        aria-haspopup="dialog"
        aria-expanded={aberto}
        aria-controls={aberto ? `${id}-janela` : undefined}
        aria-invalid={invalid || undefined}
        required={obrigatorio}
        disabled={disabled}
        value={texto}
        onChange={(event) => digitar(event.target.value)}
        onClick={() => !aberto && abrir(false)}
        onKeyDown={teclaNoCampo}
        onBlur={() => {
          if (texto && !lerTextoDaData(texto)) return;
          setTexto(formatarData(value));
        }}
      />
      <button
        type="button"
        className="date-field-botao"
        tabIndex={-1}
        aria-label={`Abrir calendário de ${rotulo}`}
        disabled={disabled}
        onClick={(event) => {
          event.preventDefault();
          if (aberto) fechar(true);
          else abrir(true);
        }}
      >
        <CalendarDays size={17} aria-hidden="true" />
      </button>
      {aberto && (
        <div
          ref={janelaRef}
          id={`${id}-janela`}
          popover="manual"
          tabIndex={-1}
          className="date-janela"
          role="dialog"
          aria-label={`Escolher ${rotulo.toLowerCase()}`}
          onKeyDown={teclaNaJanela}
          onClick={(event) => event.preventDefault()}
        >
          <div className="date-topo">
            {vista === "dias" ? (
              <>
                <button
                  type="button"
                  className="date-titulo"
                  aria-label={`${tituloDoMes}, escolher outro ano`}
                  onClick={() => setVista("anos")}
                >
                  {tituloDoMes}
                  <ChevronDown size={16} aria-hidden="true" />
                </button>
                <span className="date-setas">
                  <button type="button" aria-label="Mês anterior" onClick={() => trocarMes(-1)}>
                    <ChevronLeft size={18} aria-hidden="true" />
                  </button>
                  <button type="button" aria-label="Próximo mês" onClick={() => trocarMes(1)}>
                    <ChevronRight size={18} aria-hidden="true" />
                  </button>
                </span>
              </>
            ) : (
              <button
                type="button"
                className="date-titulo is-aberto"
                aria-label="Voltar para os dias"
                onClick={() => (vista === "meses" ? setVista("anos") : voltarParaDias())}
              >
                {vista === "anos" ? "Escolha o ano" : mes.ano}
                <ChevronDown size={16} aria-hidden="true" />
              </button>
            )}
          </div>

          {vista === "dias" && (
            <div
              ref={gradeRef}
              className="date-grade"
              role="grid"
              aria-label={tituloDoMes}
              onKeyDown={teclaNaGrade}
              onMouseLeave={() => setSobre("")}
            >
              <div className="date-semana" role="row">
                {DIAS_DA_SEMANA.map((dia) => (
                  <span key={dia.nome} role="columnheader" title={dia.nome} aria-label={dia.nome}>
                    {dia.curto}
                  </span>
                ))}
              </div>
              {Array.from({ length: 6 }, (_, semana) => (
                <div key={semana} className="date-semana" role="row">
                  {gradeDoMes(mes)
                    .slice(semana * 7, semana * 7 + 7)
                    .map((dia) => {
                      const bloqueado = foraDoLimite(dia.iso, min, max);
                      const classes = [
                        "date-dia",
                        dia.doMes ? "" : "is-fora",
                        dia.iso === hoje ? "is-hoje" : "",
                        dia.iso === value ? "is-escolhido" : "",
                        faixaValida && (dia.iso === inicioDaFaixa || dia.iso === fimDaFaixa) ? "is-ponta" : "",
                      ]
                        .filter(Boolean)
                        .join(" ");
                      const naFaixa =
                        faixaValida && duracao > 1 && dia.iso >= (inicioDaFaixa ?? "") && dia.iso <= (fimDaFaixa ?? "");
                      const celula = naFaixa
                        ? `date-celula is-faixa${dia.iso === inicioDaFaixa ? " is-inicio" : ""}${dia.iso === fimDaFaixa ? " is-fim" : ""}`
                        : "date-celula";
                      return (
                        <span key={dia.iso} className={celula} role="gridcell" aria-selected={dia.iso === value}>
                          <button
                            type="button"
                            className={classes}
                            data-dia={dia.iso}
                            tabIndex={dia.iso === foco ? 0 : -1}
                            disabled={bloqueado}
                            aria-label={`${dataPorExtenso(dia.iso)}${dia.iso === hoje ? ", hoje" : ""}`}
                            aria-current={dia.iso === hoje ? "date" : undefined}
                            onClick={() => escolher(dia.iso)}
                            onMouseEnter={() => temPeriodo && !bloqueado && setSobre(dia.iso)}
                          >
                            {dia.dia}
                          </button>
                        </span>
                      );
                    })}
                </div>
              ))}
            </div>
          )}

          {vista === "anos" && (
            <div className="date-anos" role="listbox" aria-label="Ano">
              {anosAoRedor(mes.ano, min, max).map((ano) => (
                <button
                  key={ano}
                  type="button"
                  role="option"
                  aria-selected={ano === mes.ano}
                  className={`date-opcao${ano === mes.ano ? " is-escolhido" : ""}${
                    ano === Number(hoje.slice(0, 4)) ? " is-hoje" : ""
                  }`}
                  onClick={() => {
                    setMes({ ano, mes: mes.mes });
                    setVista("meses");
                  }}
                >
                  {ano}
                </button>
              ))}
            </div>
          )}

          {vista === "meses" && (
            <div className="date-meses" role="listbox" aria-label={`Mês de ${mes.ano}`}>
              {MESES.map((nome, indice) => {
                const ultimoDia = paraIso(mes.ano, indice, new Date(Date.UTC(mes.ano, indice + 1, 0)).getUTCDate());
                const bloqueado = Boolean((min && ultimoDia < min) || (max && paraIso(mes.ano, indice, 1) > max));
                return (
                  <button
                    key={nome}
                    type="button"
                    role="option"
                    aria-selected={indice === mes.mes}
                    disabled={bloqueado}
                    className={`date-opcao${indice === mes.mes ? " is-escolhido" : ""}`}
                    onClick={() => {
                      setMes({ ano: mes.ano, mes: indice });
                      moverFoco(paraIso(mes.ano, indice, 1));
                      voltarParaDias();
                    }}
                  >
                    {nome.slice(0, 3)}
                  </button>
                );
              })}
            </div>
          )}

          <div className="date-rodape">
            <button
              type="button"
              disabled={!value && !texto}
              onClick={() => {
                if (value) onChange("");
                setTexto("");
                fechar(true);
              }}
            >
              Limpar
            </button>
            {vista === "dias" && duracao > 0 && (
              <span className="date-duracao" aria-live="polite">
                {duracao === 1 ? "1 dia" : `${duracao} dias`}
              </span>
            )}
            <button type="button" className="is-forte" disabled={hojeBloqueado} onClick={() => escolher(hoje)}>
              Hoje
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
