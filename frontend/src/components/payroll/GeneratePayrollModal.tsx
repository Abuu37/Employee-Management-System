import { useEffect, useState } from "react";
import ModalShell from "../user/ModalShell";
import { getAllSalaries } from "../../services/salaryService";

const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export interface PayrollFormValues {
  user_id: number;
  month: number;
  year: number;
}

interface UserOption {
  id: number;
  name: string;
}

interface GeneratePayrollModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (values: PayrollFormValues) => Promise<void>;
  isSaving: boolean;
}

export default function GeneratePayrollModal({
  isOpen,
  onClose,
  onSave,
  isSaving,
}: GeneratePayrollModalProps) {
  const [formValues, setFormValues] = useState<PayrollFormValues>({
    user_id: 0,
    month: 0,
    year: 0,
  });
  const [users, setUsers] = useState<UserOption[]>([]);

  useEffect(() => {
    if (!isOpen) return;
    setFormValues({ user_id: 0, month: 0, year: 0 });

    getAllSalaries()
      .then((salaries) => {
        setUsers(
          salaries.map((s) => ({
            id: s.user_id,
            name: s.user?.name ?? `User #${s.user_id}`,
          })),
        );
      })
      .catch(console.error);
  }, [isOpen]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({
      ...prev,
      [name]: Number(value),
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await onSave(formValues);
  };

  return (
    <ModalShell
      isOpen={isOpen}
      onClose={onClose}
      title="Generate Payroll"
      maxWidth="max-w-2xl"
    >
      <form className="space-y-5" onSubmit={handleSubmit}>
        <div className="grid gap-4">
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">
              Select Employee
            </span>
            <select
              name="user_id"
              value={formValues.user_id || ""}
              onChange={handleChange}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white"
              required
            >
              <option value="" disabled>
                Select Employee
              </option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} (ID: {u.id})
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">
              Month
            </span>
            <select
              name="month"
              value={formValues.month || ""}
              onChange={handleChange}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white"
              required
            >
              <option value="" disabled>
                Select Month
              </option>
              {monthNames.map((name, i) => (
                <option key={i + 1} value={i + 1}>
                  {name}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">
              Year
            </span>
            <input
              type="number"
              name="year"
              value={formValues.year || ""}
              onChange={handleChange}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white"
              placeholder="e.g. 2026"
              required
            />
          </label>
        </div>

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
          >
            {isSaving ? "Generating..." : "Generate Payroll"}
          </button>
        </div>
      </form>
    </ModalShell>
  );
}
