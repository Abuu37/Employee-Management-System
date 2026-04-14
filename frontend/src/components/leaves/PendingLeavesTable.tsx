import React from "react";
import { FiCheck, FiX } from "react-icons/fi";

export interface PendingLeave {
  id: number;
  managerName: string;
  type: string;
  startDate: string;
  endDate: string;
  days: number;
  reason: string;
  status: string;
}

interface PendingLeavesTableProps {
  leaves: PendingLeave[];
  onApprove: (leave: PendingLeave) => void;
  onReject: (leave: PendingLeave) => void;
}

const PendingLeavesTable: React.FC<PendingLeavesTableProps> = ({
  leaves,
  onApprove,
  onReject,
}) => (
  <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
    <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
      <h3 className="text-lg font-semibold text-slate-900">
        Pending Approvals
      </h3>
      <div className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
        {leaves.length} records
      </div>
    </div>
    <table className="min-w-full text-left text-sm">
      <thead className="bg-slate-50 text-slate-500">
        <tr>
          <th className="px-5 py-3 font-medium">S/N</th>
          <th className="px-5 py-3 font-medium">Manager Name</th>
          <th className="px-5 py-3 font-medium">Type</th>
          <th className="px-5 py-3 font-medium">Start Date</th>
          <th className="px-5 py-3 font-medium">End Date</th>
          <th className="px-5 py-3 font-medium">Days</th>
          <th className="px-5 py-3 font-medium">Reason</th>
          <th className="px-5 py-3 font-medium">Status</th>
          <th className="px-5 py-3 font-medium text-right">Actions</th>
        </tr>
      </thead>
      <tbody>
        {leaves.length > 0 ? (
          leaves.map((leave, idx) => (
            <tr key={leave.id} className="border-t border-slate-100">
              <td className="px-5 py-4 font-medium text-slate-600">
                {idx + 1}
              </td>
              <td className="px-5 py-4 text-slate-600">{leave.managerName}</td>
              <td className="px-5 py-4 font-semibold text-slate-900">
                {leave.type}
              </td>
              <td className="px-5 py-4 text-slate-600">{leave.startDate}</td>
              <td className="px-5 py-4 text-slate-600">{leave.endDate}</td>
              <td className="px-5 py-4 text-slate-600">{leave.days}</td>
              <td className="px-5 py-4 text-slate-600">{leave.reason}</td>
              <td className="px-5 py-4">
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                    leave.status === "pending" ? "bg-yellow-50 text-yellow-700" : leave.status === "approved" ? 
                    "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-600"}`}
                >
                  {leave.status}
                </span>
              </td>
              <td className="px-5 py-4">
                <div className="flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => onApprove(leave)}
                    className="inline-flex items-center gap-1 rounded-lg border
                     border-emerald-100 bg-white px-3 py-1.5 text-xs font-medium text-emerald-700 hover:bg-emerald-50 transition"
                  >
                    <FiCheck className="h-4 w-4" />
                    Approve
                  </button>
                  <button
                    type="button"
                    onClick={() => onReject(leave)}
                    className="inline-flex items-center gap-1 rounded-lg border border-red-100
                     bg-white px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 transition"
                  >
                    <FiX className="h-4 w-4" />
                    Reject
                  </button>
                </div>
              </td>
            </tr>
          ))
        ) : (
          <tr>
            <td
              colSpan={9}
              className="px-5 py-10 text-center text-sm text-slate-500"
            >
              No pending approvals.
            </td>
          </tr>
        )}
      </tbody>
    </table>
  </section>
);

export default PendingLeavesTable;
