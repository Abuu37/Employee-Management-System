import React, { useState } from "react";
import ViewLeaveModal from "./ViewLeaveModal";

export interface AllLeave {
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

}

interface AllLeavesTableProps {
  leaves: AllLeave[];
  showActions?: boolean;
  onApprove?: (leave: AllLeave) => void;
  onReject?: (leave: AllLeave) => void;
}

const AllLeavesTable: React.FC<AllLeavesTableProps> = ({
  leaves,
  showActions = false,
  onApprove,
  onReject,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;
  const totalPages = Math.ceil(leaves.length / pageSize);
  const paginatedLeaves = leaves.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  // State for viewing leave details
  const [selectedLeave, setSelectedLeave] = useState<AllLeave | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  return (
    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
        <h3 className="text-lg font-semibold text-slate-900">All Leaves</h3>
        <div className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
          {leaves.length} records
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-500">
            <tr>
              <th className="px-5 py-3 font-medium">S/N</th>
              <th className="px-5 py-3 font-medium">IDs</th>
              <th className="px-5 py-3 font-medium">Employee</th>
              <th className="px-5 py-3 font-medium">Type</th>
              <th className="px-5 py-3 font-medium">Start Date</th>
              <th className="px-5 py-3 font-medium">End Date</th>
              <th className="px-5 py-3 font-medium">Days</th>
              <th className="px-5 py-3 font-medium">Reason</th>
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3 font-medium">Approved By</th>
              <th className="px-5 py-3 font-medium">Approved At</th>
              {showActions && (
                <th className="px-5 py-3 font-medium">Actions</th>
              )}
            </tr>
          </thead>
          <tbody>
            {paginatedLeaves.length > 0 ? (
              paginatedLeaves.map((leave, idx) => (
                <tr key={leave.id} className="border-t border-slate-100">
                  <td className="px-5 py-4 font-medium text-slate-600">
                    {(currentPage - 1) * pageSize + idx + 1}
                  </td>
                  <td className="px-5 py-4 font-medium text-slate-600">
                    {leave.id}
                  </td>
                  <td className="px-5 py-4 text-slate-600">
                    {leave.employeeName || "-"}
                  </td>
                  <td className="px-5 py-4 font-semibold text-slate-900">
                    {leave.type}
                  </td>
                  <td className="px-5 py-4 text-slate-600">
                    {leave.startDate}
                  </td>
                  <td className="px-5 py-4 text-slate-600">{leave.endDate}</td>
                  <td className="px-5 py-4 text-slate-600">{leave.days}</td>
                  <td className="px-5 py-4 text-slate-600">{leave.reason}</td>
                  <td className="px-5 py-4">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                        leave.status === "pending" ? "bg-yellow-50 text-yellow-700" :
                        leave.status === "approved" ? "bg-emerald-50 text-emerald-700" :
                         "bg-red-50 text-red-600"
                      }`}
                    >
                      {leave.status}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-slate-600">
                    {leave.approvedBy || "-"}
                  </td>

                  <td className="px-5 py-4 text-slate-600">
                    {leave.approvedAt ? new Date(leave.approvedAt).toLocaleString() : "-"}
                  </td>

                  {showActions && (
                    <td className="px-5 py-4">
                      {leave.status === "pending" ? (
                        <div className="flex gap-2">
                          <button
                            className="px-3 py-1 rounded bg-green-500 text-white text-xs hover:bg-green-600"
                            onClick={() => onApprove && onApprove(leave)}
                          >
                            Approve
                          </button>
                          <button
                            className="px-3 py-1 rounded bg-red-500 text-white text-xs hover:bg-red-600"
                            onClick={() => onReject && onReject(leave)}
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedLeave(leave);
                            setIsViewModalOpen(true);
                          }}
                          className="inline-flex items-center gap-1 rounded-lg border
                           border-blue-200 bg-white px-3 py-1.5 text-xs font-medium text-blue-700
                            hover:bg-blue-500 transition hover:text-white"
                        >
                          View
                        </button>
                      )}
                    </td>
                  )}
                  
                </tr>
              ))
              
            ) : (
              <tr>
                <td
                  colSpan={10}
                  className="px-5 py-10 text-center text-sm text-slate-500"
                >
                  No leaves found.
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
            className="rounded-lg border border-slate-300 bg-white px-3 py-1 text-sm font-medium text-slate-700
             hover:bg-slate-50 disabled:cursor-not-allowed disabled:bg-slate-100"
          >
            Previous
          </button>
          <button
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage === totalPages}
            className="rounded-lg border border-slate-300 
            bg-white px-3 py-1 text-sm font-medium text-slate-700
            hover:bg-slate-50 disabled:cursor-not-allowed disabled:bg-slate-100"
          >
            Next
          </button>
        </div>
      </div>

      // View Leave Modal
      <ViewLeaveModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        leave={selectedLeave}
      />

    </section>
  );
};

export default AllLeavesTable;
