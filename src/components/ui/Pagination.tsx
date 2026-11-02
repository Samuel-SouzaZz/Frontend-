import { ChevronLeft, ChevronRight } from "lucide-react";

export function Pagination({
  page,
  total,
  pageSize,
  onChange,
}: {
  page: number;
  total: number;
  pageSize: number;
  onChange: (page: number) => void;
}) {
  const count = Math.max(1, Math.ceil(total / pageSize));
  const pages = Array.from({ length: count }, (_, index) => index + 1).filter(
    (value) => value === 1 || value === count || Math.abs(value - page) <= 1,
  );
  const first = (page - 1) * pageSize + 1;
  const last = Math.min(page * pageSize, total);
  return (
    <div className="pagination">
      <span>{total ? `${first}–${last} de ${total} registros` : "0 registros"}</span>
      <nav aria-label="Paginação">
        <button
          type="button"
          className="page-button"
          aria-label="Página anterior"
          disabled={page <= 1}
          onClick={() => onChange(page - 1)}
        >
          <ChevronLeft size={16} />
        </button>
        {pages.map((value, index) => (
          <span key={value}>
            {index > 0 && value - pages[index - 1] > 1 && (
              <span className="page-dots">…</span>
            )}
            <button
              type="button"
              className={`page-button ${value === page ? "selected" : ""}`}
              aria-current={value === page ? "page" : undefined}
              aria-label={`Página ${value}`}
              onClick={() => onChange(value)}
            >
              {value}
            </button>
          </span>
        ))}
        <button
          type="button"
          className="page-button"
          aria-label="Próxima página"
          disabled={page >= count}
          onClick={() => onChange(page + 1)}
        >
          <ChevronRight size={16} />
        </button>
      </nav>
    </div>
  );
}
