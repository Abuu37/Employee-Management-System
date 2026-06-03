import { usePagination } from "@/hooks/usePagination";
import { FiEdit2, FiPlus, FiTrash2, FiDollarSign } from "react-icons/fi";
import { useTranslation } from "react-i18next";
import type { SalaryRecord } from "../services/salary.service";
import ActionMenu from "@/components/common/ActionMenu";
import TablePagination from "@/components/common/TablePagination";
import SortArrow from "@/components/common/SortArrow";
import {
  TABLE_HEADER_CELL_CLASS,
  useTableCountBadge,
} from "@/hooks/useTableCountBadge";
import TableCountBadge from "@/components/common/TableCountBadge";
const PAGE_SIZE = 8;

interface SalaryTableProps {
  data: SalaryRecord[];
  onAdd: () => void;
  onEdit: (record: SalaryRecord) => void;
  onDelete: (record: SalaryRecord) => void;
  sortBy?: string;
  sortOrder?: "ASC" | "DESC";
  onSort?: (column: string) => void;
}

const computeGross = (r: SalaryRecord) =>
  Number(r.base_salary) + Number(r.bonus) + Number(r.allowance);

const computeNet = (r: SalaryRecord) => {
  const gross = computeGross(r);
  const tax = (gross * Number(r.tax_percentage)) / 100;
  return gross - tax;
};

export default function SalaryTable({
  data,
  onAdd,
  onEdit,
  onDelete,
  sortBy = "created_at",
  sortOrder = "DESC",
  onSort,
}: SalaryTableProps) {
  const { t } = useTranslation();
  const { page, setPage, totalPages, paginated } = usePagination(
    data,
    PAGE_SIZE,
  );
  const { count } = useTableCountBadge({ total: data.length });

  return (
    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
        <h3 className="text-base font-semibold text-slate-800">
          {t("salary.allRecords")}
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
                {t("salary.employee")}
              </th>
              <th
                className={`${TABLE_HEADER_CELL_CLASS} cursor-pointer select-none`}
                onClick={() => onSort?.("base_salary")}
              >
                {t("salary.baseSalary")}
                <SortArrow
                  column="base_salary"
                  sortBy={sortBy}
                  sortOrder={sortOrder}
                />
              </th>
              <th
                className={`${TABLE_HEADER_CELL_CLASS} cursor-pointer select-none`}
                onClick={() => onSort?.("bonus")}
              >
                {t("salary.bonus")}
                <SortArrow
                  column="bonus"
                  sortBy={sortBy}
                  sortOrder={sortOrder}
                />
              </th>
              <th
                className={`${TABLE_HEADER_CELL_CLASS} cursor-pointer select-none`}
                onClick={() => onSort?.("allowance")}
              >
                {t("salary.allowance")}
                <SortArrow
                  column="allowance"
                  sortBy={sortBy}
                  sortOrder={sortOrder}
                />
              </th>
              <th
                className={`${TABLE_HEADER_CELL_CLASS} cursor-pointer select-none`}
                onClick={() => onSort?.("tax_percentage")}
              >
                {t("salary.tax")}&nbsp;%
                <SortArrow
                  column="tax_percentage"
                  sortBy={sortBy}
                  sortOrder={sortOrder}
                />
              </th>
              <th className={TABLE_HEADER_CELL_CLASS}>{t("salary.gross")}</th>
              <th className={TABLE_HEADER_CELL_CLASS}>{t("salary.netPay")}</th>
              <th className={`${TABLE_HEADER_CELL_CLASS} text-center`}>
                {t("common.actions", { defaultValue: "Actions" })}
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
                    {Number(item.base_salary).toFixed(2)}
                  </td>
                  <td className="px-5 py-4 text-slate-600">
                    {Number(item.bonus).toFixed(2)}
                  </td>
                  <td className="px-5 py-4 text-slate-600">
                    {Number(item.allowance).toFixed(2)}
                  </td>
                  <td className="px-5 py-4 text-slate-600">
                    {Number(item.tax_percentage).toFixed(2)}%
                  </td>
                  <td className="px-5 py-4 text-slate-600">
                    {computeGross(item).toFixed(2)}
                  </td>
                  <td className="px-5 py-4 font-bold text-green-600">
                    {computeNet(item).toFixed(2)}
                  </td>
                  <td className="px-5 py-4">
                    <ActionMenu
                      ariaLabel="Salary actions"
                      align="center"
                      items={[
                        {
                          label: t("common.edit", { defaultValue: "Edit" }),
                          icon: FiEdit2,
                          onClick: () => onEdit(item),
                        },
                        {
                          label: t("common.delete", { defaultValue: "Delete" }),
                          icon: FiTrash2,
                          danger: true,
                          onClick: () => onDelete(item),
                        },
                      ]}
                    />
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={9} className="px-5 py-16 text-center">
                  <div className="flex flex-col items-center justify-center text-slate-400">
                    <FiDollarSign className="h-12 w-12 mb-3 opacity-30" />
                    <p className="text-sm">{t("salary.noRecords")}</p>
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



