import ModalShell from "@/features/users/components/ModalShell";
import React from "react";
import { FiXCircle } from "react-icons/fi";
import { useTranslation } from "react-i18next";

interface LogoutConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading?: boolean;
}

const LogoutConfirmModal: React.FC<LogoutConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  isLoading = false,
}) => {
  const { t } = useTranslation();
  return (
    <ModalShell
      isOpen={isOpen}
      onClose={onClose}
      title={t("logout.title")}
      maxWidth="max-w-md"
    >
      <div className="space-y-5">
        <div className="flex items-center gap-3 rounded-2xl border border-red-100 bg-red-50 px-4 py-4">
          <span className="flex items-center justify-center">
            <span className="relative flex h-10 w-10 items-center justify-center">
              <span className="absolute inset-0 rounded-full bg-red-500 border-4 border-white" />
              <FiXCircle className="relative h-6 w-6 text-white" />
            </span>
          </span>
          <p className="text-sm font-medium text-red-700">
            {t("logout.message")}
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
            disabled={isLoading}
            className="rounded-xl bg-red-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-red-300"
          >
            {isLoading ? t("logout.loggingOut") : t("logout.confirm")}
          </button>
        </div>
      </div>
    </ModalShell>
  );
};

export default LogoutConfirmModal;
