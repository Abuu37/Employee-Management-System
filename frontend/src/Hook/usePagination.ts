import { useMemo, useState } from "react";

/**
 * Local (non-URL) pagination hook for table components that receive full data arrays.
 *
 * Usage:
 *   const { page, setPage, totalPages, paginated } = usePagination(items, 8);
 */
export function usePagination<T>(data: T[], pageSize: number) {
  const [page, setPage] = useState(1);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(data.length / pageSize)),
    [data.length, pageSize],
  );

  const paginated = useMemo(
    () => data.slice((page - 1) * pageSize, page * pageSize),
    [data, page, pageSize],
  );

  // If the data shrinks so that the current page no longer exists, snap back to last valid page
  const safePage = Math.min(page, totalPages);
  const safeSetPage = (p: number) =>
    setPage(Math.min(Math.max(1, p), totalPages));

  return {
    page: safePage,
    setPage: safeSetPage,
    totalPages,
    paginated,
  };
}
