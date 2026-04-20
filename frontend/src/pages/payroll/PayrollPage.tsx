// For Admin / HR manage payroll

import { useState, useEffect } from "react";
import Sidebar from "../../components/layout/Sidebar";
import Header from "../../components/layout/Header";
import PayrollTable from "../../components/payroll/PayrollTable";
import GeneratePayrollModal from "../../components/payroll/GeneratePayrollModal";
import type { PayrollFormValues } from "../../components/payroll/GeneratePayrollModal";
import { getAllPayroll, generatePayroll } from "../../services/payrollService";

export default function PayrollPage() {
  const [data, setData] = useState<any[]>([]);
  const [formOpen, setFormOpen] = useState(false);
  const [generating, setGenerating] = useState(false);

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

      <main className="flex-1 p-6">
        <Header searchTerm="" onSearchChange={() => {}} />

        <div className="space-y-6">
          <PayrollTable
            data={data}
            onRefresh={fetchPayroll}
            onAdd={() => setFormOpen(true)}
          />
        </div>

        <GeneratePayrollModal
          isOpen={formOpen}
          onClose={() => setFormOpen(false)}
          onSave={handleGenerate}
          isSaving={generating}
        />
      </main>
    </div>
  );
}
