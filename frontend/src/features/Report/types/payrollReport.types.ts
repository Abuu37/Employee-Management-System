export type PayrollStatus = "pending" | "approved" | "paid";

export interface ReportUser {
  id: number;
  name: string;
  email: string;
  employee_id: string;
  position?: string | null;
  dept?: { id: number; name: string; code: string } | null;
}

export interface PayrollSummaryRecord {
  user_id: number;
  payroll_count: string | number;
  total_base_salary: string | number;
  total_bonus: string | number;
  total_allowance: string | number;
  total_deductions: string | number;
  total_tax: string | number;
  total_net_salary: string | number;
  avg_net_salary: string | number;
  total_paid: string | number;
  total_pending: string | number;
  total_approved: string | number;
  user?: ReportUser;
}

export interface PayrollDetailRecord {
  id: number;
  user_id: number;
  month: number;
  year: number;
  base_salary: string | number;
  bonus: string | number;
  allowance: string | number;
  deductions: string | number;
  tax: string | number;
  net_salary: string | number;
  status: PayrollStatus;
  approvedAt?: string | null;
  paidAt?: string | null;
  user?: ReportUser;
}

export interface PayrollTrendRecord {
  year: number;
  month: number;
  payroll_count: string | number;
  employee_count: string | number;
  total_base_salary: string | number;
  total_bonus: string | number;
  total_allowance: string | number;
  total_deductions: string | number;
  total_tax: string | number;
  total_net_salary: string | number;
  avg_net_salary: string | number;
}

export interface PayrollReportFilters {
  year: string;
  month: string;
  userId: string;
  departmentId: string;
  status: string;
}

export interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface PayrollSummaryResponse {
  success: boolean;
  count: number;
  data: PayrollSummaryRecord[];
}

export interface PayrollDetailResponse {
  success: boolean;
  data: PayrollDetailRecord[];
  pagination: Pagination;
}

export interface PayrollTrendsResponse {
  success: boolean;
  count: number;
  data: PayrollTrendRecord[];
}

export interface PayrollCardStats {
  totalNetSalary: number;
  totalBaseSalary: number;
  totalBonus: number;
  totalDeductions: number;
  totalPaid: number;
}
