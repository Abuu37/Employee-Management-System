// For Admin / HR manage payroll

import { useState, useEffect } from "react";
import Sidebar from "../../components/layout/Sidebar";
import Header from "../../components/layout/Header";
import PayrollTable from "../../components/payroll/PayrollTable";
import { getAllPayroll, generatePayroll } from "../../services/payrollService";

export default function PayrollPage() {
  const [data, setData] = useState<any[]>([]);
  const [userId, setUserId] = useState("");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");

  const fetchPayroll = () => {
    getAllPayroll().then(setData).catch(console.error);
  };

  useEffect(() => {
    fetchPayroll();
  }, []);

  const handleGenerate = async () => {
    if (!userId || !month || !year) {
      setError("All fields are required");
      return;
    }
    setError("");
    setGenerating(true);
    try {
      await generatePayroll({
        user_id: Number(userId),
        month: Number(month),
        year: Number(year),
      });
      setUserId("");
      setMonth("");
      setYear("");
      fetchPayroll();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to generate payroll");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />

      <main className="flex-1 p-6">
        <Header searchTerm="" onSearchChange={() => {}} />

        <div className="space-y-6">
          <h1 className="text-2xl font-bold text-slate-900">
            Payroll Management
          </h1>

          {/* Generate payroll form */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="mb-4 text-lg font-semibold text-slate-900">
              Generate Payroll
            </h3>
            <div className="flex flex-wrap items-end gap-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Employee ID
                </label>
                <input
                  type="number"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  placeholder="User ID"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Month
                </label>
                <select
                  value={month}
                  onChange={(e) => setMonth(e.target.value)}
                  className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
                >
                  <option value="">Select</option>
                  {Array.from({ length: 12 }, (_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {i + 1}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Year
                </label>
                <input
                  type="number"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  placeholder="e.g. 2026"
                />
              </div>
              <button
                type="button"
                onClick={handleGenerate}
                disabled={generating}
                className="rounded-xl bg-blue-600 px-5 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:opacity-50"
              >
                {generating ? "Generating..." : "Generate"}
              </button>
            </div>
            {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
          </div>

          <PayrollTable data={data} onRefresh={fetchPayroll} />
        </div>
      </main>
    </div>
  );
}
