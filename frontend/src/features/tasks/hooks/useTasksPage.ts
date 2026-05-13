import { useCallback, useEffect, useState } from "react";
import { useTasks } from "@/features/tasks/hooks/useTasks";
import type { TaskItem } from "@/features/tasks/types/task.types";

/**
 * Orchestrates the Tasks page: composes useTasks, adds search, and manages
 * the comment modal state.
 * Concern: page-level orchestration only — no direct API calls.
 */
export const useTasksPage = () => {
  const { tasks, loading, error, updatingId, loadTasks, updateTaskStatus } =
    useTasks();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTask, setSelectedTask] = useState<TaskItem | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  useEffect(() => {
    void loadTasks();
  }, [loadTasks]);

  const displayedTasks = tasks.filter((task) => {
    const query = searchTerm.toLowerCase().trim();
    if (!query) return true;
    return (
      task.title.toLowerCase().includes(query) ||
      task.description.toLowerCase().includes(query) ||
      task.status.toLowerCase().includes(query) ||
      task.priority.toLowerCase().includes(query)
    );
  });

  const handleOpenComments = useCallback((task: TaskItem) => {
    setSelectedTask(task);
    setDetailsOpen(true);
  }, []);

  const handleCloseComments = useCallback(() => {
    setDetailsOpen(false);
    setSelectedTask(null);
  }, []);

  return {
    displayedTasks,
    loading,
    error,
    updatingId,
    searchTerm,
    setSearchTerm,
    selectedTask,
    detailsOpen,
    updateTaskStatus,
    handleOpenComments,
    handleCloseComments,
  };
};
