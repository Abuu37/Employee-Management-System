import { useEffect, useState } from "react";
import axios from "axios";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { FiFileText } from "react-icons/fi";
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

const salaryValidationSchema = Yup.object({
  user_id: Yup.number()
    .typeError("Please select a staff member")
    .min(1, "Please select a staff member")
    .required("Staff member is required"),
  base_salary: Yup.number()
    .typeError("Base salary must be a number")
    .positive("Base salary must be greater than 0")
    .required("Base salary is required"),
  bonus: Yup.number()
    .typeError("Bonus must be a number")
    .min(0, "Bonus cannot be negative")
    .required(),
  allowance: Yup.number()
    .typeError("Allowance must be a number")
    .min(0, "Allowance cannot be negative")
    .required(),
  tax_percentage: Yup.number()
    .typeError("Tax percentage must be a number")
    .min(0, "Tax cannot be negative")
    .max(100, "Tax cannot exceed 100%")
    .required(),
});

const fieldClass = (hasError: boolean) =>
  `w-full rounded-2xl border px-4 py-3 text-sm text-slate-900 outline-none transition ${
    hasError
      ? "border-red-500 bg-white focus:border-red-500"
      : "border-slate-200 bg-slate-50 focus:border-blue-500 focus:bg-white"
  }`;

// This component is used for both creating a new salary record and editing an existing one. If `salary` prop is provided, it will be in edit mode and pre-fill the form with the existing values. Otherwise, it will be in create mode with empty form fields.
export default function SetSalaryModal({
  isOpen,
  onClose,
  onSave,
  isSaving,
  salary,
}: SetSalaryModalProps) {
  const { t } = useTranslation();
  const [users, setUsers] = useState<UserOption[]>([]);

  //============== Load users when modal opens =============
  useEffect(() => {
    if (!isOpen) return;
    const token = getAccessToken();
    axios
      .get("/api/user/view-users", {
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

  const initialValues: SalaryFormValues = {
    user_id: salary ? salary.user_id : 0,
    base_salary: salary ? Number(salary.base_salary) : 0,
    bonus: salary ? Number(salary.bonus) : 0,
    allowance: salary ? Number(salary.allowance) : 0,
    tax_percentage: salary ? Number(salary.tax_percentage) : 0,
  };

  return (
    <ModalShell
      isOpen={isOpen}
      onClose={onClose}
      title={
        <span className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
            <FiFileText className="h-4 w-4" />
          </span>
          {salary ? t("salary.editSalary") : t("salary.setSalary")}
        </span>
      }
      maxWidth="max-w-2xl"
    >
      <Formik
        enableReinitialize
        initialValues={initialValues}
        validationSchema={salaryValidationSchema}
        onSubmit={async (values) => {
          await onSave(values);
        }}
      >
        {({ errors, touched, setFieldValue, values }) => (
          <Form className="space-y-5">
            <div className="grid gap-4">
              {/* Select Staff */}
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  {t("salary.selectStaff")}{" "}
                  <span className="text-red-500">*</span>
                </label>
                <select
                  name="user_id"
                  value={values.user_id || ""}
                  onChange={(e) =>
                    setFieldValue(
                      "user_id",
                      e.target.value ? Number(e.target.value) : 0,
                    )
                  }
                  disabled={!!salary}
                  className={`${fieldClass(!!(errors.user_id && touched.user_id))} disabled:bg-slate-100 disabled:text-slate-400`}
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
                <ErrorMessage
                  name="user_id"
                  component="p"
                  className="mt-1 text-xs text-red-500"
                />
              </div>

              {/* Base Salary */}
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  {t("salary.baseSalary")}{" "}
                  <span className="text-red-500">*</span>
                </label>
                <Field
                  type="number"
                  name="base_salary"
                  className={fieldClass(
                    !!(errors.base_salary && touched.base_salary),
                  )}
                  placeholder="e.g. 50000"
                />
                <ErrorMessage
                  name="base_salary"
                  component="p"
                  className="mt-1 text-xs text-red-500"
                />
              </div>

              {/*======================= Bonus + Allowance ====================== */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    {t("salary.bonus")}
                  </label>
                  <Field
                    type="number"
                    name="bonus"
                    className={fieldClass(!!(errors.bonus && touched.bonus))}
                    placeholder="0"
                  />
                  <ErrorMessage
                    name="bonus"
                    component="p"
                    className="mt-1 text-xs text-red-500"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    {t("salary.allowance")}
                  </label>
                  <Field
                    type="number"
                    name="allowance"
                    className={fieldClass(
                      !!(errors.allowance && touched.allowance),
                    )}
                    placeholder="0"
                  />
                  <ErrorMessage
                    name="allowance"
                    component="p"
                    className="mt-1 text-xs text-red-500"
                  />
                </div>
              </div>

              {/* Tax Percentage */}
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  {t("salary.taxPercent")}
                </label>
                <Field
                  type="number"
                  name="tax_percentage"
                  className={fieldClass(
                    !!(errors.tax_percentage && touched.tax_percentage),
                  )}
                  placeholder="0"
                />
                <ErrorMessage
                  name="tax_percentage"
                  component="p"
                  className="mt-1 text-xs text-red-500"
                />
              </div>
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
          </Form>
        )}
      </Formik>
    </ModalShell>
  );
}
