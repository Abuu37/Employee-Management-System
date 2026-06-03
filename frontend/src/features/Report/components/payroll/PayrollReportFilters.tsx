import { FiCalendar, FiSliders, FiX } from "react-icons/fi";
import type { PayrollReportFilters } from "@/features/Report/types/payrollReport.types";

interface Props {
  filters: PayrollReportFilters;
  onChange: (patch: Partial<PayrollReportFilters>) => void;
  onApply: () => void;
  onReset: () => void;
  loading: boolean;
}

const STATUS_OPTIONS = [
  { value: "", label: "All Status" },
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "paid", label: "Paid" },
];

const MONTH_OPTIONS = [
  { value: "", label: "All Months" },
  { value: "1", label: "January" },
  { value: "2", label: "February" },
  { value: "3", label: "March" },
  { value: "4", label: "April" },
  { value: "5", label: "May" },
  { value: "6", label: "June" },
  { value: "7", label: "July" },
  { value: "8", label: "August" },
  { value: "9", label: "September" },
  { value: "10", label: "October" },
  { value: "11", label: "November" },
  { value: "12", label: "December" },
];

const inputCls =
  "h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition placeholder-slate-400";

const iconInput =
  "h-11 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-sm text-slate-700 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition placeholder-slate-400";

export default function PayrollReportFilters({
  filters,
  onChange,
  onApply,
  onReset,
  loading,
}: Props) {
  const isDirty =
    filters.status !== "" ||
    filters.year !== "" ||
    filters.month !== "" ||
    filters.userId !== "" ||
    filters.departmentId !== "";

  return (
    <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center gap-2">
        <FiSliders className="h-4 w-4 text-slate-400" />
        <h3 className="text-sm font-semibold text-slate-700">Filters</h3>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-500">
            Year
          </label>
          <div className="relative">
            <FiCalendar className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            <input
              type="number"
              min="2000"
              max="2100"
              placeholder="2026"
              value={filters.year}
              onChange={(e) => onChange({ year: e.target.value })}
              className={iconInput}
            />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-slate-500">
            Month
          </label>
          <select
            value={filters.month}
            onChange={(e) => onChange({ month: e.target.value })}
            className={inputCls}
          >
            {MONTH_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
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
