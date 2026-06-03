export type LeaveType = "annual" | "sick" | "casual" | "emergency" | "unpaid";

export type LeaveStatus =
  | "pending_manager"
  | "pending_hr"
  | "approved"
  | "rejected_by_manager"
  | "rejected_by_hr";

export interface ReportUser {
  id: number;
  name: string;
  email: string;
  employee_id: string;
  position?: string | null;
  dept?: { id: number; name: string; code: string } | null;
}

export interface LeaveSummaryRecord {
  userId: number;
  total_leaves: string | number;
  approved: string | number;
  pending: string | number;
  rejected: string | number;
  approved_days: string | number;
  total_days_requested: string | number;
  user?: ReportUser;
}

export interface LeaveDetailRecord {
  id: number;
  userId: number;
  type: LeaveType;
  startDate: string;
  endDate: string;
  days: number;
  overallStatus: LeaveStatus;
  reason?: string | null;
  handoverNote?: string | null;
  backupEmployee?: {
    id: number;
    name: string;
    email: string;
  } | null;
  user?: ReportUser;
}

export interface LeaveTrendRecord {
  month: string;
  total: string | number;
  approved: string | number;
  pending: string | number;
  rejected: string | number;
  approved_days: string | number;
  annual: string | number;
  sick: string | number;
  casual: string | number;
  emergency: string | number;
  unpaid: string | number;
}

export interface LeaveReportFilters {
  dateFrom: string;
  dateTo: string;
  userId: string;
  departmentId: string;
  type: string;
  status: string;
  search: string;
}

export interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface LeaveSummaryResponse {
  success: boolean;
  count: number;
  data: LeaveSummaryRecord[];
}

export interface LeaveDetailResponse {
  success: boolean;
  data: LeaveDetailRecord[];
  pagination: Pagination;
}

export interface LeaveTrendsResponse {
  success: boolean;
  count: number;
  data: LeaveTrendRecord[];
}

export interface LeaveCardStats {
  totalRequests: number;
  totalApproved: number;
  totalPending: number;
  totalRejected: number;
  approvedDays: number;
}
