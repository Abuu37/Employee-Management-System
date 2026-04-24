import { useState } from "react";
import {
  FiDownload,
  FiCheckCircle,
  FiPlus,
  FiTrash2,
  FiEye,
  FiShield,
} from "react-icons/fi";
import type { DocumentRecord } from "../../services/documentService";

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

  return (
    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
        <h3 className="text-lg font-semibold text-slate-900">Documents</h3>
        <div className="flex items-center gap-3">
          {role !== "admin" && (
            <button
              type="button"
              onClick={onAdd}
              disabled={data.length >= 20}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
            >
              <FiPlus className="h-4 w-4" />
              Upload Document
            </button>
          )}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-500">
            <tr>
              <th className="px-5 py-3 font-medium">S/N</th>

              <th className="px-5 py-3 font-medium">File Name</th>
              <th className="px-5 py-3 font-medium">Type</th>
              <th className="px-5 py-3 font-medium">Visibility</th>
              <th className="px-5 py-3 font-medium">Status</th>
              {role !== "employee" && (
                <th className="px-5 py-3 font-medium">Uploaded By</th>
              )}
              <th className="px-5 py-3 font-medium">Date</th>
              <th className="px-5 py-3 font-medium">Actions</th>
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
                          Verified
                        </span>
                      ) : (
                        <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-600">
                          Pending
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
                          Download
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
                              Verify
                            </button>
                          )}

                        {(role === "admin" ||
                          role === "manager" ||
                          doc.uploaded_by ===
                            Number(localStorage.getItem("user-id"))) && (
                          <button
                            type="button"
                            onClick={() => onDelete(doc)}
                            className="inline-flex items-center gap-1 rounded-lg border border-red-100 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-100"
                            title="Delete"
                          >
                            <FiTrash2 className="h-3.5 w-3.5" />
                            Delete
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
                  className="px-5 py-10 text-center text-sm text-slate-500"
                >
                  No documents found
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
          Previous
        </button>
        <button
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          disabled={page === totalPages}
          className="rounded-lg border border-slate-300 bg-white px-3 py-1 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:bg-slate-100"
        >
          Next
        </button>
      </div>
    </section>
  );
}
