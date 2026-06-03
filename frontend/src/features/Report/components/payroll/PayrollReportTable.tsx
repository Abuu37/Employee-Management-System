import { FiChevronLeft, FiChevronRight, FiInbox } from "react-icons/fi";
import type {
  Pagination,
  PayrollDetailRecord,
  PayrollStatus,
} from "@/features/Report/types/payrollReport.types";
import {
  useTableCountBadge,
} from "@/hooks/useTableCountBadge";
import TableCountBadge from "@/components/common/TableCountBadge";
const STATUS: Record<PayrollStatus, { label: string; cls: string }> = {
  pending: {
    label: "Pending",
    cls: "border-amber-200 bg-amber-50 text-amber-700",
  },
  approved: {
    label: "Approved",
    cls: "border-blue-200 bg-blue-50 text-blue-700",
  },
  paid: {
    label: "Paid",
    cls: "border-emerald-200 bg-emerald-50 text-emerald-700",
  },
};

const currency = (v: string | number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(Number(v) || 0);

function SkeletonRow() {
  return (
    <tr className="animate-pulse border-b border-slate-50">
      {Array.from({ length: 9 }).map((_, i) => (
        <td key={i} className="px-4 py-3.5">
          <div className="h-3 rounded bg-slate-100" />
        </td>
      ))}
    </tr>
  );
}

function EmptyState() {
  return (
    <tr>
      <td colSpan={9} className="py-16 text-center">
        <div className="flex flex-col items-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">
            <FiInbox className="h-7 w-7 text-slate-400" />
          </div>
          <p className="text-sm font-medium text-slate-500">
            No payroll records found
          </p>
          <p className="text-xs text-slate-400">Try adjusting your filters</p>
        </div>
      </td>
    </tr>
  );
}

function TablePagination({
  pagination,
  onPageChange,
}: {
  pagination: Pagination;
  onPageChange: (p: number) => void;
}) {
  const { page, totalPages, total, limit, hasPrev, hasNext } = pagination;
  const from = total === 0 ? 0 : (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1).filter(
    (p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1,
  );

  return (
    <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3">
      <p className="text-xs text-slate-500">
        {total === 0 ? "No records" : `Showing ${from}-${to} of ${total}`}
      </p>

      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={!hasPrev}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
        >
          <FiChevronLeft className="h-4 w-4" />
        </button>

        {pages.map((p, i) => {
          const prev = pages[i - 1];
          return (
            <span key={`page-wrap-${p}`} className="inline-flex items-center">
              {prev && p - prev > 1 && (
                <span className="px-1 text-xs text-slate-400">...</span>
              )}
              <button
                onClick={() => onPageChange(p)}
                className={`flex h-8 w-8 items-center justify-center rounded-lg text-xs font-medium transition ${
                  p === page
                    ? "bg-blue-600 text-white"
                    : "border border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                {p}
              </button>
            </span>
          );
        })}

        <button
          onClick={() => onPageChange(page + 1)}
          disabled={!hasNext}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
        >
          <FiChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

const HEADERS = [
  "Employee",
  "Employee ID",
  "Department",
  "Month",
  "Year",
  "Base Salary",
  "Bonus",
  "Net Salary",
  "Status",
];

export default function PayrollReportTable({
  rows,
  pagination,
  loading,
  onPageChange,
}: {
  rows: PayrollDetailRecord[];
  pagination: Pagination;
  loading: boolean;
  onPageChange: (p: number) => void;
}) {
  const { count, visible } = useTableCountBadge({
    total: pagination.total,
    hideWhenZero: true,
  });

  return (
    <div className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden">
      <div className="border-b border-slate-100 px-5 py-4">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-700">
          Payroll Records
          {visible && (
            <TableCountBadge count={count} />
          )}
        </h3>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b border-white/10 bg-[#1e3a5f]">
              {HEADERS.map((h, idx) => (
                <th
                  key={h}
                  className={`whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-blue-100 ${
                    idx !== HEADERS.length - 1 ? "border-r border-white/30" : ""
                  }`}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-50">
            {loading ? (
              Array.from({ length: 8 }).map((_, i) => <SkeletonRow key={i} />)
            ) : rows.length === 0 ? (
              <EmptyState />
            ) : (
              rows.map((rec) => {
                const st = STATUS[rec.status] ?? STATUS.pending;
                return (
                  <tr
                    key={rec.id}
                    className="hover:bg-slate-50/60 transition-colors"
                  >
                    <td className="whitespace-nowrap px-4 py-3.5">
                      <div className="font-medium text-slate-800">
                        {rec.user?.name ?? "--"}
                      </div>
                      <div className="text-xs text-slate-400">
                        {rec.user?.email ?? ""}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3.5 text-slate-600">
                      {rec.user?.employee_id ?? "--"}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3.5 text-slate-600">
                      {rec.user?.dept?.name ?? "--"}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3.5 text-slate-600">
                      {rec.month}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3.5 text-slate-600">
                      {rec.year}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3.5 text-slate-600">
                      {currency(rec.base_salary)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3.5 text-slate-600">
                      {currency(rec.bonus)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3.5 font-medium text-indigo-600">
                      {currency(rec.net_salary)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3.5">
                      <span
                        className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${st.cls}`}
                      >
                        {st.label}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <TablePagination pagination={pagination} onPageChange={onPageChange} />
    </div>
  );
}



