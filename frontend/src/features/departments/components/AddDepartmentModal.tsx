import { useEffect, useState } from "react";
import axios from "@/services/axios";
import type { DeptFormValues } from "../types";
import ModalShell from "../../employees/components/ModalShell";

interface Manager {
  id: number;
  name: string;
  department?: string | null;
}

interface AddDepartmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (values: DeptFormValues) => Promise<void>;
  isSaving: boolean;
}

const empty: DeptFormValues = {
  name: "",
  code: "",
  description: "",
  manager_id: "",
  status: "active",
};

//========== add department modal ==========//

export default function AddDepartmentModal({
  isOpen,
  onClose,
  onSave,
  isSaving,
}: AddDepartmentModalProps) {
  const [form, setForm] = useState<DeptFormValues>(empty);
  const [managers, setManagers] = useState<Manager[]>([]);

  useEffect(() => {
    if (!isOpen) return;
    setForm(empty);
    axios
      .get("/user/view-users")
      .then((r) => {
        const mgrs = (Array.isArray(r.data) ? r.data : []).filter(
          (u: any) => u.role === "manager",
        );
        setManagers(mgrs);
      })
      .catch(() => {});
  }, [isOpen]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === "manager_id" ? (value ? Number(value) : "") : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave(form);
  };

  return (
    <ModalShell
      isOpen={isOpen}
      onClose={onClose}
      title="Add Department"
      maxWidth="max-w-lg"
    >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {/* Name */}
            <label className="col-span-2 block">
              <span className="mb-1.5 block text-sm font-medium text-slate-700">
                Department Name <span className="text-red-500">*</span>
              </span>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                placeholder="e.g. Information Technology"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-blue-500 focus:bg-white"
              />
            </label>

            {/* Code */}
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-slate-700">
                Department Code <span className="text-red-500">*</span>
              </span>
              <input
                type="text"
                name="code"
                value={form.code}
                onChange={handleChange}
                required
                placeholder="e.g. IT"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-blue-500 focus:bg-white uppercase"
              />
            </label>

            {/* Status */}
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-slate-700">
                Status
              </span>
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-blue-500 focus:bg-white"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </label>

            {/* Manager */}
            <label className="col-span-2 block">
              <span className="mb-1.5 block text-sm font-medium text-slate-700">
                Assign Manager
              </span>
              <select
                name="manager_id"
                value={form.manager_id}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-blue-500 focus:bg-white"
              >
                <option value="">— No manager —</option>
                {managers.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                    {m.department ? ` (${m.department})` : ""}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:bg-blue-300"
            >
              {isSaving ? "Creating..." : "Add Department"}
            </button>
          </div>
        </form>
    </ModalShell>
  );
}
