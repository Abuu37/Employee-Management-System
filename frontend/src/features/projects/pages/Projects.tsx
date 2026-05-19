import { useTranslation } from "react-i18next";
import {
  FiCheckCircle,
  FiClock,
  FiFolder,
  FiAlertTriangle,
  FiPlus,
} from "react-icons/fi";
import Header from "@/layouts/Header";
import Sidebar from "@/layouts/Sidebar";
import StatCard from "@/features/attendance/components/StatCard";
import ProjectTable from "@/features/projects/components/ProjectTable";
import ProjectForm from "@/features/projects/components/ProjectForm";
import ProjectDetails from "@/features/projects/components/ProjectDetails";
import DeleteConfirmModal from "@/components/common/DeleteConfirmModal";
import { AnimatedSearchIcon } from "@/components/common/AnimatedSearchIcon";
import { useUser } from "@/context/UserContext";
import { useProjectsPage } from "@/features/projects/hooks/useProjectsPage";
import type { ProjectItem } from "@/features/projects/types/project.types";
import useDeleteConfirmation from "@/hooks/useDeleteConfirmation";

function Projects() {
  const { t } = useTranslation();
  const { user } = useUser();
  const deleteConfirmation = useDeleteConfirmation();
  const {
    projects,
    managers,
    stats,
    error,
    feedback,
    tasks,
    employeeOptions,
    activeProject,
    isCreating,
    isSaving,
    isDeleting,
    createOpen,
    viewOpen,
    editOpen,
    deleteOpen,
    search,
    statusFilter,
    sortBy,
    sortOrder,
    page,
    totalPages,
    setSearch,
    setStatusFilter,
    setPage,
    handleSort,
    handleCreateOpen,
    handleViewOpen,
    handleEditOpen,
    handleDeleteOpen,
    handleCreate,
    handleEdit,
    handleDelete,
    handleCreateTask,
    handleDeleteTask,
    handleSwitchToEdit,
    handleCloseModal,
    updateStatus,
  } = useProjectsPage();

  const handleDeleteRequest = (project: ProjectItem) => {
    handleDeleteOpen(project);
    deleteConfirmation.requestDelete({
      title: t("common.delete"),
      message: `Are you sure you want to delete ${project.name}?`,
      confirmLabel: t("common.delete"),
      cancelLabel: t("common.cancel"),
      onConfirm: handleDelete,
    });
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header searchTerm="" onSearchChange={() => {}} />

        <main className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-5">
            {/* ── Page header ─────────────────────────────────────────── */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-slate-900">
                  {t("projects.title")}
                </h1>
                <p className="mt-1 text-sm text-slate-500">
                  {t("projects.subtitle")}
                </p>
              </div>
              {user?.role === "admin" && (
                <button
                  type="button"
                  onClick={handleCreateOpen}
                  className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
                >
                  <FiPlus className="h-4 w-4" />
                  {t("projects.createProject")}
                </button>
              )}
            </div>

            {/* ── Stat cards ──────────────────────────────────────────── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                label={t("projects.totalProjects")}
                value={stats.total}
                icon={<FiFolder />}
                color=""
                featured
                subtitle={t("projects.allProjectsLabel")}
              />
              <StatCard
                label={t("projects.inProgress")}
                value={stats.inProgress}
                icon={<FiClock />}
                color="bg-blue-100 text-blue-600"
                subtitle={t("projects.currentlyActive")}
              />
              <StatCard
                label={t("projects.completed")}
                value={stats.completed}
                icon={<FiCheckCircle />}
                color="bg-emerald-100 text-emerald-600"
                subtitle={t("projects.finishedProjects")}
              />
              <StatCard
                label={t("projects.pending")}
                value={stats.pending}
                icon={<FiAlertTriangle />}
                color="bg-amber-100 text-amber-600"
                subtitle={t("projects.notYetStarted")}
              />
            </div>

            {/* ── Search + filter ─────────────────────────────────────── */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative w-full max-w-sm">
                <AnimatedSearchIcon />
                <input
                  type="text"
                  placeholder={t("projects.searchPlaceholder")}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-4 text-sm text-slate-700 shadow-sm placeholder-slate-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
                />
              </div>

              {/* Status filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 shadow-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
              >
                <option value="all">All Status</option>
                <option value="pending">{t("projects.pending")}</option>
                <option value="in_progress">{t("projects.inProgress")}</option>
                <option value="complete">{t("projects.complete")}</option>
              </select>
            </div>

            {/* ── Alerts ──────────────────────────────────────────────── */}
            {error ? (
              <p className="rounded-2xl bg-red-50 px-5 py-4 text-sm text-red-600">
                {error}
              </p>
            ) : null}
            {feedback ? (
              <p
                className={`mb-4 rounded-2xl px-5 py-4 text-sm font-semibold flex items-center gap-2 ${
                  feedback.type === "success"
                    ? "bg-emerald-100 text-emerald-800 border border-emerald-400"
                    : "bg-red-100 text-red-700 border border-red-400"
                }`}
              >
                {feedback.type === "success" && (
                  <FiCheckCircle
                    className="text-emerald-600 shrink-0"
                    size={18}
                  />
                )}
                {feedback.message}
              </p>
            ) : null}

            {/* ── Table ───────────────────────────────────────────────── */}
            <ProjectTable
              title={t("projects.allProjectsTitle")}
              projects={projects}
              emptyMessage={t("projects.noProjects")}
              page={page}
              totalPages={totalPages}
              onPageChange={setPage}
              sortBy={sortBy}
              sortOrder={sortOrder}
              onSort={handleSort}
              onAdd={handleCreateOpen}
              onView={handleViewOpen}
              onEdit={handleEditOpen}
              onDelete={handleDeleteRequest}
              onUpdateStatus={updateStatus}
            />

            {/* ── Modals ──────────────────────────────────────────────── */}
            <ProjectForm
              isOpen={createOpen}
              onClose={handleCloseModal}
              onSave={handleCreate}
              managers={managers}
              isSaving={isCreating}
            />
            <ProjectForm
              isOpen={editOpen}
              onClose={handleCloseModal}
              onSave={handleEdit}
              managers={managers}
              isSaving={isSaving}
              project={activeProject}
            />
            <ProjectDetails
              isOpen={viewOpen}
              onClose={handleCloseModal}
              project={activeProject}
              tasks={tasks}
              assignees={employeeOptions}
              onCreateTask={handleCreateTask}
              onDeleteTask={handleDeleteTask}
              onEdit={activeProject ? handleSwitchToEdit : undefined}
            />
            <DeleteConfirmModal
              isOpen={deleteConfirmation.isOpen}
              title={deleteConfirmation.dialog?.title ?? t("common.delete")}
              message={
                deleteConfirmation.dialog?.message ??
                "Are you sure you want to delete this project?"
              }
              confirmLabel={
                deleteConfirmation.dialog?.confirmLabel ?? t("common.delete")
              }
              cancelLabel={
                deleteConfirmation.dialog?.cancelLabel ?? t("common.cancel")
              }
              isProcessing={isDeleting || deleteConfirmation.isProcessing}
              onClose={() => {
                deleteConfirmation.closeDialog();
                handleCloseModal();
              }}
              onConfirm={deleteConfirmation.confirmDelete}
            />
          </div>
        </main>
      </div>
    </div>
  );
}

export default Projects;
