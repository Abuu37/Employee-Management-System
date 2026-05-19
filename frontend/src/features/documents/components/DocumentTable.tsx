import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import {
  FiEye,
  FiCheckCircle,
  FiAlertTriangle,
  FiTrash2,
  FiLock,
  FiUsers,
  FiGlobe,
  FiShield,
  FiFileText,
} from "react-icons/fi";
import type { DocumentRecord } from "@/features/documents/types/document.types";
import TablePagination from "@/components/common/TablePagination";
import SortArrow from "@/components/common/SortArrow";
import { useUser } from "@/context/UserContext";

interface DocumentTableProps {
  data: DocumentRecord[];
  loading?: boolean;
  total: number;
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  sortBy?: string;
  sortOrder?: "ASC" | "DESC";
  onSort?: (col: string) => void;
  role: string;
  onAdd: () => void;
  onDelete: (doc: DocumentRecord) => void;
  onView: (doc: DocumentRecord) => void;
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

const visibilityConfig: Record<
  string,
  { bg: string; border: string; text: string; icon: ReactNode }
> = {
  private: {
    bg: "bg-slate-100",
    border: "border-slate-200",
    text: "text-slate-600",
    icon: <FiLock className="h-3 w-3" />,
  },
  team: {
    bg: "bg-blue-50",
    border: "border-blue-200",
    text: "text-blue-600",
    icon: <FiUsers className="h-3 w-3" />,
  },
  company: {
    bg: "bg-purple-50",
    border: "border-purple-200",
    text: "text-purple-600",
    icon: <FiGlobe className="h-3 w-3" />,
  },
};

export default function DocumentTable({
  data,
  loading = false,
  total,
  page,
  totalPages,
  onPageChange,
  sortBy,
  sortOrder,
  onSort,
  role,
  onAdd,
  onDelete,
  onView,
  onVerify,
}: DocumentTableProps) {
  const { t } = useTranslation();
  const { user } = useUser();

  // Sort helper for th props
  const thSort = (col: string) => ({
    onClick: () => onSort?.(col),
    className: onSort
      ? "px-5 py-3 font-medium cursor-pointer select-none hover:text-slate-800"
      : "px-5 py-3 font-medium",
  });

  return (
    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
        <h3 className="text-base font-semibold text-slate-800">
          {t("documents.allDocuments")}
        </h3>
        <div className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
          {total} records
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-500">
            <tr>
              <th className="px-5 py-3 font-medium">S/N</th>
              <th {...thSort("file_name")}>
                {t("documents.fileName")}
                <SortArrow
                  column="file_name"
                  sortBy={sortBy ?? ""}
                  sortOrder={sortOrder ?? "DESC"}
                />
              </th>
              <th {...thSort("file_type")}>
                {t("documents.type")}
                <SortArrow
                  column="file_type"
                  sortBy={sortBy ?? ""}
                  sortOrder={sortOrder ?? "DESC"}
                />
              </th>
              <th {...thSort("visibility")}>
                {t("documents.visibility")}
                <SortArrow
                  column="visibility"
                  sortBy={sortBy ?? ""}
                  sortOrder={sortOrder ?? "DESC"}
                />
              </th>
              <th className="px-5 py-3 font-medium">{t("documents.status")}</th>
              {role !== "employee" && (
                <th className="px-5 py-3 font-medium">
                  {t("documents.uploadedBy")}
                </th>
              )}
              <th {...thSort("created_at")}>
                {t("documents.date")}
                <SortArrow
                  column="created_at"
                  sortBy={sortBy ?? ""}
                  sortOrder={sortOrder ?? "DESC"}
                />
              </th>
              <th className="px-5 py-3 font-medium">
                {t("documents.actions")}
              </th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan={role === "employee" ? 7 : 8}
                  className="px-5 py-16 text-center text-sm text-slate-400"
                >
                  Loading...
                </td>
              </tr>
            ) : data.length > 0 ? (
              data.map((doc, idx) => {
                const vis =
                  visibilityConfig[doc.visibility] ?? visibilityConfig.private;
                const rowNum = (page - 1) * 10 + idx + 1;

                return (
                  <tr key={doc.id} className="border-t border-slate-100">
                    <td className="px-5 py-4 font-semibold text-slate-900">
                      {rowNum}
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
                        className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${vis.bg} ${vis.border} ${vis.text}`}
                      >
                        {vis.icon}
                        {doc.visibility
                          ? doc.visibility.charAt(0).toUpperCase() +
                            doc.visibility.slice(1)
                          : "Private"}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      {doc.is_verified ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-600">
                          <FiCheckCircle className="h-3.5 w-3.5" />
                          {t("documents.verifiedStatus")}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-600">
                          <FiAlertTriangle className="h-3.5 w-3.5" />
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
                          onClick={() => onView(doc)}
                          className="inline-flex items-center gap-1 rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-600 transition hover:bg-blue-100"
                          title="View"
                        >
                          <FiEye className="h-3.5 w-3.5" />
                          View
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
                          doc.uploaded_by === user?.id) && (
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
                  colSpan={role === "employee" ? 7 : 8}
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

      <TablePagination
        page={page}
        totalPages={totalPages}
        onPageChange={onPageChange}
      />
    </section>
  );
}
