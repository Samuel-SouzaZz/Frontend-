import { Link } from "react-router-dom";
import { CalendarDays, ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { Badge, PageHeader } from "../components/ui";
import { IconeDoTipo } from "../components/campanhas/IconeDoTipo";
import { formatDate } from "../models/formatters";
import { descreverPeriodo, nomeDoTipo, statusEfetivo } from "../models/periodo";
import { useCalendarioVM } from "../viewmodels/useCalendarioVM";

const SEMANA = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

export default function Calendario() {
  const vm = useCalendarioVM();
  const novaNoDia = `/campanhas?novo=1&inicio=${vm.diaEscolhido}`;

  return (
    <>
      <PageHeader
        eyebrow="RELACIONAMENTO"
        icon={CalendarDays}
        title="Calendário"
        description="Veja quando cada campanha e evento acontece. Clique em um dia para ver os detalhes."
        actions={
          <Link className="btn btn-primary" to={novaNoDia}>
            <Plus size={18} aria-hidden="true" /> Nova campanha ou evento
          </Link>
        }
      />
      <div className="calendar-layout">
        <section className="panel">
          <header className="calendar-toolbar">
            <h2>{vm.titulo}</h2>
            <div>
              <button
                type="button"
                className="btn btn-secondary btn-small"
                onClick={vm.irParaHoje}
              >
                Hoje
              </button>
              <button
                type="button"
                className="icon-button"
                aria-label="Mês anterior"
                onClick={vm.mesAnterior}
              >
                <ChevronLeft size={18} />
              </button>
              <button
                type="button"
                className="icon-button"
                aria-label="Próximo mês"
                onClick={vm.proximoMes}
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </header>
          <div className="calendar-grid" role="grid" aria-label={vm.titulo}>
            {SEMANA.map((dia) => (
              <span key={dia} className="calendar-weekday" role="columnheader">
                {dia}
              </span>
            ))}
            {vm.dias.map((dia) => {
              const classes = [
                "calendar-day",
                dia.doMes ? "" : "is-outside",
                dia.hoje ? "is-today" : "",
                dia.escolhido ? "is-selected" : "",
              ]
                .filter(Boolean)
                .join(" ");
              const total = dia.campanhas.length;
              return (
                <button
                  key={dia.data}
                  type="button"
                  role="gridcell"
                  className={classes}
                  aria-label={`${formatDate(dia.data)}: ${total} ${total === 1 ? "iniciativa" : "iniciativas"}`}
                  aria-selected={dia.escolhido}
                  onClick={() => vm.escolherDia(dia.data)}
                >
                  <span className="calendar-day-number">{dia.dia}</span>
                  {dia.campanhas.slice(0, 2).map((item) => (
                    <span
                      key={item.id}
                      className={`calendar-event tipo-${item.tipo.toLowerCase()}`}
                    >
                      {item.nome}
                    </span>
                  ))}
                  {total > 2 && (
                    <span className="calendar-more">+{total - 2}</span>
                  )}
                </button>
              );
            })}
          </div>
        </section>
        <aside className="calendar-side">
          <p className="calendar-side-title">{formatDate(vm.diaEscolhido)}</p>
          {vm.doDiaEscolhido.length ? (
            <ul className="calendar-day-list">
              {vm.doDiaEscolhido.map((item) => (
                <li key={item.id}>
                  <Link to={`/campanhas?abrir=${item.id}`}>
                    <span
                      className={`calendar-day-icon tipo-${item.tipo.toLowerCase()}`}
                      aria-hidden="true"
                    >
                      <IconeDoTipo tipo={item.tipo} size={18} />
                    </span>
                    <span className="calendar-day-item">
                      <strong>{item.nome}</strong>
                      <small>
                        {nomeDoTipo(item.tipo)} ·{" "}
                        {descreverPeriodo(
                          item.data_inicio.slice(0, 10),
                          item.data_fim.slice(0, 10),
                        )}
                      </small>
                      <Badge status={statusEfetivo(item, vm.hoje)} />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <div className="calendar-empty">
              <p>Nada marcado neste dia.</p>
              <Link className="btn btn-secondary" to={novaNoDia}>
                <Plus size={16} aria-hidden="true" /> Criar começando neste dia
              </Link>
            </div>
          )}
        </aside>
      </div>
    </>
  );
}
