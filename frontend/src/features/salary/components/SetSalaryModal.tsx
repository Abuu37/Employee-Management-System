import { useEffect, useState } from "react";
import axios from "axios";
import ModalShell from "@/features/users/components/ModalShell";
import { useTranslation } from "react-i18next";
import { getAccessToken } from "@/features/auth/services/authSession";
import type { SalaryRecord } from "../services/salary.service";

export interface SalaryFormValues {
  user_id: number;
  base_salary: number;
  bonus: number;
  allowance: number;
  tax_percentage: number;
}

interface UserOption {
  id: number;
  name: string;
}

interface SetSalaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (values: SalaryFormValues) => Promise<void>;
  isSaving: boolean;
  salary?: SalaryRecord | null;
}

// This component is used for both creating a new salary record and editing an existing one. If `salary` prop is provided, it will be in edit mode and pre-fill the form with the existing values. Otherwise, it will be in create mode with empty form fields.
export default function SetSalaryModal({
  isOpen,
  onClose,
  onSave,
  isSaving,
  salary,
}: SetSalaryModalProps) {
  const { t } = useTranslation();
  const [formValues, setFormValues] = useState<SalaryFormValues>({
    user_id: 0,
    base_salary: 0,
    bonus: 0,
    allowance: 0,
    tax_percentage: 0,
  });

  const [users, setUsers] = useState<UserOption[]>([]);

  //============== Load users when modal opens =============
  useEffect(() => {
    if (!isOpen) return;
    const token = getAccessToken();
    axios
      .get("http://localhost:5000/api/user/view-users", {
        headers: { Authorization: `Bearer ${token ?? ""}` },
      })
      .then((res) => {
        const list = Array.isArray(res.data)
          ? res.data
          : (res.data.users ?? []);
        setUsers(list.map((u: any) => ({ id: u.id, name: u.name })));
      })
      .catch(console.error);
  }, [isOpen]);

  //============== Load salary data when modal opens =============
  useEffect(() => {
    if (salary) {
      setFormValues({
        user_id: salary.user_id,
        base_salary: Number(salary.base_salary),
        bonus: Number(salary.bonus),
        allowance: Number(salary.allowance),
        tax_percentage: Number(salary.tax_percentage),
      });
      return;
    }

    setFormValues({
      user_id: 0,
      base_salary: 0,
      bonus: 0,
      allowance: 0,
      tax_percentage: 0,
    });
  }, [salary, isOpen]);

  //==============  handle form changes ===================
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({
      ...prev,
      [name]: Number(value),
    }));
  };

  //==============  fuction handle submit ===================
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await onSave(formValues);
  };

  return (
    <ModalShell
      isOpen={isOpen}
      onClose={onClose}
      title={salary ? t("salary.editSalary") : t("salary.setSalary")}
      maxWidth="max-w-2xl"
    >
      <form className="space-y-5" onSubmit={handleSubmit}>
        <div className="grid gap-4">
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">
              {t("salary.selectStaff")}
            </span>
            <select
              name="user_id"
              value={formValues.user_id || ""}
              onChange={handleChange}
              disabled={!!salary}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white disabled:bg-slate-100 disabled:text-slate-400"
              required
            >
              <option value="" disabled>
                {t("salary.selectStaff")}
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
              {t("salary.baseSalary")}
            </span>
            <input
              type="number"
              name="base_salary"
              value={formValues.base_salary || ""}
              onChange={handleChange}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm
              text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white"
              placeholder="e.g. 50000"
              required
            />
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">
                {t("salary.bonus")}
              </span>
              <input
                type="number"
                name="bonus"
                value={formValues.bonus || ""}
                onChange={handleChange}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm
                text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white"
                placeholder="0"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">
                {t("salary.allowance")}
              </span>
              <input
                type="number"
                name="allowance"
                value={formValues.allowance || ""}
                onChange={handleChange}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm
                text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white"
                placeholder="0"
              />
            </label>
          </div>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">
              {t("salary.taxPercent")}
            </span>
            <input
              type="number"
              name="tax_percentage"
              value={formValues.tax_percentage || ""}
              onChange={handleChange}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm
               text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white"
              placeholder="0"
            />
          </label>
        </div>

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
          >
            {t("common.cancel")}
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
          >
            {isSaving
              ? t("salary.saving")
              : salary
                ? t("salary.saveChanges")
                : t("salary.setSalary")}
          </button>
        </div>
      </form>
    </ModalShell>
  );
}
