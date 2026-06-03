import { FiSearch, FiSliders, FiX, FiCalendar } from "react-icons/fi";
import type { LeaveReportFilters } from "@/features/Report/types/leaveReport.types";

interface Props {
  filters: LeaveReportFilters;
  onChange: (f: Partial<LeaveReportFilters>) => void;
  onApply: () => void;
  onReset: () => void;
  loading: boolean;
}

const STATUS_OPTIONS = [
  { value: "", label: "All Status" },
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
];

const TYPE_OPTIONS = [
  { value: "", label: "All Types" },
  { value: "annual", label: "Annual" },
  { value: "sick", label: "Sick" },
  { value: "casual", label: "Casual" },
  { value: "emergency", label: "Emergency" },
  { value: "unpaid", label: "Unpaid" },
];

const inputCls =
  "h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition placeholder-slate-400";

const iconInput =
  "h-11 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-sm text-slate-700 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition placeholder-slate-400";

export default function LeaveReportFilters({
  filters,
  onChange,
  onApply,
  onReset,
  loading,
}: Props) {
  const isDirty =
    filters.search !== "" ||
    filters.status !== "" ||
    filters.type !== "" ||
    filters.dateFrom !== "" ||
    filters.dateTo !== "" ||
    filters.userId !== "" ||
    filters.departmentId !== "";

  return (
    <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center gap-2">
        <FiSliders className="h-4 w-4 text-slate-400" />
        <h3 className="text-sm font-semibold text-slate-700">Filters</h3>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-500">
            Search
          </label>
          <div className="relative">
            <FiSearch className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search employee..."
              value={filters.search}
              onChange={(e) => onChange({ search: e.target.value })}
              className={iconInput}
            />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-slate-500">
            From Date
          </label>
          <div className="relative">
            <FiCalendar className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            <input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => onChange({ dateFrom: e.target.value })}
              className={`${iconInput} text-slate-600`}
            />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-slate-500">
            To Date
          </label>
          <div className="relative">
            <FiCalendar className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            <input
              type="date"
              value={filters.dateTo}
              onChange={(e) => onChange({ dateTo: e.target.value })}
              className={`${iconInput} text-slate-600`}
            />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-slate-500">
            Status
          </label>
          <select
            value={filters.status}
            onChange={(e) => onChange({ status: e.target.value })}
            className={inputCls}
          >
            {STATUS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-slate-500">
            Leave Type
          </label>
          <select
            value={filters.type}
            onChange={(e) => onChange({ type: e.target.value })}
            className={inputCls}
          >
            {TYPE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <button
          onClick={onApply}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
        >
          <FiSliders className="h-3.5 w-3.5" />
          Apply Filters
        </button>

        {isDirty && (
          <button
            onClick={onReset}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-60 transition-colors"
          >
            <FiX className="h-3.5 w-3.5" />
            Reset
          </button>
        )}
      </div>
    </section>
  );
}
