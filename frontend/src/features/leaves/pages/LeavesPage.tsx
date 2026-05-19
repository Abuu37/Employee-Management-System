import React, { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router-dom";
import {
  FiXCircle,
  FiCalendar,
  FiCheckCircle,
  FiAlertTriangle,
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
import type { AddLeaveFormValues } from "@/features/leaves/components/AddLeaveModal";
import DeleteConfirmModal from "@/components/common/DeleteConfirmModal";
import LeaveBalanceCards from "@/features/leaves/components/LeaveBalanceCards";
import useLeaveBalance from "@/features/leaves/hooks/useLeaveBalance";
import { useUser } from "@/context/UserContext";
import useDeleteConfirmation from "@/hooks/useDeleteConfirmation";
import { richTextToPlainText } from "@/utils/richText";

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
  role?: string;
  department_id?: number;
}

import { getAccessToken } from "@/features/auth/services/authSession";

const authHeader = () => ({
  Authorization: `Bearer ${getAccessToken() ?? ""}`,
});

interface LeaveStats {
  total: number;
  approved: number;
  pending: number;
  rejected: number;
}

const Leaves: React.FC = () => {
  const { user } = useUser();
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();

  const [searchTerm, setSearchTerm] = useState(
    searchParams.get("search") ?? "",
  );
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingLeave, setEditingLeave] = useState<Leave | null>(null);
  const [leaveStats, setLeaveStats] = useState<LeaveStats>({
    total: 0,
    approved: 0,
    pending: 0,
    rejected: 0,
  });

  // Sort state — synced to URL
  const [sortBy, setSortBy] = useState<string>(
    searchParams.get("sortBy") ?? "createdAt",
  );
  const [sortOrder, setSortOrder] = useState<"ASC" | "DESC">(
    (searchParams.get("sortOrder") as "ASC" | "DESC") ?? "DESC",
  );

  // Admin tabs: "hr_pending" | "manager"
  const [adminTab, setAdminTab] = useState<"hr_pending" | "manager">(
    (searchParams.get("tab") as "hr_pending" | "manager") ?? "hr_pending",
  );
  // Manager tabs: "team" | "my"
  const [managerTab, setManagerTab] = useState<"team" | "my">(
    (searchParams.get("tab") as "team" | "my") ?? "team",
  );
  const [colleagues, setColleagues] = useState<Colleague[]>([]);

  const {
    balance,
    loading: balanceLoading,
    error: balanceError,
  } = useLeaveBalance();
  const deleteConfirmation = useDeleteConfirmation();

  const isAdmin = user?.role === "admin";
  const isManager = user?.role === "manager";

  // Sync sort + tab to URL params
  useEffect(() => {
    const params: Record<string, string> = { sortBy, sortOrder };
    if (searchTerm) params.search = searchTerm;
    if (isAdmin) params.tab = adminTab;
    else if (isManager) params.tab = managerTab;
    setSearchParams(params, { replace: true });
  }, [sortBy, sortOrder, searchTerm, adminTab, managerTab]);

  // Fetch leave stats based on current tab and role
  const fetchStats = useCallback(async () => {
    try {
      const params: Record<string, string> = {};
      if (isManager) {
        params.scope = managerTab;
      } else if (isAdmin) {
        params.scope = adminTab;
      }

      const res = await axios.get("/api/leaves/stats", {
        headers: authHeader(),
        params,
      });
      setLeaveStats(res.data);
    } catch {
      // non-critical
    }
  }, [isManager, isAdmin, managerTab, adminTab]);

  // Fetch leaves based on current tab and role
  const fetchLeaves = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params: Record<string, string> = { sortBy, sortOrder };

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

      const res = await axios.get(url, { headers: authHeader(), params });
      setLeaves(Array.isArray(res.data) ? res.data : (res.data.leaves ?? []));
    } catch (err: any) {
      setError(err.response?.data?.message ?? "Failed to fetch leaves");
    }
    setLoading(false);
  }, [user, adminTab, managerTab, sortBy, sortOrder]);

  //========= Fetch colleagues(team members) for backup employee selector =============
  const fetchColleagues = async () => {
    try {
      const res = await axios.get("/api/user/view-users", {
        headers: authHeader(),
      });
      const all: any[] = Array.isArray(res.data)
        ? res.data
        : (res.data.users ?? []);

      const filtered = all.filter((u: any) => {
        if (u.id === user?.id) return false;

        if (isManager) {
          const managerDept = (user as any)?.department_id;
          return (
            u.role === "employee" &&
            (managerDept == null || u.department_id === managerDept)
          );
        }

        return true;
      });

      setColleagues(filtered);
    } catch {
      // non-critical, ignore
    }
  };

  useEffect(() => {
    fetchLeaves();
    fetchStats();
    // eslint-disable-next-line
  }, [fetchLeaves, fetchStats]);

  useEffect(() => {
    if (user) fetchColleagues();
    // eslint-disable-next-line
  }, [user]);

  //======= Open apply modal in either add or edit mode ============
  const openApplyModal = () => {
    setEditingLeave(null);
    setShowModal(true);
  };

  // Close modal and reset edit state
  const closeLeaveModal = () => {
    setShowModal(false);
    setEditingLeave(null);
  };

  //======= Edit rejected leave (manager only) ============
  const handleEditRejectedLeave = (leave: Leave) => {
    setEditingLeave(leave);
    setShowModal(true);
  };

  //======= Employee/manager deletes own rejected/approved leave request =============
  const handleDeleteRequest = async (leave: Leave) => {
    deleteConfirmation.requestDelete({
      title: t("common.delete"),
      message: "Are you sure you want to delete this leave request?",
      confirmLabel: t("common.delete"),
      cancelLabel: t("common.cancel"),
      onConfirm: async () => {
        setError("");
        try {
          await axios.delete(`/api/leaves/cancel/${leave.id}`, {
            headers: authHeader(),
          });
          toast.success("Leave request deleted");
          await Promise.all([fetchLeaves(), fetchStats()]);
        } catch (err: any) {
          const message =
            err.response?.data?.message ?? "Failed to delete leave";
          toast.error(message);
          setError(message);
        }
      },
    });
  };

  // =========== Apply new leave or edit+apply rejected manager leave ==========
  const handleSaveLeave = async (form: AddLeaveFormValues) => {
    setIsSaving(true);
    setError("");
    try {
      if (editingLeave && isManager) {
        await axios.put(`/api/leaves/resend/${editingLeave.id}`, form, {
          headers: authHeader(),
        });
        toast.success(t("leaves.editAppliedSuccess"));
      } else {
        await axios.post("/api/leaves/apply", form, { headers: authHeader() });
        toast.success("Leave request submitted successfully");
      }
      await Promise.all([fetchLeaves(), fetchStats()]);
      closeLeaveModal();
    } catch (err: any) {
      const message =
        err.response?.data?.message ??
        (editingLeave
          ? "Failed to edit and apply leave"
          : "Failed to apply for leave");
      toast.error(message);
      setError(message);
    }
    setIsSaving(false);
  };

  //======== Employee cancels own pending leave ============
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

  //======== Manager stage-1 approve ============
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

  //======== Manager stage-1 reject (requires comment) ============
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

  //======== HR / Admin stage-2 reject =============
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
    [
      leave.type,
      richTextToPlainText(leave.reason),
      leave.overallStatus,
      leave.employeeName,
    ]
      .join(" ")
      .toLowerCase()
      .includes(searchTerm.toLowerCase()),
  );

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder((prev) => (prev === "ASC" ? "DESC" : "ASC"));
    } else {
      setSortBy(column);
      setSortOrder("DESC");
    }
  };

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
                onClick={openApplyModal}
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
              value={leaveStats.total}
              icon={<FiCalendar />}
              color=""
              featured
              subtitle={t("leaves.allLeaveRequests")}
            />
            <StatCard
              label={t("leaves.approved")}
              value={leaveStats.approved}
              icon={<FiCheckCircle />}
              color="bg-emerald-100 text-emerald-600"
              subtitle={t("leaves.leavesApproved")}
            />
            <StatCard
              label={t("leaves.pending")}
              value={leaveStats.pending}
              icon={<FiAlertTriangle />}
              color="bg-amber-100 text-amber-600"
              subtitle={t("leaves.awaitingApproval")}
            />
            <StatCard
              label={t("leaves.rejected")}
              value={leaveStats.rejected}
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
                  onClick={() => {
                    setAdminTab(key);
                    setSortBy("createdAt");
                    setSortOrder("DESC");
                  }}
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
                  onClick={() => {
                    setManagerTab(key);
                    setSortBy("createdAt");
                    setSortOrder("DESC");
                  }}
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
              sortBy={sortBy}
              sortOrder={sortOrder}
              onSort={handleSort}
            />
          ) : (
            <LeavesTable
              leaves={filteredLeaves}
              isManager={isManager}
              isMyLeaves={!isManager || managerTab === "my"}
              onManagerApprove={handleManagerApprove}
              onManagerReject={handleManagerReject}
              onCancel={handleCancel}
              onEditRejected={handleEditRejectedLeave}
              onDeleteRequest={handleDeleteRequest}
              sortBy={sortBy}
              sortOrder={sortOrder}
              onSort={handleSort}
              emptyMessage={
                loading ? t("leaves.loadingLeaves") : t("leaves.noLeaves")
              }
            />
          )}

          <AddLeaveModal
            isOpen={showModal}
            onClose={closeLeaveModal}
            onSave={handleSaveLeave}
            isSaving={isSaving}
            colleagues={colleagues}
            isEditMode={Boolean(editingLeave)}
            initialValues={
              editingLeave
                ? {
                    type: editingLeave.type,
                    startDate: editingLeave.startDate,
                    endDate: editingLeave.endDate,
                    reason: editingLeave.reason,
                    backupEmployeeId: editingLeave.backupEmployeeId
                      ? String(editingLeave.backupEmployeeId)
                      : "",
                    handoverNote: editingLeave.handoverNote ?? "",
                  }
                : undefined
            }
          />

          <DeleteConfirmModal
            isOpen={deleteConfirmation.isOpen}
            title={deleteConfirmation.dialog?.title ?? t("common.delete")}
            message={
              deleteConfirmation.dialog?.message ??
              "Are you sure you want to delete this item?"
            }
            confirmLabel={
              deleteConfirmation.dialog?.confirmLabel ?? t("common.delete")
            }
            cancelLabel={
              deleteConfirmation.dialog?.cancelLabel ?? t("common.cancel")
            }
            isProcessing={deleteConfirmation.isProcessing}
            onClose={deleteConfirmation.closeDialog}
            onConfirm={deleteConfirmation.confirmDelete}
          />
        </div>
      </main>
    </div>
  );
};

export default Leaves;
