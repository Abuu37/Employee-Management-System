import { useEffect, useState, useRef, type ReactNode } from "react";
import Lottie from "lottie-react";
import loadingIcon from "@/assets/icons/loading.json";
import searchIcon from "@/assets/icons/search.json";
import axios from "axios";
import { useTranslation } from "react-i18next";
import Sidebar from "@/layouts/Sidebar";
import Header from "@/layouts/Header";
import { useUser } from "@/context/UserContext";
import { getAccessToken } from "@/features/auth/services/authSession";
import CheckOutModel from "@/features/attendance/components/CheckOutModel";
import {
  FiUsers,
  FiUserCheck,
  FiFolder,
  FiFileText,
  FiFile,
  FiCheckCircle,
  FiClock,
  FiClipboard,
  FiLogIn,
  FiLogOut,
} from "react-icons/fi";
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Label,
} from "recharts";

// ─── Palette ──────────────────────────────────────────────────────────────────
const NAVY = "#1e3a5f";
const BLUE = "#2563eb";
const PIE_COLORS = ["#f59e0b", "#10b981", "#ef4444"]; // pending / approved / rejected

// ─── Types ────────────────────────────────────────────────────────────────────
type Summary = {
  totalEmployees: number;
  totalManagers: number;
  totalProjects: number;
  tasks: { pending: number; in_progress: number; completed: number };
  leaves: { pending: number };
};
type TaskTrendRow = { month: string; completed: number; pending: number };
type PayrollTrendRow = { month: string; totalNet: number; totalBase: number };
type DocRow = {
  id: number;
  fileName: string;
  fileType: string;
  visibility: string;
  isVerified: boolean;
  owner: string;
  uploader: string;
  uploadedAt: string;
};
type PieDatum = { name: string; value: number };
type RecentTask = {
  id: number;
  title: string;
  status: string;
  priority: string;
  assigner: string;
  deadline: string | null;
};

// ================== Custom Tooltip ======================
function ChartTip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl bg-white px-3 py-2.5 shadow-xl border border-slate-100 text-xs">
      {label && <p className="font-bold text-slate-700 mb-1">{label}</p>}
      {payload.map((p: any) => (
        <div key={p.name} className="flex items-center gap-2 mt-0.5">
          <span
            className="h-2 w-2 rounded-full"
            style={{ background: p.color }}
          />
          <span className="text-slate-400">{p.name}:</span>
          <span className="font-bold text-slate-800">{p.value}</span>
        </div>
      ))}
    </div>
  );
}

// ================ Mini Calendar =======================
function MiniCalendar() {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const todayNum = today.getDate();
  const monthName = today.toLocaleString("default", { month: "long" });
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const headers = ["S", "M", "T", "W", "T", "F", "S"];
  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <div
      className="rounded-2xl p-5 flex flex-col h-full"
      style={{ background: NAVY }}
    >
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-black text-white">
          {monthName} <span className="font-normal text-blue-300">{year}</span>
        </p>
        <div className="flex gap-2 text-blue-300 text-xs">
          <span className="cursor-pointer hover:text-white transition">◀</span>
          <span className="cursor-pointer hover:text-white transition">▶</span>
        </div>
      </div>
      <div className="grid grid-cols-7 mb-1">
        {headers.map((h, i) => (
          <div
            key={i}
            className="text-center text-[10px] font-bold text-blue-300 py-0.5"
          >
            {h}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-y-0.5 flex-1">
        {cells.map((d, i) => (
          <div
            key={i}
            className={`flex items-center justify-center text-[11px] h-7 rounded-full transition
              ${
                d === todayNum
                  ? "font-black text-white bg-blue-500 shadow-lg"
                  : d
                    ? "text-blue-100 hover:bg-white/10 cursor-pointer"
                    : ""
              }
            `}
          >
            {d ?? ""}
          </div>
        ))}
      </div>
    </div>
  );
}

// ================== Skeleton ======================
function Sk({ cls }: { cls: string }) {
  return <div className={`animate-pulse rounded-2xl bg-slate-200 ${cls}`} />;
}

type KpiIconTone = "blue" | "cyan" | "emerald" | "amber";

const KPI_ICON_TONE_CLASSES: Record<KpiIconTone, string> = {
  blue: "bg-blue-600 text-white ring-2 ring-blue-200 shadow-md shadow-blue-200/60",
  cyan: "bg-cyan-600 text-white ring-2 ring-cyan-200 shadow-md shadow-cyan-200/60",
  emerald:
    "bg-emerald-600 text-white ring-2 ring-emerald-200 shadow-md shadow-emerald-200/60",
  amber:
    "bg-amber-500 text-white ring-2 ring-amber-200 shadow-md shadow-amber-200/60",
};

function KpiIcon({
  icon,
  tone = "blue",
  inverted = false,
}: {
  icon: ReactNode;
  tone?: KpiIconTone;
  inverted?: boolean;
}) {
  return (
    <span
      className={`flex h-11 w-11 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-105 ${
        inverted
          ? "bg-white/20 text-white ring-2 ring-white/35 shadow-md shadow-black/15"
          : KPI_ICON_TONE_CLASSES[tone]
      }`}
    >
      {icon}
    </span>
  );
}

const KPI_CARD_BASE =
  "group relative overflow-hidden rounded-2xl p-5 transition-all duration-300 hover:-translate-y-0.5";
const KPI_CARD_LIGHT = `${KPI_CARD_BASE} bg-white shadow-none border border-slate-200 hover:shadow-xl`;
const KPI_CARD_DARK = `${KPI_CARD_BASE} text-white shadow-none hover:shadow-xl`;

function KpiAccent({ tone }: { tone: "blue" | "cyan" | "emerald" | "amber" }) {
  const toneClass =
    tone === "cyan"
      ? "bg-cyan-300/80"
      : tone === "emerald"
        ? "bg-emerald-300/80"
        : tone === "amber"
          ? "bg-amber-300/80"
          : "bg-blue-300/80";

  return (
    <>
      <span
        className={`pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full blur-2xl ${toneClass}`}
      />
    </>
  );
}

function KpiAccentDark() {
  return (
    <>
      <span className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-white/30 blur-2xl" />
    </>
  );
}

// ================== Dashboard ======================
export default function Dashboard() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [taskTrend, setTaskTrend] = useState<TaskTrendRow[]>([]);
  const [payrollTrend, setPayrollTrend] = useState<PayrollTrendRow[]>([]);
  const [leaveDist, setLeaveDist] = useState<PieDatum[]>([]);
  const [recentDocs, setRecentDocs] = useState<DocRow[]>([]);
  const [loading, setLoading] = useState(true);
  const isRetrying = useRef(false);
  const [hasError, setHasError] = useState(false);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  const { user } = useUser();
  const { t } = useTranslation();
  const token = getAccessToken() ?? "";
  const userName = user?.name ?? "User";
  const userRole = user?.role ?? "";
  const isManager = userRole === "manager";
  const isEmployee = userRole === "employee";

  // ================== Today's attendance (manager + employee check-in/out card) ======================
  const [todayRecord, setTodayRecord] = useState<{
    check_in?: string;
    check_out?: string;
  } | null>(null);
  const [attendanceLoading, setAttendanceLoading] = useState(false);
  const [attendanceMsg, setAttendanceMsg] = useState("");
  const [showCheckOutModal, setShowCheckOutModal] = useState(false);

  const fetchTodayAttendance = () => {
    if (!isManager && !isEmployee) return;
    axios
      .get("/api/attendance/my", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((r) => {
        const today = new Date().toISOString().split("T")[0];
        const rec =
          (r.data as any[]).find((x: any) => x.date === today) ?? null;
        setTodayRecord(rec);
      })
      .catch(() => {});
  };

  const handleCheckIn = async () => {
    setAttendanceLoading(true);
    setAttendanceMsg("");
    try {
      await axios.post(
        "/api/attendance/check-in",
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setAttendanceMsg(t("dashboard.checkedIn"));
      fetchTodayAttendance();
    } catch (e: any) {
      setAttendanceMsg(
        e.response?.data?.message ?? t("dashboard.checkInFailed"),
      );
    } finally {
      setAttendanceLoading(false);
    }
  };

  const handleCheckOut = async (
    completedTaskIds: number[],
    summary: string,
    notes: string,
  ) => {
    setAttendanceLoading(true);
    setAttendanceMsg("");
    try {
      await axios.post(
        "/api/attendance/check-out",
        { work_summary: summary, notes, completed_task_ids: completedTaskIds },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setShowCheckOutModal(false);
      setAttendanceMsg(t("dashboard.checkedOut"));
      fetchTodayAttendance();
    } catch (e: any) {
      setAttendanceMsg(
        e.response?.data?.message ?? t("dashboard.checkOutFailed"),
      );
    } finally {
      setAttendanceLoading(false);
    }
  };

  useEffect(() => {
    const goOnline = () => setIsOffline(false);
    const goOffline = () => setIsOffline(true);
    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);
    return () => {
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
    };
  }, []);

  useEffect(() => {
    fetchTodayAttendance();
  }, [isManager, isEmployee, token]);

  useEffect(() => {
    axios
      .get("/api/dashboard/summary", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((r) => {
        setSummary(r.data.summary);
        setTaskTrend(r.data.taskTrend);
        setPayrollTrend(r.data.payrollTrend ?? []);
        setLeaveDist(r.data.leaveDistribution);
        setRecentDocs(r.data.recentDocuments ?? []);
      })
      .catch(() => {
        setHasError(true);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [token]);

  const totalLeaves = leaveDist.reduce((s, d) => s + d.value, 0);
  const pendingPct =
    totalLeaves > 0
      ? Math.round(
          ((leaveDist.find((d) => d.name === "Pending")?.value ?? 0) /
            totalLeaves) *
            100,
        )
      : 0;

  const donutData = leaveDist.some((d) => d.value > 0)
    ? leaveDist
    : [{ name: "No data", value: 1 }];

  if (loading && !isRetrying.current) {
    return (
      <div className="flex min-h-screen bg-[#f0f2f7] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Lottie
            animationData={loadingIcon}
            loop={true}
            autoplay={true}
            style={{ width: 140, height: 140 }}
          />
          <p className="text-slate-500 text-sm font-medium tracking-wide animate-pulse">
            Loading...
          </p>
        </div>
      </div>
    );
  }

  if (isOffline) {
    return (
      <div className="flex min-h-screen bg-[#f0f2f7] items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-center">
          <Lottie
            animationData={searchIcon}
            loop={true}
            autoplay={true}
            style={{ width: 150, height: 150 }}
          />
          <p className="text-xl font-bold text-slate-700">
            No Internet Connection
          </p>
          <p className="text-sm text-slate-400 max-w-xs">
            It looks like you're offline. Please check your network and try
            again.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-2 px-5 py-2 rounded-full text-sm font-semibold text-white shadow"
            style={{ background: "#1e3a5f" }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (hasError && !loading) {
    return (
      <div className="flex min-h-screen bg-[#f0f2f7] items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-center">
          <Lottie
            animationData={searchIcon}
            loop={true}
            autoplay={true}
            style={{ width: 150, height: 150 }}
          />
          <p className="text-xl font-bold text-slate-700">Connection Failed</p>
          <p className="text-sm text-slate-400 max-w-xs">
            Unable to reach the server. Please check your connection or try
            again later.
          </p>
          <button
            onClick={() => {
              setHasError(false);
              isRetrying.current = true;
              setLoading(true);
              axios
                .get("/api/dashboard/summary", {
                  headers: { Authorization: `Bearer ${token}` },
                })
                .then((r) => {
                  setSummary(r.data.summary);
                  setTaskTrend(r.data.taskTrend);
                  setPayrollTrend(r.data.payrollTrend ?? []);
                  setLeaveDist(r.data.leaveDistribution);
                  setRecentDocs(r.data.recentDocuments ?? []);
                })
                .catch(() => setHasError(true))
                .finally(() => {
                  isRetrying.current = false;
                  setLoading(false);
                });
            }}
            className="mt-2 px-5 py-2 rounded-full text-sm font-semibold text-white shadow"
            style={{ background: "#1e3a5f" }}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#f0f2f7]">
      <Sidebar />

      <main className="flex-1 flex flex-col overflow-auto">
        <Header searchTerm="" onSearchChange={() => {}} />

        <div className="p-6 space-y-5">
          {/* ================== KPI Cards ====================== */}
          {loading ? (
            <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Sk key={i} cls="h-28" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
              {/* Card 1 — navy */}
              <div className={KPI_CARD_DARK} style={{ background: NAVY }}>
                <KpiAccentDark />
                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-3">
                    <p className="text-xs font-semibold text-blue-100 uppercase tracking-wider">
                      {isEmployee
                        ? t("dashboard.myTasks")
                        : isManager
                          ? t("dashboard.totalTeamMembers")
                          : t("dashboard.totalEmployees")}
                    </p>
                    <KpiIcon
                      inverted
                      icon={
                        isEmployee ? (
                          <FiClipboard className="h-4 w-4" />
                        ) : (
                          <FiUsers className="h-4 w-4" />
                        )
                      }
                    />
                  </div>
                  <p className="text-4xl font-black leading-none tabular-nums">
                    {isEmployee
                      ? (summary?.tasks.pending ?? 0) +
                        (summary?.tasks.in_progress ?? 0) +
                        (summary?.tasks.completed ?? 0)
                      : (summary?.totalEmployees ?? 0)}
                  </p>
                  <p className="text-xs text-blue-200 mt-2">
                    {isEmployee
                      ? t("dashboard.tasksAssigned")
                      : isManager
                        ? t("dashboard.teamMembers")
                        : t("dashboard.companyStaff")}
                  </p>
                </div>
              </div>

              {/*====================== Card 2 =====================*/}
              {isEmployee ? (
                <div className={KPI_CARD_LIGHT}>
                  <KpiAccent tone="blue" />
                  <div className="relative z-10">
                    <div className="flex items-start justify-between mb-3">
                      <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                        {t("dashboard.myProjects")}
                      </p>
                      <KpiIcon
                        icon={<FiFolder className="h-4 w-4" />}
                        tone="blue"
                      />
                    </div>
                    <p className="text-4xl font-black text-slate-800 leading-none tabular-nums">
                      {summary?.totalProjects ?? 0}
                    </p>
                    <p className="text-xs text-slate-500 mt-2">
                      {t("dashboard.yourProjects")}
                    </p>
                  </div>
                </div>
              ) : isManager ? (
                <div className={KPI_CARD_LIGHT}>
                  <KpiAccent tone="blue" />
                  <div className="relative z-10">
                    <div className="flex items-start justify-between mb-3">
                      <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                        {t("dashboard.totalProjects")}
                      </p>
                      <KpiIcon
                        icon={<FiFolder className="h-4 w-4" />}
                        tone="blue"
                      />
                    </div>
                    <p className="text-4xl font-black text-slate-800 leading-none tabular-nums">
                      {summary?.totalProjects ?? 0}
                    </p>
                    <p className="text-xs text-slate-500 mt-2">
                      {t("dashboard.yourProjects")}
                    </p>
                  </div>
                </div>
              ) : (
                <div className={KPI_CARD_LIGHT}>
                  <KpiAccent tone="emerald" />
                  <div className="relative z-10">
                    <div className="flex items-start justify-between mb-3">
                      <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                        {t("dashboard.totalManagers")}
                      </p>
                      <KpiIcon
                        icon={<FiUserCheck className="h-4 w-4" />}
                        tone="emerald"
                      />
                    </div>
                    <p className="text-4xl font-black text-slate-800 leading-none tabular-nums">
                      {summary?.totalManagers ?? 0}
                    </p>
                    <p className="text-xs text-slate-500 mt-2">
                      {t("dashboard.companyManagers")}
                    </p>
                  </div>
                </div>
              )}

              {/* Card 3 */}
              {isEmployee ? (
                <div className={KPI_CARD_LIGHT}>
                  <KpiAccent tone="amber" />
                  <div className="relative z-10">
                    <div className="flex items-start justify-between mb-3">
                      <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                        {t("dashboard.myLeaves")}
                      </p>
                      <KpiIcon
                        icon={<FiClock className="h-4 w-4" />}
                        tone="amber"
                      />
                    </div>
                    <p className="text-4xl font-black text-slate-800 leading-none tabular-nums">
                      {totalLeaves}
                    </p>
                    <p className="text-xs text-slate-500 mt-2">
                      {t("dashboard.totalLeaveRequests")}
                    </p>
                  </div>
                </div>
              ) : isManager ? (
                <div className={KPI_CARD_LIGHT}>
                  <KpiAccent tone="cyan" />
                  <div className="relative z-10">
                    <div className="flex items-start justify-between mb-3">
                      <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                        {t("dashboard.totalTasks")}
                      </p>
                      <KpiIcon
                        icon={<FiClipboard className="h-4 w-4" />}
                        tone="cyan"
                      />
                    </div>
                    <p className="text-4xl font-black text-slate-800 leading-none tabular-nums">
                      {(summary?.tasks.pending ?? 0) +
                        (summary?.tasks.in_progress ?? 0) +
                        (summary?.tasks.completed ?? 0)}
                    </p>
                    <p className="text-xs text-slate-500 mt-2">
                      {t("dashboard.teamTasks")}
                    </p>
                  </div>
                </div>
              ) : (
                <div className={KPI_CARD_LIGHT}>
                  <KpiAccent tone="blue" />
                  <div className="relative z-10">
                    <div className="flex items-start justify-between mb-3">
                      <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                        {t("dashboard.totalProjects")}
                      </p>
                      <KpiIcon
                        icon={<FiFolder className="h-4 w-4" />}
                        tone="blue"
                      />
                    </div>
                    <p className="text-4xl font-black text-slate-800 leading-none tabular-nums">
                      {summary?.totalProjects ?? 0}
                    </p>
                    <p className="text-xs text-slate-500 mt-2">
                      {t("dashboard.allProjects")}
                    </p>
                  </div>
                </div>
              )}

              {/*==================== Card 4 — Attendance (manager+employee) / Tasks (admin)================ */}
              {isEmployee || isManager ? (
                <div
                  className={`${KPI_CARD_LIGHT} flex flex-col justify-between`}
                >
                  <KpiAccent tone="cyan" />
                  <div className="relative z-10">
                    <div className="flex items-start justify-between mb-2">
                      <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                        {t("dashboard.myAttendance")}
                      </p>
                      <KpiIcon
                        tone="cyan"
                        icon={
                          todayRecord?.check_in ? (
                            <FiLogOut className="h-4 w-4" />
                          ) : (
                            <FiLogIn className="h-4 w-4" />
                          )
                        }
                      />
                    </div>
                    <div className="flex flex-col gap-1.5 mb-2">
                      <p className="text-[11px] text-slate-500">
                        {t("dashboard.checkInLabel")}:{" "}
                        <span className="font-bold text-slate-700">
                          {todayRecord?.check_in
                            ? todayRecord.check_in.slice(0, 5)
                            : "—"}
                        </span>
                      </p>
                      <p className="text-[11px] text-slate-500">
                        {t("dashboard.checkOutLabel")}:{" "}
                        <span className="font-bold text-slate-700">
                          {todayRecord?.check_out
                            ? todayRecord.check_out.slice(0, 5)
                            : "—"}
                        </span>
                      </p>
                    </div>

                    <div className="flex gap-2">
                      {!todayRecord?.check_in && (
                        <button
                          disabled={attendanceLoading}
                          onClick={handleCheckIn}
                          className="flex-1 flex items-center justify-center gap-2 rounded-full py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50 transition"
                          style={{ background: NAVY }}
                        >
                          <FiLogIn className="h-4 w-4" />{" "}
                          {t("dashboard.checkIn")}
                        </button>
                      )}

                      {todayRecord?.check_in && !todayRecord?.check_out && (
                        <button
                          disabled={attendanceLoading}
                          onClick={() => setShowCheckOutModal(true)}
                          className="flex-1 flex items-center justify-center gap-2 rounded-full py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50 transition"
                          style={{ background: NAVY }}
                        >
                          <FiLogOut className="h-4 w-4" />{" "}
                          {t("dashboard.checkOut")}
                        </button>
                      )}

                      {todayRecord?.check_in && todayRecord?.check_out && (
                        <p className="text-xs font-semibold text-green-600 text-center w-full">
                          ✓ Attendance completed for today
                        </p>
                      )}
                    </div>

                    {attendanceMsg && (
                      <p className="text-[10px] text-center mt-1 text-slate-500">
                        {attendanceMsg}
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <div className={KPI_CARD_LIGHT}>
                  <KpiAccent tone="cyan" />
                  <div className="relative z-10">
                    <div className="flex items-start justify-between mb-3">
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                        {t("dashboard.totalTasks")}
                      </p>
                      <KpiIcon
                        icon={<FiClipboard className="h-4 w-4" />}
                        tone="cyan"
                      />
                    </div>
                    <p className="text-4xl font-black text-slate-800 leading-none tabular-nums">
                      {(summary?.tasks.pending ?? 0) +
                        (summary?.tasks.in_progress ?? 0) +
                        (summary?.tasks.completed ?? 0)}
                    </p>
                    <p className="text-xs text-slate-500 mt-2">
                      {t("dashboard.allTasks")}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ================== Row 2: Grouped Bar + Donut ====================== */}
          {loading ? (
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
              <Sk cls="h-80 xl:col-span-2" />
              <Sk cls="h-80" />
            </div>
          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
              {/* Payroll smooth area chart */}
              <div className="xl:col-span-2 rounded-2xl bg-white shadow-sm border border-slate-100 p-5">
                <div className="flex items-start justify-between mb-5">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
                      {t("dashboard.monthlyOverview")}
                    </p>
                    <p
                      className="text-lg font-black mt-0.5"
                      style={{ color: NAVY }}
                    >
                      {t("dashboard.result")}
                    </p>
                  </div>
                  <button
                    className="rounded-lg px-4 py-1.5 text-xs font-bold text-white shadow-sm hover:opacity-90 transition"
                    style={{ background: BLUE }}
                  >
                    {t("dashboard.checkNow")}
                  </button>
                </div>
                <ResponsiveContainer width="100%" height={230}>
                  <LineChart
                    data={payrollTrend}
                    margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
                  >
                    <CartesianGrid
                      stroke="#f1f5f9"
                      strokeDasharray="0"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="month"
                      tick={{ fontSize: 11, fill: "#94a3b8" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis hide />
                    <Tooltip
                      content={<ChartTip />}
                      formatter={(v: number) => [
                        `$${v.toLocaleString()}`,
                        undefined,
                      ]}
                    />
                    <Line
                      type="basis"
                      dataKey="totalBase"
                      name={t("dashboard.totalBaseSalary")}
                      stroke="#facc15"
                      strokeWidth={2.5}
                      dot={false}
                      activeDot={{ r: 5, fill: "#facc15" }}
                      connectNulls
                    />
                    <Line
                      type="basis"
                      dataKey="totalNet"
                      name={t("dashboard.totalNetSalary")}
                      stroke="#e879f9"
                      strokeWidth={2.5}
                      dot={false}
                      activeDot={{ r: 5, fill: "#e879f9" }}
                      connectNulls
                    />
                  </LineChart>
                </ResponsiveContainer>
                <div className="flex items-center gap-5 mt-3 ml-1">
                  <span className="flex items-center gap-1.5 text-xs text-slate-500">
                    <span className="h-2.5 w-2.5 rounded-full inline-block bg-yellow-300" />
                    {t("dashboard.totalBaseSalary")}
                  </span>
                  <span className="flex items-center gap-1.5 text-xs text-slate-500">
                    <span className="h-2.5 w-2.5 rounded-full inline-block bg-fuchsia-400" />
                    {t("dashboard.totalNetSalary")}
                  </span>
                </div>
              </div>

              {/* Donut — Leave distribution */}
              <div
                className="rounded-2xl p-5 flex flex-col shadow-xl"
                style={{ background: NAVY }}
              >
                <p className="text-[11px] font-bold uppercase tracking-widest text-blue-300 mb-1">
                  {t("dashboard.leaveStatus")}
                </p>
                <p className="text-lg font-black mb-2 text-white">
                  {t("dashboard.distribution")}
                </p>
                <div className="flex items-center justify-center flex-1">
                  <ResponsiveContainer width="100%" height={160}>
                    <PieChart>
                      <Pie
                        data={donutData}
                        cx="50%"
                        cy="50%"
                        innerRadius={48}
                        outerRadius={70}
                        paddingAngle={3}
                        dataKey="value"
                        stroke="none"
                      >
                        {donutData.map((_, i) => (
                          <Cell
                            key={i}
                            fill={PIE_COLORS[i % PIE_COLORS.length]}
                          />
                        ))}
                        <Label
                          content={({ viewBox }: any) => {
                            const { cx, cy } = viewBox as {
                              cx: number;
                              cy: number;
                            };
                            return (
                              <text
                                x={cx}
                                y={cy}
                                textAnchor="middle"
                                dominantBaseline="central"
                              >
                                <tspan
                                  fill="#ffffff"
                                  fontSize={20}
                                  fontWeight="800"
                                >
                                  {totalLeaves}
                                </tspan>
                                <tspan
                                  x={cx}
                                  dy={16}
                                  fill="#93c5fd"
                                  fontSize={10}
                                >
                                  {t("dashboard.totalLeave")}
                                </tspan>
                              </text>
                            );
                          }}
                        />
                      </Pie>
                      <Tooltip content={<ChartTip />} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-2 mt-1">
                  {leaveDist.map((d, i) => (
                    <div key={d.name} className="flex items-center gap-2">
                      <span
                        className="h-2 w-2 rounded-full shrink-0"
                        style={{
                          background: PIE_COLORS[i % PIE_COLORS.length],
                        }}
                      />
                      <span className="text-xs text-blue-200 flex-1">
                        {d.name}
                      </span>
                      <span className="text-xs font-bold text-white">
                        {d.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── Row 3: Recent Documents Table + Calendar ─────────────────── */}
          {loading ? (
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
              <Sk cls="h-72 xl:col-span-2" />
              <Sk cls="h-72" />
            </div>
          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
              {/* Recent documents table */}
              <div className="xl:col-span-2 rounded-2xl bg-white shadow-sm border border-slate-100 overflow-hidden">
                {/* Card header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
                      {t("dashboard.lastUploaded")}
                    </p>
                    <p
                      className="text-lg font-black mt-0.5"
                      style={{ color: NAVY }}
                    >
                      {t("dashboard.recentDocuments")}
                    </p>
                  </div>
                  <span className="flex items-center justify-center w-9 h-9 rounded-xl bg-blue-50">
                    <FiFileText size={18} className="text-blue-500" />
                  </span>
                </div>

                {recentDocs.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-14 text-slate-300">
                    <FiFile size={36} />
                    <p className="mt-3 text-sm font-medium">
                      {t("dashboard.noDocuments")}
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-slate-50">
                          {[
                            t("dashboard.file"),
                            t("dashboard.type"),
                            t("dashboard.owner"),
                            t("dashboard.uploadedBy"),
                            t("common.status"),
                          ].map((h) => (
                            <th
                              key={h}
                              className="px-5 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-slate-400"
                            >
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {recentDocs.map((d, i) => {
                          const TYPE_COLORS: Record<string, string> = {
                            contract: "bg-violet-50 text-violet-700",
                            id: "bg-sky-50    text-sky-700",
                            cv: "bg-blue-50   text-blue-700",
                            certificate: "bg-teal-50   text-teal-700",
                            performance_report: "bg-orange-50 text-orange-700",
                            evaluation: "bg-pink-50   text-pink-700",
                          };
                          const typeCls =
                            TYPE_COLORS[d.fileType] ??
                            "bg-slate-100 text-slate-600";
                          return (
                            <tr
                              key={d.id}
                              className={`border-b border-slate-50 transition-colors hover:bg-blue-50/30 ${
                                i % 2 === 0 ? "bg-white" : "bg-slate-50/50"
                              }`}
                            >
                              {/* File name with icon */}
                              <td className="px-5 py-3.5">
                                <div className="flex items-center gap-2.5">
                                  <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-50 shrink-0">
                                    <FiFileText
                                      size={15}
                                      className="text-blue-500"
                                    />
                                  </span>
                                  <span
                                    className="font-semibold text-slate-700 max-w-36 truncate"
                                    title={d.fileName}
                                  >
                                    {d.fileName}
                                  </span>
                                </div>
                              </td>
                              {/* Type badge */}
                              <td className="px-5 py-3.5">
                                <span
                                  className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold capitalize ${typeCls}`}
                                >
                                  {d.fileType.replace(/_/g, " ")}
                                </span>
                              </td>
                              <td className="px-5 py-3.5 text-slate-700 font-medium">
                                {d.owner}
                              </td>
                              <td className="px-5 py-3.5 text-slate-500">
                                {d.uploader}
                              </td>
                              {/* Verified badge */}
                              <td className="px-5 py-3.5">
                                <span
                                  className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                                    d.isVerified
                                      ? "bg-emerald-50 text-emerald-700"
                                      : "bg-amber-50   text-amber-700"
                                  }`}
                                >
                                  {d.isVerified ? (
                                    <>
                                      <FiCheckCircle size={11} />{" "}
                                      {t("dashboard.verified")}
                                    </>
                                  ) : (
                                    <>
                                      <FiClock size={11} />{" "}
                                      {t("dashboard.pending")}
                                    </>
                                  )}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Mini calendar */}
              <MiniCalendar />
            </div>
          )}
        </div>
      </main>

      <CheckOutModel
        open={showCheckOutModal}
        onClose={() => setShowCheckOutModal(false)}
        onConfirm={handleCheckOut}
        token={token}
        role={userRole as "employee" | "manager"}
      />
    </div>
  );
}
