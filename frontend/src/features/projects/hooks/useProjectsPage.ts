import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useProjects } from "@/features/projects/hooks/useProjects";
import { useProjectTasks } from "@/features/projects/hooks/useProjectTasks";
import { useProjectModals } from "@/features/projects/hooks/useProjectModals";
import type { TaskFormValues } from "@/features/tasks/types/task.types";
import type {
  ProjectFormValues,
  ProjectItem,
} from "@/features/projects/types/project.types";

/**
 * Orchestrates the Projects page: wires together useProjects, useProjectTasks,
 * and useProjectModals, adds search filtering, and exposes a flat handler API
 * to the page component.
 *
 * Concern: page-level orchestration only — no direct API calls.
 */
export const useProjectsPage = () => {
  const {
    projects,
    managers,
    stats,
    error,
    feedback,
    isCreating,
    isSaving,
    isDeleting,
    employeeOptions,
    userNameById,
    setFeedback,
    loadInitial,
    createProject,
    editProject,
    removeProject,
    updateStatus,
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

  const [searchTerm, setSearchTerm] = useState("");

  // ─── Initial load ─────────────────────────────────────────────────────────

  useEffect(() => {
    void loadInitial();
  }, [loadInitial]);

  // ─── Derived data ─────────────────────────────────────────────────────────

  const displayedProjects = projects.filter((project) => {
    const query = searchTerm.toLowerCase().trim();
    if (!query) return true;
    return (
      project.name.toLowerCase().includes(query) ||
      (project.managerName ?? "").toLowerCase().includes(query) ||
      project.status.toLowerCase().includes(query)
    );
  });

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

  // ─── CRUD handlers ────────────────────────────────────────────────────────

  const handleCreate = useCallback(
    async (formValues: ProjectFormValues) => {
      const ok = await createProject(formValues);
      if (ok) handleCloseModal();
    },
    [createProject, handleCloseModal],
  );

  const handleEdit = useCallback(
    async (formValues: ProjectFormValues) => {
      const ok = await editProject(activeProject, formValues);
      if (ok) handleCloseModal();
    },
    [editProject, activeProject, handleCloseModal],
  );

  const handleDelete = useCallback(async () => {
    const ok = await removeProject(activeProject);
    if (ok) handleCloseModal();
  }, [removeProject, activeProject, handleCloseModal]);

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
    displayedProjects,
    managers,
    stats,
    error,
    feedback,
    tasks,
    employeeOptions,
    activeProject,

    // ── Loading states ───────────────────────────────────────────────────────
    isCreating,
    isSaving,
    isDeleting,

    // ── Modal visibility ─────────────────────────────────────────────────────
    createOpen,
    viewOpen,
    editOpen,
    deleteOpen,

    // ── Search ───────────────────────────────────────────────────────────────
    searchTerm,
    setSearchTerm,

    // ── Handlers ─────────────────────────────────────────────────────────────
    handleCreateOpen,
    handleViewOpen,
    handleEditOpen,
    handleDeleteOpen,
    handleCreate,
    handleEdit,
    handleDelete,
    handleCreateTask,
    handleDeleteTask,
    handleCloseModal,
    updateStatus,
  };
};
