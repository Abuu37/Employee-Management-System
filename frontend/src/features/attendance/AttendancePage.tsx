import { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "@/layouts/Sidebar";
import Header from "@/layouts/Header";
import {
  FiUsers,
  FiCheckCircle,
  FiClock,
  FiXCircle,
  FiDownload,
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

  const role = localStorage.getItem("user-role") ?? "";
  const token = localStorage.getItem("token") ?? "";
  const userName = localStorage.getItem("user-name") ?? "Employee";

  const fetchRecords = () => {
    const endpoint = role === "admin" ? "/api/attendance/all"
        : role === "manager"
          ? "/api/attendance/team"
          : "/api/attendance/my";

    axios
      .get(endpoint, { 
        headers: { Authorization: `Bearer ${token}` } 
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
    axios
      .get("/api/leaves", { 
        headers: { Authorization: `Bearer ${token}` } 
      })
      .then((res) => {
        const count = (res.data as any[]).filter(
          (l) =>
            l.status === "approved" &&
            l.start_date <= todayStr &&
            l.end_date >= todayStr,
        ).length;
        setLeavesToday(count);
      })
      .catch(() => {});
  }, [role, token]);

  const today = new Date().toISOString().split("T")[0];

  const filtered = records.filter((r) => {
    const name = r.user?.name?.toLowerCase() ?? `user #${r.user_id}`;
    const matchSearch = name.includes(search.toLowerCase()) || r.date.includes(search);
    const matchStatus = statusFilter === "all" || r.status === statusFilter;
    const matchFrom = !dateFrom || r.date >= dateFrom;
    const matchTo = !dateTo || r.date <= dateTo;
    return matchSearch && matchStatus && matchFrom && matchTo;
  });

  //export csv file download function
  const handleExportCSV = () => {
    const headers = [
      "S/N",
      "Employee",
      "User ID",
      "Date",
      "Check In",
      "Check Out",
      "Hours",
      "Status",
    ];
    const rows = filtered.map((r, i) => [
      i + 1,
      r.user?.name ?? `User #${r.user_id}`,
      r.user_id,
      r.date,
      r.check_in ? r.check_in.slice(0, 5) : "—",
      r.check_out ? r.check_out.slice(0, 5) : "—",
      r.total_hours != null
        ? parseFloat(String(r.total_hours)).toFixed(1)
        : "0.0",
      r.status,
    ]);

    const csv = [headers, ...rows]
      .map((row) =>
        row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","),
      )
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `attendance_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

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
      setActionMsg("Checked in successfully!");
      fetchRecords();
    } catch (err: any) {
      setActionMsg(err.response?.data?.message ?? "Check-in failed.");
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
      setActionMsg("Checked out successfully!");
      fetchRecords();
    } catch (err: any) {
      setActionMsg(err.response?.data?.message ?? "Check-out failed.");
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
                My Attendance
              </h1>
              <p className="text-sm text-slate-500">
                Track your daily check-in and check-out
              </p>
            </div>

            <section className="mb-5 grid grid-cols-2 gap-4 sm:grid-cols-4">
              <StatCard
                label="Present Today"
                value={presentToday}
                icon={<FiCheckCircle className="h-5 w-5" />}
                color="bg-green-100 text-green-600"
                subtitle="Your status today"
                extra={`${myAttendanceRate}% this month`}
                extraClassName="text-emerald-300"
                featured
              />
              <StatCard
                label="Late Today"
                value={lateToday}
                icon={<FiClock className="h-5 w-5" />}
                color="bg-amber-100 text-amber-600"
                subtitle="Arrived after time"
                extra={lateToday > 0 ? avgLateText : undefined}
                extraClassName="text-amber-600"
              />
              <StatCard
                label="Absent Today"
                value={absentToday}
                icon={<FiXCircle className="h-5 w-5" />}
                color="bg-red-100 text-red-600"
                subtitle="Not checked in"
                extra={`${myAbsentThisMonth} days absent this month`}
                extraClassName="text-slate-500"
              />

              {/* Check In / Check Out card */}
              <article className="relative overflow-hidden rounded-2xl border border-slate-100 bg-white p-5 shadow-sm flex flex-col justify-between gap-3">
                <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
                  Attendance
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
                    Check In
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
                    Check Out
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
                placeholder="Search by date..."
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
                {role === "admin" ? "All Attendance" : "Team Attendance"}
              </h1>
              <p className="text-sm text-slate-500">
                {role === "admin"
                  ? "Monitor attendance across all employees"
                  : "Monitor your team members' attendance"}
              </p>
            </div>
            <button
              type="button"
              onClick={handleExportCSV}
              className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold
              text-white shadow-md transition-all duration-200 hover:shadow-lg hover:scale-[1.03] active:scale-95"
              style={{
                background: "linear-gradient(135deg, #1e3a5f 0%, #2563eb 100%)",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background =
                  "linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background =
                  "linear-gradient(135deg, #1e3a5f 0%, #2563eb 100%)")
              }
            >
              <FiDownload className="h-4 w-4" />
              Export CSV
            </button>
          </div>

          <section className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <StatCard
              label={role === "admin" ? "Total Employees" : "Team Members"}
              value={totalEmployees}
              icon={<FiUsers className="h-5 w-5" />}
              color="bg-slate-100 text-slate-600"
              subtitle="Total staff members"
              extra={
                newThisMonth > 0 ? `+${newThisMonth} this month` : undefined
              }
              featured
            />
            <StatCard
              label="Present Today"
              value={presentToday}
              icon={<FiCheckCircle className="h-5 w-5" />}
              color="bg-green-100 text-green-600"
              subtitle="Checked in today"
              extra={`${attendanceRate}% attendance rate`}
              extraClassName="text-green-600"
            />
            <StatCard
              label="Late Today"
              value={lateToday}
              icon={<FiClock className="h-5 w-5" />}
              color="bg-amber-100 text-amber-600"
              subtitle="Arrived after time"
              extra={lateToday > 0 ? avgLateText : undefined}
              extraClassName="text-amber-600"
            />
            <StatCard
              label="Absent Today"
              value={absentToday}
              icon={<FiXCircle className="h-5 w-5" />}
              color="bg-red-100 text-red-600"
              subtitle="Not checked in"
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
