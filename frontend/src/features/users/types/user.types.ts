export type UserRole = "admin" | "manager" | "employee";

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  status: string;
  department?: string;
  department_id?: number;
  manager_id?: number;
  position?: string;
  phone?: string;
  employee_id?: string;
  gender?: string;
  date_of_birth?: string;
  address?: string;
  emergency_contact?: string;
  employment_type?: string;
  join_date?: string;
  createdAt?: string;
  reportsTo?: string;
  reports_to?: number;
  officeBranch?: string;
  office_branch?: string;
}

export interface Feedback {
  type: "success" | "error";
  message: string;
}

export interface UserListResponse {
  data: User[];
  page: number;
  totalPages: number;
  total: number;
}

export interface AddUserFormValues {
  name: string;
  email: string;
  role: UserRole;
  manager_id?: number;
  department?: string;
  department_id?: number;
  position?: string;
  phone?: string;
  gender?: string;
  date_of_birth?: string;
  address?: string;
  emergency_contact?: string;
  employment_type?: string;
  join_date?: string;
  employee_id?: string;
}

export interface EditUserFormValues {
  name: string;
  email: string;
  role: UserRole;
  department?: string;
  department_id?: number;
  position?: string;
  phone?: string;
  employee_id?: string;
  gender?: string;
  date_of_birth?: string;
  address?: string;
  emergency_contact?: string;
  employment_type?: string;
  join_date?: string;
  manager_id?: number;
  reports_to?: number;
  office_branch?: string;
}

export interface EmployeeInsightsResponse {
  attendanceSummary: {
    attendancePct: number;
    lateArrivals: number;
    leaveDays: number;
    overtime: number;
  };
  recentAttendance: {
    id: number;
    date: string;
    checkIn: string;
    checkOut: string;
    status: string;
  }[];
  taskSummary: {
    pendingTasks: number;
    inProgressTasks: number;
    completedTasks: number;
  };
  tasks: {
    id: number;
    title: string;
    status: "pending" | "in_progress" | "completed";
    dueLabel: string;
  }[];
  timeline: {
    id: string;
    title: string;
    detail: string;
    timestamp: string;
  }[];
}
