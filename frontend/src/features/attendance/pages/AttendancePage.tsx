import { useTranslation } from "react-i18next";
import Sidebar from "@/layouts/Sidebar";
import Header from "@/layouts/Header";
import {
  FiUsers,
  FiCheckCircle,
  FiClock,
  FiXCircle,
  FiLogIn,
  FiLogOut,
} from "react-icons/fi";
import { AnimatedSearchIcon } from "@/components/common/AnimatedSearchIcon";
import StatCard from "@/features/attendance/components/StatCard";
import AttendanceHistoryTable from "@/features/attendance/components/AttendanceHistoryTable";
import AttendanceFilters from "@/features/attendance/components/AttendanceFilters";
import AdminAttendanceTable from "@/features/attendance/components/AdminAttendanceTable";
import CheckOutModel from "@/features/attendance/components/CheckOutModel";
import { useAttendancePage } from "@/features/attendance/hooks/useAttendancePage";

export default function AttendancePage() {
  const { t } = useTranslation();
  const {
    role,
    records,
    loading,
    error,
    totalPages,
    stats,
    search,
    statusFilter,
    dateFrom,
    dateTo,
    sortBy,
    sortOrder,
    page,
    setPage,
    setSearch,
    setStatusFilter,
    setDateFrom,
    setDateTo,
    setSort,
    employeeSearch,
    setEmployeeSearch,
    viewId,
    openView,
    closeView,
    actionLoading,
    actionMsg,
    showCheckOutModel,
    setShowCheckOutModel,
    handleCheckIn,
    handleCheckOut,
  } = useAttendancePage();

  // =============== EMPLOYEE VIEW ==================
  if (role === "employee") {
    return (
      <div className="flex min-h-screen bg-slate-50">
        <Sidebar />
        <main className="flex-1 flex flex-col overflow-auto">
          <Header searchTerm="" onSearchChange={() => {}} />
          <div className="p-6">
            <CheckOutModel
              open={showCheckOutModel}
              onClose={() => setShowCheckOutModel(false)}
              onConfirm={handleCheckOut}
            />
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-slate-900">
                {t("nav.myAttendance")}
              </h1>
              <p className="text-sm text-slate-500">
                {t("attendance.monitorAll")}
              </p>
            </div>

            <section className="mb-5 grid grid-cols-2 gap-4 sm:grid-cols-4">
              <StatCard
                label={t("attendance.presentToday")}
                value={stats?.presentToday ?? 0}
                icon={<FiCheckCircle className="h-5 w-5" />}
                color="bg-green-100 text-green-600"
                subtitle={t("attendance.myStatus")}
                extra={`${stats?.myAttendanceRate ?? 0}% attendance rate`}
                extraClassName="text-emerald-300"
                featured
              />
              <StatCard
                label={t("attendance.lateToday")}
                value={stats?.lateToday ?? 0}
                icon={<FiClock className="h-5 w-5" />}
                color="bg-amber-100 text-amber-600"
                subtitle={t("attendance.arrivedAfterTime")}
                extra={
                  (stats?.lateToday ?? 0) > 0
                    ? stats?.avgLateArrival
                      ? `Avg arrival ${stats.avgLateArrival}`
                      : "Arrived after schedule"
                    : undefined
                }
                extraClassName="text-amber-600"
              />
              <StatCard
                label={t("attendance.absentToday")}
                value={stats?.absentToday ?? 0}
                icon={<FiXCircle className="h-5 w-5" />}
                color="bg-red-100 text-red-600"
                subtitle={t("attendance.notCheckedIn")}
                extra={`${stats?.myAbsentThisMonth ?? 0} days absent this month`}
                extraClassName="text-slate-500"
              />

              {/* Check In / Check Out card */}
              <article className="rounded-2xl border border-slate-100 bg-white px-5 py-4 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl p-2.5 shrink-0 flex items-center justify-center bg-blue-100 text-[#1e3a5f]">
                    {stats?.checkedInToday ? (
                      <FiLogOut className="h-5 w-5" />
                    ) : (
                      <FiLogIn className="h-5 w-5" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-1">
                      {t("attendance.attendance")}
                    </p>
                    {!stats?.checkedInToday && (
                      <button
                        type="button"
                        disabled={actionLoading}
                        onClick={handleCheckIn}
                        className="w-full flex items-center justify-center gap-1.5 rounded-full
                        py-1.5 text-xs font-semibold text-white hover:opacity-90 disabled:opacity-40 
                        disabled:cursor-not-allowed transition"
                        style={{ background: "#1e3a5f" }}
                      >
                        <FiLogIn className="h-3.5 w-3.5" />
                        {t("attendance.checkIn")}
                      </button>
                    )}
                    {stats?.checkedInToday && !stats?.checkedOutToday && (
                      <button
                        type="button"
                        disabled={actionLoading}
                        onClick={() => setShowCheckOutModel(true)}
                        className="w-full flex items-center justify-center gap-1.5 rounded-full
                        py-1.5 text-xs font-semibold text-white hover:opacity-90 disabled:opacity-40 
                        disabled:cursor-not-allowed transition"
                        style={{ background: "#1e3a5f" }}
                      >
                        <FiLogOut className="h-3.5 w-3.5" />
                        {t("attendance.checkOut")}
                      </button>
                    )}
                    {stats?.checkedInToday && stats?.checkedOutToday && (
                      <p className="text-xs font-semibold text-green-600">
                        ✓ Completed
                      </p>
                    )}
                    {actionMsg && (
                      <p className="text-[10px] text-slate-500 mt-0.5">
                        {actionMsg}
                      </p>
                    )}
                  </div>
                </div>
              </article>
            </section>

            {/* Search bar */}
            <div className="relative w-full max-w-sm mb-4">
              <AnimatedSearchIcon />
              <input
                type="text"
                placeholder={t("attendance.searchDate")}
                value={employeeSearch}
                onChange={(e) => setEmployeeSearch(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-4 text-sm
                text-slate-700 shadow-sm placeholder-slate-400 focus:border-blue-400 focus:outline-none 
                focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <AttendanceHistoryTable
              records={
                employeeSearch
                  ? records.filter((r) => r.date.includes(employeeSearch))
                  : records
              }
              loading={loading}
              sortBy={sortBy}
              sortOrder={sortOrder}
              onSort={setSort}
            />
          </div>
        </main>
      </div>
    );
  }

  // =============== ADMIN / MANAGER VIEW ==================
  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <main className="flex-1 flex flex-col overflow-auto">
        <Header searchTerm="" onSearchChange={() => {}} />
        <div className="p-6">
          {/* Manager check-out modal */}
          {role === "manager" && (
            <CheckOutModel
              open={showCheckOutModel}
              onClose={() => setShowCheckOutModel(false)}
              onConfirm={handleCheckOut}
              role="manager"
            />
          )}

          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                {role === "admin"
                  ? t("attendance.allTitle")
                  : t("attendance.teamTitle")}
              </h1>
              <p className="text-sm text-slate-500">
                {role === "admin"
                  ? t("attendance.monitorAll")
                  : t("attendance.monitorTeam")}
              </p>
            </div>

            {/* Manager's own check-in / check-out */}
            {role === "manager" && (
              <div className="flex flex-col items-end gap-2">
                <div className="flex items-center gap-2">
                  {!stats?.checkedInToday && (
                    <button
                      type="button"
                      disabled={actionLoading}
                      onClick={handleCheckIn}
                      className="inline-flex items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all duration-200
                      hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
                      style={{ background: "#1e3a5f" }}
                    >
                      <FiLogIn className="h-4 w-4" /> Check In
                    </button>
                  )}
                  {stats?.checkedInToday && !stats?.checkedOutToday && (
                    <button
                      type="button"
                      disabled={actionLoading}
                      onClick={() => setShowCheckOutModel(true)}
                      className="inline-flex items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all duration-200
                      hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
                      style={{ background: "#1e3a5f" }}
                    >
                      <FiLogOut className="h-4 w-4" /> Check Out
                    </button>
                  )}
                  {stats?.checkedInToday && stats?.checkedOutToday && (
                    <p className="text-xs font-semibold text-green-600">
                      ✓ Attendance completed
                    </p>
                  )}
                </div>
                {actionMsg && (
                  <p className="text-xs font-medium text-blue-600">
                    {actionMsg}
                  </p>
                )}
              </div>
            )}
          </div>

          <section className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <StatCard
              label={
                role === "admin" ? "TOTAL STAFF" : t("attendance.teamMembers")
              }
              value={stats?.totalEmployees ?? 0}
              icon={<FiUsers className="h-5 w-5" />}
              color="bg-slate-100 text-slate-600"
              subtitle={t("attendance.totalStaff")}
              extra={
                (stats?.newThisMonth ?? 0) > 0
                  ? `+${stats!.newThisMonth} ${t("attendance.newThisMonth")}`
                  : undefined
              }
              featured
            />
            <StatCard
              label={t("attendance.presentToday")}
              value={stats?.presentToday ?? 0}
              icon={<FiCheckCircle className="h-5 w-5" />}
              color="bg-green-100 text-green-600"
              subtitle={t("attendance.checkedInToday")}
              extra={`${stats?.attendanceRate ?? 0}% attendance rate`}
              extraClassName="text-green-600"
            />
            <StatCard
              label={t("attendance.lateToday")}
              value={stats?.lateToday ?? 0}
              icon={<FiClock className="h-5 w-5" />}
              color="bg-amber-100 text-amber-600"
              subtitle={t("attendance.arrivedAfterTime")}
              extra={
                (stats?.lateToday ?? 0) > 0
                  ? stats?.avgLateArrival
                    ? `Avg arrival ${stats.avgLateArrival}`
                    : "Arrived after schedule"
                  : undefined
              }
              extraClassName="text-amber-600"
            />
            <StatCard
              label={t("attendance.absentToday")}
              value={stats?.absentToday ?? 0}
              icon={<FiXCircle className="h-5 w-5" />}
              color="bg-red-100 text-red-600"
              subtitle={t("attendance.notCheckedIn")}
              extra={`${stats?.onLeave ?? 0} on leave, ${stats?.absentToday ?? 0} no check-in`}
              extraClassName="text-slate-500"
            />
          </section>

          <AttendanceFilters
            search={search}
            statusFilter={statusFilter}
            dateFrom={dateFrom}
            dateTo={dateTo}
            onSearchChange={setSearch}
            onStatusChange={setStatusFilter}
            onDateFromChange={setDateFrom}
            onDateToChange={setDateTo}
            onClear={() => {
              setSearch("");
              setStatusFilter("all");
              setDateFrom("");
              setDateTo("");
            }}
          />

          <AdminAttendanceTable
            records={records}
            loading={loading}
            error={error}
            role={role}
            viewId={viewId}
            onView={openView}
            onCloseView={closeView}
            sortBy={sortBy}
            sortOrder={sortOrder}
            onSort={setSort}
          />
        </div>
      </main>
    </div>
  );
}
