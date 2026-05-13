import ModalShell from "@/features/users/components/ModalShell";
import { useTranslation } from "react-i18next";
import type { DocumentRecord } from "@/features/documents/types/document.types";

interface DeleteDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  document: DocumentRecord | null;
  isDeleting: boolean;
}

export default function DeleteDocumentModal({
  isOpen,
  onClose,
  onConfirm,
  document: doc,
  isDeleting,
}: DeleteDocumentModalProps) {
  const { t } = useTranslation();

  return (
    <ModalShell
      isOpen={isOpen}
      onClose={onClose}
      title={t("documents.deleteTitle")}
      maxWidth="max-w-lg"
    >
      {doc ? (
        <div className="space-y-5">
          <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-4">
            <p className="text-sm font-medium text-red-700">
              {t("documents.deleteConfirm")}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-600 space-y-1">
            <p>
              <span className="font-semibold text-slate-900">
                {t("documents.file")}:
              </span>{" "}
              {doc.file_name}
            </p>
            <p>
              <span className="font-semibold text-slate-900">
                {t("documents.type")}:
              </span>{" "}
              {t(`documents.fileTypes.${doc.file_type}`, {
                defaultValue: doc.file_type,
              })}
            </p>
            <p>
              <span className="font-semibold text-slate-900">
                {t("documents.employee")}:
              </span>{" "}
              {doc.owner?.name ?? `User #${doc.user_id}`}
            </p>
            <p>
              <span className="font-semibold text-slate-900">
                {t("documents.uploaded")}:
              </span>{" "}
              {doc.created_at || doc.createdAt
                ? new Date(
                    doc.created_at || doc.createdAt!,
                  ).toLocaleDateString()
                : "—"}
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
                ? t("documents.deleting")
                : t("documents.deleteTitle")}
            </button>
          </div>
        </div>
      ) : null}
    </ModalShell>
  );
}
