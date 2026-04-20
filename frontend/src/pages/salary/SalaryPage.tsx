import { useState, useEffect } from "react";
import Sidebar from "../../components/layout/Sidebar";
import Header from "../../components/layout/Header";
import SalaryTable from "../../components/salary/SalaryTable";
import SetSalaryModal from "../../components/salary/SetSalaryModal";
import DeleteSalaryModal from "../../components/salary/DeleteSalaryModal";
import type { SalaryFormValues } from "../../components/salary/SetSalaryModal";
import {
  getAllSalaries,
  setSalary,
  deleteSalary,
  type SalaryRecord,
} from "../../services/salaryService";

export default function SalaryPage() {
  const [data, setData] = useState<SalaryRecord[]>([]);
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

      <main className="flex-1 p-6">
        <Header searchTerm="" onSearchChange={() => {}} />

        <div className="space-y-6">
          <SalaryTable
            data={data}
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
      </main>
    </div>
  );
}
