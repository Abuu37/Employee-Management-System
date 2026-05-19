import { useCallback, useEffect } from "react";
import toast from "react-hot-toast";
import { useProjects } from "@/features/projects/hooks/useProjects";
import { useProjectTasks } from "@/features/projects/hooks/useProjectTasks";
import { useProjectModals } from "@/features/projects/hooks/useProjectModals";
import { useTableQueryParams } from "@/hooks/useTableQueryParams";
import type { TaskFormValues } from "@/features/tasks/types/task.types";
import type {
  ProjectFormValues,
  ProjectItem,
  ProjectQueryParams,
} from "@/features/projects/types/project.types";

/**
 * Orchestrates the Projects page: wires together useProjects, useProjectTasks,
 * and useProjectModals with URL-driven server-side filtering and pagination.
 */
export const useProjectsPage = () => {
  const {
    projects,
    managers,
    stats,
    error,
    feedback,
    loading,
    isCreating,
    isSaving,
    isDeleting,
    totalPages,
    employeeOptions,
    userNameById,
    setFeedback,
    loadInitial,
    fetchProjects,
    reloadProjects,
    createProject,
    editProject,
    removeProject,
    updateStatus: rawUpdateStatus,
  } = useProjects();

  const { tasks, setTasks, fetchTasks, createTask, removeTask, clearTasks } =
    useProjectTasks();

  const {
    activeProject,
    createOpen,
    viewOpen,
    editOpen,
    deleteOpen,
    openCreate,
    openView,
    openEdit,
    openDelete,
    closeAllModals,
  } = useProjectModals();

  // ─── URL-driven filter/sort/page state ────────────────────────────────────
  const {
    searchParams,
    page,
    search,
    status: statusFilter,
    sortBy,
    sortOrder,
    setPage,
    setSearch,
    setStatus: setStatusFilter,
    handleSort,
    updateParams,
  } = useTableQueryParams({ defaultSortBy: "id", defaultSortOrder: "DESC" });

  const currentParams: ProjectQueryParams = {
    search: search || null,
    status: statusFilter !== "all" ? statusFilter : null,
    sortBy,
    sortOrder,
    page,
    limit: 10,
  };

  // ─── Initial load ─────────────────────────────────────────────────────────
  useEffect(() => {
    void loadInitial();
  }, [loadInitial]);

  // ─── Re-fetch when URL params change (skip on first render — loadInitial handles it) ──
  useEffect(() => {
    void fetchProjects(currentParams);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, statusFilter, sortBy, sortOrder, page]);

  // ─── Shared close helper ──────────────────────────────────────────────────
  const handleCloseModal = useCallback(() => {
    closeAllModals(clearTasks);
  }, [closeAllModals, clearTasks]);

  // ─── Modal open handlers ──────────────────────────────────────────────────
  const handleCreateOpen = useCallback(() => {
    setFeedback(null);
    openCreate();
  }, [setFeedback, openCreate]);

  const handleViewOpen = useCallback(
    async (project: ProjectItem) => {
      setFeedback(null);
      openView(project);
      try {
        await fetchTasks(project.id, userNameById);
      } catch {
        setTasks([]);
      }
    },
    [setFeedback, openView, fetchTasks, userNameById, setTasks],
  );

  const handleEditOpen = useCallback(
    (project: ProjectItem) => {
      setFeedback(null);
      openEdit(project);
    },
    [setFeedback, openEdit],
  );

  const handleDeleteOpen = useCallback(
    (project: ProjectItem) => {
      setFeedback(null);
      openDelete(project);
    },
    [setFeedback, openDelete],
  );

  // Switch from view drawer → edit form without clearing activeProject
  const handleSwitchToEdit = useCallback(() => {
    if (!activeProject) return;
    const project = activeProject;
    clearTasks();
    closeAllModals();
    setFeedback(null);
    openEdit(project);
  }, [activeProject, clearTasks, closeAllModals, setFeedback, openEdit]);

  // ─── CRUD handlers ────────────────────────────────────────────────────────
  const handleCreate = useCallback(
    async (formValues: ProjectFormValues) => {
      const ok = await createProject(formValues, currentParams);
      if (ok) handleCloseModal();
    },
    [createProject, handleCloseModal, currentParams],
  );

  const handleEdit = useCallback(
    async (formValues: ProjectFormValues) => {
      const ok = await editProject(activeProject, formValues, currentParams);
      if (ok) handleCloseModal();
    },
    [editProject, activeProject, handleCloseModal, currentParams],
  );

  const handleDelete = useCallback(async () => {
    const ok = await removeProject(activeProject, currentParams);
    if (ok) handleCloseModal();
  }, [removeProject, activeProject, handleCloseModal, currentParams]);

  const handleUpdateStatus = useCallback(
    (project: ProjectItem, status: string) =>
      rawUpdateStatus(project, status, currentParams),
    [rawUpdateStatus, currentParams],
  );

  // ─── Task handlers ────────────────────────────────────────────────────────
  const handleCreateTask = useCallback(
    async (values: TaskFormValues) => {
      if (!activeProject) return;
      try {
        setFeedback(null);
        await createTask(activeProject.id, values, userNameById);
        setFeedback({ type: "success", message: "Task created successfully." });
        toast.success("Task created successfully");
      } catch {
        setFeedback({ type: "error", message: "Failed to create task." });
        toast.error("Failed to create task.");
        throw new Error("Task creation failed");
      }
    },
    [activeProject, createTask, userNameById, setFeedback],
  );

  const handleDeleteTask = useCallback(
    async (taskId: number) => {
      if (!activeProject) return;
      try {
        await removeTask(taskId, activeProject.id, userNameById);
        setFeedback({ type: "success", message: "Task deleted successfully." });
        toast.success("Task deleted successfully");
      } catch {
        setFeedback({ type: "error", message: "Failed to delete task." });
        toast.error("Failed to delete task.");
      }
    },
    [activeProject, removeTask, userNameById, setFeedback],
  );

  return {
    // ── Data ────────────────────────────────────────────────────────────────
    projects,
    managers,
    stats,
    error,
    feedback,
    tasks,
    employeeOptions,
    activeProject,

    // ── Loading states ───────────────────────────────────────────────────────
    loading,
    isCreating,
    isSaving,
    isDeleting,

    // ── Modal visibility ─────────────────────────────────────────────────────
    createOpen,
    viewOpen,
    editOpen,
    deleteOpen,

    // ── Filter / sort / page (URL-driven) ────────────────────────────────────
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

    // ── Handlers ─────────────────────────────────────────────────────────────
    handleCreateOpen,
    handleViewOpen,
    handleEditOpen,
    handleDeleteOpen,
    handleSwitchToEdit,
    handleCreate,
    handleEdit,
    handleDelete,
    handleCreateTask,
    handleDeleteTask,
    handleCloseModal,
    updateStatus: handleUpdateStatus,
  };
};
