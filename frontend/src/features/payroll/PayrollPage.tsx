// For Admin / HR manage payroll

import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import Sidebar from "@/layouts/Sidebar";
import Header from "@/layouts/Header";
import PayrollTable from "@/features/payroll/components/PayrollTable";
import GeneratePayrollModal from "@/features/payroll/components/GeneratePayrollModal";
import ViewPayslipModal from "@/features/payslip/components/ViewPayslipModal";
import StatCard from "@/features/attendance/components/StatCard";
import type { PayrollFormValues } from "@/features/payroll/components/GeneratePayrollModal";
import { useUser } from "@/context/UserContext";
import {
  getAllPayroll,
  generatePayroll,
  getTeamPayroll,
  getMyPayslips,
} from "@/services/payroll.service";

import {
  FiDollarSign,
  FiCheckCircle,
  FiClock,
  FiSearch,
  FiAward,
  FiPlus,
} from "react-icons/fi";

export default function PayrollPage() {
  const { user } = useUser();
  const { t } = useTranslation();
  const [data, setData] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [viewSlip, setViewSlip] = useState<any | null>(null);

  const fetchPayroll = async () => {
    try {
      let payroll = [];

      if (user?.role === "admin") {
        payroll = await getAllPayroll();
      } else if (user?.role === "manager") {
        payroll = await getTeamPayroll();
      } else {
        payroll = await getMyPayslips();
      }

      setData(payroll);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (user) {
      fetchPayroll();
    }
  }, [user]);

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
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                {t("payroll.title")}
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                {t("payroll.subtitle")}
              </p>
            </div>

            {user?.role === "admin" && (
              <button
                type="button"
                onClick={() => setFormOpen(true)}
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium
              text-white transition hover:bg-blue-700"
              >
                <FiPlus className="h-4 w-4" />
                {t("payroll.generatePayroll")}
              </button>
            )}
          </div>

          {/* Stat cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              label={t("payroll.totalRecords")}
              value={data.length}
              icon={<FiDollarSign />}
              color=""
              featured
              subtitle={t("payroll.allPayrollEntries")}
            />
            <StatCard
              label={t("payroll.paid")}
              value={data.filter((d) => d.status === "paid").length}
              icon={<FiAward />}
              color="bg-emerald-100 text-emerald-600"
              subtitle={t("payroll.disbursedPayments")}
            />
            <StatCard
              label={t("payroll.approved")}
              value={data.filter((d) => d.status === "approved").length}
              icon={<FiCheckCircle />}
              color="bg-blue-100 text-blue-600"
              subtitle={t("payroll.readyToPay")}
            />
            <StatCard
              label={t("payroll.pending")}
              value={data.filter((d) => d.status === "pending").length}
              icon={<FiClock />}
              color="bg-amber-100 text-amber-600"
              subtitle={t("payroll.awaitingApproval")}
            />
          </div>

          {/* Search bar */}
          <div className="relative w-full max-w-sm">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder={
                user?.role === "employee"
                  ? t("payroll.searchMonthYear")
                  : t("payroll.searchEmployee")
              }
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-4 text-sm
              text-slate-700 shadow-sm placeholder-slate-400 focus:border-blue-400 focus:outline-none focus:ring-2
              focus:ring-blue-100"
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
