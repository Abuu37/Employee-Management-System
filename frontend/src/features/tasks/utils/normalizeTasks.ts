import type { RawMyTask, TaskItem } from "@/features/tasks/types/task.types";

export const normalizeTaskStatus = (status?: string): TaskItem["status"] => {
  if (status === "in_progress") return "in_progress";
  if (status === "completed" || status === "complete") return "completed";
  return "pending";
};

export const normalizeTaskPriority = (
  priority?: string,
): TaskItem["priority"] => {
  const p = (priority ?? "").toLowerCase();
  if (p === "low" || p === "medium" || p === "high") {
    return p as TaskItem["priority"];
  }
  return "medium";
};

/** Maps a raw API task (from /task/mytasks) to the display TaskItem shape. */
export const normalizeMyTask = (raw: RawMyTask): TaskItem => ({
  id: raw.id,
  title: raw.title,
  projectName: raw.project?.name ?? "-",
  assignedByName: raw.assigner?.name ?? "-",
  description: raw.description ?? "",
  status: normalizeTaskStatus(raw.status),
  priority: normalizeTaskPriority(raw.priority),
  deadline: raw.deadline ?? "",
});
