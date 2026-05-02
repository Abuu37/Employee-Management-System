import React from "react";
import {
  FiBriefcase,
  FiHash,
  FiUser,
  FiCalendar,
  FiFileText,
  FiAlertCircle,
  FiCheckCircle,
  FiXCircle,
  FiClock,
} from "react-icons/fi";

interface Leave {
  id: number;
  employeeName?: string;
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
  backupEmployeeName?: string;
  handoverNote?: string;
}

interface ViewLeaveModalProps {
  isOpen: boolean;
  onClose: () => void;
  leave: Leave | null;
}

function overallBadgeClass(status: string) {
  const map: Record<string, string> = {
    pending_manager: "bg-yellow-50 text-yellow-700",
    pending_hr: "bg-blue-50 text-blue-700",
    approved: "bg-emerald-50 text-emerald-700",
    rejected_by_manager: "bg-red-50 text-red-600",
    rejected_by_hr: "bg-red-50 text-red-600",
  };
  return map[status] ?? "bg-slate-100 text-slate-600";
}

function overallLabel(status: string) {
  const labels: Record<string, string> = {
    pending_manager: "Pending Manager Approval",
    pending_hr: "Pending HR Approval",
    approved: "Approved",
    rejected_by_manager: "Rejected by Manager",
    rejected_by_hr: "Rejected by HR",
  };
  return labels[status] ?? status;
}

const ViewLeaveModal: React.FC<ViewLeaveModalProps> = ({ isOpen, onClose, leave }) => {
  if (!isOpen || !leave) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm z-50">
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full relative">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 pt-5 pb-4">
          <h2 className="text-lg font-semibold text-slate-900">Leave Details</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-200 p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
          >
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          {/* Profile Snapshot */}
          <div className="rounded-2xl bg-linear-to-br from-blue-600 via-cyan-600 to-teal-500 p-px">
            <div className="rounded-2xl bg-white px-5 py-4 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">{leave.employeeName ?? "Employee"}</h3>
                <p className="text-sm text-slate-500 capitalize">{leave.type} Leave</p>
              </div>
              <div className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${overallBadgeClass(leave.overallStatus)}`}>
                {overallLabel(leave.overallStatus)}
              </div>
            </div>
          </div>

          {/* Leave Info Grid */}
          <div className="grid grid-cols-3 gap-2">
            {[
              { key: "id", label: "Leave ID", icon: FiHash, value: leave.id },
              { key: "type", label: "Type", icon: FiBriefcase, value: leave.type },
              { key: "days", label: "Days", icon: FiHash, value: leave.days },
              { key: "startDate", label: "Start Date", icon: FiCalendar, value: leave.startDate },
              { key: "endDate", label: "End Date", icon: FiCalendar, value: leave.endDate },
              { key: "backup", label: "Backup Person", icon: FiUser, value: leave.backupEmployeeName ?? "-" },
            ].map(({ key, label, icon: Icon, value }) => (
              <div key={key} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-3">
                <div className="flex items-center gap-2">
                  <Icon className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                  <p className="text-xs text-slate-400 uppercase tracking-wide truncate">{label}</p>
                </div>
                <p className="mt-1 text-sm font-semibold text-slate-900 pl-5">{value ?? "-"}</p>
              </div>
            ))}
          </div>

          {/* Reason */}
          <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
            <div className="flex items-center gap-2 mb-1">
              <FiFileText className="h-3.5 w-3.5 text-slate-400" />
              <p className="text-xs text-slate-400 uppercase tracking-wide">Reason</p>
            </div>
            <p className="text-sm text-slate-900 pl-5">{leave.reason ?? "-"}</p>
          </div>

          {/* Handover Notes */}
          {leave.handoverNote && (
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
              <div className="flex items-center gap-2 mb-1">
                <FiFileText className="h-3.5 w-3.5 text-slate-400" />
                <p className="text-xs text-slate-400 uppercase tracking-wide">Handover Notes</p>
              </div>
              <p className="text-sm text-slate-900 pl-5">{leave.handoverNote}</p>
            </div>
          )}

          {/* Review Sections — side by side */}
          <div className="grid grid-cols-2 gap-3">
            {/* Manager Review */}
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 space-y-1">
              <div className="flex items-center gap-2 mb-1">
                {leave.managerStatus === "approved" ? (
                  <FiCheckCircle className="h-4 w-4 text-emerald-600" />
                ) : leave.managerStatus === "rejected" ? (
                  <FiXCircle className="h-4 w-4 text-red-500" />
                ) : (
                  <FiClock className="h-4 w-4 text-yellow-500" />
                )}
                <p className="text-sm font-semibold text-slate-800">Manager Review</p>
              </div>
              <p className="text-xs text-slate-500">
                Status: <span className="font-medium text-slate-800 capitalize">{leave.managerStatus ?? "Pending"}</span>
              </p>
              {leave.managerApprovedAt && (
                <p className="text-xs text-slate-500">
                  Date: <span className="font-medium text-slate-800">{new Date(leave.managerApprovedAt).toLocaleString()}</span>
                </p>
              )}
              {leave.managerComment && (
                <p className="text-xs text-slate-500">
                  Reason: <span className="font-medium text-red-600">{leave.managerComment}</span>
                </p>
              )}
            </div>

            {/* HR Review */}
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 space-y-1">
              <div className="flex items-center gap-2 mb-1">
                {leave.hrStatus === "approved" ? (
                  <FiCheckCircle className="h-4 w-4 text-emerald-600" />
                ) : leave.hrStatus === "rejected" ? (
                  <FiXCircle className="h-4 w-4 text-red-500" />
                ) : (
                  <FiAlertCircle className="h-4 w-4 text-slate-400" />
                )}
                <p className="text-sm font-semibold text-slate-800">HR Review</p>
              </div>
              <p className="text-xs text-slate-500">
                Status: <span className="font-medium text-slate-800 capitalize">{leave.hrStatus ?? "Not yet reviewed"}</span>
              </p>
              {leave.hrApprovedAt && (
                <p className="text-xs text-slate-500">
                  Date: <span className="font-medium text-slate-800">{new Date(leave.hrApprovedAt).toLocaleString()}</span>
                </p>
              )}
              {leave.hrComment && (
                <p className="text-xs text-slate-500">
                  Reason: <span className="font-medium text-red-600">{leave.hrComment}</span>
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end px-6 pb-5">
          <button
            className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewLeaveModal;
