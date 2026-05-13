export type ProjectStatus = "pending" | "in_progress" | "complete";

export interface ProjectItem {
  id: number;
  name: string;
  description: string;
  managerId: number;
  managerName?: string;
  startDate: string;
  endDate: string;
  status: ProjectStatus;
  deadline?: string;
}

export interface ProjectTask {
  id: number;
  title: string;
  description?: string;
  assignedTo: number;
  assignedName: string;
  status: string;
  deadline?: string;
}

export interface ManagerOption {
  id: number;
  name: string;
}

export interface ProjectFormValues {
  name: string;
  description: string;
  managerId: number;
  startDate: string;
  endDate: string;
  status?: ProjectStatus;
}

export type RawProject = {
  id: number;
  name: string;
  description?: string | null;
  managerId?: number;
  manager_id?: number;
  startDate?: string;
  start_date?: string;
  endDate?: string;
  end_date?: string;
  deadline?: string;
  deadline_date?: string;
  status?: ProjectItem["status"];
};

export type RawUser = {
  id: number;
  name: string;
  role: string;
};

export type RawTask = {
  id: number;
  title: string;
  description?: string;
  projectId?: number;
  project_id?: number;
  assignedTo: number;
  status: string;
  deadline?: string;
};

export type ProjectStats = {
  total: number;
  inProgress: number;
  completed: number;
  pending: number;
};

export type FeedbackState = {
  type: "success" | "error";
  message: string;
} | null;
