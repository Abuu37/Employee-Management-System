import api from "@/services/axios";
import type {
  EmployeeDepartmentStatsResponse,
  EmployeeListResponse,
  EmployeeSummaryFilters,
  EmployeeSummaryResponse,
} from "@/features/Report/types/employeeSummaryReport.types";

const normalizeEmploymentType = (value?: string) => {
  if (!value) return "";
  return value
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "_");
};

const normalizeStatus = (value?: string) => {
  const normalized = value?.trim().toLowerCase() ?? "";
  return normalized === "active" || normalized === "inactive" ? normalized : "";
};

const normalizeDepartmentId = (value?: string) => {
  if (!value) return "";
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? String(parsed) : "";
};

const clean = (f: EmployeeSummaryFilters) => {
  const params: Record<string, unknown> = {
    search: f.search?.trim() ?? "",
    status: normalizeStatus(f.status),
    employment_type: normalizeEmploymentType(f.employmentType),
    gender: f.gender,
    role: f.role,
    department_id: normalizeDepartmentId(f.departmentId),
    joinDateFrom: f.joinDateFrom,
    joinDateTo: f.joinDateTo,
  };

  return Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== "" && v !== null),
  );
};

export const employeeSummaryReportService = {
  getSummary: async (
    filters: EmployeeSummaryFilters,
  ): Promise<EmployeeSummaryResponse> => {
    const response = await api.get("/reports/employees/summary", {
      params: clean(filters),
    });

    return response.data;
  },

  getDepartmentStats: async (
    filters: EmployeeSummaryFilters,
  ): Promise<EmployeeDepartmentStatsResponse> => {
    const response = await api.get("/reports/employees/department-stats", {
      params: clean(filters),
    });

    return response.data;
  },

  getList: async (
    filters: EmployeeSummaryFilters,
    page: number,
    limit: number,
    sortBy = "name",
    sortOrder: "ASC" | "DESC" = "ASC",
  ): Promise<EmployeeListResponse> => {
    const response = await api.get("/reports/employees", {
      params: {
        ...clean(filters),
        page,
        limit,
        sortBy,
        sortOrder,
      },
    });

    return response.data;
  },
};
