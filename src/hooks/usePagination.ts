import { useCallback, useState } from "react";

export function usePagination(total: number, pageSize: number, resetKey = "") {
  const [state, setState] = useState({ page: 1, key: resetKey });
  if (state.key !== resetKey) setState({ page: 1, key: resetKey });
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const requested = state.key === resetKey ? state.page : 1;
  const current = Math.min(Math.max(requested, 1), totalPages);
  const start = (current - 1) * pageSize;
  const end = Math.min(start + pageSize, total);

  const setPage = useCallback(
    (page: number) => setState({ page, key: resetKey }),
    [resetKey],
  );

  return {
    page: current,
    setPage,
    totalPages,
    start,
    end,
    hasPrev: current > 1,
    hasNext: current < totalPages,
    prev: () => setPage(Math.max(current - 1, 1)),
    next: () => setPage(Math.min(current + 1, totalPages)),
    reset: () => setPage(1),
  };
}
