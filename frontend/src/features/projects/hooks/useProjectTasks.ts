import { useState } from "react";
import { taskService } from "@/features/tasks/services/task.service";
import type { TaskFormValues } from "@/features/tasks/types/task.types";
import type {
  ProjectTask,
  RawTask,
} from "@/features/projects/types/project.types";

const mapTasks = (
  tasks: RawTask[],
  userNameById: Map<number, string>,
): ProjectTask[] => {
  return tasks.map((task) => ({
    id: task.id,
    title: task.title,
    description: task.description,
    assignedTo: task.assignedTo,
    assignedName: userNameById.get(task.assignedTo) || "Unknown User",
    status: task.status,
    deadline: task.deadline,
  }));
};

export const useProjectTasks = () => {
  const [tasks, setTasks] = useState<ProjectTask[]>([]);

  const fetchTasks = async (
    projectId: number,
    userNameById: Map<number, string>,
  ) => {
    const rows = await taskService.getProjectTasks(projectId);
    setTasks(mapTasks(rows as RawTask[], userNameById));
  };

  const createTask = async (
    projectId: number,
    values: TaskFormValues,
    userNameById: Map<number, string>,
  ) => {
    await taskService.createTask({ ...values, projectId });
    await fetchTasks(projectId, userNameById);
  };

  const removeTask = async (
    taskId: number,
    projectId: number,
    userNameById: Map<number, string>,
  ) => {
    await taskService.deleteTask(taskId);
    await fetchTasks(projectId, userNameById);
  };

  const clearTasks = () => setTasks([]);

  return {
    tasks,
    setTasks,
    fetchTasks,
    createTask,
    removeTask,
    clearTasks,
  };
};
