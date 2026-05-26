import {
  FiChevronLeft,
  FiChevronRight,
  FiLogIn,
  FiLogOut,
  FiInbox,
} from "react-icons/fi";
import SortArrow from "@/components/common/SortArrow";
import type {
  AttendanceDetailRecord,
  AttendanceStatus,
  Pagination,
} from "@/features/Report/types/attendanceReport.types";
import { useAnimatedCount } from "@/hooks/useAnimatedCount";

const STATUS: Record<AttendanceStatus, { label: string; cls: string }> = {
  present: {
    label: "Present",
    cls: "border-emerald-200 bg-emerald-50 text-emerald-700",
  },
  late: {
    label: "Late",
    cls: "border-amber-200 bg-amber-50 text-amber-700",
  },
  absent: {
    label: "Absent",
    cls: "border-red-200 bg-red-50 text-red-700",
  },
  half_day: {
    label: "Half Day",
    cls: "border-blue-200 bg-blue-50 text-blue-700",
  },
};

const fmtTime = (t: string | null) => (t ? t.slice(0, 5) : "--");

const fmtHours = (h: string | number | null) => {
  if (h == null) return "--";
  const n = Number(h);
  return Number.isFinite(n) ? `${n.toFixed(1)}h` : "--";
};

const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

function SkeletonRow() {
  return (
    <tr className="animate-pulse border-b border-slate-50">
      {Array.from({ length: 8 }).map((_, i) => (
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
      <td colSpan={8} className="py-16 text-center">
        <div className="flex flex-col items-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">
            <FiInbox className="h-7 w-7 text-slate-400" />
          </div>
          <p className="text-sm font-medium text-slate-500">
            No attendance records found
          </p>
          <p className="text-xs text-slate-400">Try adjusting your filters</p>
        </div>
      </td>
    </tr>
  );
}

interface TablePaginationProps {
  pagination: Pagination;
  onPageChange: (p: number) => void;
}

function TablePagination({ pagination, onPageChange }: TablePaginationProps) {
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

interface Props {
  rows: AttendanceDetailRecord[];
  pagination: Pagination;
  loading: boolean;
  sortBy: string;
  sortOrder: "ASC" | "DESC";
  onSort: (column: string) => void;
  onPageChange: (p: number) => void;
}

const HEADERS: Array<{ label: string; sortKey?: string }> = [
  { label: "Employee" },
  { label: "Employee ID" },
  { label: "Department" },
  { label: "Date", sortKey: "date" },
  { label: "Status", sortKey: "status" },
  { label: "Check In", sortKey: "check_in" },
  { label: "Check Out", sortKey: "check_out" },
  { label: "Hours", sortKey: "total_hours" },
];

export default function AttendanceReportTable({
  rows,
  pagination,
  loading,
  sortBy,
  sortOrder,
  onSort,
  onPageChange,
}: Props) {
  const animatedTotal = useAnimatedCount(pagination.total, { durationMs: 800 });

  return (
    <div className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden">
      <div className="border-b border-slate-100 px-5 py-4">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-700">
          Attendance Records
          {pagination.total > 0 && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-linear-to-r from-blue-50 to-sky-100 px-2.5 py-1 text-xs font-semibold text-blue-700 shadow-sm">
              <span
                className="text-[11px] font-bold leading-none text-blue-600"
                aria-hidden
              >
                +
              </span>
              <span>{animatedTotal}</span>
            </span>
          )}
        </h3>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b border-white/10 bg-[#1e3a5f]">
              {HEADERS.map((h, idx) => (
                <th
                  key={h.label}
                  className={`whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-blue-100 ${
                    idx !== HEADERS.length - 1 ? "border-r border-white/30" : ""
                  }`}
                >
                  {h.sortKey ? (
                    <button
                      type="button"
                      onClick={() => onSort(h.sortKey as string)}
                      className="inline-flex items-center gap-1 text-blue-100 hover:text-white transition-colors"
                    >
                      {h.label}
                      <SortArrow
                        column={h.sortKey}
                        sortBy={sortBy}
                        sortOrder={sortOrder}
                      />
                    </button>
                  ) : (
                    h.label
                  )}
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
                const st = STATUS[rec.status] ?? STATUS.absent;
                const dept =
                  rec.user?.dept?.name ?? rec.user?.department ?? "--";
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
                      {dept}
                    </td>

                    <td className="whitespace-nowrap px-4 py-3.5 text-slate-600">
                      {fmtDate(rec.date)}
                    </td>

                    <td className="whitespace-nowrap px-4 py-3.5">
                      <span
                        className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${st.cls}`}
                      >
                        {st.label}
                      </span>
                    </td>

                    <td className="whitespace-nowrap px-4 py-3.5">
                      <span className="inline-flex items-center gap-1 text-slate-600">
                        <FiLogIn className="h-3.5 w-3.5 text-emerald-500" />
                        {fmtTime(rec.check_in)}
                      </span>
                    </td>

                    <td className="whitespace-nowrap px-4 py-3.5">
                      <span className="inline-flex items-center gap-1 text-slate-600">
                        <FiLogOut className="h-3.5 w-3.5 text-red-400" />
                        {fmtTime(rec.check_out)}
                      </span>
                    </td>

                    <td className="whitespace-nowrap px-4 py-3.5 font-medium text-indigo-600">
                      {fmtHours(rec.total_hours)}
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


