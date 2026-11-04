import { Link } from "react-router-dom";
import { CalendarDays, ListChecks } from "lucide-react";

export function Atalhos({ pendencias }: { pendencias: number }) {
  return (
    <>
      <Link className="btn btn-secondary" to="/pendencias">
        <ListChecks size={17} aria-hidden="true" /> Pendências
        {pendencias > 0 && (
          <span
            className="atalho-contador"
            aria-label={`${pendencias} pendências`}
          >
            {pendencias}
          </span>
        )}
      </Link>
      <Link className="btn btn-secondary" to="/calendario">
        <CalendarDays size={17} aria-hidden="true" /> Calendário
      </Link>
    </>
  );
}
