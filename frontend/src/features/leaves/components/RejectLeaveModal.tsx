import React, { useState, useEffect } from "react";
import ModalShell from "@/features/users/components/ModalShell";
import { useTranslation } from "react-i18next";
import { FiAlertCircle } from "react-icons/fi";
import RichTextEditor from "@/components/editor/RichTextEditor";
import { isRichTextEmpty } from "@/utils/richText";

interface RejectLeaveModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (comment: string) => void;
}

const RejectLeaveModal: React.FC<RejectLeaveModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
}) => {
  const [comment, setComment] = useState("");
  const { t } = useTranslation();

  // Reset comment when modal opens
  useEffect(() => {
    if (isOpen) setComment("");
  }, [isOpen]);

  const handleSubmit = () => {
    if (isRichTextEmpty(comment)) return;
    onConfirm(comment);
    setComment("");
  };

  return (
    <ModalShell
      isOpen={isOpen}
      onClose={onClose}
      title={t("leaves.rejectTitle")}
      maxWidth="max-w-md"
    >
      <div className="space-y-5">
        <div className="flex items-start gap-3 rounded-2xl border border-red-100 bg-red-50 px-4 py-4">
          <span className="mt-0.5 flex items-center justify-center shrink-0">
            <span className="relative flex h-9 w-9 items-center justify-center">
              <span className="absolute inset-0 rounded-full bg-red-500 border-4 border-white" />
              <FiAlertCircle className="relative h-5 w-5 text-white" />
            </span>
          </span>
          <p className="text-sm font-medium text-red-700">
            {t("leaves.rejectWarning")}
          </p>
        </div>

        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-slate-700">
            {t("leaves.rejectReason")} <span className="text-red-500">*</span>
          </label>
          <RichTextEditor
            value={comment}
            onChange={setComment}
            placeholder={t("leaves.rejectPlaceholder")}
            height="120px"
            simple
          />
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
            onClick={handleSubmit}
            disabled={isRichTextEmpty(comment)}
            className="rounded-xl bg-red-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-red-300"
          >
            {t("common.confirm")}
          </button>
        </div>
      </div>
    </ModalShell>
  );
};

export default RejectLeaveModal;
