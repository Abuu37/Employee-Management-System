export interface ReportDepartment {
  id: number;
  name: string;
  code?: string | null;
  status?: string | null;
}

export interface ReportSupervisor {
  id: number;
  name: string;
  email?: string | null;
  position?: string | null;
}

export interface EmployeeListRecord {
  id: number;
  name: string;
  email: string;
  employee_id?: string | null;
  role?: string | null;
  status?: string | null;
  gender?: string | null;
  employment_type?: string | null;
  join_date?: string | null;
  office_branch?: string | null;
  position?: string | null;
  dept?: ReportDepartment | null;
  supervisor?: ReportSupervisor | null;
}

export interface EmployeeBreakdownRecord {
  status?: string | null;
  gender?: string | null;
  employment_type?: string | null;
  role?: string | null;
  office_branch?: string | null;
  count: string | number;
}

export interface EmployeeDepartmentBreakdownRecord {
  department_id?: number | null;
  count: string | number;
  dept?: ReportDepartment | null;
}

export interface EmployeeDepartmentStatsRecord {
  id: number;
  name: string;
  code?: string | null;
  status?: string | null;
  total_employees: string | number;
  active_employees: string | number;
  inactive_employees: string | number;
  manager?: ReportSupervisor | null;
}

export interface EmployeeSummaryData {
  total: number;
  activeCount: string | number;
  inactiveCount: string | number;
  byStatus: EmployeeBreakdownRecord[];
  byGender: EmployeeBreakdownRecord[];
  byEmploymentType: EmployeeBreakdownRecord[];
  byRole: EmployeeBreakdownRecord[];
  byOfficeBranch: EmployeeBreakdownRecord[];
  byDepartment: EmployeeDepartmentBreakdownRecord[];
  recentJoined: EmployeeListRecord[];
}

export interface EmployeeSummaryFilters {
  search: string;
  status: string;
  employmentType: string;
  gender: string;
  role: string;
  departmentId: string;
  joinDateFrom: string;
  joinDateTo: string;
}

export interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface EmployeeSummaryResponse {
  success: boolean;
  data: EmployeeSummaryData;
}

export interface EmployeeListResponse {
  success: boolean;
  data: EmployeeListRecord[];
  pagination: Pagination;
}

export interface EmployeeDepartmentStatsResponse {
  success: boolean;
  count: number;
  data: EmployeeDepartmentStatsRecord[];
}

export interface EmployeeSummaryCards {
  totalEmployees: number;
  activeEmployees: number;
  inactiveEmployees: number;
  departmentCount: number;
  recentJoiners: number;
}
