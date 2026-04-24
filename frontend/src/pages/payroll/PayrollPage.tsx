// For Admin / HR manage payroll

import { useState, useEffect } from "react";
import Sidebar from "../../components/layout/Sidebar";
import Header from "../../components/layout/Header";
import PayrollTable from "../../components/payroll/PayrollTable";
import GeneratePayrollModal from "../../components/payroll/GeneratePayrollModal";
import ViewPayslipModal from "../../components/payslip/ViewPayslipModal";
import StatCard from "../../components/attendance/StatCard";
import type { PayrollFormValues } from "../../components/payroll/GeneratePayrollModal";
import { getAllPayroll, generatePayroll } from "../../services/payrollService";
import {
  FiDollarSign,
  FiCheckCircle,
  FiClock,
  FiSearch,
  FiAward,
} from "react-icons/fi";

export default function PayrollPage() {
  const [data, setData] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [viewSlip, setViewSlip] = useState<any | null>(null);

  const fetchPayroll = () => {
    getAllPayroll().then(setData).catch(console.error);
  };

  useEffect(() => {
    fetchPayroll();
  }, []);

  const handleGenerate = async (values: PayrollFormValues) => {
    setGenerating(true);
    try {
      await generatePayroll({
        user_id: values.user_id,
        month: values.month,
        year: values.year,
      });
      setFormOpen(false);
      fetchPayroll();
    } catch (err) {
      console.error(err);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />

      <main className="flex-1 flex flex-col overflow-auto">
        <Header searchTerm="" onSearchChange={() => {}} />

        <div className="p-6 space-y-5">
          {/* Page header */}
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Payroll</h1>
            <p className="mt-1 text-sm text-slate-500">
              Manage and process employee payroll records
            </p>
          </div>

          {/* Stat cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              label="Total Records"
              value={data.length}
              icon={<FiDollarSign />}
              color=""
              featured
              subtitle="All payroll entries"
            />
            <StatCard
              label="Paid"
              value={data.filter((d) => d.status === "paid").length}
              icon={<FiAward />}
              color="bg-emerald-100 text-emerald-600"
              subtitle="Disbursed payments"
            />
            <StatCard
              label="Approved"
              value={data.filter((d) => d.status === "approved").length}
              icon={<FiCheckCircle />}
              color="bg-blue-100 text-blue-600"
              subtitle="Ready to pay"
            />
            <StatCard
              label="Pending"
              value={data.filter((d) => d.status === "pending").length}
              icon={<FiClock />}
              color="bg-amber-100 text-amber-600"
              subtitle="Awaiting approval"
            />
          </div>

          {/* Search bar */}
          <div className="relative w-full max-w-sm">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by employee or period..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-4 text-sm text-slate-700 shadow-sm placeholder-slate-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div className="space-y-6">
            <PayrollTable
              data={
                search
                  ? data.filter(
                      (d) =>
                        (d.user?.name ?? "")
                          .toLowerCase()
                          .includes(search.toLowerCase()) ||
                        String(d.year).includes(search) ||
                        String(d.month).includes(search),
                    )
                  : data
              }
              onRefresh={fetchPayroll}
              onAdd={() => setFormOpen(true)}
              onView={setViewSlip}
            />
          </div>

          <GeneratePayrollModal
            isOpen={formOpen}
            onClose={() => setFormOpen(false)}
            onSave={handleGenerate}
            isSaving={generating}
          />

          <ViewPayslipModal
            isOpen={!!viewSlip}
            onClose={() => setViewSlip(null)}
            data={viewSlip}
          />
        </div>
      </main>
    </div>
  );
}
