import React, { useState } from "react";
import { usePagination } from "@/Hook/usePagination";
import { FiEye, FiCheck, FiX, FiCalendar } from "react-icons/fi";
import { useTranslation } from "react-i18next";
import ViewLeaveModal from "./ViewLeaveModal";
import RejectLeaveModal from "./RejectLeaveModal";
import TablePagination from "@/components/common/TablePagination";

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

const AllLeavesTable: React.FC<AllLeavesTableProps> = ({
  leaves,
  tab,
  onHrApprove,
  onHrReject,
}) => {
  const { t } = useTranslation();
  const {
    page: currentPage,
    setPage: setCurrentPage,
    totalPages,
    paginated,
  } = usePagination(leaves, 8);

  const [selectedLeave, setSelectedLeave] = useState<Leave | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);

  // HR reject modal state
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
              <th className="px-5 py-3 font-medium">{t("leaves.type")}</th>
              <th className="px-5 py-3 font-medium">{t("leaves.startDate")}</th>
              <th className="px-5 py-3 font-medium">{t("leaves.endDate")}</th>
              <th className="px-5 py-3 font-medium">{t("leaves.days")}</th>
              <th className="px-5 py-3 font-medium">
                {t("leaves.backupPerson")}
              </th>
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
                          leave.overallStatus === "pending_manager"
                          ? "pending_hr"
                          : leave.overallStatus,
                        t,
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-2">
                        {/* HR approve / reject on pending_hr tab or manager tab with pending_hr status */}
                        {((tab === "hr_pending" &&
                          leave.overallStatus === "pending_hr") ||
                          (tab === "manager" &&
                            (leave.overallStatus === "pending_hr" ||
                              leave.overallStatus === "pending_manager"))) && (
                          <>
                            <button
                              type="button"
                              onClick={() => onHrApprove(leave)}
                              className="inline-flex items-center gap-1 rounded-lg border border-emerald-200 bg-white px-3 py-1.5 text-xs font-medium text-emerald-700 hover:bg-emerald-500 transition hover:text-white"
                            >
                              <FiCheck className="h-4 w-4" />
                              {t("leaves.approve")}
                            </button>
                            <button
                              type="button"
                              onClick={() => setRejectingLeave(leave)}
                              className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-500 transition hover:text-white"
                            >
                              <FiX className="h-4 w-4" />
                              {t("leaves.reject")}
                            </button>
                          </>
                        )}

                        {/* View always available */}
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedLeave(leave);
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
