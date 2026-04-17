import { approvePayroll, markAsPaid } from "../../services/payrollService";

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
}: {
  data: PayrollRecord[];
  onRefresh: () => void;
}) {
  const handleApprove = async (id: number) => {
    await approvePayroll(id);
    onRefresh();
  };

  const handlePay = async (id: number) => {
    await markAsPaid(id);
    onRefresh();
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-500">
            <tr>
              <th className="px-5 py-3 font-medium">S/N</th>
              <th className="px-5 py-3 font-medium">Employee ID</th>
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
              data.map((item, idx) => (
                <tr key={item.id} className="border-t border-slate-100">
                  <td className="px-5 py-4 font-semibold text-slate-900">
                    {idx + 1}
                  </td>
                  <td className="px-5 py-4 text-slate-600">{item.user_id}</td>
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
    </div>
  );
}
