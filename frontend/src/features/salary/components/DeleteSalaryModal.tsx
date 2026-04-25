import ModalShell from "@/features/employees/components/ModalShell";
import type { SalaryRecord } from "@/services/salary.service";

interface DeleteSalaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  salary: SalaryRecord | null;
  isDeleting: boolean;
}

export default function DeleteSalaryModal({
  isOpen,
  onClose,
  onConfirm,
  salary,
  isDeleting,
}: DeleteSalaryModalProps) {
  return (
    <ModalShell
      isOpen={isOpen}
      onClose={onClose}
      title="Delete Salary"
      maxWidth="max-w-lg"
    >
      {salary ? (
        <div className="space-y-5">
          <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-4">
            <p className="text-sm font-medium text-red-700">
              Are you sure you want to delete the salary record for{" "}
              {salary.user?.name ?? `User #${salary.user_id}`}?
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-600">
            <p>
              <span className="font-semibold text-slate-900">Base Salary:</span>{" "}
              {Number(salary.base_salary).toFixed(2)}
            </p>
            <p className="mt-1">
              <span className="font-semibold text-slate-900">Bonus:</span>{" "}
              {Number(salary.bonus).toFixed(2)}
            </p>
            <p className="mt-1">
              <span className="font-semibold text-slate-900">Allowance:</span>{" "}
              {Number(salary.allowance).toFixed(2)}
            </p>
            <p className="mt-1">
              <span className="font-semibold text-slate-900">Tax:</span>{" "}
              {Number(salary.tax_percentage).toFixed(2)}%
            </p>
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
              type="button"
              onClick={onConfirm}
              disabled={isDeleting}
              className="rounded-xl bg-red-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-red-300"
            >
              {isDeleting ? "Deleting..." : "Delete Salary"}
            </button>
          </div>
        </div>
      ) : null}
    </ModalShell>
  );
}
