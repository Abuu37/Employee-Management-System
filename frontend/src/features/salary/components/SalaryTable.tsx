import { useState } from "react";
import { FiEdit2, FiPlus, FiTrash2, FiDollarSign } from "react-icons/fi";
import { useTranslation } from "react-i18next";
import type { SalaryRecord } from "@/services/salary.service";

const PAGE_SIZE = 8;

interface SalaryTableProps {
  data: SalaryRecord[];
  onAdd: () => void;
  onEdit: (record: SalaryRecord) => void;
  onDelete: (record: SalaryRecord) => void;
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
}: SalaryTableProps) {
  const [page, setPage] = useState(1);
  const { t } = useTranslation();
  const totalPages = Math.max(1, Math.ceil(data.length / PAGE_SIZE));
  const paginated = data.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
        <h3 className="text-base font-semibold text-slate-800">
          {t("salary.allRecords")}
        </h3>
        <div className="flex items-center gap-3">
          <div className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
            {data.length} {t("salary.records")}
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-500">
            <tr>
              <th className="px-5 py-3 font-medium">S/N</th>
              <th className="px-5 py-3 font-medium">{t("salary.employee")}</th>
              <th className="px-5 py-3 font-medium">
                {t("salary.baseSalary")}
              </th>
              <th className="px-5 py-3 font-medium">{t("salary.bonus")}</th>
              <th className="px-5 py-3 font-medium">{t("salary.allowance")}</th>
              <th className="px-5 py-3 font-medium">
                {t("salary.tax")}&nbsp;%
              </th>
              <th className="px-5 py-3 font-medium">{t("salary.gross")}</th>
              <th className="px-5 py-3 font-medium">{t("salary.netPay")}</th>
              <th className="px-5 py-3 font-medium">
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
                    <div>
                      <span className="font-medium text-slate-900">
                        {item.user?.name ?? `User #${item.user_id}`}
                      </span>
                      {item.user?.email && (
                        <p className="text-xs text-slate-400">
                          {item.user.email}
                        </p>
                      )}
                    </div>
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
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => onEdit(item)}
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-100"
                      >
                        <FiEdit2 className="h-3.5 w-3.5" />
                        {t("common.edit", { defaultValue: "Edit" })}
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(item)}
                        className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-500 transition hover:text-white"
                      >
                        <FiTrash2 className="h-3.5 w-3.5" />
                        {t("common.delete", { defaultValue: "Delete" })}
                      </button>
                    </div>
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
      {/* Pagination */}
      <div className="flex items-center justify-end gap-3 border-t border-slate-200 px-5 py-4">
        <button
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1}
          className="rounded-lg border border-slate-300 bg-white px-3 py-1 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:bg-slate-100"
        >
          {t("salary.previous")}
        </button>
        <button
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          disabled={page === totalPages}
          className="rounded-lg border border-slate-300 bg-white px-3 py-1 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:bg-slate-100"
        >
          {t("salary.next")}
        </button>
      </div>
    </section>
  );
}
