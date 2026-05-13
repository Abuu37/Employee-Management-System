import React from "react";
import ModalShell from "@/features/users/components/ModalShell";
import { FiAlertTriangle } from "react-icons/fi";
import { useTranslation } from "react-i18next";

interface CancelLeaveModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const CancelLeaveModal: React.FC<CancelLeaveModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
}) => {
  const { t } = useTranslation();
  return (
    <ModalShell
      isOpen={isOpen}
      onClose={onClose}
      title={t("leaves.cancelTitle")}
      maxWidth="max-w-md"
    >
      <div className="space-y-5">
        <div className="flex items-center gap-3 rounded-2xl border border-orange-100 bg-orange-50 px-4 py-4">
          <span className="flex items-center justify-center">
            <span className="relative flex h-10 w-10 items-center justify-center">
              <span className="absolute inset-0 rounded-full bg-orange-500 border-4 border-white" />
              <FiAlertTriangle className="relative h-6 w-6 text-white" />
            </span>
          </span>
          <p className="text-sm font-medium text-orange-700">
            {t("leaves.cancelWarning")}
          </p>
        </div>
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
          >
            {t("leaves.keepIt")}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="rounded-xl bg-red-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-red-700"
          >
            {t("leaves.cancelConfirm")}
          </button>
        </div>
      </div>
    </ModalShell>
  );
};

export default CancelLeaveModal;
