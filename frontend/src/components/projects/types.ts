export type ProjectStatus = "pending" | "in_progress" | "complete";

export interface ProjectItem {
  id: number;
  name: string;
  description: string;
  managerId: number;
  managerName: string;
  startDate: string;
  endDate: string;
  status: ProjectStatus;
}

export interface ProjectTask {
  id: number;
  title: string;
  assignedTo: number;
  assignedName: string;
  status: string;
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
