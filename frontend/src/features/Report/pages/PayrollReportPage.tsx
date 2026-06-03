import { useState } from "react";
import { FiCreditCard, FiFileText } from "react-icons/fi";
import Header from "@/layouts/Header";
import Sidebar from "@/layouts/Sidebar";
import { usePayrollReport } from "@/features/Report/hooks/usePayrollReport";
import PayrollSummaryCards from "@/features/Report/components/payroll/PayrollSummaryCards";
import PayrollReportFilters from "@/features/Report/components/payroll/PayrollReportFilters";
import PayrollReportCharts from "@/features/Report/components/payroll/PayrollReportCharts";
import PayrollReportTable from "@/features/Report/components/payroll/PayrollReportTable";

export default function PayrollReportPage() {
  const [searchTerm, setSearchTerm] = useState("");

  const {
    filters,
    setFilters,
    cardStats,
    summaryRows,
    detailRows,
    trendRows,
    pagination,
    loadingSummary,
    loadingDetails,
    loadingTrends,
    exporting,
    canViewTrends,
    error,
    applyFilters,
    resetFilters,
    goToPage,
    exportCsv,
    exportPdf,
  } = usePayrollReport();

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header searchTerm={searchTerm} onSearchChange={setSearchTerm} />

        <main className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 shadow-sm">
                  <FiCreditCard className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-slate-800">
                    Payroll Report
                  </h1>
                  <p className="text-sm text-slate-500">
                    Track payroll totals, payment status, and monthly salary
                    trends
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={exportCsv}
                  disabled={exporting}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors shadow-sm"
                  title="Export CSV"
                >
                  <FiFileText className="h-4 w-4 text-emerald-500" />
                  Export CSV
                </button>
                <button
                  type="button"
                  onClick={exportPdf}
                  disabled={exporting}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors shadow-sm"
                  title="Export PDF"
                >
                  <FiFileText className="h-4 w-4 text-red-400" />
                  Export PDF
                </button>
              </div>
            </div>

            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <PayrollSummaryCards
              stats={cardStats}
              summaryRows={summaryRows}
              loading={loadingSummary}
            />

            <PayrollReportFilters
              filters={filters}
              onChange={(patch) =>
                setFilters((prev) => ({ ...prev, ...patch }))
              }
              onApply={applyFilters}
              onReset={resetFilters}
              loading={loadingDetails}
            />

            {canViewTrends && (
              <PayrollReportCharts
                data={trendRows}
                summaryRows={summaryRows}
                loadingTrends={loadingTrends}
                loadingSummary={loadingSummary}
              />
            )}

            <PayrollReportTable
              rows={detailRows}
              pagination={pagination}
              loading={loadingDetails}
              onPageChange={goToPage}
            />
          </div>
        </main>
      </div>
    </div>
  );
}
