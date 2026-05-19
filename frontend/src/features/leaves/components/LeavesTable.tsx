import React, { useState } from "react";
import { usePagination } from "@/hooks/usePagination";
import {
  FiX,
  FiEye,
  FiAlertTriangle,
  FiCheckCircle,
  FiXCircle,
} from "react-icons/fi";
import { useTranslation } from "react-i18next";
import ViewLeaveModal from "./ViewLeaveModal";
import CancelLeaveModal from "./CancelLeaveModal";
import RejectLeaveModal from "./RejectLeaveModal";
import TablePagination from "@/components/common/TablePagination";
import SortArrow from "@/components/common/SortArrow";

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
  onEditRejected?: (leave: Leave) => void;
  onDeleteRequest?: (leave: Leave) => void;
  emptyMessage: string;
  sortBy?: string;
  sortOrder?: "ASC" | "DESC";
  onSort?: (column: string) => void;
}

//============== Status badge config ==============
const statusConfig: Record<string, { color: string; icon: React.ReactNode }> = {
  pending_manager: {
    color: "bg-yellow-50 text-yellow-700 border border-yellow-200",
    icon: <FiAlertTriangle className="shrink-0" />,
  },
  pending_hr: {
    color: "bg-yellow-50 text-yellow-700 border border-yellow-200",
    icon: <FiAlertTriangle className="shrink-0" />,
  },
  approved: {
    color: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    icon: <FiCheckCircle className="shrink-0" />,
  },
  rejected_by_manager: {
    color: "bg-red-50 text-red-600 border border-red-200",
    icon: <FiXCircle className="shrink-0" />,
  },
  rejected_by_hr: {
    color: "bg-red-50 text-red-600 border border-red-200",
    icon: <FiXCircle className="shrink-0" />,
  },
};

//=============== Status label keys for i18n ===============
const statusLabelKey: Record<string, string> = {
  pending_manager: "leaves.statusLabels.pending_manager",
  pending_hr: "leaves.statusLabels.pending_hr",
  approved: "leaves.approved",
  rejected_by_manager: "leaves.statusLabels.rejected_by_manager",
  rejected_by_hr: "leaves.statusLabels.rejected_by_hr",
};

//=============== Helper function to render status badge ===============

function statusBadge(status: string, t: (key: string) => string) {
  const cfg = statusConfig[status] ?? {
    color: "bg-slate-100 text-slate-600 border border-slate-200",
    icon: null,
  };
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${cfg.color}`}
    >
      {cfg.icon}
      {statusLabelKey[status] ? t(statusLabelKey[status]) : status}
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
  onEditRejected,
  onDeleteRequest,
  emptyMessage,
  sortBy = "createdAt",
  sortOrder = "DESC",
  onSort,
}: LeavesTableProps) {
  const { t } = useTranslation();
  const pageSize = 8;
  const {
    page: currentPage,
    setPage: setCurrentPage,
    totalPages,
    paginated,
  } = usePagination(leaves, pageSize);

  const [selectedLeave, setSelectedLeave] = useState<Leave | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [viewApprove, setViewApprove] = useState<(() => void) | undefined>(
    undefined,
  );

  // Reject action for manager approval
  const [viewReject, setViewReject] = useState<(() => void) | undefined>(
    undefined,
  );

  // Edit action for rejected requests
  const [viewEdit, setViewEdit] = useState<(() => void) | undefined>(undefined);

  // Delete action moved from ViewLeaveModal to inline button, so we need to track it here to conditionally show in the modal
  const [viewDelete, setViewDelete] = useState<(() => void) | undefined>(
    undefined,
  );

  // Reject state
  const [rejectingLeave, setRejectingLeave] = useState<Leave | null>(null);

  // Cancel confirmation state
  const [cancelingLeave, setCancelingLeave] = useState<Leave | null>(null);

  // Edit state  // const [editingLeave, setEditingLeave] = useState<Leave | null>(null);
  const getDisplayStatus = (leave: Leave) => {
    if (!(isManager && isMyLeaves)) return leave.overallStatus;
    if (leave.overallStatus === "pending_manager") return "pending_hr";
    if (leave.overallStatus === "rejected_by_manager") return "rejected_by_hr";
    return leave.overallStatus;
  };

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
              <th
                className="px-5 py-3 font-medium cursor-pointer select-none"
                onClick={() => onSort?.("type")}
              >
                {t("leaves.type")}
                <SortArrow
                  column="type"
                  sortBy={sortBy}
                  sortOrder={sortOrder}
                />
              </th>
              <th
                className="px-5 py-3 font-medium cursor-pointer select-none"
                onClick={() => onSort?.("startDate")}
              >
                {t("leaves.startDate")}
                <SortArrow
                  column="startDate"
                  sortBy={sortBy}
                  sortOrder={sortOrder}
                />
              </th>
              <th
                className="px-5 py-3 font-medium cursor-pointer select-none"
                onClick={() => onSort?.("endDate")}
              >
                {t("leaves.endDate")}
                <SortArrow
                  column="endDate"
                  sortBy={sortBy}
                  sortOrder={sortOrder}
                />
              </th>
              <th
                className="px-5 py-3 font-medium cursor-pointer select-none"
                onClick={() => onSort?.("days")}
              >
                {t("leaves.days")}
                <SortArrow
                  column="days"
                  sortBy={sortBy}
                  sortOrder={sortOrder}
                />
              </th>
              <th
                className="px-5 py-3 font-medium cursor-pointer select-none"
                onClick={() => onSort?.("overallStatus")}
              >
                {t("leaves.status")}
                <SortArrow
                  column="overallStatus"
                  sortBy={sortBy}
                  sortOrder={sortOrder}
                />
              </th>
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

                        {/* View always available � approve/reject inside the panel */}
                        <button
                          type="button"
                          onClick={() => {
                            const isRejected =
                              leave.overallStatus.startsWith("rejected");
                            const canAct =
                              isManager &&
                              !isMyLeaves &&
                              leave.overallStatus === "pending_manager";
                            const canEditRejected =
                              Boolean(onEditRejected) &&
                              ((isManager &&
                                isMyLeaves &&
                                leave.overallStatus === "rejected_by_hr") ||
                                (isManager && !isMyLeaves && isRejected));
                            const canDeleteRequest =
                              Boolean(onDeleteRequest) &&
                              ((isMyLeaves && isRejected) ||
                                (isManager && !isMyLeaves && isRejected));
                            setSelectedLeave(leave);
                            setViewApprove(
                              canAct
                                ? () => () => onManagerApprove(leave)
                                : undefined,
                            );
                            setViewReject(
                              canAct
                                ? () => () => setRejectingLeave(leave)
                                : undefined,
                            );
                            setViewEdit(
                              canEditRejected
                                ? () => () => onEditRejected?.(leave)
                                : undefined,
                            );
                            setViewDelete(
                              canDeleteRequest
                                ? () => () => onDeleteRequest?.(leave)
                                : undefined,
                            );
                            setIsViewOpen(true);
                          }}
                          className="inline-flex items-center gap-1 rounded-lg border border-blue-200 bg-white px-3 py-1.5 text-xs font-medium text-blue-700 hover:bg-blue-50 transition"
                        >
                          <FiEye className="h-4 w-4" />
                          {t("leaves.view")}
                        </button>
                      </div>
                    </td>
                  </tr>

                  {/* Inline reject reason row � replaced by RejectLeaveModal */}
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
        onApprove={viewApprove}
        onReject={viewReject}
        onEdit={viewEdit}
        onDelete={viewDelete}
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
