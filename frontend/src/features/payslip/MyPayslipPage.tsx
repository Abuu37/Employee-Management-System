import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import Sidebar from "@/layouts/Sidebar";
import Header from "@/layouts/Header";
import ViewPayslipModal from "@/features/payslip/components/ViewPayslipModal";
import { useTranslation } from "react-i18next";
import { getMyPayslips } from "@/services/payroll.service";
import { FiFileText, FiEye } from "react-icons/fi";
import { AnimatedSearchIcon } from "@/components/common/AnimatedSearchIcon";
import TablePagination from "@/components/common/TablePagination";

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
  const [search, setSearch] = useState("");
  const { t } = useTranslation();

  useEffect(() => {
    getMyPayslips()
      .then(setData)
      .catch((err) => {
        console.error(err);
        toast.error("Failed to load payslips");
      })
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
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-slate-900">
                    {t("payslip.title")}
                  </h1>
                  <p className="mt-1 text-sm text-slate-500">
                    {t("payslip.subtitle")}
                  </p>
                </div>
              </div>

              {/* Search bar */}
              <div className="relative w-full max-w-sm">
                <AnimatedSearchIcon />
                <input
                  type="text"
                  placeholder={t("payslip.searchPlaceholder")}
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                  className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-4 text-sm text-slate-700 shadow-sm placeholder-slate-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
                />
              </div>

              {data.length === 0 ? (
                <p className="text-sm text-slate-500">No payslips found</p>
              ) : (
                <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
                  <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
                    <h3 className="text-base font-semibold text-slate-800">
                      All Payslips
                    </h3>
                    <div className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                      {data.length} records
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-left text-sm">
                      <thead className="bg-slate-50 text-slate-500">
                        <tr>
                          <th className="px-5 py-3 font-medium">S/N</th>
                          <th className="px-5 py-3 font-medium">
                            {t("payslip.period")}
                          </th>
                          <th className="px-5 py-3 font-medium">
                            {t("payslip.baseSalary")}
                          </th>
                          <th className="px-5 py-3 font-medium">
                            {t("payroll.deductions")}
                          </th>
                          <th className="px-5 py-3 font-medium">
                            {t("payslip.netSalary")}
                          </th>
                          <th className="px-5 py-3 font-medium">
                            {t("payslip.status")}
                          </th>
                          <th className="px-5 py-3 font-medium">
                            {t("common.actions")}
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {data
                          .filter((slip) => {
                            const q = search.toLowerCase();
                            return (
                              !q ||
                              `${monthNames[slip.month]} ${slip.year}`
                                .toLowerCase()
                                .includes(q) ||
                              slip.status.toLowerCase().includes(q)
                            );
                          })
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
                    <TablePagination
                      page={page}
                      totalPages={Math.ceil(data.length / PAGE_SIZE)}
                      onPageChange={setPage}
                    />
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
