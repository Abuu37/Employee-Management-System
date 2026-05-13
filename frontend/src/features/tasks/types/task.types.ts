// ─── Primitive unions ────────────────────────────────────────────────────────

export type TaskStatus = "pending" | "in_progress" | "completed";
export type TaskPriority = "low" | "medium" | "high";

// ─── Display / UI types ──────────────────────────────────────────────────────

/** Normalized task row displayed in the employee task table. */
export interface TaskItem {
  id: number;
  title: string;
  projectName: string;
  assignedByName: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  deadline: string;
}

/** Comment entry shown inside the task chat view. */
export interface TaskComment {
  id: number;
  authorId: number;
  authorName: string;
  role: string;
  content: string;
  createdAt: string;
}

// ─── Form / mutation types ────────────────────────────────────────────────────

/** Values submitted when creating a new task. */
export type TaskFormValues = {
  title: string;
  description?: string;
  assignedTo: number;
  priority: TaskPriority;
  deadline?: string;
  /** Set when creating a task from within a project. */
  projectId?: number;
};

// ─── Raw API shapes ───────────────────────────────────────────────────────────

/** Shape returned from GET /task/mytasks (employee perspective). */
export type RawMyTask = {
  id: number;
  title: string;
  description?: string | null;
  status?: string;
  priority?: string;
  deadline?: string;
  project?: { id: number; name: string } | null;
  assigner?: { id: number; name: string } | null;
};

/** Shape returned from GET /tasks_comments/:id */
export type RawComment = {
  id: number;
  authorId: number;
  authorName: string;
  role: string;
  content: string;
  createdAt: string;
};
