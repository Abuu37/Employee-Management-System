import { FiChevronLeft, FiChevronRight, FiInbox } from "react-icons/fi";
import SortArrow from "@/components/common/SortArrow";
import { useTableCountBadge } from "@/hooks/useTableCountBadge";
import TableCountBadge from "@/components/common/TableCountBadge";
import type {
  EmployeeDepartmentStatsRecord,
  EmployeeListRecord,
  Pagination,
} from "@/features/Report/types/employeeSummaryReport.types";

const fmtDate = (value?: string | null) =>
  value
    ? new Date(value).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "--";

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
                className={`flex h-8 w-8 items-center justify-center rounded-lg text-xs font-medium transition ${p === page ? "bg-blue-600 text-white" : "border border-slate-200 text-slate-600 hover:bg-slate-50"}`}
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

function SkeletonRows({ columns }: { columns: number }) {
  return (
    <>
      {Array.from({ length: 6 }).map((_, i) => (
        <tr key={i} className="animate-pulse border-b border-slate-50">
          {Array.from({ length: columns }).map((__, j) => (
            <td key={j} className="px-4 py-3.5">
              <div className="h-3 rounded bg-slate-100" />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

function EmptyState({ colSpan, label }: { colSpan: number; label: string }) {
  return (
    <tr>
      <td colSpan={colSpan} className="py-16 text-center">
        <div className="flex flex-col items-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">
            <FiInbox className="h-7 w-7 text-slate-400" />
          </div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
        </div>
      </td>
    </tr>
  );
}

export function EmployeeListTable({
  rows,
  pagination,
  loading,
  sortBy,
  sortOrder,
  onSort,
  onPageChange,
}: {
  rows: EmployeeListRecord[];
  pagination: Pagination;
  loading: boolean;
  sortBy: string;
  sortOrder: "ASC" | "DESC";
  onSort: (column: string) => void;
  onPageChange: (p: number) => void;
}) {
  const { count, visible } = useTableCountBadge({
    total: pagination.total,
    hideWhenZero: true,
  });

  const headers: Array<{ label: string; sortKey?: string }> = [
    { label: "Employee", sortKey: "name" },
    { label: "Employee ID" },
    { label: "Department" },
    { label: "Role", sortKey: "role" },
    { label: "Employment", sortKey: "employment_type" },
    { label: "Status", sortKey: "status" },
    { label: "Join Date", sortKey: "join_date" },
    { label: "Supervisor" },
  ];

  return (
    <div className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden">
      <div className="border-b border-slate-100 px-5 py-4">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-700">
          Employee Directory
          {visible && <TableCountBadge count={count} />}
        </h3>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b border-white/10 bg-[#1e3a5f]">
              {headers.map((header, idx) => (
                <th
                  key={header.label}
                  className={`whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-blue-100 ${idx !== headers.length - 1 ? "border-r border-white/30" : ""}`}
                >
                  {header.sortKey ? (
                    <button
                      type="button"
                      onClick={() => onSort(header.sortKey as string)}
                      className="inline-flex items-center gap-1 text-blue-100 hover:text-white transition-colors"
                    >
                      {header.label}
                      <SortArrow
                        column={header.sortKey}
                        sortBy={sortBy}
                        sortOrder={sortOrder}
                      />
                    </button>
                  ) : (
                    header.label
                  )}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-50">
            {loading ? (
              <SkeletonRows columns={8} />
            ) : rows.length === 0 ? (
              <EmptyState colSpan={8} label="No employee records found" />
            ) : (
              rows.map((row) => (
                <tr
                  key={row.id}
                  className="hover:bg-slate-50/60 transition-colors"
                >
                  <td className="whitespace-nowrap px-4 py-3.5">
                    <div className="font-medium text-slate-800">{row.name}</div>
                    <div className="text-xs text-slate-400">{row.email}</div>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3.5 text-slate-600">
                    {row.employee_id ?? "--"}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3.5 text-slate-600">
                    {row.dept?.name ?? "--"}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3.5 text-slate-600 capitalize">
                    {row.role ?? "--"}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3.5 text-slate-600">
                    {row.employment_type ?? "--"}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3.5">
                    <span
                      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${row.status === "active" ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-rose-200 bg-rose-50 text-rose-700"}`}
                    >
                      {row.status ?? "Unknown"}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3.5 text-slate-600">
                    {fmtDate(row.join_date)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3.5 text-slate-600">
                    {row.supervisor?.name ?? "--"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <TablePagination pagination={pagination} onPageChange={onPageChange} />
    </div>
  );
}

export function DepartmentStatsTable({
  rows,
  loading,
}: {
  rows: EmployeeDepartmentStatsRecord[];
  loading: boolean;
}) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden">
      <div className="border-b border-slate-100 px-5 py-4">
        <h3 className="text-sm font-semibold text-slate-700">
          Department Statistics
        </h3>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b border-white/10 bg-[#1e3a5f]">
              {["Department", "Manager", "Total", "Active", "Inactive"].map(
                (label, idx, arr) => (
                  <th
                    key={label}
                    className={`whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-blue-100 ${idx !== arr.length - 1 ? "border-r border-white/30" : ""}`}
                  >
                    {label}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {loading ? (
              <SkeletonRows columns={5} />
            ) : rows.length === 0 ? (
              <EmptyState
                colSpan={5}
                label="No department statistics available"
              />
            ) : (
              rows.map((row) => (
                <tr
                  key={row.id}
                  className="hover:bg-slate-50/60 transition-colors"
                >
                  <td className="whitespace-nowrap px-4 py-3.5">
                    <div className="font-medium text-slate-800">{row.name}</div>
                    <div className="text-xs text-slate-400">
                      {row.code ?? ""}
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3.5 text-slate-600">
                    {row.manager?.name ?? "--"}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3.5 text-slate-600">
                    {Number(row.total_employees) || 0}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3.5 text-emerald-600 font-medium">
                    {Number(row.active_employees) || 0}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3.5 text-rose-600 font-medium">
                    {Number(row.inactive_employees) || 0}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
