import { useEffect, useState } from "react";
import axios from "axios";
import { useTranslation } from "react-i18next";
import Sidebar from "@/layouts/Sidebar";
import Header from "@/layouts/Header";
import { useUser } from "@/context/UserContext";
import {
  FiUsers,
  FiCheckCircle,
  FiClock,
  FiXCircle,
  FiLogIn,
  FiLogOut,
  FiSearch,
} from "react-icons/fi";

import { AttendanceRecord } from "./components/types";
import StatCard from "./components/StatCard";
import AttendanceHistoryTable from "./components/AttendanceHistoryTable";
import AttendanceFilters from "./components/AttendanceFilters";
import AdminAttendanceTable from "./components/AdminAttendanceTable";

export default function AttendancePage() {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [actionMsg, setActionMsg] = useState("");
  const [employeeSearch, setEmployeeSearch] = useState("");
  const [leavesToday, setLeavesToday] = useState(0);

  const { user } = useUser();
  const { t } = useTranslation();
  const role = user?.role ?? "";
  const token = localStorage.getItem("token") ?? "";
  const userName = user?.name ?? "Employee";

  const fetchRecords = () => {
    const endpoint =
      role === "admin"
        ? "/api/attendance/all"
        : role === "manager"
          ? "/api/attendance/team"
          : "/api/attendance/my";

    axios
      .get(endpoint, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setRecords(res.data))
      .catch(() => setError("Failed to load attendance data."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchRecords();
  }, [role, token]);

  useEffect(() => {
    if (role !== "admin" && role !== "manager") return;

    const todayStr = new Date().toISOString().split("T")[0];
    const leavesUrl =
      role === "admin" ? "/api/leaves/" : "/api/leaves/team-leaves";
    axios
      .get(leavesUrl, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        const count = (res.data as any[]).filter(
          (l) =>
            l.overallStatus === "approved" &&
            l.startDate <= todayStr &&
            l.endDate >= todayStr,
        ).length;
        setLeavesToday(count);
      })
      .catch(() => {});
  }, [role, token]);

  const today = new Date().toISOString().split("T")[0];

  const filtered = records.filter((r) => {
    const name = r.user?.name?.toLowerCase() ?? `user #${r.user_id}`;
    const matchSearch =
      name.includes(search.toLowerCase()) || r.date.includes(search);
    const matchStatus = statusFilter === "all" || r.status === statusFilter;
    const matchFrom = !dateFrom || r.date >= dateFrom;
    const matchTo = !dateTo || r.date <= dateTo;
    return matchSearch && matchStatus && matchFrom && matchTo;
  });

  const todayRecords = records.filter((r) => r.date === today);
  const totalEmployees = new Set(records.map((r) => r.user_id)).size;
  const presentToday = todayRecords.filter(
    (r) => r.status === "present",
  ).length;
  const lateToday = todayRecords.filter((r) => r.status === "late").length;
  const absentToday = todayRecords.filter((r) => r.status === "absent").length;

  // New employees this month vs last month
  const thisMonthStr = today.slice(0, 7);
  const prevMonthDate = new Date();
  prevMonthDate.setMonth(prevMonthDate.getMonth() - 1);
  const prevMonthStr = prevMonthDate.toISOString().slice(0, 7);
  const thisMonthUserIds = new Set(
    records
      .filter((r) => r.date.startsWith(thisMonthStr))
      .map((r) => r.user_id),
  );
  const prevMonthUserIds = new Set(
    records
      .filter((r) => r.date.startsWith(prevMonthStr))
      .map((r) => r.user_id),
  );
  const newThisMonth = [...thisMonthUserIds].filter(
    (id) => !prevMonthUserIds.has(id),
  ).length;

  // Attendance rate (present + late) / total employees
  const attendanceRate =
    totalEmployees > 0
      ? Math.round(((presentToday + lateToday) / totalEmployees) * 100)
      : 0;

  // Average check-in time for late arrivals today
  const lateRecordsToday = todayRecords.filter(
    (r) => r.status === "late" && r.check_in,
  );
  let avgLateText = "Arrived after schedule";
  if (lateRecordsToday.length > 0) {
    const totalMins = lateRecordsToday.reduce((sum, r) => {
      const parts = (r.check_in ?? "09:00").split(":");
      return sum + parseInt(parts[0]) * 60 + parseInt(parts[1]);
    }, 0);
    const avgMins = Math.round(totalMins / lateRecordsToday.length);
    const h = Math.floor(avgMins / 60);
    const m = avgMins % 60;
    const ampm = h >= 12 ? "PM" : "AM";
    const displayH = h > 12 ? h - 12 : h === 0 ? 12 : h;
    avgLateText = `Avg arrival ${displayH}:${m.toString().padStart(2, "0")} ${ampm}`;
  }

  // Absent breakdown
  const absentBreakdown = `${leavesToday} on leave, ${absentToday} no check-in`;

  const todayRecord = records.find((r) => r.date === today);
  const totalHoursThisMonth = records
    .filter((r) => r.date.startsWith(today.slice(0, 7)))
    .reduce((sum, r) => sum + (parseFloat(String(r.total_hours ?? 0)) || 0), 0);
  const presentDays = records.filter(
    (r) => r.status === "present" || r.status === "late",
  ).length;
  const absentDays = records.filter((r) => r.status === "absent").length;

  // Employee monthly rate
  const myMonthRecords = records.filter((r) =>
    r.date.startsWith(today.slice(0, 7)),
  );
  const myPresentThisMonth = myMonthRecords.filter(
    (r) => r.status === "present" || r.status === "late",
  ).length;
  const myAttendanceRate =
    myMonthRecords.length > 0
      ? Math.round((myPresentThisMonth / myMonthRecords.length) * 100)
      : 0;
  const myAbsentThisMonth = myMonthRecords.filter(
    (r) => r.status === "absent",
  ).length;

  //check in function
  const handleCheckIn = async () => {
    setActionLoading(true);
    setActionMsg("");
    try {
      await axios.post(
        "/api/attendance/check-in",
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setActionMsg(t("attendance.checkedIn"));
      fetchRecords();
    } catch (err: any) {
      setActionMsg(
        err.response?.data?.message ?? t("attendance.checkInFailed"),
      );
    } finally {
      setActionLoading(false);
    }
  };

  //check out function
  const handleCheckOut = async () => {
    setActionLoading(true);
    setActionMsg("");
    try {
      await axios.post(
        "/api/attendance/check-out",
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setActionMsg(t("attendance.checkedOut"));
      fetchRecords();
    } catch (err: any) {
      setActionMsg(
        err.response?.data?.message ?? t("attendance.checkOutFailed"),
      );
    } finally {
      setActionLoading(false);
    }
  };

  // =============== EMPLOYEE VIEW ==================
  if (role === "employee") {
    return (
      <div className="flex min-h-screen bg-slate-50">
        <Sidebar />
        <main className="flex-1 flex flex-col overflow-auto">
          <Header searchTerm="" onSearchChange={() => {}} />
          <div className="p-6">
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
                value={presentToday}
                icon={<FiCheckCircle className="h-5 w-5" />}
                color="bg-green-100 text-green-600"
                subtitle={t("attendance.myStatus")}
                extra={`${myAttendanceRate}% ${t("attendance.newThisMonth")}`}
                extraClassName="text-emerald-300"
                featured
              />
              <StatCard
                label={t("attendance.lateToday")}
                value={lateToday}
                icon={<FiClock className="h-5 w-5" />}
                color="bg-amber-100 text-amber-600"
                subtitle={t("attendance.arrivedAfterTime")}
                extra={lateToday > 0 ? avgLateText : undefined}
                extraClassName="text-amber-600"
              />
              <StatCard
                label={t("attendance.absentToday")}
                value={absentToday}
                icon={<FiXCircle className="h-5 w-5" />}
                color="bg-red-100 text-red-600"
                subtitle={t("attendance.notCheckedIn")}
                extra={`${myAbsentThisMonth} days absent this month`}
                extraClassName="text-slate-500"
              />

              {/* Check In / Check Out card */}
              <article className="relative overflow-hidden rounded-2xl border border-slate-100 bg-white p-5 shadow-sm flex flex-col justify-between gap-3">
                <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
                  {t("attendance.attendance")}
                </p>
                <div className="flex flex-col gap-2">
                  <button
                    type="button"
                    disabled={actionLoading || !!todayRecord?.check_in}
                    onClick={handleCheckIn}
                    className="inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:scale-[1.03] hover:shadow-md disabled:opacity-40 disabled:cursor-not-allowed"
                    style={{
                      background:
                        "linear-gradient(135deg, #059669 0%, #10b981 100%)",
                    }}
                  >
                    <FiLogIn className="h-4 w-4" />
                    {t("attendance.checkIn")}
                  </button>
                  <button
                    type="button"
                    disabled={
                      actionLoading ||
                      !todayRecord?.check_in ||
                      !!todayRecord?.check_out
                    }
                    onClick={handleCheckOut}
                    className="inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:scale-[1.03] hover:shadow-md disabled:opacity-40 disabled:cursor-not-allowed"
                    style={{
                      background:
                        "linear-gradient(135deg, #1e3a5f 0%, #2563eb 100%)",
                    }}
                  >
                    <FiLogOut className="h-4 w-4" />
                    {t("attendance.checkOut")}
                  </button>
                </div>
                {actionMsg && (
                  <p className="text-[11px] font-semibold text-blue-600">
                    {actionMsg}
                  </p>
                )}
              </article>
            </section>

            {/* Search bar */}
            <div className="relative w-full max-w-sm mb-4">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
              <input
                type="text"
                placeholder={t("attendance.searchDate")}
                value={employeeSearch}
                onChange={(e) => setEmployeeSearch(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-4 text-sm text-slate-700 shadow-sm placeholder-slate-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <AttendanceHistoryTable
              records={
                employeeSearch
                  ? records.filter((r) => r.date.includes(employeeSearch))
                  : records
              }
              loading={loading}
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
          </div>

          <section className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <StatCard
              label={
                role === "admin"
                  ? t("attendance.totalEmployees")
                  : t("attendance.teamMembers")
              }
              value={totalEmployees}
              icon={<FiUsers className="h-5 w-5" />}
              color="bg-slate-100 text-slate-600"
              subtitle={t("attendance.totalStaff")}
              extra={
                newThisMonth > 0
                  ? `+${newThisMonth} ${t("attendance.newThisMonth")}`
                  : undefined
              }
              featured
            />
            <StatCard
              label={t("attendance.presentToday")}
              value={presentToday}
              icon={<FiCheckCircle className="h-5 w-5" />}
              color="bg-green-100 text-green-600"
              subtitle={t("attendance.checkedInToday")}
              extra={`${attendanceRate}% attendance rate`}
              extraClassName="text-green-600"
            />
            <StatCard
              label={t("attendance.lateToday")}
              value={lateToday}
              icon={<FiClock className="h-5 w-5" />}
              color="bg-amber-100 text-amber-600"
              subtitle={t("attendance.arrivedAfterTime")}
              extra={lateToday > 0 ? avgLateText : undefined}
              extraClassName="text-amber-600"
            />
            <StatCard
              label={t("attendance.absentToday")}
              value={absentToday}
              icon={<FiXCircle className="h-5 w-5" />}
              color="bg-red-100 text-red-600"
              subtitle={t("attendance.notCheckedIn")}
              extra={absentBreakdown}
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
            records={filtered}
            loading={loading}
            error={error}
            role={role}
          />
        </div>
      </main>
    </div>
  );
}
