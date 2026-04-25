import { useState, useEffect } from "react";
import Sidebar from "@/layouts/Sidebar";
import Header from "@/layouts/Header";
import ViewPayslipModal from "@/features/payslip/components/ViewPayslipModal";
import { getMyPayslips } from "@/services/payroll.service";
import { FiFileText } from "react-icons/fi";
import { FiEye } from "react-icons/fi";

const monthNames = [
  "",
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const statusClass: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700",
  approved: "bg-blue-50 text-blue-700",
  paid: "bg-emerald-50 text-emerald-700",
};

const PAGE_SIZE = 8;

export default function MyPayslipPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<any | null>(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    getMyPayslips()
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />

      <main className="flex-1 flex flex-col overflow-auto">
        <Header searchTerm="" onSearchChange={() => {}} />

        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center p-10 text-slate-500">
              Loading...
            </div>
          ) : (
            <div className="space-y-6">
              <h1 className="text-2xl font-bold text-slate-900">My Payslips</h1>

              {data.length === 0 ? (
                <p className="text-sm text-slate-500">No payslips found</p>
              ) : (
                <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-left text-sm">
                      <thead className="bg-slate-50 text-slate-500">
                        <tr>
                          <th className="px-5 py-3 font-medium">S/N</th>
                          <th className="px-5 py-3 font-medium">Period</th>
                          <th className="px-5 py-3 font-medium">Gross</th>
                          <th className="px-5 py-3 font-medium">Deductions</th>
                          <th className="px-5 py-3 font-medium">Net Pay</th>
                          <th className="px-5 py-3 font-medium">Status</th>
                          <th className="px-5 py-3 font-medium">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data
                          .slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
                          .map((slip, idx) => {
                            const gross =
                              Number(slip.base_salary) +
                              Number(slip.bonus) +
                              Number(slip.allowance);
                            return (
                              <tr
                                key={slip.id}
                                className="border-t border-slate-100"
                              >
                                <td className="px-5 py-4 font-semibold text-slate-900">
                                  {(page - 1) * PAGE_SIZE + idx + 1}
                                </td>
                                <td className="px-5 py-4 text-slate-600">
                                  {monthNames[slip.month]} {slip.year}
                                </td>
                                <td className="px-5 py-4 text-slate-600">
                                  {gross.toLocaleString("en-US", {
                                    minimumFractionDigits: 2,
                                  })}
                                </td>
                                <td className="px-5 py-4 text-red-500">
                                  {Number(slip.deductions).toLocaleString(
                                    "en-US",
                                    {
                                      minimumFractionDigits: 2,
                                    },
                                  )}
                                </td>
                                <td className="px-5 py-4 font-bold text-green-600">
                                  {Number(slip.net_salary).toLocaleString(
                                    "en-US",
                                    {
                                      minimumFractionDigits: 2,
                                    },
                                  )}
                                </td>
                                <td className="px-5 py-4">
                                  <span
                                    className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${statusClass[slip.status]}`}
                                  >
                                    {slip.status}
                                  </span>
                                </td>
                                <td className="px-5 py-4">
                                  <button
                                    type="button"
                                    onClick={() => setSelected(slip)}
                                    className="inline-flex items-center gap-1 rounded-lg border border-blue-200
                                bg-white px-3 py-1.5 text-xs font-medium text-blue-700 transition
                                hover:bg-blue-500 hover:text-white"
                                  >
                                    <FiEye className="h-4 w-4" />
                                    View
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                      </tbody>
                    </table>
                  </div>
                  {data.length > PAGE_SIZE && (
                    <div className="flex items-center justify-end gap-3 border-t border-slate-200 px-5 py-4">
                      <button
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="rounded-lg border border-slate-300 bg-white px-3 py-1 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:bg-slate-100"
                      >
                        Previous
                      </button>
                      <button
                        onClick={() =>
                          setPage((p) =>
                            Math.min(Math.ceil(data.length / PAGE_SIZE), p + 1),
                          )
                        }
                        disabled={page === Math.ceil(data.length / PAGE_SIZE)}
                        className="rounded-lg border border-slate-300 bg-white px-3 py-1 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:bg-slate-100"
                      >
                        Next
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          <ViewPayslipModal
            isOpen={!!selected}
            onClose={() => setSelected(null)}
            data={selected}
          />
        </div>
      </main>
    </div>
  );
}
