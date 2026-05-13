export type AttendanceStatus = "present" | "late" | "absent" | "half_day";

export interface AttendanceRecord {
  id: number;
  user_id: number;
  date: string;
  check_in: string | null;
  check_out: string | null;
  total_hours: number | string | null;
  status: AttendanceStatus;
  work_summary?: string | null;
  notes?: string | null;
  completed_task_ids?: number[];
  department?: string | null;
  user?: {
    name: string;
    email: string;
    department?: string | null;
    dept?: { name: string } | null;
  };
}

export interface AttendanceStats {
  totalEmployees?: number;
  presentToday?: number;
  lateToday?: number;
  absentToday?: number;
  onLeave?: number;
  attendanceRate?: number;
  avgLateArrival?: string;
  newThisMonth?: number;
  // employee-specific
  myAttendanceRate?: number;
  myAbsentThisMonth?: number;
  checkedInToday?: boolean;
  checkedOutToday?: boolean;
}

export interface AttendanceListResponse {
  data: AttendanceRecord[];
  page: number;
  totalPages: number;
}

export interface CheckOutPayload {
  work_summary: string;
  notes: string;
  completed_task_ids: number[];
}

export interface AttendanceQueryParams {
  search?: string | null;
  status?: string | null;
  dateFrom?: string | null;
  dateTo?: string | null;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: string;
}
