import React, { useEffect, useState } from "react";
import {
  FiXCircle,
  FiCalendar,
  FiCheckCircle,
  FiClock,
  FiSlash,
  FiPlus,
  FiSearch,
} from "react-icons/fi";
import axios from "axios";
import StatCard from "@/features/attendance/components/StatCard";
import Header from "@/layouts/Header";
import Sidebar from "@/layouts/Sidebar";
import LeavesTable from "@/features/leaves/components/LeavesTable";
import PendingLeavesTable from "@/features/leaves/components/PendingLeavesTable";
import AllLeavesTable from "@/features/leaves/components/AllLeavesTable";
import AddLeaveModal from "@/features/leaves/components/AddLeaveModal";
import LeaveBalanceCards from "@/features/leaves/components/LeaveBalanceCards";
import useLeaveBalance from "@/features/leaves/hooks/useLeaveBalance";
import { useUser } from "@/context/UserContext";

// Define the Leave type
interface Leave {
  id: number;
  type: string;
  startDate: string;
  endDate: string;
  days: number;
  reason: string;
  status: string;
  employeeName?: string; // Optional, for display purposes
  approvedBy?: string; // Optional, for display purposes
  userRole?: string; // Role of the leave owner
}

const Leaves: React.FC = () => {
  const { user } = useUser();
  const [searchTerm, setSearchTerm] = useState("");
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<"manager" | "employee">("manager");
  const [managerTab, setManagerTab] = useState<"all" | "my">("all");
  const {
    balance,
    loading: balanceLoading,
    error: balanceError,
  } = useLeaveBalance();

  // Fetch leaves based on user role and tab
  const fetchLeaves = async () => {
    setLoading(true);
    setError("");
    try {
      let url = "/api/leaves/my-leaves";
      if (user?.role === "manager" && managerTab === "all")
        url = "/api/leaves/team-leaves";
      if (user?.role === "manager" && managerTab === "my")
        url = "/api/leaves/my-leaves";
      if (user?.role === "admin" && activeTab === "manager")
        url = "/api/leaves/manager-leaves";
      if (user?.role === "admin" && activeTab === "employee")
        url = "/api/leaves/";
      const res = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setLeaves(Array.isArray(res.data) ? res.data : res.data.leaves || []);
    } catch (error: any) {
      setError(error.response?.data?.message || "Failed to fetch leaves");
      console.error("Error fetching leaves:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchLeaves();
    // eslint-disable-next-line
  }, [user, activeTab, managerTab]);

  // Handle leave application (modal form)
  const handleApply = async (form: {
    type: string;
    startDate: string;
    endDate: string;
    reason: string;
  }) => {
    setIsSaving(true);
    setError("");
    try {
      await axios.post("/api/leaves/apply", form, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      fetchLeaves();
      setShowModal(false);
    } catch (error: any) {
      setError(error.response?.data?.message || "Failed to apply for leave");
      console.error("Error applying for leave:", error);
    }
    setIsSaving(false);
  };

  // Handle Approve
  const handleApprove = async (leave: Leave) => {
    setError("");
    try {
      await axios.post(
        `/api/leaves/approve/${leave.id}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );
      fetchLeaves();
    } catch (error: any) {
      setError(error.response?.data?.message || "Failed to approve leave");
      console.error("Error approving leave:", error);
    }
  };

  // Handle Cancel (Employee cancels their own pending leave)
  const handleCancel = async (leave: Leave) => {
    setError("");
    try {
      await axios.delete(`/api/leaves/cancel/${leave.id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      fetchLeaves();
    } catch (error: any) {
      setError(error.response?.data?.message || "Failed to cancel leave");
      console.error("Error cancelling leave:", error);
    }
  };

  // Handle Reject
  const handleReject = async (leave: Leave) => {
    setError("");
    try {
      await axios.post(
        `/api/leaves/reject/${leave.id}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );
      fetchLeaves();
    } catch (error: any) {
      setError(error.response?.data?.message || "Failed to reject leave");
      console.error("Error rejecting leave:", error);
    }
  };

  // Filter leaves by search term (type, reason, or status)
  const role = typeof window !== "undefined" ? user?.role : undefined;
  const isAdmin = role === "admin";
  const isManager = role === "manager";

  // Search filter (client-side, only for display)
  const filteredLeaves = leaves.filter((leave) =>
    [leave.type, leave.reason, leave.status]
      .join(" ")
      .toLowerCase()
      .includes(searchTerm.toLowerCase()),
  );

  // Admin tab filtering
  // Manager Leaves: leaves submitted by managers (approved by admin)
  const managerLeaves = leaves.filter((l) => l.userRole === "manager");
  // Employee Leaves: show all leaves submitted by employees
  const employeeLeaves = leaves.filter((l) => l.userRole === "employee");

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
                Leave Management
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                Track and manage all leave requests
              </p>
            </div>
            {!isAdmin && (
              <button
                type="button"
                onClick={() => setShowModal(true)}
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
              >
                <FiPlus className="h-4 w-4" />
                Apply Leave
              </button>
            )}
          </div>

          {/* Stat cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              label="Total Leaves"
              value={leaves.length}
              icon={<FiCalendar />}
              color=""
              featured
              subtitle="All leave requests"
            />
            <StatCard
              label="Approved"
              value={leaves.filter((l) => l.status === "approved").length}
              icon={<FiCheckCircle />}
              color="bg-emerald-100 text-emerald-600"
              subtitle="Leaves approved"
            />
            <StatCard
              label="Pending"
              value={leaves.filter((l) => l.status === "pending").length}
              icon={<FiClock />}
              color="bg-amber-100 text-amber-600"
              subtitle="Awaiting approval"
            />
            <StatCard
              label="Rejected"
              value={leaves.filter((l) => l.status === "rejected").length}
              icon={<FiSlash />}
              color="bg-red-100 text-red-500"
              subtitle="Leaves declined"
            />
          </div>

          {/* Leave Balance Cards UI */}
          {balanceLoading ? (
            <div className="mb-6">Loading leave balance...</div>
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
          ) : null}

          {error && (
            <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 mb-4">
              <span className="flex items-center justify-center h-8 w-8 rounded-full bg-red-500">
                <FiXCircle className="text-white h-5 w-5" />
              </span>
              <span className="text-base text-slate-900">{error}</span>
            </div>
          )}

          {/* Search bar */}
          <div className="relative w-full max-w-sm">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search leaves..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-4 text-sm text-slate-700 shadow-sm placeholder-slate-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
            />
          </div>

          {/* Tab Navigation for Admin and Manager */}
          {isAdmin && (
            <div className="flex gap-2 mb-4">
              <button
                className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
                  activeTab === "manager"
                    ? "bg-[#1e3a5f] text-white shadow"
                    : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
                onClick={() => setActiveTab("manager")}
              >
                Manager Leaves
              </button>
              <button
                className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
                  activeTab === "employee"
                    ? "bg-[#1e3a5f] text-white shadow"
                    : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
                onClick={() => setActiveTab("employee")}
              >
                Employee Leaves
              </button>
            </div>
          )}
          {isManager && (
            <div className="flex gap-2 mb-4">
              <button
                className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
                  managerTab === "all"
                    ? "bg-[#1e3a5f] text-white shadow"
                    : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
                onClick={() => setManagerTab("all")}
              >
                Team Leaves
              </button>
              <button
                className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
                  managerTab === "my"
                    ? "bg-[#1e3a5f] text-white shadow"
                    : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
                onClick={() => setManagerTab("my")}
              >
                My Leaves
              </button>
            </div>
          )}

          {/* Conditional Rendering */}
          {isAdmin ? (
            activeTab === "manager" ? (
              <AllLeavesTable
                leaves={filteredLeaves}
                showActions={true}
                onApprove={handleApprove}
                onReject={handleReject}
              />
            ) : (
              <AllLeavesTable leaves={filteredLeaves} />
            )
          ) : isManager ? (
            <LeavesTable
              leaves={filteredLeaves}
              onApprove={handleApprove}
              onReject={handleReject}
              emptyMessage={loading ? "Loading leaves..." : "No leaves found."}
              onAdd={() => setShowModal(true)}
              onCancel={handleCancel}
            />
          ) : (
            <LeavesTable
              leaves={filteredLeaves}
              onApprove={handleApprove}
              onReject={handleReject}
              emptyMessage={loading ? "Loading leaves..." : "No leaves found."}
              onAdd={() => setShowModal(true)}
              onCancel={handleCancel}
            />
          )}

          <AddLeaveModal
            isOpen={showModal}
            onClose={() => setShowModal(false)}
            onSave={handleApply}
            isSaving={isSaving}
          />
        </div>
      </main>
    </div>
  );
};

export default Leaves;
