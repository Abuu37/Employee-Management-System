import {
  useRef,
  useEffect,
  useState,
  useCallback,
  useLayoutEffect,
} from "react";
import { usePagination } from "@/hooks/usePagination";
import SortArrow from "@/components/common/SortArrow";
import {
  FiClock,
  FiCalendar,
  FiEye,
  FiX,
  FiHash,
  FiMail,
  FiCheckSquare,
  FiCheckCircle,
  FiXCircle,
  FiMinus,
  FiLogIn,
  FiLogOut,
  FiFileText,
  FiBriefcase,
  FiBook,
  FiMessageSquare,
} from "react-icons/fi";
import { useTranslation } from "react-i18next";
import type { AttendanceRecord } from "@/features/attendance/types/attendance.types";
import RichTextEditor from "@/components/editor/RichTextEditor";
import {
  statusConfig,
  fmt,
  fmtHours,
} from "@/features/attendance/utils/attendance.utils";
import TablePagination from "@/components/common/TablePagination";

const PAGE_SIZE = 8;

type AttendanceDrawerTab = "overview" | "day-summary" | "notes";

const ATTENDANCE_TABS: {
  key: AttendanceDrawerTab;
  label: string;
  icon: React.ReactNode;
}[] = [
  {
    key: "overview",
    label: "Overview",
    icon: <FiBriefcase className="h-3.5 w-3.5" />,
  },
  {
    key: "day-summary",
    label: "Day Summary",
    icon: <FiBook className="h-3.5 w-3.5" />,
  },
  {
    key: "notes",
    label: "Notes",
    icon: <FiMessageSquare className="h-3.5 w-3.5" />,
  },
];

function AttendanceTabBar({
  activeTab,
  onTabChange,
}: {
  activeTab: AttendanceDrawerTab;
  onTabChange: (tab: AttendanceDrawerTab) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [slider, setSlider] = useState({ left: 0, width: 0 });

  const updateSlider = useCallback(() => {
    const idx = ATTENDANCE_TABS.findIndex((t) => t.key === activeTab);
    const btn = buttonRefs.current[idx];
    const wrap = containerRef.current;
    if (!btn || !wrap) return;
    const wrapRect = wrap.getBoundingClientRect();
    const btnRect = btn.getBoundingClientRect();
    setSlider({ left: btnRect.left - wrapRect.left, width: btnRect.width });
  }, [activeTab]);

  useLayoutEffect(() => {
    updateSlider();
  }, [updateSlider]);
  useEffect(() => {
    window.addEventListener("resize", updateSlider);
    return () => window.removeEventListener("resize", updateSlider);
  }, [updateSlider]);

  return (
    <div
      ref={containerRef}
      className="relative mt-3 inline-flex items-center overflow-x-auto rounded-full border border-slate-200 bg-white p-1"
    >
      <span
        aria-hidden
        className="pointer-events-none absolute top-1 bottom-1 rounded-full bg-[#1e3a5f] shadow-sm transition-all duration-300 ease-in-out"
        style={{ left: slider.left, width: slider.width }}
      />
      {ATTENDANCE_TABS.map((tab, i) => {
        const isActive = activeTab === tab.key;
        return (
          <button
            key={tab.key}
            ref={(el) => {
              buttonRefs.current[i] = el;
            }}
            type="button"
            onClick={() => onTabChange(tab.key)}
            className={`relative z-10 inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium transition-colors duration-200 ${
              isActive ? "text-white" : "text-slate-600 hover:text-slate-800"
            }`}
          >
            <span
              className={`inline-flex h-5 w-5 items-center justify-center rounded-full transition-colors duration-200 ${
                isActive ? "bg-white/20" : "bg-slate-100 text-slate-500"
              }`}
            >
              {tab.icon}
            </span>
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}

function InfoTile({
  icon,
  label,
  value,
  span2 = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
  span2?: boolean;
}) {
  return (
    <div
      className={`${span2 ? "col-span-2" : ""} rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4`}
    >
      <div className="flex items-center gap-3">
        <div className="rounded-xl bg-white p-2 text-slate-500 shadow-sm shrink-0">
          {icon}
        </div>
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
            {label}
          </p>
          <p className="mt-1 text-sm font-semibold text-slate-900">{value}</p>
        </div>
      </div>
    </div>
  );
}

function TextSection({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
      <div className="flex items-start gap-3">
        <div className="rounded-xl bg-white p-2 text-slate-500 shadow-sm shrink-0">
          {icon}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
            {label}
          </p>
          <div className="mt-2">
            <RichTextEditor
              value={value}
              onChange={() => {}}
              readOnly
              simple
              height="140px"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

type Props = {
  records: AttendanceRecord[];
  loading: boolean;
  error: string;
  role: string;
  viewId: number | null;
  onView: (id: number) => void;
  onCloseView: () => void;

  sortBy: string;
  sortOrder: string;
  onSort: (column: string) => void;
};

export default function AdminAttendanceTable({
  records,
  loading,
  error,
  role,
  viewId,
  onView,
  onCloseView,
  sortBy,
  sortOrder,
  onSort,
}: Props) {
  const { page, setPage, totalPages, paginated } = usePagination(
    records,
    PAGE_SIZE,
  );

  const selected =
    viewId != null
      ? (records.find((r) => Number(r.id) === viewId) ?? null)
      : null;
  const lastSelectedRef = useRef<AttendanceRecord | null>(null);
  if (selected) lastSelectedRef.current = selected;
  const drawerData = selected ?? lastSelectedRef.current;
  const { t } = useTranslation();

  const [activeTab, setActiveTab] = useState<AttendanceDrawerTab>("overview");
  useEffect(() => {
    if (!selected) setActiveTab("overview");
  }, [selected]);

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
                <th className="px-5 py-3">Staff</th>
                <th className="px-5 py-3">Department</th>

                <th
                  className="px-5 py-3 cursor-pointer"
                  onClick={() => onSort("date")}
                >
                  {t("attendance.date")}
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
                  {t("attendance.checkInTime")}
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
                  {t("attendance.checkOutTime")}
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
                  {t("attendance.hours")}
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
                  {t("attendance.status")}
                  <SortArrow
                    column="status"
                    sortBy={sortBy}
                    sortOrder={sortOrder}
                  />
                </th>
                <th className="px-5 py-3">Completed Tasks</th>
                <th className="px-5 py-3">Action</th>
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
                      <td className="px-5 py-4 font-semibold text-slate-900">
                        {rec.user?.name ?? `User #${rec.user_id}`}
                      </td>
                      <td className="px-5 py-4 text-slate-600">
                        {rec.department ?? (
                          <span className="text-slate-300">—</span>
                        )}
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
                          className={`inline-flex items-center gap-1.5 rounded-full whitespace-nowrap px-2.5 py-1 text-xs font-semibold ${s.chip}`}
                        >
                          <span className={`rounded-full p-0.5 ${s.iconCls}`}>
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
                          {s.label}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-slate-600">
                        {rec.completed_task_ids?.length ? (
                          `${rec.completed_task_ids.length} task${rec.completed_task_ids.length > 1 ? "s" : ""}`
                        ) : (
                          <span className="text-slate-300">—</span>
                        )}
                      </td>

                      <td className="px-5 py-4">
                        <button
                          onClick={() => onView(Number(rec.id))}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-blue-200 bg-white px-3 py-1.5 text-xs font-medium text-blue-700 hover:bg-blue-500 hover:text-white transition"
                        >
                          <FiEye className="h-3.5 w-3.5" />
                          View
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={10} className="px-5 py-16 text-center">
                    <div className="flex flex-col items-center justify-center text-slate-400">
                      <FiCalendar className="h-12 w-12 mb-3 opacity-30" />
                      <p className="text-sm">No attendance records found</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
      {/* Pagination */}
      {!loading && !error && (
        <TablePagination
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      )}

      {/* Right-side drawer */}
      {(() => {
        const s = drawerData
          ? (statusConfig[drawerData.status] ?? statusConfig.present)
          : statusConfig.present;
        return (
          <div
            className="fixed inset-0 z-50"
            style={{ pointerEvents: selected ? "auto" : "none" }}
          >
            {/* Backdrop */}
            <div
              className={`absolute inset-0 bg-black/30 backdrop-blur-sm transition-opacity duration-300 ${
                selected ? "opacity-100" : "opacity-0"
              }`}
              style={{ pointerEvents: selected ? "auto" : "none" }}
              onClick={onCloseView}
            />
            {/* Drawer panel */}
            <div
              className={`absolute inset-y-0 right-0 w-full max-w-md sm:max-w-xl lg:max-w-2xl bg-white shadow-2xl flex flex-col overflow-y-auto overflow-x-hidden transition-transform duration-300 ease-out ${
                selected ? "translate-x-0" : "translate-x-full"
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              {drawerData && (
                <>
                  {/* Header */}
                  <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white px-6 py-5">
                    <h2 className="text-lg font-semibold text-slate-800">
                      Attendance Detail
                    </h2>
                    <button
                      onClick={onCloseView}
                      className="rounded-xl border border-slate-200 p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
                    >
                      <FiX className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Sticky profile + tabs */}
                  <div className="sticky top-17.25 z-20 border-b border-slate-100 bg-white px-6 pt-4 pb-3">
                    {/* Profile snapshot card */}
                    <div className="rounded-2xl bg-linear-to-br from-blue-600 via-cyan-600 to-teal-500 p-px shadow-md drop-shadow-sm">
                      <div className="rounded-[14px] bg-white px-5 py-4">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">
                          Profile Snapshot
                        </p>
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-xl font-bold text-slate-900 leading-tight">
                            {drawerData.user?.name ??
                              `User #${drawerData.user_id}`}
                          </p>
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full whitespace-nowrap px-2.5 py-1 text-xs font-semibold ${s.chip}`}
                          >
                            <span className={`rounded-full p-0.5 ${s.iconCls}`}>
                              {drawerData.status === "present" && (
                                <FiCheckCircle className="h-3 w-3" />
                              )}
                              {drawerData.status === "late" && (
                                <FiClock className="h-3 w-3" />
                              )}
                              {drawerData.status === "absent" && (
                                <FiXCircle className="h-3 w-3" />
                              )}
                              {drawerData.status === "half_day" && (
                                <FiMinus className="h-3 w-3" />
                              )}
                            </span>
                            {s.label}
                          </span>
                        </div>
                        {drawerData.department && (
                          <p className="text-xs font-medium text-slate-500 mt-0.5">
                            {drawerData.department}
                          </p>
                        )}
                        <p className="text-sm text-slate-400 mt-0.5">
                          {new Date(drawerData.date).toLocaleDateString(
                            "en-GB",
                            {
                              weekday: "long",
                              day: "2-digit",
                              month: "long",
                              year: "numeric",
                            },
                          )}
                        </p>
                      </div>
                    </div>

                    <AttendanceTabBar
                      activeTab={activeTab}
                      onTabChange={setActiveTab}
                    />
                  </div>

                  {/* Tab content */}
                  <div className="flex-1 px-6 py-5 space-y-3">
                    {activeTab === "overview" && (
                      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                        <div className="grid grid-cols-2 gap-3">
                          {drawerData.department && (
                            <InfoTile
                              span2
                              icon={<FiHash className="h-4 w-4" />}
                              label="Department"
                              value={drawerData.department}
                            />
                          )}
                          <InfoTile
                            icon={<FiLogIn className="h-4 w-4" />}
                            label="Check In"
                            value={
                              drawerData.check_in
                                ? fmt(drawerData.check_in)
                                : "—"
                            }
                          />
                          <InfoTile
                            icon={<FiLogOut className="h-4 w-4" />}
                            label="Check Out"
                            value={
                              drawerData.check_out
                                ? fmt(drawerData.check_out)
                                : "—"
                            }
                          />
                          <InfoTile
                            icon={<FiClock className="h-4 w-4" />}
                            label="Total Hours"
                            value={fmtHours(drawerData.total_hours)}
                          />
                          <InfoTile
                            icon={<FiCheckSquare className="h-4 w-4" />}
                            label="Completed Tasks"
                            value={
                              drawerData.completed_task_ids?.length
                                ? `${drawerData.completed_task_ids.length} task${drawerData.completed_task_ids.length > 1 ? "s" : ""}`
                                : "—"
                            }
                          />
                        </div>
                      </div>
                    )}

                    {activeTab === "day-summary" && (
                      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                        {drawerData.work_summary ? (
                          <TextSection
                            icon={<FiFileText className="h-4 w-4" />}
                            label="Work Summary"
                            value={drawerData.work_summary}
                          />
                        ) : (
                          <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                            <FiBook className="h-10 w-10 mb-3 opacity-30" />
                            <p className="text-sm">No work summary recorded</p>
                          </div>
                        )}
                      </div>
                    )}

                    {activeTab === "notes" && (
                      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                        {drawerData.notes ? (
                          <TextSection
                            icon={<FiMail className="h-4 w-4" />}
                            label="Notes"
                            value={drawerData.notes}
                          />
                        ) : (
                          <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                            <FiMessageSquare className="h-10 w-10 mb-3 opacity-30" />
                            <p className="text-sm">No notes recorded</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/*=========== Footer============= */}
                  <div className="sticky bottom-0 border-t border-slate-100 bg-white px-6 py-4 flex justify-end">
                    <button
                      onClick={onCloseView}
                      className="rounded-xl bg-slate-900 px-6 py-2.5 text-sm font-semibold text-white hover:bg-slate-700 transition"
                    >
                      Close
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        );
      })()}
    </div>
  );
}
