import api from "@/services/axios";
import type {
  LeaveDetailResponse,
  LeaveSummaryResponse,
  LeaveTrendsResponse,
  LeaveReportFilters,
} from "@/features/Report/types/leaveReport.types";

const clean = (f: LeaveReportFilters) => {
  const params: Record<string, unknown> = {
    ...f,
    search: f.search?.trim() ?? "",
  };

  if (params.departmentId) {
    params.department_id = params.departmentId;
  }

  delete params.departmentId;

  return Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== "" && v !== null),
  );
};

export const leaveReportService = {
  getSummary: async (
    filters: LeaveReportFilters,
  ): Promise<LeaveSummaryResponse> => {
    const response = await api.get("/reports/leaves/summary", {
      params: clean(filters),
    });

    return response.data;
  },

  getDetails: async (
    filters: LeaveReportFilters,
    page: number,
    limit: number,
  ): Promise<LeaveDetailResponse> => {
    const response = await api.get("/reports/leaves/details", {
      params: {
        ...clean(filters),
        page,
        limit,
      },
    });

    return response.data;
  },

  getTrends: async (
    filters: LeaveReportFilters,
  ): Promise<LeaveTrendsResponse> => {
    const response = await api.get("/reports/leaves/trends", {
      params: clean(filters),
    });

    return response.data;
  },
};
