export type AttendanceStatus = "present" | "late" | "absent" | "half_day";

export interface ReportUser {
  id: number;
  name: string;
  email: string;
  employee_id: string;
  position?: string | null;
  dept?: { id: number; name: string; code: string } | null;
}

// ── Detail (individual records) ────────────────────────────────────────────────
export interface AttendanceDetailRecord {
  id: number;
  user_id: number;
  date: string;
  check_in: string | null;
  check_out: string | null;
  total_hours: number | string | null;
  status: AttendanceStatus;
  notes?: string | null;
  user?: ReportUser;
}

// ── Summary (per-employee aggregated) ─────────────────────────────────────────
export interface AttendanceSummaryRecord {
  user_id: number;
  total_days: string | number;
  present: string | number;
  late: string | number;
  absent: string | number;
  half_day: string | number;
  total_hours: string | number;
  avg_hours: string | number;
  user?: ReportUser;
}

// ── Trends (daily chart data) ─────────────────────────────────────────────────
export interface AttendanceTrendRecord {
  date: string;
  present: number;
  late: number;
  absent: number;
  half_day: number;
  total: number;
}

// ── Filters ────────────────────────────────────────────────────────────────────
export interface AttendanceReportFilters {
  dateFrom: string;
  dateTo: string;
  userId: string;
  departmentId: string;
  status: string;
  search: string;
}

// ── API responses ──────────────────────────────────────────────────────────────
export interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface AttendanceDetailResponse {
  success: boolean;
  data: AttendanceDetailRecord[];
  pagination: Pagination;
}

export interface AttendanceSummaryResponse {
  success: boolean;
  count: number;
  data: AttendanceSummaryRecord[];
  stats?: AttendanceCardStats;
}

export interface AttendanceTrendsResponse {
  success: boolean;
  count: number;
  data: AttendanceTrendRecord[];
}

// ── Card-level aggregated stats ────────────────────────────────────────────────
export interface AttendanceCardStats {
  totalPresent: number;
  totalAbsent: number;
  totalLate: number;
  totalHalfDay: number;
  totalHours: number;
}
