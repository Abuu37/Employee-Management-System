import {
  FiEye,
  FiTrash2,
  FiBriefcase,
  FiAlertTriangle,
  FiClock,
  FiCheckCircle,
} from "react-icons/fi";
import type { ReactNode } from "react";
import SortArrow from "@/components/common/SortArrow";
import { useTranslation } from "react-i18next";
import type { ProjectItem } from "@/features/projects/types/project.types";
import { useUser } from "@/context/UserContext";
import TablePagination from "@/components/common/TablePagination";

// Component for displaying a table of projects with actions to view, edit, or delete each project
interface ProjectTableProps {
  title: string;
  projects: ProjectItem[];
  emptyMessage: string;
  // server-side pagination
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  // sort
  sortBy: string;
  sortOrder: string;
  onSort: (col: string) => void;
  onAdd: () => void;
  onView: (project: ProjectItem) => void;
  onEdit: (project: ProjectItem) => void;
  onDelete: (project: ProjectItem) => void;
  onUpdateStatus: (project: ProjectItem, status: string) => void;
}

// Helper function to format date strings for display in the project table
const formatDate = (value: string) => {
  if (!value) {
    return "-";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return date.toLocaleDateString("en-GB");
};

const statusConfig: Record<
  ProjectItem["status"],
  { bg: string; border: string; text: string; icon: ReactNode; label: string }
> = {
  pending: {
    bg: "bg-amber-50",
    border: "border-amber-200",
    text: "text-amber-700",
    icon: <FiAlertTriangle className="h-3.5 w-3.5" />,
    label: "Pending",
  },
  in_progress: {
    bg: "bg-blue-50",
    border: "border-blue-200",
    text: "text-blue-700",
    icon: <FiClock className="h-3.5 w-3.5" />,
    label: "In Progress",
  },
  complete: {
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    text: "text-emerald-700",
    icon: <FiCheckCircle className="h-3.5 w-3.5" />,
    label: "Complete",
  },
};

const priorityConfig: Record<
  NonNullable<ProjectItem["priority"]>,
  { bg: string; border: string; text: string; label: string }
> = {
  low: {
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    text: "text-emerald-700",
    label: "Low",
  },
  medium: {
    bg: "bg-amber-50",
    border: "border-amber-200",
    text: "text-amber-700",
    label: "Medium",
  },
  high: {
    bg: "bg-rose-50",
    border: "border-rose-200",
    text: "text-rose-700",
    label: "High",
  },
};

function ProjectTable({
  title,
  projects,
  emptyMessage,
  page,
  totalPages,
  onPageChange,
  sortBy,
  sortOrder,
  onSort,
  onAdd,
  onView,
  onEdit,
  onDelete,
  onUpdateStatus,
}: ProjectTableProps) {
  const { user } = useUser();
  const isAdmin = user?.role === "admin";
  const { t } = useTranslation();

  const thSort = (col: string) => ({
    onClick: () => onSort(col),
    className:
      "px-5 py-3 font-medium cursor-pointer select-none hover:text-slate-800",
  });

  return (
    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
        <h3 className="text-base font-semibold text-slate-800">{title}</h3>
        <div className="flex items-center gap-3">
          <div className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
            {projects.length} {t("projects.records")}
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-500">
            <tr>
              <th className="px-5 py-3 font-medium">S/N</th>
              <th {...thSort("name")}>
                {t("projects.projectName")}
                <SortArrow
                  column="name"
                  sortBy={sortBy}
                  sortOrder={sortOrder as "ASC" | "DESC"}
                />
              </th>
              <th {...thSort("startDate")}>
                {t("projects.startDate")}
                <SortArrow
                  column="startDate"
                  sortBy={sortBy}
                  sortOrder={sortOrder as "ASC" | "DESC"}
                />
              </th>
              <th {...thSort("endDate")}>
                {t("projects.endDate")}
                <SortArrow
                  column="endDate"
                  sortBy={sortBy}
                  sortOrder={sortOrder as "ASC" | "DESC"}
                />
              </th>
              <th className="px-5 py-3 font-medium">Priority</th>
              <th {...thSort("status")}>
                {t("projects.status")}
                <SortArrow
                  column="status"
                  sortBy={sortBy}
                  sortOrder={sortOrder as "ASC" | "DESC"}
                />
              </th>
              {isAdmin && (
                <th className="px-5 py-3 font-medium">
                  {t("projects.manager")}
                </th>
              )}
              <th className="px-5 py-3 font-medium">{t("projects.actions")}</th>
            </tr>
          </thead>

          <tbody>
            {projects.length > 0 ? (
              projects.map((project, index) => (
                <tr key={project.id} className="border-t border-slate-100">
                  <td className="px-5 py-4 font-semibold text-slate-900">
                    {(page - 1) * 10 + index + 1}
                  </td>
                  <td className="px-5 py-4 font-semibold text-slate-900">
                    {project.name}
                  </td>

                  <td className="px-5 py-4 text-slate-600">
                    {formatDate(project.startDate)}
                  </td>
                  <td className="px-5 py-4 text-slate-600">
                    {formatDate(project.endDate)}
                  </td>
                  <td className="px-5 py-4">
                    {(() => {
                      const priority = project.priority ?? "medium";
                      const cfg = priorityConfig[priority];
                      return (
                        <span
                          className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${cfg.bg} ${cfg.border} ${cfg.text}`}
                        >
                          {cfg.label}
                        </span>
                      );
                    })()}
                  </td>
                  <td className="px-5 py-4">
                    {(() => {
                      const cfg =
                        statusConfig[project.status] ?? statusConfig.pending;
                      return (
                        <div className="relative inline-flex">
                          {/* visible badge */}
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold pointer-events-none ${
                              cfg.bg
                            } ${cfg.border} ${cfg.text}`}
                          >
                            {cfg.icon}
                            {cfg.label}
                          </span>
                          {/* invisible select overlay for editing */}
                          <select
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            value={project.status}
                            onChange={(e) =>
                              onUpdateStatus(project, e.target.value)
                            }
                          >
                            <option value="pending">
                              {t("projects.pending")}
                            </option>
                            <option value="in_progress">
                              {t("projects.inProgress")}
                            </option>
                            <option value="complete">
                              {t("projects.complete")}
                            </option>
                          </select>
                        </div>
                      );
                    })()}
                  </td>

                  {isAdmin && (
                    <td className="px-5 py-4 text-slate-600">
                      {project.managerName || t("projects.unassigned")}
                    </td>
                  )}
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => onView(project)}
                        className="inline-flex items-center gap-1 rounded-lg border border-blue-200 bg-white px-3 py-1.5 text-xs font-medium text-blue-700 hover:bg-blue-500 transition hover:text-white"
                      >
                        <FiEye className="h-4 w-4" />
                        {t("common.view")}
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(project)}
                        className="inline-flex items-center gap-1 rounded-lg border
                         border-red-200 bg-white px-3 py-1.5 text-xs font-medium
                          text-red-700 hover:bg-red-500 transition hover:text-white"
                      >
                        <FiTrash2 className="h-3.5 w-3.5" />
                        {t("common.delete")}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={isAdmin ? 8 : 7}
                  className="px-5 py-16 text-center"
                >
                  <div className="flex flex-col items-center justify-center text-slate-400">
                    <FiBriefcase className="h-12 w-12 mb-3 opacity-30" />
                    <p className="text-sm">{emptyMessage}</p>
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

export default ProjectTable;
