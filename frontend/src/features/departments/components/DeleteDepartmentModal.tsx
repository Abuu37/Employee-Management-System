import ModalShell from "@/features/users/components/ModalShell";
import { useTranslation } from "react-i18next";
import type { Department } from "../types";

interface DeleteDepartmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  department: Department | null;
  isDeleting: boolean;
}

export default function DeleteDepartmentModal({
  isOpen,
  onClose,
  onConfirm,
  department,
  isDeleting,
}: DeleteDepartmentModalProps) {
  const { t } = useTranslation();

  return (
    <ModalShell
      isOpen={isOpen}
      onClose={onClose}
      title={t("departments.deleteTitle")}
      maxWidth="max-w-lg"
    >
      {department ? (
        <div className="space-y-5">
          <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-4">
            <p className="text-sm font-medium text-red-700">
              {t("departments.deleteConfirm", { name: department.name })}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-600">
            <p>
              <span className="font-semibold text-slate-900">
                {t("departments.manager")}:
              </span>{" "}
              {department.manager?.name ?? t("departments.unassigned")}
            </p>
            <p className="mt-1">
              <span className="font-semibold text-slate-900">
                {t("common.status")}:
              </span>{" "}
              {department.status === "active"
                ? t("departments.active")
                : t("departments.inactive")}
            </p>
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
              type="button"
              onClick={onConfirm}
              disabled={isDeleting}
              className="rounded-xl bg-red-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-red-300"
            >
              {isDeleting
                ? t("departments.deleting")
                : t("departments.deleteTitle")}
            </button>
          </div>
        </div>
      ) : null}
    </ModalShell>
  );
}
