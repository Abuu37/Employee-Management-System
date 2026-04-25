// This component is used by both Employee and Manager views, with some conditional rendering based on role.

import React, { useState } from "react";
import { FiCheck, FiX, FiEye } from "react-icons/fi";
import ViewLeaveModal from "./ViewLeaveModal";

export interface Leave {
  id: number;
  type: string;
  startDate: string;
  endDate: string;
  days: number;
  reason: string;
  status: string;
  employeeName?: string; // for manager/admin
  approvedBy?: string;
  approvedAt?: string;
}

interface LeavesTableProps {
  leaves: Leave[];
  onApprove: (leave: Leave) => void;
  onReject: (leave: Leave) => void;
  emptyMessage: string;
  onAdd: () => void;
  onCancel: (leave: Leave) => void;
}

function LeavesTable({
  leaves,
  onApprove,
  onReject,
  onCancel,
  emptyMessage,
  onAdd,
}: LeavesTableProps) {
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;
  const totalPages = Math.ceil(leaves.length / pageSize);

  const paginatedLeaves = leaves.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  // Get user role and name from localStorage
  const role =
    typeof window !== "undefined"
      ? localStorage.getItem("user-role")
      : undefined;
  const userName =
    typeof window !== "undefined"
      ? localStorage.getItem("user-name")
      : undefined;


      // View Leave Modal state
  const[selectedLeave, setSelectedLeave] = useState<Leave | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);



  return (
    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
        <h3 className="text-lg font-semibold text-slate-900">
          Leaves Management
        </h3>
        <div className="flex items-center gap-3">
          <div className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
            {leaves.length} records
          </div>
          <button
            type="button"
            onClick={onAdd}
            className="inline-flex items-center gap-2 rounded-xl
             bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
          >
            + Apply Leave
          </button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-500">
            <tr>
              <th className="px-5 py-3 font-medium">S/N</th>
              {/* Show Employee column for manager/admin */}
              {(role === "manager" || role === "admin") && (
                <th className="px-5 py-3 font-medium">Employee</th>
              )}
              <th className="px-5 py-3 font-medium">Type</th>
              <th className="px-5 py-3 font-medium">Start Date</th>
              <th className="px-5 py-3 font-medium">End Date</th>
              <th className="px-5 py-3 font-medium">Days</th>
              
              <th className="px-5 py-3 font-medium">Status</th>

              {/* Show Processed By column for admin */}

              <th className="px-5 py-3 font-medium">Processed By</th>
              <th className="px-5 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>

          <tbody>
            {paginatedLeaves.length > 0 ? (
              paginatedLeaves.map((leave, idx) => (
                <tr key={leave.id} className="border-t border-slate-100">
                  <td className="px-5 py-4 font-medium text-slate-600">
                    {(currentPage - 1) * pageSize + idx + 1}
                  </td>
                 
                  {/* Show Employee cell for manager/admin */}
                  {(role === "manager" || role === "admin") && (
                    <td className="px-5 py-4 text-slate-600">
                      {leave.employeeName || "-"}
                    </td>
                  )}

                  <td className="px-5 py-4 font-semibold text-slate-900">
                    {leave.type}
                  </td>

                  <td className="px-5 py-4 text-slate-600">
                    {leave.startDate}
                  </td>

                  <td className="px-5 py-4 text-slate-600">{leave.endDate}</td>
                  <td className="px-5 py-4 text-slate-600">{leave.days}</td>
                
                  <td className="px-5 py-4">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                        leave.status === "pending"
                          ? "bg-yellow-50 text-yellow-700"
                          : leave.status === "approved"
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-red-50 text-red-600"
                      }`}
                    >
                      {leave.status}
                    </span>
                  </td>

                  <td className="px-5 py-4 text-slate-600">
                    {leave.approvedBy || "-"}
                  </td>

                  <td className="px-5 py-4 ">
                    <div className="flex items-center justify-end gap-2">
                      {/* MANAGER / ADMIN ACTIONS  */}
                      {leave.status === "pending" &&
                        (role === "manager" || role === "admin") &&
                        // Disable approve/reject if this is the manager's own leave
                        (!userName || leave.employeeName !== userName) && (
                          <>
                            <button
                              type="button"
                              onClick={() => onApprove(leave)}
                              className="inline-flex items-center gap-1 rounded-lg 
                              border border-emerald-200 bg-white px-3 py-1.5 text-xs font-medium
                             text-emerald-700 hover:bg-emerald-500 transition hover:text-white"
                            >
                              <FiCheck className="h-4 w-4" />
                              Approve
                            </button>
                            <button
                              type="button"
                              onClick={() => onReject(leave)}
                              className="inline-flex items-center gap-1 rounded-lg border
                             border-red-200 bg-white px-3 py-1.5 text-xs font-medium
                              text-red-700 hover:bg-red-500 transition hover:text-white"
                            >
                              <FiX className="h-4 w-4" />
                              Reject
                            </button>
                          </>
                        )}

                      {/* EMPLOYEE or MANAGER CANCEL (own leave) */}
                      {leave.status === "pending" &&
                        (role === "employee" ||
                          (role === "manager" &&
                            userName &&
                            leave.employeeName === userName)) && (
                          <>
                            <button
                              type="button"
                              onClick={() => onCancel(leave)}
                              className="inline-flex items-center gap-1 rounded-lg border
                               border-red-200 bg-white px-3 py-1.5 text-xs font-medium
                                text-red-700 hover:bg-red-500 transition hover:text-white"
                            >
                              <FiX className="h-4 w-4" />
                              Cancel
                            </button>
                          </>
                        )}

                      {/* finally if the status not pending */}
                      {leave.status !== "pending" && (
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedLeave(leave);
                            setIsViewModalOpen(true);
                          }}
                          className="inline-flex items-center gap-1 rounded-lg border border-blue-200 bg-white px-3 py-1.5 text-xs font-medium text-blue-700 hover:bg-blue-500 transition hover:text-white"
                        >
                          <FiEye className="h-4 w-4" />
                          View
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={role === "admin" ? 10 : role === "manager" ? 9 : 8}
                  className="px-5 py-10 text-center text-sm text-slate-500"
                >
                  {emptyMessage}
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Pagination Controls */}
        <div className="flex items-center justify-end gap-3 border-t border-slate-200 px-5 py-4">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="rounded-lg border border-slate-300
                bg-white px-3 py-1 text-sm font-medium text-slate-700
                hover:bg-slate-50 disabled:cursor-not-allowed disabled:bg-slate-100"
          >
            Previous
          </button>
          <button
            onClick={() => setCurrentPage((prev) => prev + 1)}
            disabled={currentPage === totalPages}
            className="rounded-lg border border-slate-300
                bg-white px-3 py-1 text-sm font-medium text-slate-700
                hover:bg-slate-50 disabled:cursor-not-allowed disabled:bg-slate-100"
          >
            Next
          </button>
        </div>
      </div>

      {/* View Leave Modal */}
      <ViewLeaveModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        leave={selectedLeave}
      />

    </section>
  );
}
export type { Leave };
export default LeavesTable;
