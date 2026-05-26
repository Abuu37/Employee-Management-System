import api from "@/services/axios";
import type {
  AttendanceDetailResponse,
  AttendanceSummaryResponse,
  AttendanceTrendsResponse,
  AttendanceReportFilters,
} from "@/features/Report/types/attendanceReport.types";

const clean = (f: AttendanceReportFilters) => {
  const params: Record<string, unknown> = {
    ...f,
    search: f.search?.trim() ?? "",
  };

  if (params.departmentId) {
    params.department = params.departmentId;
  }

  delete params.departmentId;

  return Object.fromEntries(
    Object.entries(params).filter(
      ([, v]) => v !== "" && v !== null,
    ),
  );
};

export const attendanceReportService = {
  // SUMMARY
  getSummary: async (
    filters: AttendanceReportFilters,
  ): Promise<AttendanceSummaryResponse> => {
    console.log( "Fetching attendance summary with filters:",clean(filters),);
    const response = await api.get(
      "/reports/attendance/summary",
      {
        params: clean(filters),
      },
    );

    console.log(
      "Attendance summary response:",
      response.data,
    );

    return response.data;
  },

  // DETAILS
  getDetails: async (
    filters: AttendanceReportFilters,
    page: number,
    limit: number,
    sortBy = "date",
    sortOrder: "ASC" | "DESC" = "DESC",
  ): Promise<AttendanceDetailResponse> => {
    console.log("Fetching attendance details");

    const response = await api.get(
      "/reports/attendance/detail",
      {
        params: {
          ...clean(filters),
          page,
          limit,
          sortBy,
          sortOrder,
        },
      },
    );

    console.log( "Attendance details response:", response.data, );

    return response.data;
  },

  // TRENDS
  getTrends: async (
    filters: AttendanceReportFilters,
  ): Promise<AttendanceTrendsResponse> => {
    console.log("Fetching attendance trends");

    const response = await api.get(
      "/reports/attendance/trends",
      {
        params: clean(filters),
      },
    );

    console.log( "Attendance trends response:", response.data, );
    return response.data;
  },

  // EXPORT CSV
  exportCsv: async (
    filters: AttendanceReportFilters,
  ): Promise<Blob> => {
    console.log("Exporting CSV");

    const response = await api.get(
      "/reports/attendance/export/csv",
      {
        params: clean(filters),
        responseType: "blob",
      },
    );

    return response.data as Blob;
  },
};