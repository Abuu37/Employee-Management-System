import { useState } from "react";
import { FiEdit2, FiPlus, FiTrash2 } from "react-icons/fi";
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
  const totalPages = Math.max(1, Math.ceil(data.length / PAGE_SIZE));
  const paginated = data.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
        <h3 className="text-lg font-semibold text-slate-900">Salary</h3>
        <div className="flex items-center gap-3">
          <div className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
            {data.length} records
          </div>
          <button
            type="button"
            onClick={onAdd}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
          >
            <FiPlus className="h-4 w-4" />
            Set Salary
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-500">
            <tr>
              <th className="px-5 py-3 font-medium">S/N</th>
              <th className="px-5 py-3 font-medium">Employee</th>
              <th className="px-5 py-3 font-medium">Base Salary</th>
              <th className="px-5 py-3 font-medium">Bonus</th>
              <th className="px-5 py-3 font-medium">Allowance</th>
              <th className="px-5 py-3 font-medium">Tax %</th>
              <th className="px-5 py-3 font-medium">Gross</th>
              <th className="px-5 py-3 font-medium">Net Pay</th>
              <th className="px-5 py-3 font-medium">Actions</th>
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
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(item)}
                        className="inline-flex items-center gap-1 rounded-lg border border-red-100 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-100"
                      >
                        <FiTrash2 className="h-3.5 w-3.5" />
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={9}
                  className="px-5 py-10 text-center text-sm text-slate-500"
                >
                  No salary records found
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
          Previous
        </button>
        <button
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          disabled={page === totalPages}
          className="rounded-lg border border-slate-300 bg-white px-3 py-1 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:bg-slate-100"
        >
          Next
        </button>
      </div>
    </section>
  );
}
