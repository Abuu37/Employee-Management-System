import { useState } from "react";
import { FiDownload, FiFileText, FiPieChart } from "react-icons/fi";
import Header from "@/layouts/Header";
import Sidebar from "@/layouts/Sidebar";
import { useEmployeeSummaryReport } from "@/features/Report/hooks/useEmployeeSummaryReport";
import EmployeeSummaryCards from "@/features/Report/components/employeesummary/EmployeeSummaryCards";
import EmployeeSummaryFilters from "@/features/Report/components/employeesummary/EmployeeSummaryFilters";
import EmployeeSummaryCharts from "@/features/Report/components/employeesummary/EmployeeSummaryCharts";
import {
  DepartmentStatsTable,
  EmployeeListTable,
} from "@/features/Report/components/employeesummary/EmployeeSummaryTable";

export default function EmployeeSummaryReportPage() {
  const [searchTerm, setSearchTerm] = useState("");

  const {
    filters,
    setFilters,
    summaryData,
    departmentRows,
    listRows,
    cardStats,
    pagination,
    loadingSummary,
    loadingDepartments,
    loadingList,
    exporting,
    error,
    sortBy,
    sortOrder,
    handleSort,
    applyFilters,
    resetFilters,
    goToPage,
    exportCsv,
    exportPdf,
  } = useEmployeeSummaryReport();

  const departmentOptions = departmentRows.map((row) => ({
    id: row.id,
    name: row.name,
  }));

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
                  <FiPieChart className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-slate-800">
                    Employee Summary Report
                  </h1>
                  <p className="text-sm text-slate-500">
                    Track employee demographics, department health, and team
                    composition
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={exportCsv}
                  disabled={exporting}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 shadow-sm transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                  title="Export CSV"
                >
                  <FiFileText className="h-4 w-4 text-emerald-500" />
                  Export CSV
                </button>
                <button
                  type="button"
                  onClick={exportPdf}
                  disabled={exporting}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 shadow-sm transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                  title="Export PDF"
                >
                  <FiDownload className="h-4 w-4 text-red-400" />
                  Export PDF
                </button>
              </div>
            </div>

            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <EmployeeSummaryCards stats={cardStats} loading={loadingSummary} />

            <EmployeeSummaryFilters
              filters={filters}
              departments={departmentOptions}
              onChange={(patch) =>
                setFilters((prev) => ({ ...prev, ...patch }))
              }
              onApply={applyFilters}
              onReset={resetFilters}
              loading={loadingList}
            />

            <EmployeeSummaryCharts
              data={summaryData}
              loading={loadingSummary}
            />

            <DepartmentStatsTable
              rows={departmentRows}
              loading={loadingDepartments}
            />

            <EmployeeListTable
              rows={listRows}
              pagination={pagination}
              loading={loadingList}
              sortBy={sortBy}
              sortOrder={sortOrder}
              onSort={handleSort}
              onPageChange={goToPage}
            />
          </div>
        </main>
      </div>
    </div>
  );
}
