import React from "react";
import { FiBriefcase, FiHash, FiMail, FiUser, FiCalendar, FiFileText } from "react-icons/fi";

interface ViewLeaveModalProps {
  isOpen: boolean;
  onClose: () => void;
  leave: {
    id: number;
    employeeName?: string;
    type: string;
    startDate: string;
    endDate: string;
    days: number;
    reason: string;
    status: string;
    approvedBy?: string;
    approvedAt?: string;
  } | null;
}

const detailItems = [
  { key: "id", label: "Leave ID", icon: FiHash },
  { key: "employeeName", label: "Employee", icon: FiUser },
  { key: "type", label: "Type", icon: FiBriefcase },
  { key: "startDate", label: "Start Date", icon: FiCalendar },
  { key: "endDate", label: "End Date", icon: FiCalendar },
  { key: "days", label: "Days", icon: FiHash },
  { key: "reason", label: "Reason", icon: FiFileText },
  { key: "approvedBy", label: "Approved By", icon: FiUser },
  { key: "approvedAt", label: "Approved At", icon: FiCalendar },
];

const ViewLeaveModal: React.FC<ViewLeaveModalProps> = ({ isOpen, onClose, leave }) => {
  if (!isOpen || !leave) return null;

  return (
      <div className="fixed inset-0 flex items-center justify-center bg-black/70 bg-opacity-30 z-50">
        <div className="bg-white rounded-2xl shadow-xl max-w-xl w-full p-0 relative">
          {/* Close button */}
          <button
            className="absolute top-4 right-4 text-slate-400 hover:text-slate-700"
            onClick={onClose}
          >
            <span className="sr-only">Close</span>
            <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
          {/* Profile Snapshot */}
          <div className="rounded-2xl bg-gradient-to-br from-blue-600 via-cyan-600 to-teal-500 p-px mx-8 mt-8">
            <div className="rounded-2xl bg-white px-5 py-5">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">
                Profile Snapshot
              </p>
              <h3 className="mt-3 text-2xl font-semibold text-slate-900">
                {leave.employeeName || "-"}
              </h3>
              <p className="mt-1 text-sm text-slate-500">{leave.type}</p>
              <div className={`mt-4 inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                leave.status === "approved"
                  ? "bg-emerald-50 text-emerald-700"
                  : leave.status === "pending"
                  ? "bg-yellow-50 text-yellow-700"
                  : "bg-red-50 text-red-600"
              }`}>
                {leave.status}
              </div>
            </div>
          </div>

          {/* Info Grid */}
          <div className="grid gap-3 sm:grid-cols-2 px-8 py-8">
            {detailItems.map((item) => {
              const Icon = item.icon;
              let value = leave[item.key as keyof typeof leave];
              if (item.key === "approvedAt") {
                value = value ? new Date(value as string).toLocaleString() : "-";
              }
              return (
                <div
                  key={item.key}
                  className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="rounded-xl bg-white p-2 text-slate-500 shadow-sm">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                        {item.label}
                      </p>
                      <p className="mt-1 text-sm font-semibold text-slate-900">
                        {value || "-"}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer */}
          <div className="flex justify-end px-8 pb-8">
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
