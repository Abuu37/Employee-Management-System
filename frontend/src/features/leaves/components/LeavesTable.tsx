import React, { useState } from "react";
import { usePagination } from "@/Hook/usePagination";
import { FiCheck, FiX, FiEye } from "react-icons/fi";
import { useTranslation } from "react-i18next";
import ViewLeaveModal from "./ViewLeaveModal";
import CancelLeaveModal from "./CancelLeaveModal";
import RejectLeaveModal from "./RejectLeaveModal";
import TablePagination from "@/components/common/TablePagination";

export interface Leave {
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
}

interface LeavesTableProps {
  leaves: Leave[];
  isManager: boolean;
  isMyLeaves: boolean;
  onManagerApprove: (leave: Leave) => void;
  onManagerReject: (leave: Leave, comment: string) => void;
  onCancel: (leave: Leave) => void;
  emptyMessage: string;
}

function statusBadge(status: string, t: (key: string) => string) {
  const map: Record<string, string> = {
    pending_manager: "bg-yellow-50 text-yellow-700",
    pending_hr: "bg-yellow-50 text-yellow-700",
    approved: "bg-emerald-50 text-emerald-700",
    rejected_by_manager: "bg-red-50 text-red-600",
    rejected_by_hr: "bg-red-50 text-red-600",
  };
  const labelKey: Record<string, string> = {
    pending_manager: "leaves.statusLabels.pending_manager",
    pending_hr: "leaves.statusLabels.pending_hr",
    approved: "leaves.approved",
    rejected_by_manager: "leaves.statusLabels.rejected_by_manager",
    rejected_by_hr: "leaves.statusLabels.rejected_by_hr",
  };
  return (
    <span
      className={`rounded-full px-2.5 py-1 text-xs font-medium ${map[status] ?? "bg-slate-100 text-slate-600"}`}
    >
      {labelKey[status] ? t(labelKey[status]) : status}
    </span>
  );
}

function LeavesTable({
  leaves,
  isManager,
  isMyLeaves,
  onManagerApprove,
  onManagerReject,
  onCancel,
  emptyMessage,
}: LeavesTableProps) {
  const { t } = useTranslation();
  const {
    page: currentPage,
    setPage: setCurrentPage,
    totalPages,
    paginated,
  } = usePagination(leaves, 8);

  const [selectedLeave, setSelectedLeave] = useState<Leave | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);

  // Reject state
  const [rejectingLeave, setRejectingLeave] = useState<Leave | null>(null);

  // Cancel confirmation state
  const [cancelingLeave, setCancelingLeave] = useState<Leave | null>(null);

  const getDisplayStatus = (leave: Leave) =>
    isManager && isMyLeaves && leave.overallStatus === "pending_manager"
      ? "pending_hr"
      : leave.overallStatus;

  const submitReject = () => {}; // unused — handled by modal

  return (
    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
        <h3 className="text-base font-semibold text-slate-800">
          {isManager && !isMyLeaves
            ? t("leaves.teamLeaveRequests")
            : t("leaves.myLeaves")}
        </h3>
        <div className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
          {leaves.length} {t("leaves.records")}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-500">
            <tr>
              <th className="px-5 py-3 font-medium">S/N</th>
              {isManager && !isMyLeaves && (
                <th className="px-5 py-3 font-medium">
                  {t("leaves.employee")}
                </th>
              )}
              <th className="px-5 py-3 font-medium">{t("leaves.type")}</th>
              <th className="px-5 py-3 font-medium">{t("leaves.startDate")}</th>
              <th className="px-5 py-3 font-medium">{t("leaves.endDate")}</th>
              <th className="px-5 py-3 font-medium">{t("leaves.days")}</th>
              <th className="px-5 py-3 font-medium">{t("leaves.status")}</th>
              <th className="px-5 py-3 font-medium text-right">
                {t("leaves.actions")}
              </th>
            </tr>
          </thead>
          <tbody>
            {paginated.length > 0 ? (
              paginated.map((leave, idx) => (
                <React.Fragment key={leave.id}>
                  <tr className="border-t border-slate-100">
                    <td className="px-5 py-4 font-medium text-slate-600">
                      {(currentPage - 1) * pageSize + idx + 1}
                    </td>
                    {isManager && !isMyLeaves && (
                      <td className="px-5 py-4 text-slate-600">
                        {leave.employeeName ?? "-"}
                      </td>
                    )}
                    <td className="px-5 py-4 font-semibold text-slate-900 capitalize">
                      {leave.type}
                    </td>
                    <td className="px-5 py-4 text-slate-600">
                      {leave.startDate}
                    </td>
                    <td className="px-5 py-4 text-slate-600">
                      {leave.endDate}
                    </td>
                    <td className="px-5 py-4 text-slate-600">{leave.days}</td>
                    <td className="px-5 py-4">
                      {statusBadge(getDisplayStatus(leave), t)}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-2">
                        {/* Manager approves / rejects pending_manager leaves (team view) */}
                        {isManager &&
                          !isMyLeaves &&
                          leave.overallStatus === "pending_manager" && (
                            <>
                              <button
                                type="button"
                                onClick={() => onManagerApprove(leave)}
                                className="inline-flex items-center gap-1 rounded-lg border border-emerald-200 bg-white px-3 py-1.5 text-xs font-medium text-emerald-700 hover:bg-emerald-50 transition"
                              >
                                <FiCheck className="h-4 w-4" />
                                {t("leaves.approve")}
                              </button>
                              <button
                                type="button"
                                onClick={() => setRejectingLeave(leave)}
                                className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 transition"
                              >
                                <FiX className="h-4 w-4" />
                                {t("leaves.reject")}
                              </button>
                            </>
                          )}

                        {/* Cancel button: employee on pending_manager; manager on own pending_manager or pending_hr */}
                        {((leave.overallStatus === "pending_manager" &&
                          (isMyLeaves || !isManager)) ||
                          (isManager &&
                            isMyLeaves &&
                            leave.overallStatus === "pending_hr")) && (
                          <button
                            type="button"
                            onClick={() => setCancelingLeave(leave)}
                            className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 transition"
                          >
                            <FiX className="h-4 w-4" />
                            {t("leaves.cancelLeave")}
                          </button>
                        )}

                        {/* View details for any non-cancellable state */}
                        {leave.overallStatus !== "pending_manager" ||
                        (isManager && !isMyLeaves) ? (
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedLeave(leave);
                              setIsViewOpen(true);
                            }}
                            className="inline-flex items-center gap-1 rounded-lg border border-blue-200 bg-white px-3 py-1.5 text-xs font-medium text-blue-700 hover:bg-blue-50 transition"
                          >
                            <FiEye className="h-4 w-4" />
                            {t("leaves.view")}
                          </button>
                        ) : null}
                      </div>
                    </td>
                  </tr>

                  {/* Inline reject reason row — replaced by RejectLeaveModal */}
                </React.Fragment>
              ))
            ) : (
              <tr>
                <td
                  colSpan={isManager && !isMyLeaves ? 8 : 7}
                  className="px-5 py-10 text-center text-sm text-slate-500"
                >
                  {emptyMessage}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <TablePagination
        page={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />

      <ViewLeaveModal
        isOpen={isViewOpen}
        onClose={() => setIsViewOpen(false)}
        leave={selectedLeave}
      />

      <CancelLeaveModal
        isOpen={cancelingLeave !== null}
        onClose={() => setCancelingLeave(null)}
        onConfirm={() => {
          onCancel(cancelingLeave!);
          setCancelingLeave(null);
        }}
      />

      <RejectLeaveModal
        isOpen={rejectingLeave !== null}
        onClose={() => setRejectingLeave(null)}
        onConfirm={(comment) => {
          onManagerReject(rejectingLeave!, comment);
          setRejectingLeave(null);
        }}
      />
    </section>
  );
}

export type { Leave };
export default LeavesTable;
