import api from "@/services/axios";
import type {
  PayrollDetailResponse,
  PayrollSummaryResponse,
  PayrollTrendsResponse,
  PayrollReportFilters,
} from "@/features/Report/types/payrollReport.types";

const clean = (f: PayrollReportFilters) => {
  const params: Record<string, unknown> = { ...f };

  if (params.departmentId) {
    params.department_id = params.departmentId;
  }

  delete params.departmentId;

  return Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== "" && v !== null),
  );
};

export const payrollReportService = {
  getSummary: async (
    filters: PayrollReportFilters,
  ): Promise<PayrollSummaryResponse> => {
    const response = await api.get("/reports/payroll/summary", {
      params: clean(filters),
    });

    return response.data;
  },

  getDetails: async (
    filters: PayrollReportFilters,
    page: number,
    limit: number,
  ): Promise<PayrollDetailResponse> => {
    const response = await api.get("/reports/payroll/details", {
      params: {
        ...clean(filters),
        page,
        limit,
      },
    });

    return response.data;
  },

  getTrends: async (
    filters: PayrollReportFilters,
  ): Promise<PayrollTrendsResponse> => {
    const response = await api.get("/reports/payroll/trends", {
      params: clean(filters),
    });

    return response.data;
  },
};
