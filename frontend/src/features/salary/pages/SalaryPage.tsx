import { useState } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import Sidebar from "@/layouts/Sidebar";
import Header from "@/layouts/Header";
import SalaryTable from "@/features/salary/components/SalaryTable";
import SetSalaryModal from "@/features/salary/components/SetSalaryModal";
import DeleteConfirmModal from "@/components/common/DeleteConfirmModal";
import type { SalaryFormValues } from "@/features/salary/components/SetSalaryModal";
import { useSalary } from "@/features/salary/hooks/useSalary";
import StatCard from "@/features/attendance/components/StatCard";
import {
  FiPlus,
  FiDollarSign,
  FiUsers,
  FiTrendingUp,
  FiCreditCard,
} from "react-icons/fi";
import { AnimatedSearchIcon } from "@/components/common/AnimatedSearchIcon";
import {
  setSalary,
  deleteSalary,
  type SalaryRecord,
} from "../services/salary.service";
import useDeleteConfirmation from "@/hooks/useDeleteConfirmation";

export default function SalaryPage() {
  const { t } = useTranslation();
  const deleteConfirmation = useDeleteConfirmation();
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
  } = useSalary();
  const [formOpen, setFormOpen] = useState(false);
  const [editRecord, setEditRecord] = useState<SalaryRecord | null>(null);
  const [deleteRecord, setDeleteRecord] = useState<SalaryRecord | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  //============== Load users when modal opens =============
  const handleAdd = () => {
    setEditRecord(null);
    setFormOpen(true);
  };

  //==============  function handle edit ===================
  const handleEdit = (record: SalaryRecord) => {
    setEditRecord(record);
    setFormOpen(true);
  };

  //==============  function handle save ===================
  const handleSave = async (values: SalaryFormValues) => {
    setSaving(true);
    try {
      await setSalary({
        user_id: values.user_id,
        base_salary: values.base_salary,
        bonus: values.bonus,
        allowance: values.allowance,
        tax_percentage: values.tax_percentage,
      });
      toast.success(editRecord ? "Salary updated" : "Salary set successfully");
      setFormOpen(false);
      setEditRecord(null);
      refetch();
      refetchStats();
    } catch (err: any) {
      console.error(err);
      toast.error(err?.response?.data?.message ?? "Failed to save salary");
    } finally {
      setSaving(false);
    }
  };

  //=========== handle delete confirmtaion =============

  const handleDeleteConfirm = async () => {
    if (!deleteRecord) return;
    setDeleting(true);
    try {
      await deleteSalary(deleteRecord.id);
      toast.success("Salary record deleted");
      setDeleteRecord(null);
      refetch();
      refetchStats();
    } catch (err: any) {
      console.error(err);
      toast.error(
        err?.response?.data?.message ?? "Failed to delete salary record",
      );
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteRequest = (record: SalaryRecord) => {
    setDeleteRecord(record);
    deleteConfirmation.requestDelete({
      title: t("common.delete"),
      message: t("salary.deleteConfirm", { name: record.name }),
      confirmLabel: t("common.delete"),
      cancelLabel: t("common.cancel"),
      onConfirm: handleDeleteConfirm,
    });
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />

      <main className="flex-1 flex flex-col overflow-auto">
        <Header searchTerm="" onSearchChange={() => {}} />

        <div className="p-6">
          <div className="space-y-6">
            {/* Page header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-slate-900">
                  {t("salary.title")}
                </h1>
                <p className="mt-1 text-sm text-slate-500">
                  {t("salary.subtitle")}
                </p>
              </div>
              <button
                type="button"
                onClick={handleAdd}
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
              >
                <FiPlus className="h-4 w-4" />
                {t("salary.setSalary")}
              </button>
            </div>

            {/* Stat cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                label={t("salary.totalRecords", {
                  defaultValue: "Total Records",
                })}
                value={stats.total}
                icon={<FiUsers />}
                color=""
                featured
                subtitle={t("salary.allRecords")}
              />
              <StatCard
                label={t("salary.avgBase", { defaultValue: "Avg Base Salary" })}
                value={stats.avgBase.toLocaleString(undefined, {
                  maximumFractionDigits: 0,
                })}
                icon={<FiDollarSign />}
                color="bg-blue-100 text-blue-600"
                subtitle={t("salary.perEmployee", {
                  defaultValue: "Per employee",
                })}
              />
              <StatCard
                label={t("salary.totalGross", { defaultValue: "Total Gross" })}
                value={stats.totalGross.toLocaleString(undefined, {
                  maximumFractionDigits: 0,
                })}
                icon={<FiTrendingUp />}
                color="bg-amber-100 text-amber-600"
                subtitle={t("salary.monthlyGross", {
                  defaultValue: "Monthly gross payout",
                })}
              />
              <StatCard
                label={t("salary.totalNet", { defaultValue: "Total Net" })}
                value={stats.totalNet.toLocaleString(undefined, {
                  maximumFractionDigits: 0,
                })}
                icon={<FiCreditCard />}
                color="bg-emerald-100 text-emerald-600"
                subtitle={t("salary.monthlyNet", {
                  defaultValue: "Monthly net payout",
                })}
              />
            </div>

            {/* Search bar */}
            <div className="relative w-full max-w-sm">
              <AnimatedSearchIcon />
              <input
                type="text"
                placeholder={t("salary.searchPlaceholder")}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-4 text-sm text-slate-700 shadow-sm placeholder-slate-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <SalaryTable
              data={filteredData}
              onAdd={handleAdd}
              onEdit={handleEdit}
              onDelete={handleDeleteRequest}
              sortBy={sortBy}
              sortOrder={sortOrder}
              onSort={handleSort}
            />
          </div>

          <SetSalaryModal
            isOpen={formOpen}
            onClose={() => {
              setFormOpen(false);
              setEditRecord(null);
            }}
            onSave={handleSave}
            isSaving={saving}
            salary={editRecord}
          />

          <DeleteConfirmModal
            isOpen={deleteConfirmation.isOpen}
            title={deleteConfirmation.dialog?.title ?? t("common.delete")}
            message={
              deleteConfirmation.dialog?.message ??
              "Are you sure you want to delete this salary record?"
            }
            confirmLabel={
              deleteConfirmation.dialog?.confirmLabel ?? t("common.delete")
            }
            cancelLabel={
              deleteConfirmation.dialog?.cancelLabel ?? t("common.cancel")
            }
            isProcessing={deleting || deleteConfirmation.isProcessing}
            onClose={() => {
              deleteConfirmation.closeDialog();
              setDeleteRecord(null);
            }}
            onConfirm={deleteConfirmation.confirmDelete}
          />
        </div>
      </main>
    </div>
  );
}
