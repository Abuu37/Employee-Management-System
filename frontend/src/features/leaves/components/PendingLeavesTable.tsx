import React from "react";
import { usePagination } from "@/hooks/usePagination";
import { FiCheck, FiX } from "react-icons/fi";
import { useTranslation } from "react-i18next";
import ActionMenu from "@/components/common/ActionMenu";
import TablePagination from "@/components/common/TablePagination";
import { richTextToPlainText } from "@/utils/richText";
import {
  TABLE_HEADER_CELL_CLASS,
  useTableCountBadge,
} from "@/hooks/useTableCountBadge";
import TableCountBadge from "@/components/common/TableCountBadge";
const PAGE_SIZE = 8;

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
}) => {
  const { t } = useTranslation();
  const { count } = useTableCountBadge({ total: leaves.length });
  const { page, setPage, totalPages, paginated } = usePagination(
    leaves,
    PAGE_SIZE,
  );

  return (
    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
        <h3 className="text-lg font-semibold text-slate-900">
          {t("leaves.pendingApprovals")}
        </h3>
        <TableCountBadge count={count} />
      </div>
      <table className="min-w-full text-left text-sm">
        <thead className="bg-[#1e3a5f] text-blue-100">
          <tr>
            <th className={TABLE_HEADER_CELL_CLASS}>S/N</th>
            <th className={TABLE_HEADER_CELL_CLASS}>
              {t("leaves.managerName")}
            </th>
            <th className={TABLE_HEADER_CELL_CLASS}>{t("leaves.type")}</th>
            <th className={TABLE_HEADER_CELL_CLASS}>{t("leaves.startDate")}</th>
            <th className={TABLE_HEADER_CELL_CLASS}>{t("leaves.endDate")}</th>
            <th className={TABLE_HEADER_CELL_CLASS}>{t("leaves.days")}</th>
            <th className={TABLE_HEADER_CELL_CLASS}>{t("leaves.reason")}</th>
            <th className={TABLE_HEADER_CELL_CLASS}>{t("leaves.status")}</th>
            <th className={`${TABLE_HEADER_CELL_CLASS} text-center`}>
              {t("leaves.actions")}
            </th>
          </tr>
        </thead>
        <tbody>
          {paginated.length > 0 ? (
            paginated.map((leave, idx) => (
              <tr key={leave.id} className="border-t border-slate-100">
                <td className="px-5 py-4 font-medium text-slate-600">
                  {(page - 1) * PAGE_SIZE + idx + 1}
                </td>
                <td className="px-5 py-4 text-slate-600">
                  {leave.managerName}
                </td>
                <td className="px-5 py-4 font-semibold text-slate-900">
                  {leave.type}
                </td>
                <td className="px-5 py-4 text-slate-600">{leave.startDate}</td>
                <td className="px-5 py-4 text-slate-600">{leave.endDate}</td>
                <td className="px-5 py-4 text-slate-600">{leave.days}</td>
                <td className="px-5 py-4 text-slate-600">
                  {richTextToPlainText(leave.reason) || "-"}
                </td>
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
                <td className="px-5 py-4">
                  <ActionMenu
                    ariaLabel="Pending leave actions"
                    align="center"
                    items={[
                      {
                        label: t("leaves.approve"),
                        icon: FiCheck,
                        onClick: () => onApprove(leave),
                      },
                      {
                        label: t("leaves.reject"),
                        icon: FiX,
                        danger: true,
                        onClick: () => onReject(leave),
                      },
                    ]}
                  />
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td
                colSpan={9}
                className="px-5 py-10 text-center text-sm text-slate-500"
              >
                {t("leaves.noPending")}
              </td>
            </tr>
          )}
        </tbody>
      </table>
      <TablePagination
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
        totalRecords={leaves.length}
        pageSize={PAGE_SIZE}
      />
    </section>
  );
};

export default PendingLeavesTable;



