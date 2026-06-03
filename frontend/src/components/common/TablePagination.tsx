import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

interface TablePaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalRecords?: number;
  pageSize?: number;
}

export default function TablePagination({
  page,
  totalPages,
  onPageChange,
  totalRecords,
  pageSize,
}: TablePaginationProps) {
  const safeTotalPages = Math.max(1, totalPages || 1);
  const currentPage = Math.min(Math.max(1, page), safeTotalPages);
  const hasPrev = currentPage > 1;
  const hasNext = currentPage < safeTotalPages;

  const pages = Array.from({ length: safeTotalPages }, (_, i) => i + 1).filter(
    (p) => p === 1 || p === safeTotalPages || Math.abs(p - currentPage) <= 1,
  );

  const effectivePageSize =
    pageSize ??
    (typeof totalRecords === "number" && safeTotalPages > 0
      ? Math.max(1, Math.ceil(totalRecords / safeTotalPages))
      : undefined);

  const from =
    typeof totalRecords === "number" && effectivePageSize
      ? totalRecords === 0
        ? 0
        : (currentPage - 1) * effectivePageSize + 1
      : 0;
  const to =
    typeof totalRecords === "number" && effectivePageSize
      ? Math.min(currentPage * effectivePageSize, totalRecords)
      : 0;

  const summary =
    typeof totalRecords === "number"
      ? totalRecords === 0
        ? "No records"
        : `Showing ${from}-${to} of ${totalRecords}`
      : `Page ${currentPage} of ${safeTotalPages}`;

  return (
    <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3">
      <p className="text-xs text-slate-500">{summary}</p>

      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={!hasPrev}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
          aria-label="Previous page"
        >
          <FiChevronLeft className="h-4 w-4" />
        </button>

        {pages.map((p, i) => {
          const prev = pages[i - 1];
          return (
            <span key={`page-wrap-${p}`} className="inline-flex items-center">
              {prev && p - prev > 1 ? (
                <span className="px-1 text-xs text-slate-400">...</span>
              ) : null}
              <button
                type="button"
                onClick={() => onPageChange(p)}
                className={`flex h-8 w-8 items-center justify-center rounded-lg text-xs font-medium transition ${
                  p === currentPage
                    ? "bg-blue-600 text-white"
                    : "border border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
                aria-label={`Go to page ${p}`}
              >
                {p}
              </button>
            </span>
          );
        })}

        <button
          type="button"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={!hasNext}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
          aria-label="Next page"
        >
          <FiChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
