import { FiSearch } from "react-icons/fi";

type Props = {
  search: string;
  statusFilter: string;
  dateFrom: string;
  dateTo: string;
  onSearchChange: (v: string) => void;
  onStatusChange: (v: string) => void;
  onDateFromChange: (v: string) => void;
  onDateToChange: (v: string) => void;
  onClear: () => void;
};

export default function AttendanceFilters({
  search,
  statusFilter,
  dateFrom,
  dateTo,
  onSearchChange,
  onStatusChange,
  onDateFromChange,
  onDateToChange,
  onClear,
}: Props) {
  const isDirty =
    search !== "" || statusFilter !== "all" || dateFrom !== "" || dateTo !== "";

  return (
    <div className="mb-4 flex flex-wrap items-center gap-3">
      <div className="relative flex-1 min-w-48">
        <FiSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
        <input
          type="text"
          placeholder="Search employee or date…"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 transition"
        />
      </div>

      <select
        value={statusFilter}
        onChange={(e) => onStatusChange(e.target.value)}
        className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-blue-500 transition"
      >
        <option value="all">All Status</option>
        <option value="present">Present</option>
        <option value="late">Late</option>
        <option value="absent">Absent</option>
        <option value="half_day">Half Day</option>
      </select>

      <div className="relative">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400 select-none">
          From
        </span>
        <input
          type="date"
          value={dateFrom}
          onChange={(e) => onDateFromChange(e.target.value)}
          className="rounded-xl border border-slate-200 bg-white py-2.5 pl-14 pr-3 text-sm
          text-slate-700 outline-none focus:ring-2 focus:ring-blue-500 transition"
        />
      </div>

      <div className="relative">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs font-semibold
         text-slate-400 select-none">
          To
        </span>
        <input
          type="date"
          value={dateTo}
          onChange={(e) => onDateToChange(e.target.value)}
          className="rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-blue-500 transition"
        />
      </div>

      {isDirty && (
        <button
          type="button"
          onClick={onClear}
          className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-500 transition hover:bg-slate-50"
        >
          Clear
        </button>
      )}
    </div>
  );
}
