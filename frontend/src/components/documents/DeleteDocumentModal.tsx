import ModalShell from "../user/ModalShell";
import type { DocumentRecord } from "../../services/documentService";

const fileTypeLabels: Record<string, string> = {
  contract: "Contract",
  id: "ID Document",
  cv: "CV / Resume",
  certificate: "Certificate",
  performance_report: "Performance Report",
  evaluation: "Evaluation",
};

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
  return (
    <ModalShell
      isOpen={isOpen}
      onClose={onClose}
      title="Delete Document"
      maxWidth="max-w-lg"
    >
      {doc ? (
        <div className="space-y-5">
          <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-4">
            <p className="text-sm font-medium text-red-700">
              Are you sure you want to delete this document? This action cannot
              be undone.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-600 space-y-1">
            <p>
              <span className="font-semibold text-slate-900">File:</span>{" "}
              {doc.file_name}
            </p>
            <p>
              <span className="font-semibold text-slate-900">Type:</span>{" "}
              {fileTypeLabels[doc.file_type] ?? doc.file_type}
            </p>
            <p>
              <span className="font-semibold text-slate-900">Employee:</span>{" "}
              {doc.owner?.name ?? `User #${doc.user_id}`}
            </p>
            <p>
              <span className="font-semibold text-slate-900">Uploaded:</span>{" "}
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
              Cancel
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={isDeleting}
              className="rounded-xl bg-red-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-red-300"
            >
              {isDeleting ? "Deleting..." : "Delete Document"}
            </button>
          </div>
        </div>
      ) : null}
    </ModalShell>
  );
}
