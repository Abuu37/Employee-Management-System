import api from "@/services/axios";
import type {
  AttendanceRecord,
  AttendanceStats,
  AttendanceListResponse,
  AttendanceQueryParams,
  CheckOutPayload,
} from "@/features/attendance/types/attendance.types";

export type {
  AttendanceRecord,
  AttendanceStatus,
  AttendanceStats,
  AttendanceListResponse,
  AttendanceQueryParams,
  CheckOutPayload,
} from "@/features/attendance/types/attendance.types";

type Role = "admin" | "manager" | "employee";

const endpointFor = (role: Role) => {
  if (role === "admin") return "/attendance/all";
  if (role === "manager") return "/attendance/team";
  return "/attendance/my";
};

export const attendanceService = {
  getRecords: (
    role: Role,
    params: AttendanceQueryParams,
  ): Promise<AttendanceListResponse | AttendanceRecord[]> =>
    api.get(endpointFor(role), { params }).then((r) => r.data),

  getStats: (): Promise<AttendanceStats> =>
    api.get("/attendance/stats").then((r) => r.data),

  checkIn: (): Promise<void> =>
    api.post("/attendance/check-in", {}).then((r) => r.data),

  checkOut: (payload: CheckOutPayload): Promise<void> =>
    api.post("/attendance/check-out", payload).then((r) => r.data),
};
