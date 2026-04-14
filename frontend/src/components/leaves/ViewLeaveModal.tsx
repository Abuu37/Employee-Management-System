import React from "react";
import {
  FiX,
  FiUser,
  FiMail,
  FiHash,
  FiBriefcase,
  FiCalendar,
  FiFileText,
} from "react-icons/fi";

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

const ViewLeaveModal: React.FC<ViewLeaveModalProps> = ({
  isOpen,
  onClose,
  leave,
}) => {
  if (!isOpen || !leave) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
      <div className="bg-white rounded-2xl shadow-xl min-w-100 max-w-[95vw] p-0 relative">
        {/* Close button */}
        <button
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-700"
          onClick={onClose}
        >
          <FiX size={22} />
        </button>
        {/* Header */}
        <div className="border-b px-8 pt-6 pb-4">
          <h2 className="text-lg font-semibold">Leave Details</h2>
        </div>
        {/* Profile Snapshot */}
        <div className="px-8 pt-6 pb-4">
          <div className="border rounded-xl p-4 mb-4">
            <div className="text-slate-800 text-xl font-bold">
              {leave.employeeName || "-"}
            </div>
            <div className="text-slate-500 text-sm">{leave.type}</div>
            <span
              className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-semibold
              ${
                leave.status === "approved"
                  ? "bg-emerald-50 text-emerald-700"
                  : leave.status === "pending"
                    ? "bg-yellow-50 text-yellow-700"
                    : "bg-red-50 text-red-600"
              }`}
            >
              {leave.status}
            </span>
          </div>
          {/* Info Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="border rounded-lg p-3 flex items-center gap-2">
              <FiHash className="text-slate-400" />
              <div>
                <div className="text-xs text-slate-400">LEAVE ID</div>
                <div className="font-semibold">{leave.id}</div>
              </div>
            </div>
            <div className="border rounded-lg p-3 flex items-center gap-2">
              <FiUser className="text-slate-400" />
              <div>
                <div className="text-xs text-slate-400">EMPLOYEE</div>
                <div className="font-semibold">{leave.employeeName || "-"}</div>
              </div>
            </div>
            <div className="border rounded-lg p-3 flex items-center gap-2">
              <FiCalendar className="text-slate-400" />
              <div>
                <div className="text-xs text-slate-400">START DATE</div>
                <div className="font-semibold">{leave.startDate}</div>
              </div>
            </div>
            <div className="border rounded-lg p-3 flex items-center gap-2">
              <FiCalendar className="text-slate-400" />
              <div>
                <div className="text-xs text-slate-400">END DATE</div>
                <div className="font-semibold">{leave.endDate}</div>
              </div>
            </div>
            <div className="border rounded-lg p-3 flex items-center gap-2">
              <FiFileText className="text-slate-400" />
              <div>
                <div className="text-xs text-slate-400">REASON</div>
                <div className="font-semibold">{leave.reason}</div>
              </div>
            </div>
            <div className="border rounded-lg p-3 flex items-center gap-2">
              <FiBriefcase className="text-slate-400" />
              <div>
                <div className="text-xs text-slate-400">APPROVED BY</div>
                <div className="font-semibold">{leave.approvedBy || "-"}</div>
              </div>
            </div>
            <div className="border rounded-lg p-3 flex items-center gap-2">
              <FiHash className="text-slate-400" />
              <div>
                <div className="text-xs text-slate-400">DAYS</div>
                <div className="font-semibold">{leave.days}</div>
              </div>
            </div>
            <div className="border rounded-lg p-3 flex items-center gap-2">
              <FiCalendar className="text-slate-400" />
              <div>
                <div className="text-xs text-slate-400">APPROVED AT</div>
                <div className="font-semibold">
                  {leave.approvedAt
                    ? new Date(leave.approvedAt).toLocaleString()
                    : "-"}
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Footer */}
        <div className="flex justify-end border-t px-8 py-4">
          <button
            className="px-5 py-2 rounded-lg bg-slate-900 text-white font-semibold hover:bg-slate-700"
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
