import axios from "axios";
import { useCallback, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useUser } from "@/context/UserContext";
import { taskService } from "@/features/tasks/services/task.service";
import { normalizeMyTask } from "@/features/tasks/utils/normalizeTasks";
import type { TaskItem } from "@/features/tasks/types/task.types";
import { clearAuthSession } from "@/features/auth/services/authSession";

/**
 * Handles data loading and status mutations for the employee task list.
 * Concern: task CRUD + loading state only.
 */
export const useTasks = () => {
  const navigate = useNavigate();
  const { user } = useUser();

  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const loadTasks = useCallback(async () => {
    if (user?.role !== "employee") {
      setError("Only employees can view this page.");
      setTasks([]);
      return;
    }

    try {
      setLoading(true);
      setError("");
      const raw = await taskService.getMyTasks();
      setTasks(raw.map(normalizeMyTask));
    } catch (err) {
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 401 || err.response?.status === 403) {
          clearAuthSession();
          navigate("/login");
          return;
        }
        setError(err.response?.data?.message ?? "Failed to load tasks.");
      } else {
        setError("Failed to load tasks.");
      }
      setTasks([]);
    } finally {
      setLoading(false);
    }
  }, [user?.role, navigate]);

  const updateTaskStatus = useCallback(
    async (taskId: number, newStatus: TaskItem["status"]) => {
      setUpdatingId(taskId);
      try {
        await taskService.updateTaskStatus(taskId, newStatus);
        setTasks((prev) =>
          prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t)),
        );
        toast.success("Task status updated");
        await loadTasks();
      } catch (err) {
        const msg = axios.isAxiosError(err)
          ? (err.response?.data?.message ?? "Failed to update status.")
          : "Failed to update status.";
        setError(msg);
        toast.error(msg);
      } finally {
        setUpdatingId(null);
      }
    },
    [loadTasks],
  );

  return {
    tasks,
    loading,
    error,
    updatingId,
    loadTasks,
    updateTaskStatus,
  };
};
