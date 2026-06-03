import { usePagination } from "@/hooks/usePagination";
import toast from "react-hot-toast";
import { FiPlus, FiEye, FiCreditCard, FiCheckCircle } from "react-icons/fi";
import { useTranslation } from "react-i18next";
import { approvePayroll, markAsPaid } from "../services/payroll.service";
import { useUser } from "@/context/UserContext";
import ActionMenu from "@/components/common/ActionMenu";
import TablePagination from "@/components/common/TablePagination";
import SortArrow from "@/components/common/SortArrow";
import {
  TABLE_HEADER_CELL_CLASS,
  useTableCountBadge,
} from "@/hooks/useTableCountBadge";
import TableCountBadge from "@/components/common/TableCountBadge";
const PAGE_SIZE = 8;

interface PayrollRecord {
  id: number;
  user_id: number;
  month: number;
  year: number;
  base_salary: string;
  bonus: string;
  allowance: string;
  deductions: string;
  tax: string;
  net_salary: string;
  status: "pending" | "approved" | "paid";
  user?: { id: number; name: string; email: string };
}

const statusClass: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700",
  approved: "bg-blue-50 text-blue-700",
  paid: "bg-emerald-50 text-emerald-700",
};

const monthNames = [
  "",
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export default function PayrollTable({
  data,
  onRefresh,
  onAdd,
  onView,
  sortBy = "created_at",
  sortOrder = "DESC",
  onSort,
}: {
  data: PayrollRecord[];
  onRefresh: () => void;
  onAdd: () => void;
  onView?: (record: PayrollRecord) => void;
  sortBy?: string;
  sortOrder?: "ASC" | "DESC";
  onSort?: (column: string) => void;
}) {
  //==============  handle approve and mark as paid actions ===================
  const handleApprove = async (id: number) => {
    try {
      await approvePayroll(id);
      toast.success("Payroll approved");
      onRefresh();
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Failed to approve payroll");
    }
  };

  //==============  handle approve and mark as paid actions ===================
  const handlePay = async (id: number) => {
    try {
      await markAsPaid(id);
      toast.success("Payroll marked as paid");
      onRefresh();
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Failed to mark as paid");
    }
  };

  const { user } = useUser(); // for role-based action buttons
  const { t } = useTranslation(); // for translations
  const { count } = useTableCountBadge({ total: data.length });
  const { page, setPage, totalPages, paginated } = usePagination(
    data,
    PAGE_SIZE,
  ); // pagination logic

  return (
    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
        <h3 className="text-base font-semibold text-slate-800">
          {t("payroll.title")}
        </h3>
        <div className="flex items-center gap-3">
          <TableCountBadge count={count} />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-[#1e3a5f] text-blue-100">
            <tr>
              <th className={TABLE_HEADER_CELL_CLASS}>S/N</th>
              <th className={TABLE_HEADER_CELL_CLASS}>
                {t("payroll.employee")}
              </th>
              <th
                className={`${TABLE_HEADER_CELL_CLASS} cursor-pointer select-none`}
                onClick={() => onSort?.("year")}
              >
                {t("payroll.period")}
                <SortArrow
                  column="year"
                  sortBy={sortBy}
                  sortOrder={sortOrder}
                />
              </th>
              <th
                className={`${TABLE_HEADER_CELL_CLASS} cursor-pointer select-none`}
                onClick={() => onSort?.("base_salary")}
              >
                {t("payroll.baseSalary")}
                <SortArrow
                  column="base_salary"
                  sortBy={sortBy}
                  sortOrder={sortOrder}
                />
              </th>
              <th className={TABLE_HEADER_CELL_CLASS}>{t("payroll.bonus")}</th>
              <th className={TABLE_HEADER_CELL_CLASS}>
                {t("payroll.allowance")}
              </th>
              <th className={TABLE_HEADER_CELL_CLASS}>
                {t("payroll.deductions")}
              </th>
              <th className={TABLE_HEADER_CELL_CLASS}>{t("payroll.tax")}</th>
              <th
                className={`${TABLE_HEADER_CELL_CLASS} cursor-pointer select-none`}
                onClick={() => onSort?.("net_salary")}
              >
                {t("payroll.netPay")}
                <SortArrow
                  column="net_salary"
                  sortBy={sortBy}
                  sortOrder={sortOrder}
                />
              </th>
              <th
                className={`${TABLE_HEADER_CELL_CLASS} cursor-pointer select-none`}
                onClick={() => onSort?.("status")}
              >
                {t("payroll.status")}
                <SortArrow
                  column="status"
                  sortBy={sortBy}
                  sortOrder={sortOrder}
                />
              </th>
              <th className={`${TABLE_HEADER_CELL_CLASS} text-center`}>
                {t("payroll.actions")}
              </th>
            </tr>
          </thead>

          <tbody>
            {data.length > 0 ? (
              paginated.map((item, idx) => (
                <tr key={item.id} className="border-t border-slate-100">
                  <td className="px-5 py-4 font-semibold text-slate-900">
                    {(page - 1) * PAGE_SIZE + idx + 1}
                  </td>
                  <td className="px-5 py-4 text-slate-600">
                    <span className="font-medium text-slate-900">
                      {item.user?.name ?? `User #${item.user_id}`}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-slate-600">
                    {monthNames[item.month]} {item.year}
                  </td>
                  <td className="px-5 py-4 text-slate-600">
                    {Number(item.base_salary).toFixed(2)}
                  </td>
                  <td className="px-5 py-4 text-slate-600">
                    {Number(item.bonus).toFixed(2)}
                  </td>
                  <td className="px-5 py-4 text-slate-600">
                    {Number(item.allowance).toFixed(2)}
                  </td>
                  <td className="px-5 py-4 text-slate-600">
                    {Number(item.deductions).toFixed(2)}
                  </td>
                  <td className="px-5 py-4 text-slate-600">
                    {Number(item.tax).toFixed(2)}
                  </td>
                  <td className="px-5 py-4 font-bold text-green-600">
                    {Number(item.net_salary).toFixed(2)}
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${statusClass[item.status]}`}
                    >
                      {item.status}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <ActionMenu
                      ariaLabel="Payroll actions"
                      align="center"
                      items={[
                        {
                          label: t("payroll.approve"),
                          icon: FiCheckCircle,
                          onClick: () => handleApprove(item.id),
                          hidden:
                            item.status !== "pending" ||
                            !(
                              user?.role === "manager" || user?.role === "admin"
                            ),
                        },
                        {
                          label: t("payroll.markPaid"),
                          icon: FiCreditCard,
                          onClick: () => handlePay(item.id),
                          hidden:
                            item.status !== "approved" ||
                            user?.role !== "admin",
                        },
                        {
                          label: t("payroll.view"),
                          icon: FiEye,
                          onClick: () => onView?.(item),
                          hidden: item.status !== "paid" || !onView,
                        },
                      ]}
                    />
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={11} className="px-5 py-16 text-center">
                  <div className="flex flex-col items-center justify-center text-slate-400">
                    <FiCreditCard className="h-12 w-12 mb-3 opacity-30" />
                    <p className="text-sm">{t("payroll.noRecords")}</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <TablePagination
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
        totalRecords={data.length}
        pageSize={PAGE_SIZE}
      />
    </section>
  );
}



