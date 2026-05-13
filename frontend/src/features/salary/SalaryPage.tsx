import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import Sidebar from "@/layouts/Sidebar";
import Header from "@/layouts/Header";
import SalaryTable from "@/features/salary/components/SalaryTable";
import SetSalaryModal from "@/features/salary/components/SetSalaryModal";
import DeleteSalaryModal from "@/features/salary/components/DeleteSalaryModal";
import type { SalaryFormValues } from "@/features/salary/components/SetSalaryModal";
import { FiPlus } from "react-icons/fi";
import { AnimatedSearchIcon } from "@/components/common/AnimatedSearchIcon";
import {
  getAllSalaries,
  setSalary,
  deleteSalary,
  type SalaryRecord,
} from "@/services/salary.service";

export default function SalaryPage() {
  const { t } = useTranslation();
  const [data, setData] = useState<SalaryRecord[]>([]);
  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editRecord, setEditRecord] = useState<SalaryRecord | null>(null);
  const [deleteRecord, setDeleteRecord] = useState<SalaryRecord | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const fetchSalaries = () => {
    getAllSalaries()
      .then(setData)
      .catch((err) => {
        console.error(err);
        toast.error("Failed to load salary records");
      });
  };

  useEffect(() => {
    fetchSalaries();
  }, []);

  const handleAdd = () => {
    setEditRecord(null);
    setFormOpen(true);
  };

  const handleEdit = (record: SalaryRecord) => {
    setEditRecord(record);
    setFormOpen(true);
  };

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
      fetchSalaries();
    } catch (err: any) {
      console.error(err);
      toast.error(err?.response?.data?.message ?? "Failed to save salary");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteRecord) return;
    setDeleting(true);
    try {
      await deleteSalary(deleteRecord.id);
      toast.success("Salary record deleted");
      setDeleteRecord(null);
      fetchSalaries();
    } catch (err: any) {
      console.error(err);
      toast.error(
        err?.response?.data?.message ?? "Failed to delete salary record",
      );
    } finally {
      setDeleting(false);
    }
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
              data={data.filter((r) => {
                const name = r.user?.name?.toLowerCase() ?? "";
                const email = r.user?.email?.toLowerCase() ?? "";
                const q = search.toLowerCase();
                return name.includes(q) || email.includes(q);
              })}
              onAdd={handleAdd}
              onEdit={handleEdit}
              onDelete={setDeleteRecord}
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

          <DeleteSalaryModal
            isOpen={!!deleteRecord}
            onClose={() => setDeleteRecord(null)}
            onConfirm={handleDeleteConfirm}
            salary={deleteRecord}
            isDeleting={deleting}
          />
        </div>
      </main>
    </div>
  );
}
