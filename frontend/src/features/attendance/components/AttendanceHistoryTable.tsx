import { usePagination } from "@/Hook/usePagination";
import {
  FiCalendar,
  FiCheckCircle,
  FiClock,
  FiXCircle,
  FiMinus,
} from "react-icons/fi";
import SortArrow from "@/components/common/SortArrow";
import { useTranslation } from "react-i18next";
import type { AttendanceRecord } from "@/features/attendance/types/attendance.types";
import {
  statusConfig,
  fmt,
  fmtHours,
} from "@/features/attendance/utils/attendance.utils";
import TablePagination from "@/components/common/TablePagination";

const PAGE_SIZE = 8;

type Props = {
  records: AttendanceRecord[];
  loading: boolean;
  sortBy: string;
  sortOrder: string;
  onSort: (column: string) => void;
};

export default function AttendanceHistoryTable({
  records,
  loading,
  sortBy,
  sortOrder,
  onSort,
}: Props) {
  const { t } = useTranslation();
  const { page, setPage, totalPages, paginated } = usePagination(
    records,
    PAGE_SIZE,
  );

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
        <h3 className="text-sm font-semibold text-slate-900">
          Attendance History
        </h3>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
          {records.length} records
        </span>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-400">
            <tr>
              <th className="px-5 py-3">S/N</th>

              <th
                className="px-5 py-3 cursor-pointer"
                onClick={() => onSort("date")}
              >
                {t("attendance.date")}{" "}
                <SortArrow
                  column="date"
                  sortBy={sortBy}
                  sortOrder={sortOrder}
                />
              </th>

              <th
                className="px-5 py-3 cursor-pointer"
                onClick={() => onSort("check_in")}
              >
                {t("attendance.checkInTime")}{" "}
                <SortArrow
                  column="check_in"
                  sortBy={sortBy}
                  sortOrder={sortOrder}
                />
              </th>

              <th
                className="px-5 py-3 cursor-pointer"
                onClick={() => onSort("check_out")}
              >
                {t("attendance.checkOutTime")}{" "}
                <SortArrow
                  column="check_out"
                  sortBy={sortBy}
                  sortOrder={sortOrder}
                />
              </th>
              <th
                className="px-5 py-3 cursor-pointer"
                onClick={() => onSort("total_hours")}
              >
                {t("attendance.hours")}{" "}
                <SortArrow
                  column="total_hours"
                  sortBy={sortBy}
                  sortOrder={sortOrder}
                />
              </th>
              <th
                className="px-5 py-3 cursor-pointer"
                onClick={() => onSort("status")}
              >
                {t("attendance.status")}{" "}
                <SortArrow
                  column="status"
                  sortBy={sortBy}
                  sortOrder={sortOrder}
                />
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-5 py-12 text-center text-sm text-slate-400"
                >
                  Loading…
                </td>
              </tr>
            ) : records.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-5 py-16 text-center">
                  <div className="flex flex-col items-center justify-center text-slate-400">
                    <FiCalendar className="h-12 w-12 mb-3 opacity-30" />
                    <p className="text-sm">No attendance records found</p>
                  </div>
                </td>
              </tr>
            ) : (
              paginated.map((rec, idx) => {
                const st = statusConfig[rec.status] ?? statusConfig.present;
                return (
                  <tr
                    key={rec.id}
                    className="border-t border-slate-100 hover:bg-slate-50 transition"
                  >
                    <td className="px-5 py-4 font-semibold text-slate-400">
                      {(page - 1) * PAGE_SIZE + idx + 1}
                    </td>

                    <td className="px-5 py-4 font-medium text-slate-800">
                      {new Date(rec.date).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>

                    <td className="px-5 py-4 text-slate-700">
                      {fmt(rec.check_in)}
                    </td>

                    <td className="px-5 py-4 text-slate-700">
                      {fmt(rec.check_out)}
                    </td>

                    <td className="px-5 py-4 font-semibold text-slate-700">
                      {fmtHours(rec.total_hours)}
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full whitespace-nowrap px-2.5 py-1 text-xs font-semibold ${st.chip}`}
                      >
                        <span className={`rounded-full p-0.5 ${st.iconCls}`}>
                          {rec.status === "present" && (
                            <FiCheckCircle className="h-3 w-3" />
                          )}
                          {rec.status === "late" && (
                            <FiClock className="h-3 w-3" />
                          )}
                          {rec.status === "absent" && (
                            <FiXCircle className="h-3 w-3" />
                          )}
                          {rec.status === "half_day" && (
                            <FiMinus className="h-3 w-3" />
                          )}
                        </span>
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
      {/* Pagination */}
      {!loading && (
        <TablePagination
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      )}
    </div>
  );
}
