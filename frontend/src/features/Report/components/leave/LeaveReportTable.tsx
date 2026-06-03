import {
  FiAlertTriangle,
  FiCheckCircle,
  FiChevronLeft,
  FiChevronRight,
  FiInbox,
  FiXCircle,
} from "react-icons/fi";
import type { IconType } from "react-icons";
import type {
  LeaveDetailRecord,
  LeaveStatus,
  LeaveType,
  Pagination,
} from "@/features/Report/types/leaveReport.types";
import {
  useTableCountBadge,
} from "@/hooks/useTableCountBadge";
import TableCountBadge from "@/components/common/TableCountBadge";
const TYPE_LABEL: Record<LeaveType, string> = {
  annual: "Annual",
  sick: "Sick",
  casual: "Casual",
  emergency: "Emergency",
  unpaid: "Unpaid",
};

const TYPE_BADGE: Record<LeaveType, string> = {
  annual: "border-blue-200 bg-blue-50 text-blue-700",
  sick: "border-emerald-200 bg-emerald-50 text-emerald-700",
  casual: "border-violet-200 bg-violet-50 text-violet-700",
  emergency: "border-rose-200 bg-rose-50 text-rose-700",
  unpaid: "border-slate-300 bg-slate-100 text-slate-700",
};

const STATUS: Record<
  LeaveStatus,
  { label: string; cls: string; icon: IconType }
> = {
  approved: {
    label: "Approved",
    cls: "border-emerald-200 bg-emerald-50 text-emerald-700",
    icon: FiCheckCircle,
  },
  pending_manager: {
    label: "Pending Manager",
    cls: "border-amber-200 bg-amber-50 text-amber-700",
    icon: FiAlertTriangle,
  },
  pending_hr: {
    label: "Pending HR",
    cls: "border-amber-200 bg-amber-50 text-amber-700",
    icon: FiAlertTriangle,
  },
  rejected_by_manager: {
    label: "Rejected Manager",
    cls: "border-red-200 bg-red-50 text-red-700",
    icon: FiXCircle,
  },
  rejected_by_hr: {
    label: "Rejected HR",
    cls: "border-red-200 bg-red-50 text-red-700",
    icon: FiXCircle,
  },
};

const fmtDate = (d: string) =>
  new Date(d + "T00:00:00").toLocaleDateString("en-GB", {
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
            No leave records found
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
  rows: LeaveDetailRecord[];
  pagination: Pagination;
  loading: boolean;
  onPageChange: (p: number) => void;
}

const HEADERS = [
  "Employee",
  "Employee ID",
  "Department",
  "Type",
  "Date Range",
  "Days",
  "Status",
  "Backup Employee",
];

export default function LeaveReportTable({
  rows,
  pagination,
  loading,
  onPageChange,
}: Props) {
  const { count, visible } = useTableCountBadge({
    total: pagination.total,
    hideWhenZero: true,
  });

  return (
    <div className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden">
      <div className="border-b border-slate-100 px-5 py-4">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-700">
          Leave Records
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
                const st = STATUS[rec.overallStatus] ?? STATUS.pending_manager;
                const StatusIcon = st.icon;
                const dept = rec.user?.dept?.name ?? "--";
                const typeBadge =
                  TYPE_BADGE[rec.type] ??
                  "border-slate-200 bg-slate-50 text-slate-700";

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

                    <td className="whitespace-nowrap px-4 py-3.5">
                      <span
                        className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${typeBadge}`}
                      >
                        {TYPE_LABEL[rec.type] ?? rec.type}
                      </span>
                    </td>

                    <td className="whitespace-nowrap px-4 py-3.5 text-slate-600">
                      {fmtDate(rec.startDate)} - {fmtDate(rec.endDate)}
                    </td>

                    <td className="whitespace-nowrap px-4 py-3.5 font-medium text-indigo-600">
                      {Number(rec.days) || 0}
                    </td>

                    <td className="whitespace-nowrap px-4 py-3.5">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${st.cls}`}
                      >
                        <StatusIcon className="h-3.5 w-3.5" />
                        {st.label}
                      </span>
                    </td>

                    <td className="whitespace-nowrap px-4 py-3.5 text-slate-600">
                      {rec.backupEmployee?.name ?? "--"}
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



