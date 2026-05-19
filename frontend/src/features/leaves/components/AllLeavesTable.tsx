import React, { useState } from "react";
import { usePagination } from "@/hooks/usePagination";
import {
  FiEye,
  FiCalendar,
  FiAlertTriangle,
  FiCheckCircle,
  FiXCircle,
} from "react-icons/fi";
import { useTranslation } from "react-i18next";
import ViewLeaveModal from "./ViewLeaveModal";
import RejectLeaveModal from "./RejectLeaveModal";
import TablePagination from "@/components/common/TablePagination";
import SortArrow from "@/components/common/SortArrow";

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
  userRole?: string;
}

interface AllLeavesTableProps {
  leaves: Leave[];
  tab: "hr_pending" | "all" | "manager";
  onHrApprove: (leave: Leave) => void;
  onHrReject: (leave: Leave, comment: string) => void;
  sortBy?: string;
  sortOrder?: "ASC" | "DESC";
  onSort?: (column: string) => void;
}

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
  rejected: {
    color: "bg-red-50 text-red-600 border border-red-200",
    icon: <FiXCircle className="shrink-0" />,
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

const statusLabelKey: Record<string, string> = {
  pending_manager: "leaves.statusLabels.pending_manager",
  pending_hr: "leaves.statusLabels.pending_hr",
  approved: "leaves.approved",
  rejected: "leaves.rejected",
  rejected_by_manager: "leaves.statusLabels.rejected_by_manager",
  rejected_by_hr: "leaves.statusLabels.rejected_by_hr",
};

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

const AllLeavesTable: React.FC<AllLeavesTableProps> = ({
  leaves,
  tab,
  onHrApprove,
  onHrReject,
  sortBy = "createdAt",
  sortOrder = "DESC",
  onSort,
}) => {
  const { t } = useTranslation();
  const PAGE_SIZE = 8;
  const {
    page: currentPage,
    setPage: setCurrentPage,
    totalPages,
    paginated,
  } = usePagination(leaves, PAGE_SIZE);

  const [selectedLeave, setSelectedLeave] = useState<Leave | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [viewApprove, setViewApprove] = useState<(() => void) | undefined>(
    undefined,
  );
  const [viewReject, setViewReject] = useState<(() => void) | undefined>(
    undefined,
  );

  // Reject modal state
  const [rejectingLeave, setRejectingLeave] = useState<Leave | null>(null);

  const tableTitle =
    tab === "hr_pending"
      ? t("leaves.pendingHRApproval")
      : tab === "manager"
        ? t("leaves.managerLeaveRequests")
        : t("leaves.allLeaveRequests");

  return (
    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
        <h3 className="text-base font-semibold text-slate-800">{tableTitle}</h3>
        <div className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
          {leaves.length} {t("leaves.records")}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-500">
            <tr>
              <th className="px-5 py-3 font-medium">S/N</th>
              <th className="px-5 py-3 font-medium">{t("leaves.employee")}</th>
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
              <th className="px-5 py-3 font-medium">
                {t("leaves.backupPerson")}
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
                      {(currentPage - 1) * PAGE_SIZE + idx + 1}
                    </td>
                    <td className="px-5 py-4 text-slate-600">
                      {leave.employeeName ?? "-"}
                    </td>
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
                    <td className="px-5 py-4 text-slate-600">
                      {leave.backupEmployeeName ?? "-"}
                    </td>
                    <td className="px-5 py-4">
                      {statusBadge(
                        tab === "manager" &&
                          leave.overallStatus.startsWith("rejected")
                          ? "rejected"
                          : leave.overallStatus,
                        t,
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-2">
                        {/* View opens the slide panel with approve/reject inside */}
                        <button
                          type="button"
                          onClick={() => {
                            // Both tabs: HR approves/rejects only when status is pending_hr
                            const canAct = leave.overallStatus === "pending_hr";

                            setSelectedLeave(leave);
                            setViewApprove(
                              canAct
                                ? () => () => onHrApprove(leave)
                                : undefined,
                            );
                            setViewReject(
                              canAct
                                ? () => () => setRejectingLeave(leave)
                                : undefined,
                            );
                            setIsViewOpen(true);
                          }}
                          className="inline-flex items-center gap-1 rounded-lg border border-blue-200 bg-white px-3 py-1.5 text-xs font-medium text-blue-700 hover:bg-blue-500 transition hover:text-white"
                        >
                          <FiEye className="h-4 w-4" />
                          {t("leaves.view")}
                        </button>
                      </div>
                    </td>
                  </tr>

                  {/* Reject handled by RejectLeaveModal */}
                </React.Fragment>
              ))
            ) : (
              <tr>
                <td colSpan={9} className="px-5 py-16 text-center">
                  <div className="flex flex-col items-center justify-center text-slate-400">
                    <FiCalendar className="h-12 w-12 mb-3 opacity-30" />
                    <p className="text-sm">{t("leaves.noRecords")}</p>
                  </div>
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
      />

      <RejectLeaveModal
        isOpen={rejectingLeave !== null}
        onClose={() => setRejectingLeave(null)}
        onConfirm={(comment) => {
          onHrReject(rejectingLeave!, comment);
          setRejectingLeave(null);
        }}
      />
    </section>
  );
};

export type { Leave as AllLeave };
export default AllLeavesTable;
