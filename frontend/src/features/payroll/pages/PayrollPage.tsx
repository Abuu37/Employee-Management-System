// For Admin / HR manage payroll

import { useState } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import Sidebar from "@/layouts/Sidebar";
import Header from "@/layouts/Header";
import PayrollTable from "@/features/payroll/components/PayrollTable";
import GeneratePayrollModal from "@/features/payroll/components/GeneratePayrollModal";
import ViewPayslipModal from "@/features/payslip/components/ViewPayslipModal";
import StatCard from "@/features/attendance/components/StatCard";
import type { PayrollFormValues } from "@/features/payroll/components/GeneratePayrollModal";
import { useUser } from "@/context/UserContext";
import { usePayroll } from "@/features/payroll/hooks/usePayroll";
import { generatePayroll } from "../services/payroll.service";

import {
  FiDollarSign,
  FiCheckCircle,
  FiAlertTriangle,
  FiAward,
  FiPlus,
} from "react-icons/fi";
import { AnimatedSearchIcon } from "@/components/common/AnimatedSearchIcon";

export default function PayrollPage() {
  const { user } = useUser();
  const { t } = useTranslation();
  const {
    filteredData,
    stats,
    search,
    setSearch,
    sortBy,
    sortOrder,
    handleSort,
    refetch,
    refetchStats,
  } = usePayroll(user?.role);
  const [formOpen, setFormOpen] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [viewSlip, setViewSlip] = useState<any | null>(null);

  //=============  handle payroll generation ===================
  const handleGenerate = async (values: PayrollFormValues) => {
    setGenerating(true);
    try {
      await generatePayroll({
        user_id: values.user_id,
        month: values.month,
        year: values.year,
      });
      toast.success("Payroll generated successfully");
      setFormOpen(false);
      refetch();
      refetchStats();
    } catch (err: any) {
      console.error(err);
      toast.error(err?.response?.data?.message ?? "Failed to generate payroll");
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
          {/*============= Page header================== */}
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

          {/*============== Stat cards =================== */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              label={t("payroll.totalRecords")}
              value={stats.total}
              icon={<FiDollarSign />}
              color=""
              featured
              subtitle={t("payroll.allPayrollEntries")}
            />
            <StatCard
              label={t("payroll.paid")}
              value={stats.paid}
              icon={<FiAward />}
              color="bg-emerald-100 text-emerald-600"
              subtitle={t("payroll.disbursedPayments")}
            />
            <StatCard
              label={t("payroll.approved")}
              value={stats.approved}
              icon={<FiCheckCircle />}
              color="bg-blue-100 text-blue-600"
              subtitle={t("payroll.readyToPay")}
            />
            <StatCard
              label={t("payroll.pending")}
              value={stats.pending}
              icon={<FiAlertTriangle />}
              color="bg-amber-100 text-amber-600"
              subtitle={t("payroll.awaitingApproval")}
            />
          </div>

          {/*============== Search bar =================== */}
          <div className="relative w-full max-w-sm">
            <AnimatedSearchIcon />
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
              data={filteredData}
              onRefresh={() => {
                refetch();
                refetchStats();
              }}
              onAdd={() => setFormOpen(true)}
              onView={setViewSlip}
              sortBy={sortBy}
              sortOrder={sortOrder}
              onSort={handleSort}
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
