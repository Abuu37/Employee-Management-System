import { FiSearch, FiSliders, FiX } from "react-icons/fi";
import type { EmployeeSummaryFilters as Filters } from "@/features/Report/types/employeeSummaryReport.types";

const inputCls =
  "h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition placeholder-slate-400";
const iconInput =
  "h-11 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-sm text-slate-700 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition placeholder-slate-400";

export default function EmployeeSummaryFilters({
  filters,
  departments,
  onChange,
  onApply,
  onReset,
  loading,
}: {
  filters: Filters;
  departments: Array<{ id: number; name: string }>;
  onChange: (patch: Partial<Filters>) => void;
  onApply: () => void;
  onReset: () => void;
  loading: boolean;
}) {
  const isDirty =
    filters.search !== "" ||
    filters.status !== "" ||
    filters.departmentId !== "" ||
    filters.employmentType !== "" ||
    filters.joinDateFrom !== "" ||
    filters.joinDateTo !== "";

  return (
    <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center gap-2">
        <FiSliders className="h-4 w-4 text-slate-400" />
        <h3 className="text-sm font-semibold text-slate-700">Filters</h3>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-500">
            Search Employee
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
            Status
          </label>
          <select
            value={filters.status}
            onChange={(e) => onChange({ status: e.target.value })}
            className={inputCls}
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-slate-500">
            Department
          </label>
          <select
            value={filters.departmentId}
            onChange={(e) => onChange({ departmentId: e.target.value })}
            className={inputCls}
          >
            <option value="">All Departments</option>
            {departments.map((dept) => (
              <option key={dept.id} value={String(dept.id)}>
                {dept.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-slate-500">
            Employment Type
          </label>
          <select
            value={filters.employmentType}
            onChange={(e) => onChange({ employmentType: e.target.value })}
            className={inputCls}
          >
            <option value="">All Types</option>
            <option value="full_time">Full Time</option>
            <option value="part_time">Part Time</option>
            <option value="contract">Contract</option>
            <option value="intern">Intern</option>
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
