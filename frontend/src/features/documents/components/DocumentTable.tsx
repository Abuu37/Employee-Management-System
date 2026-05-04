import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  FiDownload,
  FiCheckCircle,
  FiPlus,
  FiTrash2,
  FiEye,
  FiShield,
  FiFileText,
} from "react-icons/fi";
import type { DocumentRecord } from "@/services/document.service";

const PAGE_SIZE = 8;

interface DocumentTableProps {
  data: DocumentRecord[];
  role: string;
  onAdd: () => void;
  onDelete: (doc: DocumentRecord) => void;
  onDownload: (doc: DocumentRecord) => void;
  onVerify?: (doc: DocumentRecord) => void;
}

const fileTypeLabels: Record<string, string> = {
  contract: "Contract",
  id: "ID Document",
  cv: "CV / Resume",
  certificate: "Certificate",
  performance_report: "Performance Report",
  evaluation: "Evaluation",
};

const visibilityBadge: Record<string, { bg: string; text: string }> = {
  private: { bg: "bg-slate-100 text-slate-600", text: "Private" },
  team: { bg: "bg-blue-50 text-blue-600", text: "Team" },
  company: { bg: "bg-purple-50 text-purple-600", text: "Company" },
};

export default function DocumentTable({
  data,
  role,
  onAdd,
  onDelete,
  onDownload,
  onVerify,
}: DocumentTableProps) {
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(data.length / PAGE_SIZE));
  const paginated = data.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const { t } = useTranslation();

  return (
    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
        <h3 className="text-base font-semibold text-slate-800">
          {t("documents.allDocuments")}
        </h3>
        <div className="flex items-center gap-3">
          <div className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
            {data.length} records
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-500">
            <tr>
              <th className="px-5 py-3 font-medium">S/N</th>
              <th className="px-5 py-3 font-medium">
                {t("documents.fileName")}
              </th>
              <th className="px-5 py-3 font-medium">{t("documents.type")}</th>
              <th className="px-5 py-3 font-medium">
                {t("documents.visibility")}
              </th>
              <th className="px-5 py-3 font-medium">{t("documents.status")}</th>
              {role !== "employee" && (
                <th className="px-5 py-3 font-medium">
                  {t("documents.uploadedBy")}
                </th>
              )}
              <th className="px-5 py-3 font-medium">{t("documents.date")}</th>
              <th className="px-5 py-3 font-medium">
                {t("documents.actions")}
              </th>
            </tr>
          </thead>

          <tbody>
            {data.length > 0 ? (
              paginated.map((doc, idx) => {
                const vis =
                  visibilityBadge[doc.visibility] ?? visibilityBadge.private;

                return (
                  <tr key={doc.id} className="border-t border-slate-100">
                    <td className="px-5 py-4 font-semibold text-slate-900">
                      {(page - 1) * PAGE_SIZE + idx + 1}
                    </td>

                    <td className="px-5 py-4 text-slate-600 max-w-50 truncate">
                      {doc.file_name}
                    </td>
                    <td className="px-5 py-4">
                      {doc.file_type ? (
                        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
                          {fileTypeLabels[doc.file_type] ?? doc.file_type}
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400">—</span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-medium ${vis.bg}`}
                      >
                        {vis.text}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      {doc.is_verified ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-1 text-xs font-medium text-green-600">
                          <FiCheckCircle className="h-3.5 w-3.5" />
                          {t("documents.verifiedStatus")}
                        </span>
                      ) : (
                        <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-600">
                          {t("documents.pendingStatus")}
                        </span>
                      )}
                    </td>
                    {role !== "employee" && (
                      <td className="px-5 py-4 text-slate-600">
                        {doc.uploader?.name ?? `User #${doc.uploaded_by}`}
                      </td>
                    )}
                    <td className="px-5 py-4 text-slate-600">
                      {doc.created_at || doc.createdAt
                        ? new Date(
                            doc.created_at || doc.createdAt!,
                          ).toLocaleDateString()
                        : "—"}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => onDownload(doc)}
                          className="inline-flex items-center gap-1 rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-600 transition hover:bg-blue-100"
                          title="Download"
                        >
                          <FiDownload className="h-3.5 w-3.5" />
                          {t("documents.download")}
                        </button>

                        {(role === "admin" || role === "manager") &&
                          !doc.is_verified &&
                          onVerify && (
                            <button
                              type="button"
                              onClick={() => onVerify(doc)}
                              className="inline-flex items-center gap-1 rounded-lg border border-green-200 bg-green-50 px-3 py-1.5 text-xs font-medium text-green-600 transition hover:bg-green-100"
                              title="Verify"
                            >
                              <FiShield className="h-3.5 w-3.5" />
                              {t("documents.verify")}
                            </button>
                          )}

                        {(role === "admin" ||
                          role === "manager" ||
                          doc.uploaded_by ===
                            Number(localStorage.getItem("user-id"))) && (
                          <button
                            type="button"
                            onClick={() => onDelete(doc)}
                            className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-500 transition hover:text-white"
                            title="Delete"
                          >
                            <FiTrash2 className="h-3.5 w-3.5" />
                            {t("documents.delete")}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td
                  colSpan={role === "employee" ? 7 : 9}
                  className="px-5 py-16 text-center"
                >
                  <div className="flex flex-col items-center justify-center text-slate-400">
                    <FiFileText className="h-12 w-12 mb-3 opacity-30" />
                    <p className="text-sm">{t("documents.noDocuments")}</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {/* Pagination */}
      <div className="flex items-center justify-end gap-3 border-t border-slate-200 px-5 py-4">
        <button
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1}
          className="rounded-lg border border-slate-300 bg-white px-3 py-1 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:bg-slate-100"
        >
          {t("common.previous")}
        </button>
        <button
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          disabled={page === totalPages}
          className="rounded-lg border border-slate-300 bg-white px-3 py-1 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:bg-slate-100"
        >
          {t("common.next")}
        </button>
      </div>
    </section>
  );
}
