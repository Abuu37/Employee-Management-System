import React, { useEffect, useState } from "react";
import axios from "axios";
import Header from "../components/layout/Header";
import Sidebar from "../components/layout/Sidebar";
import LeavesTable from "../components/leaves/LeavesTable";
import PendingLeavesTable from "../components/leaves/PendingLeavesTable";
import AllLeavesTable from "../components/leaves/AllLeavesTable";
import AddLeaveModal from "../components/leaves/AddLeaveModal";
import LeaveBalanceCards from "../components/leaves/LeaveBalanceCards";
import useLeaveBalance from "../hooks/useLeaveBalance";

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

  // Fetch leaves based on user role
  const fetchLeaves = async () => {
    setLoading(true);
    setError("");
    try {
      const role = localStorage.getItem("user-role");
      let url = "/api/leaves/";
      if (role === "employee") {
        url = "/api/leaves/my-leaves";
      }
      const res = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const data = Array.isArray(res.data) ? res.data : res.data.leaves;
      setLeaves(data || []);
    } catch (error: any) {
      setError(error.response?.data?.message || "Failed to fetch leaves");
      console.error("Error fetching leaves:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchLeaves();
  }, []);


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
  const filteredLeaves = leaves.filter((leave) =>
    [leave.type, leave.reason, leave.status]
      .join(" ")
      .toLowerCase()
      .includes(searchTerm.toLowerCase()),
  );

  const role =
    typeof window !== "undefined"
      ? localStorage.getItem("user-role")
      : undefined;
  const isAdmin = role === "admin";
  const isManager = role === "manager";

  // Admin tab filtering
  // Manager Leaves: leaves submitted by managers (approved by admin)
  const managerLeaves = leaves.filter((l) => l.userRole === "manager");
  // Employee Leaves: show all leaves submitted by employees
  const employeeLeaves = leaves.filter((l) => l.userRole === "employee");

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <main className="flex-1 p-6">
        <Header searchTerm={searchTerm} onSearchChange={setSearchTerm} />

        {/* Leave Balance Cards UI */}
        {balanceLoading ? (
          <div className="mb-6">Loading leave balance...</div>
        ) : balanceError ? (
          <div className="mb-6 text-red-600">{balanceError}</div>
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

        {error && <div style={{ color: "red" }}>{error}</div>}

        {/* Tab Navigation for Admin and Manager */}
        {isAdmin && (
          <div className="flex gap-2 mb-4">
            <button
              className={`px-4 py-2 rounded-t ${
                activeTab === "manager"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-700"
              }`}
              onClick={() => setActiveTab("manager")}
            >
              Manager Leaves
            </button>
            <button
              className={`px-4 py-2 rounded-t ${
                activeTab === "employee"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-700"
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
              className={`px-4 py-2 rounded-t ${
                managerTab === "all"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-700"
              }`}
              onClick={() => setManagerTab("all")}
            >
              All Leaves
            </button>
            <button
              className={`px-4 py-2 rounded-t ${
                managerTab === "my"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-700"
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
            // Manager Leaves: show leaves from managers (approved by admin), with actions
            <AllLeavesTable
              leaves={managerLeaves}
              showActions={true}
              onApprove={handleApprove}
              onReject={handleReject}
            />
          ) : (
            // All Leaves: show employee leaves approved by manager, no actions
            <AllLeavesTable leaves={employeeLeaves} />
          )
        ) : isManager ? (
          managerTab === "all" ? (
            <LeavesTable
              leaves={leaves}
              onApprove={handleApprove}
              onReject={handleReject}
              emptyMessage={loading ? "Loading leaves..." : "No leaves found."}
              onAdd={() => setShowModal(true)}
              onCancel={handleCancel}
            />
          ) : (
            <LeavesTable
              leaves={leaves.filter(
                (l) => l.employeeName === localStorage.getItem("user-name"),
              )}
              onApprove={handleApprove}
              onReject={handleReject}
              emptyMessage={loading ? "Loading leaves..." : "No leaves found."}
              onAdd={() => setShowModal(true)}
              onCancel={handleCancel}
            />
          )
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
      </main>
    </div>
  );
};

export default Leaves;
