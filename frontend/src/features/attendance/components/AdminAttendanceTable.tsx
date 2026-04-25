import { useState } from "react";
import { FiClock } from "react-icons/fi";
import { AttendanceRecord, statusConfig, fmt, fmtHours } from "./types";

const PAGE_SIZE = 8;

type Props = {
  records: AttendanceRecord[];
  loading: boolean;
  error: string;
  role: string;
};

export default function AdminAttendanceTable({
  records,
  loading,
  error,
  role,
}: Props) {
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(records.length / PAGE_SIZE));
  const paginated = records.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
        <h3 className="text-sm font-semibold text-slate-900">
          {role === "admin"
            ? "All Attendance Records"
            : "Team Attendance Records"}
        </h3>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
          {records.length} records
        </span>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20 text-sm text-slate-500">
          Loading attendance data…
        </div>
      ) : error ? (
        <div className="flex items-center justify-center py-20 text-sm text-red-500">
          {error}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-400">
              <tr>
                <th className="px-5 py-3">S/N</th>
                <th className="px-5 py-3">Employee</th>
                <th className="px-5 py-3">Date</th>
                <th className="px-5 py-3">Check In</th>
                <th className="px-5 py-3">Check Out</th>
                <th className="px-5 py-3">Hours</th>
                <th className="px-5 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {records.length > 0 ? (
                paginated.map((rec, idx) => {
                  const s = statusConfig[rec.status] ?? statusConfig.present;
                  return (
                    <tr
                      key={rec.id}
                      className="border-t border-slate-100 transition hover:bg-slate-50"
                    >
                      <td className="px-5 py-4 font-semibold text-slate-400">
                        {(page - 1) * PAGE_SIZE + idx + 1}
                      </td>
                      <td className="px-5 py-4">
                        <div>
                          <p className="font-semibold text-slate-900">
                            {rec.user?.name ?? `User #${rec.user_id}`}
                          </p>
                          <p className="text-xs text-slate-400">
                            ID: {rec.user_id}
                          </p>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-slate-600">
                        {new Date(rec.date).toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                      <td className="px-5 py-4">
                        {rec.check_in ? (
                          <span className="inline-flex items-center gap-1 font-medium text-slate-800">
                            <FiClock className="h-3.5 w-3.5 text-slate-400" />
                            {fmt(rec.check_in)}
                          </span>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        {rec.check_out ? (
                          <span className="inline-flex items-center gap-1 font-medium text-slate-800">
                            <FiClock className="h-3.5 w-3.5 text-slate-400" />
                            {fmt(rec.check_out)}
                          </span>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                      <td className="px-5 py-4 font-semibold text-slate-700">
                        {fmtHours(rec.total_hours)}
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${s.bg} ${s.text}`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${s.dot}`}
                          />
                          {s.label}
                        </span>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan={7}
                    className="px-5 py-16 text-center text-sm text-slate-400"
                  >
                    No attendance records found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
      {/* Pagination */}
      {!loading && !error && (
        <div className="flex items-center justify-end gap-3 border-t border-slate-200 px-5 py-4">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="rounded-lg border border-slate-300 bg-white px-3 py-1 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:bg-slate-100"
          >
            Previous
          </button>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="rounded-lg border border-slate-300 bg-white px-3 py-1 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:bg-slate-100"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
