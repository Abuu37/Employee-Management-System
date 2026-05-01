export interface Department {
  id: number;
  name: string;
  code: string;
  description?: string;
  manager_id?: number | null;
  status: "active" | "inactive";
  createdAt: string;
  manager?: {
    id: number;
    name: string;
    email: string;
    position?: string;
  } | null;
  employees?: {
    id: number;
    name: string;
    email: string;
    role: string;
    position?: string;
  }[];
  employeeCount: number;
}

export interface DepartmentStats {
  total: number;
  active: number;
  assigned: number;
  totalEmployees: number;
}

export interface DeptFormValues {
  name: string;
  code: string;
  description: string;
  manager_id: number | "";
  status: "active" | "inactive";
}
