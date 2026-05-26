import { useEffect, useState } from "react";
import { Formik, Form, ErrorMessage } from "formik";
import * as Yup from "yup";
import { FiDollarSign } from "react-icons/fi";
import ModalShell from "@/features/users/components/ModalShell";
import { useTranslation } from "react-i18next";
import { getAllSalaries } from "@/features/salary/services/salary.service";

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

const currentYear = new Date().getFullYear();
const yearOptions = Array.from({ length: 10 }, (_, i) => currentYear - 5 + i);

const payrollValidationSchema = Yup.object({
  user_id: Yup.number()
    .typeError("Please select an employee")
    .min(1, "Please select an employee")
    .required("Employee is required"),
  month: Yup.number()
    .typeError("Please select a month")
    .min(1, "Please select a month")
    .max(12)
    .required("Month is required"),
  year: Yup.number()
    .typeError("Year must be a number")
    .min(2000, "Year must be 2000 or later")
    .max(currentYear + 1, `Year cannot exceed ${currentYear + 1}`)
    .required("Year is required"),
});

const fieldClass = (hasError: boolean) =>
  `w-full rounded-2xl border px-4 py-3 text-sm text-slate-900 outline-none transition ${
    hasError
      ? "border-red-500 bg-white focus:border-red-500"
      : "border-slate-200 bg-slate-50 focus:border-blue-500 focus:bg-white"
  }`;

export default function GeneratePayrollModal({
  isOpen,
  onClose,
  onSave,
  isSaving,
}: GeneratePayrollModalProps) {
  const { t } = useTranslation();
  const [users, setUsers] = useState<UserOption[]>([]);

  //============== Load users (with salary) when modal opens =============
  useEffect(() => {
    if (!isOpen) return;
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

  const initialValues: PayrollFormValues = { user_id: 0, month: 0, year: 0 };

  return (
    <ModalShell
      isOpen={isOpen}
      onClose={onClose}
      title={
        <span className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
            <FiDollarSign className="h-4 w-4" />
          </span>
          {t("payroll.generatePayroll") || "Generate Payroll"}
        </span>
      }
      maxWidth="max-w-2xl"
    >
      <Formik
        key={isOpen ? "open" : "closed"}
        initialValues={initialValues}
        validationSchema={payrollValidationSchema}
        onSubmit={async (values) => {
          await onSave(values);
        }}
      >
        {({ errors, touched, setFieldValue, values }) => (
          <Form className="space-y-5">
            <div className="grid gap-4">
              {/* Select Employee */}
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  {t("payroll.selectEmployee")}{" "}
                  <span className="text-red-500">*</span>
                </label>
                <select
                  value={values.user_id || ""}
                  onChange={(e) =>
                    setFieldValue(
                      "user_id",
                      e.target.value ? Number(e.target.value) : 0,
                    )
                  }
                  className={fieldClass(!!(errors.user_id && touched.user_id))}
                >
                  <option value="" disabled>
                    {t("payroll.selectEmployee")}
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

              {/*=====================  Month ========================= */}
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  {t("payroll.month")} <span className="text-red-500">*</span>
                </label>
                <select
                  value={values.month || ""}
                  onChange={(e) =>
                    setFieldValue(
                      "month",
                      e.target.value ? Number(e.target.value) : 0,
                    )
                  }
                  className={fieldClass(!!(errors.month && touched.month))}
                >
                  <option value="" disabled>
                    {t("payroll.selectMonth")}
                  </option>
                  {monthNames.map((name, i) => (
                    <option key={i + 1} value={i + 1}>
                      {name}
                    </option>
                  ))}
                </select>
                <ErrorMessage
                  name="month"
                  component="p"
                  className="mt-1 text-xs text-red-500"
                />
              </div>

              {/* Year */}
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  {t("payroll.year")} <span className="text-red-500">*</span>
                </label>
                <select
                  value={values.year || ""}
                  onChange={(e) =>
                    setFieldValue(
                      "year",
                      e.target.value ? Number(e.target.value) : 0,
                    )
                  }
                  className={fieldClass(!!(errors.year && touched.year))}
                >
                  <option value="" disabled>
                    {t("select Year") || "Select Year"}
                  </option>
                  {yearOptions.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
                <ErrorMessage
                  name="year"
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
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
              >
                {isSaving
                  ? t("payroll.generating")
                  : t("payroll.generatePayroll")}
              </button>
            </div>
          </Form>
        )}
      </Formik>
    </ModalShell>
  );
}
