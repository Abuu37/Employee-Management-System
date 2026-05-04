import { useState } from "react";
import { FiEdit2, FiEye, FiPlus, FiTrash2, FiBriefcase } from "react-icons/fi";
import { useTranslation } from "react-i18next";
import type { ProjectItem } from "./types";
import { useUser } from "@/context/UserContext";

const PAGE_SIZE = 8;

// Component for displaying a table of projects with actions to view, edit, or delete each project
interface ProjectTableProps {
  title: string;
  projects: ProjectItem[];
  emptyMessage: string;
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

// Mapping of project status to corresponding CSS classes for styling in the project table
const statusClassMap: Record<ProjectItem["status"], string> = {
  pending: "bg-amber-50 text-amber-700",
  in_progress: "bg-blue-50 text-blue-700",
  complete: "bg-emerald-50 text-emerald-700",
};

// Mapping of project status to human-readable labels for display in the project table
const statusLabelMap: Record<ProjectItem["status"], string> = {
  pending: "Pending",
  in_progress: "In Progress",
  complete: "Complete",
};

// Determine if the current user is an admin to conditionally render certain columns and actions in the project table

function ProjectTable({
  title,
  projects,
  emptyMessage,
  onAdd,
  onView,
  onEdit,
  onDelete,
  onUpdateStatus,
}: ProjectTableProps) {
  const { user } = useUser();
  const isAdmin = user?.role === "admin";
  const { t } = useTranslation();
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(projects.length / PAGE_SIZE));
  const paginated = projects.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

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
              <th className="px-5 py-3 font-medium">
                {t("projects.projectName")}
              </th>
              <th className="px-5 py-3 font-medium">
                {t("projects.startDate")}
              </th>
              <th className="px-5 py-3 font-medium">{t("projects.endDate")}</th>
              <th className="px-5 py-3 font-medium">{t("projects.status")}</th>
              {isAdmin && (
                <th className="px-5 py-3 font-medium">
                  {t("projects.manager")}
                </th>
              )}
              <th className="px-5 py-3 justify-end font-medium">
                {t("projects.actions")}
              </th>
            </tr>
          </thead>

          <tbody>
            {projects.length > 0 ? (
              paginated.map((project, index) => (
                <tr key={project.id} className="border-t border-slate-100">
                  <td className="px-5 py-4 font-semibold text-slate-900">
                    {(page - 1) * PAGE_SIZE + index + 1}
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
                    <select
                      className={`rounded-xl border px-2 py-1 text-xs font-medium ${statusClassMap[project.status]}`}
                      value={project.status}
                      onChange={(e) => onUpdateStatus(project, e.target.value)}
                    >
                      <option value="pending">{t("projects.pending")}</option>
                      <option value="in_progress">
                        {t("projects.inProgress")}
                      </option>
                      <option value="complete">{t("projects.complete")}</option>
                    </select>
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
                        onClick={() => onEdit(project)}
                        className="inline-flex items-center gap-1 rounded-lg border
                         border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-100"
                      >
                        <FiEdit2 className="h-3.5 w-3.5" />
                        {t("common.edit")}
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
                  colSpan={isAdmin ? 7 : 6}
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
      {/* Pagination */}
      <div className="flex items-center justify-end gap-3 border-t border-slate-200 px-5 py-4">
        <button
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1}
          className="rounded-lg border border-slate-300 bg-white px-3 py-1 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:bg-slate-100"
        >
          {t("projects.previous")}
        </button>
        <button
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          disabled={page === totalPages}
          className="rounded-lg border border-slate-300 bg-white px-3 py-1 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:bg-slate-100"
        >
          {t("projects.next")}
        </button>
      </div>
    </section>
  );
}

export default ProjectTable;
