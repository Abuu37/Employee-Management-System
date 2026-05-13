import { useEffect, useState } from "react";
import axios from "@/services/axios";
import { useTranslation } from "react-i18next";
import type { Department, DeptFormValues } from "../types";
import ModalShell from "../../users/components/ModalShell";

interface Manager {
  id: number;
  name: string;
  department?: string | null;
}

interface EditDepartmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (values: DeptFormValues) => Promise<void>;
  department: Department | null;
  isSaving: boolean;
}

export default function EditDepartmentModal({
  isOpen,
  onClose,
  onSave,
  department,
  isSaving,
}: EditDepartmentModalProps) {
  const [form, setForm] = useState<DeptFormValues>({
    name: "",
    code: "",
    description: "",
    manager_id: "",
    status: "active",
  });
  const [managers, setManagers] = useState<Manager[]>([]);
  const { t } = useTranslation();

  useEffect(() => {
    if (!isOpen || !department) return;
    setForm({
      name: department.name,
      code: department.code,
      description: "",
      manager_id: department.manager_id ?? "",
      status: department.status,
    });
    axios
      .get("/user/view-users")
      .then((r) => {
        const mgrs = (Array.isArray(r.data) ? r.data : []).filter(
          (u: any) => u.role === "manager",
        );
        setManagers(mgrs);
      })
      .catch(() => {});
  }, [isOpen, department]);

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
      title={t("departments.editTitle")}
      maxWidth="max-w-lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <label className="col-span-2 block">
            <span className="mb-1.5 block text-sm font-medium text-slate-700">
              {t("departments.departmentName")}{" "}
              <span className="text-red-500">*</span>
            </span>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-blue-500 focus:bg-white"
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-slate-700">
              {t("departments.departmentCode")}{" "}
              <span className="text-red-500">*</span>
            </span>
            <input
              type="text"
              name="code"
              value={form.code}
              onChange={handleChange}
              required
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-blue-500 focus:bg-white uppercase"
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-slate-700">
              {t("common.status")}
            </span>
            <select
              name="status"
              value={form.status}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-blue-500 focus:bg-white"
            >
              <option value="active">{t("departments.active")}</option>
              <option value="inactive">{t("departments.inactive")}</option>
            </select>
          </label>

          <label className="col-span-2 block">
            <span className="mb-1.5 block text-sm font-medium text-slate-700">
              {t("departments.selectManager")}
            </span>
            <select
              name="manager_id"
              value={form.manager_id}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-blue-500 focus:bg-white"
            >
              <option value="">{t("departments.noManager")}</option>
              {managers.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                  {m.department ? ` (${m.department})` : ""}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="flex justify-end gap-3 pt-1">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            {t("common.cancel")}
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:bg-blue-300"
          >
            {isSaving ? t("departments.saving") : t("departments.saveChanges")}
          </button>
        </div>
      </form>
    </ModalShell>
  );
}
