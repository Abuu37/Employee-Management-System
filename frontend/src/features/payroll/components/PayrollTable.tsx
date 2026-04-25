import { useState } from "react";
import { FiPlus, FiEye } from "react-icons/fi";
import { approvePayroll, markAsPaid } from "@/services/payroll.service";

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
}: {
  data: PayrollRecord[];
  onRefresh: () => void;
  onAdd: () => void;
  onView?: (record: PayrollRecord) => void;
}) {
  const handleApprove = async (id: number) => {
    await approvePayroll(id);
    onRefresh();
  };

  const handlePay = async (id: number) => {
    await markAsPaid(id);
    onRefresh();
  };

  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(data.length / PAGE_SIZE));
  const paginated = data.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
        <h3 className="text-lg font-semibold text-slate-900">Payroll</h3>
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
            Generate Payroll
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-500">
            <tr>
              <th className="px-5 py-3 font-medium">S/N</th>
              <th className="px-5 py-3 font-medium">Employee</th>
              <th className="px-5 py-3 font-medium">Period</th>
              <th className="px-5 py-3 font-medium">Base Salary</th>
              <th className="px-5 py-3 font-medium">Bonus</th>
              <th className="px-5 py-3 font-medium">Allowance</th>
              <th className="px-5 py-3 font-medium">Deductions</th>
              <th className="px-5 py-3 font-medium">Tax</th>
              <th className="px-5 py-3 font-medium">Net Pay</th>
              <th className="px-5 py-3 font-medium">Status</th>
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
                      <p className="text-xs text-slate-400">
                        ID: {item.user_id}
                      </p>
                    </div>
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
                    <div className="flex items-center gap-2">
                      {item.status === "pending" && (
                        <button
                          type="button"
                          onClick={() => handleApprove(item.id)}
                          className="rounded-lg border border-blue-200 bg-white px-3 py-1.5 text-xs font-medium text-blue-700 transition hover:bg-blue-500 hover:text-white"
                        >
                          Approve
                        </button>
                      )}
                      {item.status === "approved" && (
                        <button
                          type="button"
                          onClick={() => handlePay(item.id)}
                          className="rounded-lg border border-emerald-200 bg-white px-3 py-1.5 text-xs font-medium text-emerald-700 transition hover:bg-emerald-500 hover:text-white"
                        >
                          Mark Paid
                        </button>
                      )}
                      {item.status === "paid" && onView && (
                        <button
                          type="button"
                          onClick={() => onView(item)}
                          className="inline-flex items-center gap-1 rounded-lg border border-blue-200 bg-white px-3 py-1.5 text-xs font-medium text-blue-700 transition hover:bg-blue-500 hover:text-white"
                        >
                          <FiEye className="h-3.5 w-3.5" />
                          View
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={11}
                  className="px-5 py-10 text-center text-sm text-slate-500"
                >
                  No payroll records found
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
