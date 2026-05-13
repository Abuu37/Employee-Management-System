import api from "@/services/axios";
import type {
  RawComment,
  RawMyTask,
  TaskFormValues,
} from "@/features/tasks/types/task.types";

/**
 * All task-related API calls.
 * Project-scoped task methods (getProjectTasks, createTask, deleteTask)
 * are also here so the projects feature can import a single source of truth.
 */
export const taskService = {
  // ─── Employee task feed ─────────────────────────────────────────────────

  /** Returns tasks assigned to the authenticated employee. */
  getMyTasks: async (): Promise<RawMyTask[]> => {
    const res = await api.get("/task/mytasks");
    return res.data as RawMyTask[];
  },

  /** Updates the status of a task (employee or manager). */
  updateTaskStatus: async (taskId: number, status: string): Promise<void> => {
    await api.put(`/task/${taskId}/status`, { status });
  },

  /** Returns a single task by ID. */
  getTaskById: async (taskId: number | string) => {
    const res = await api.get(`/task/${taskId}`);
    return res.data;
  },

  // ─── Project-scoped tasks ────────────────────────────────────────────────

  /** Returns all tasks that belong to a project. */
  getProjectTasks: async (projectId: number): Promise<unknown[]> => {
    const res = await api.get(`/task/project/${projectId}`);
    return res.data as unknown[];
  },

  /** Creates a new task (manager only). */
  createTask: async (values: TaskFormValues): Promise<void> => {
    await api.post("/task/create", values);
  },

  /** Deletes a task by ID (admin or manager). */
  deleteTask: async (taskId: number): Promise<void> => {
    await api.delete(`/task/delete/${taskId}`);
  },

  // ─── Comments ────────────────────────────────────────────────────────────

  /** Returns all comments for a task. */
  getComments: async (taskId: number | string): Promise<RawComment[]> => {
    const res = await api.get(`/tasks_comments/${taskId}`);
    return res.data as RawComment[];
  },

  /** Posts a new comment to a task. */
  addComment: async (
    taskId: number | string,
    message: string,
  ): Promise<void> => {
    await api.post(`/tasks_comments/${taskId}`, { message });
  },
};
