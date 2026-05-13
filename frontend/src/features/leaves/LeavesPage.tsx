import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import {
  FiXCircle,
  FiCalendar,
  FiCheckCircle,
  FiClock,
  FiSlash,
  FiPlus,
} from "react-icons/fi";
import { AnimatedSearchIcon } from "@/components/common/AnimatedSearchIcon";
import axios from "axios";
import StatCard from "@/features/attendance/components/StatCard";
import Header from "@/layouts/Header";
import Sidebar from "@/layouts/Sidebar";
import LeavesTable from "@/features/leaves/components/LeavesTable";
import AllLeavesTable from "@/features/leaves/components/AllLeavesTable";
import AddLeaveModal from "@/features/leaves/components/AddLeaveModal";
import LeaveBalanceCards from "@/features/leaves/components/LeaveBalanceCards";
import useLeaveBalance from "@/features/leaves/hooks/useLeaveBalance";
import { useUser } from "@/context/UserContext";

interface Leave {
  id: number;
  type: string;
  startDate: string;
  endDate: string;
  days: number;
  reason: string;
  overallStatus: string;
  managerStatus?: string;
  managerComment?: string;
  managerApprovedAt?: string;
  hrStatus?: string;
  hrComment?: string;
  hrApprovedAt?: string;
  employeeName?: string;
  backupEmployeeId?: number;
  backupEmployeeName?: string;
  handoverNote?: string;
  userRole?: string;
  department_id?: number;
}

interface Colleague {
  id: number;
  name: string;
}

const authHeader = () => ({
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

const Leaves: React.FC = () => {
  const { user } = useUser();
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState("");
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  // Admin tabs: "hr_pending" | "all" | "manager"
  const [adminTab, setAdminTab] = useState<"hr_pending" | "manager">(
    "hr_pending",
  );
  // Manager tabs: "team" | "my"
  const [managerTab, setManagerTab] = useState<"team" | "my">("team");
  const [colleagues, setColleagues] = useState<Colleague[]>([]);

  const {
    balance,
    loading: balanceLoading,
    error: balanceError,
  } = useLeaveBalance();

  const isAdmin = user?.role === "admin";
  const isManager = user?.role === "manager";

  const fetchLeaves = async () => {
    setLoading(true);
    setError("");
    try {
      let url = "/api/leaves/my-leaves";

      if (isManager) {
        url =
          managerTab === "team"
            ? "/api/leaves/team-leaves"
            : "/api/leaves/my-leaves";
      }

      if (isAdmin) {
        if (adminTab === "hr_pending") url = "/api/leaves/hr-pending";
        else if (adminTab === "manager") url = "/api/leaves/manager-leaves";
      }

      const res = await axios.get(url, { headers: authHeader() });
      setLeaves(Array.isArray(res.data) ? res.data : (res.data.leaves ?? []));
    } catch (err: any) {
      setError(err.response?.data?.message ?? "Failed to fetch leaves");
    }
    setLoading(false);
  };

  // Fetch colleagues for backup employee selector
  const fetchColleagues = async () => {
    try {
      const res = await axios.get("/api/user/view-users", {
        headers: authHeader(),
      });
      const all: Colleague[] = Array.isArray(res.data)
        ? res.data
        : (res.data.users ?? []);
      // Exclude self
      setColleagues(all.filter((u: any) => u.id !== user?.id));
    } catch {
      // non-critical, ignore
    }
  };

  useEffect(() => {
    fetchLeaves();
    // eslint-disable-next-line
  }, [user, adminTab, managerTab]);

  useEffect(() => {
    if (user) fetchColleagues();
    // eslint-disable-next-line
  }, [user]);

  // ---- Employee applies ----
  const handleApply = async (form: {
    type: string;
    startDate: string;
    endDate: string;
    reason: string;
    backupEmployeeId: string;
    handoverNote: string;
  }) => {
    setIsSaving(true);
    setError("");
    try {
      await axios.post("/api/leaves/apply", form, { headers: authHeader() });
      toast.success("Leave request submitted successfully");
      fetchLeaves();
      setShowModal(false);
    } catch (err: any) {
      toast.error(err.response?.data?.message ?? "Failed to apply for leave");
      setError(err.response?.data?.message ?? "Failed to apply for leave");
    }
    setIsSaving(false);
  };

  // ---- Employee cancels own pending leave ----
  const handleCancel = async (leave: Leave) => {
    setError("");
    try {
      await axios.delete(`/api/leaves/cancel/${leave.id}`, {
        headers: authHeader(),
      });
      toast.success("Leave request cancelled");
      fetchLeaves();
    } catch (err: any) {
      toast.error(err.response?.data?.message ?? "Failed to cancel leave");
      setError(err.response?.data?.message ?? "Failed to cancel leave");
    }
  };

  // ---- Manager stage-1 approve ----
  const handleManagerApprove = async (leave: Leave) => {
    setError("");
    try {
      await axios.post(
        `/api/leaves/manager-approve/${leave.id}`,
        {},
        { headers: authHeader() },
      );
      toast.success("Leave approved and sent to HR");
      fetchLeaves();
    } catch (err: any) {
      toast.error(err.response?.data?.message ?? "Failed to approve leave");
      setError(err.response?.data?.message ?? "Failed to approve leave");
    }
  };

  // ---- Manager stage-1 reject (requires comment) ----
  const handleManagerReject = async (leave: Leave, comment: string) => {
    setError("");
    try {
      await axios.post(
        `/api/leaves/manager-reject/${leave.id}`,
        { comment },
        { headers: authHeader() },
      );
      toast.success("Leave request rejected");
      fetchLeaves();
    } catch (err: any) {
      toast.error(err.response?.data?.message ?? "Failed to reject leave");
      setError(err.response?.data?.message ?? "Failed to reject leave");
    }
  };

  // ---- HR / Admin stage-2 approve ----
  const handleHrApprove = async (leave: Leave) => {
    setError("");
    try {
      await axios.post(
        `/api/leaves/hr-approve/${leave.id}`,
        {},
        { headers: authHeader() },
      );
      toast.success("Leave approved successfully");
      fetchLeaves();
    } catch (err: any) {
      toast.error(err.response?.data?.message ?? "Failed to approve leave");
      setError(err.response?.data?.message ?? "Failed to approve leave");
    }
  };

  // ---- HR / Admin stage-2 reject ----
  const handleHrReject = async (leave: Leave, comment: string) => {
    setError("");
    try {
      await axios.post(
        `/api/leaves/hr-reject/${leave.id}`,
        { comment },
        { headers: authHeader() },
      );
      toast.success("Leave request rejected");
      fetchLeaves();
    } catch (err: any) {
      toast.error(err.response?.data?.message ?? "Failed to reject leave");
      setError(err.response?.data?.message ?? "Failed to reject leave");
    }
  };

  const filteredLeaves = leaves.filter((leave) =>
    [leave.type, leave.reason, leave.overallStatus, leave.employeeName]
      .join(" ")
      .toLowerCase()
      .includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <main className="flex-1 flex flex-col overflow-auto">
        <Header searchTerm="" onSearchChange={() => {}} />

        <div className="p-6 space-y-5">
          {/* Page header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                {t("leaves.title")}
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                {t("leaves.allLeaveRequests")}
              </p>
            </div>
            {!isAdmin && (
              <button
                type="button"
                onClick={() => setShowModal(true)}
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
              >
                <FiPlus className="h-4 w-4" />
                {t("leaves.applyLeave")}
              </button>
            )}
          </div>

          {/* Stat cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              label={t("leaves.totalLeaves")}
              value={leaves.length}
              icon={<FiCalendar />}
              color=""
              featured
              subtitle={t("leaves.allLeaveRequests")}
            />
            <StatCard
              label={t("leaves.approved")}
              value={
                leaves.filter((l) => l.overallStatus === "approved").length
              }
              icon={<FiCheckCircle />}
              color="bg-emerald-100 text-emerald-600"
              subtitle={t("leaves.leavesApproved")}
            />
            <StatCard
              label={t("leaves.pending")}
              value={
                leaves.filter(
                  (l) =>
                    l.overallStatus === "pending_manager" ||
                    l.overallStatus === "pending_hr",
                ).length
              }
              icon={<FiClock />}
              color="bg-amber-100 text-amber-600"
              subtitle={t("leaves.awaitingApproval")}
            />
            <StatCard
              label={t("leaves.rejected")}
              value={
                leaves.filter(
                  (l) =>
                    l.overallStatus === "rejected_by_manager" ||
                    l.overallStatus === "rejected_by_hr",
                ).length
              }
              icon={<FiSlash />}
              color="bg-red-100 text-red-500"
              subtitle={t("leaves.leavesDeclined")}
            />
          </div>

          {/* Leave Balance */}
          {!isAdmin &&
            (balanceLoading ? (
              <div className="mb-6">{t("leaves.loadingBalance")}</div>
            ) : balanceError ? (
              <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 mb-6">
                <span className="flex items-center justify-center h-8 w-8 rounded-full bg-red-500">
                  <FiXCircle className="text-white h-5 w-5" />
                </span>
                <span className="text-base text-slate-900">{balanceError}</span>
              </div>
            ) : balance ? (
              <LeaveBalanceCards
                annual={balance.annual}
                annualTotal={balance.annualTotal}
                sick={balance.sick}
                sickTotal={balance.sickTotal}
                casual={balance.casual}
                casualTotal={balance.casualTotal}
              />
            ) : null)}

          {error && (
            <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
              <span className="flex items-center justify-center h-8 w-8 rounded-full bg-red-500">
                <FiXCircle className="text-white h-5 w-5" />
              </span>
              <span className="text-base text-slate-900">{error}</span>
            </div>
          )}

          {/* Search */}
          <div className="relative w-full max-w-sm">
            <AnimatedSearchIcon />
            <input
              type="text"
              placeholder={t("leaves.searchPlaceholder")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-4 text-sm text-slate-700 shadow-sm placeholder-slate-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
            />
          </div>

          {/* Admin tabs */}
          {isAdmin && (
            <div className="flex gap-2 mb-4">
              {(
                [
                  { key: "hr_pending", label: t("leaves.pendingHRApproval") },
                  { key: "manager", label: t("leaves.managerLeaves") },
                ] as const
              ).map(({ key, label }) => (
                <button
                  key={key}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
                    adminTab === key
                      ? "bg-[#1e3a5f] text-white shadow"
                      : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                  onClick={() => setAdminTab(key)}
                >
                  {label}
                </button>
              ))}
            </div>
          )}

          {/* Manager tabs */}
          {isManager && (
            <div className="flex gap-2 mb-4">
              {(
                [
                  { key: "team", label: t("leaves.teamLeaves") },
                  { key: "my", label: t("leaves.myLeaves") },
                ] as const
              ).map(({ key, label }) => (
                <button
                  key={key}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
                    managerTab === key
                      ? "bg-[#1e3a5f] text-white shadow"
                      : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                  onClick={() => setManagerTab(key)}
                >
                  {label}
                </button>
              ))}
            </div>
          )}

          {/* Tables */}
          {isAdmin ? (
            <AllLeavesTable
              leaves={filteredLeaves}
              tab={adminTab}
              onHrApprove={handleHrApprove}
              onHrReject={handleHrReject}
            />
          ) : (
            <LeavesTable
              leaves={filteredLeaves}
              isManager={isManager}
              isMyLeaves={!isManager || managerTab === "my"}
              onManagerApprove={handleManagerApprove}
              onManagerReject={handleManagerReject}
              onCancel={handleCancel}
              emptyMessage={
                loading ? t("leaves.loadingLeaves") : t("leaves.noLeaves")
              }
            />
          )}

          <AddLeaveModal
            isOpen={showModal}
            onClose={() => setShowModal(false)}
            onSave={handleApply}
            isSaving={isSaving}
            colleagues={colleagues}
          />
        </div>
      </main>
    </div>
  );
};

export default Leaves;
