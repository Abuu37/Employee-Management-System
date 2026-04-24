import { useState, useEffect } from "react";
import Sidebar from "../../components/layout/Sidebar";
import Header from "../../components/layout/Header";
import SalaryTable from "../../components/salary/SalaryTable";
import SetSalaryModal from "../../components/salary/SetSalaryModal";
import DeleteSalaryModal from "../../components/salary/DeleteSalaryModal";
import type { SalaryFormValues } from "../../components/salary/SetSalaryModal";
import { FiSearch } from "react-icons/fi";
import {
  getAllSalaries,
  setSalary,
  deleteSalary,
  type SalaryRecord,
} from "../../services/salaryService";

export default function SalaryPage() {
  const [data, setData] = useState<SalaryRecord[]>([]);
  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editRecord, setEditRecord] = useState<SalaryRecord | null>(null);
  const [deleteRecord, setDeleteRecord] = useState<SalaryRecord | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const fetchSalaries = () => {
    getAllSalaries().then(setData).catch(console.error);
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
      setFormOpen(false);
      setEditRecord(null);
      fetchSalaries();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteRecord) return;
    setDeleting(true);
    try {
      await deleteSalary(deleteRecord.id);
      setDeleteRecord(null);
      fetchSalaries();
    } catch (err) {
      console.error(err);
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
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-2xl font-bold text-slate-900">
                  Salary Management
                </h1>
                <p className="mt-1 text-sm text-slate-500">
                  Manage all employee salary records
                </p>
              </div>
            </div>

            {/* Search bar */}
            <div className="relative w-full max-w-sm">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Search employees..."
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
