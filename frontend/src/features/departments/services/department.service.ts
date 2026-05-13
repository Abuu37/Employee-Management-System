import api from "@/services/axios";
import type {
  Department,
  DepartmentListResponse,
  DeptFormValues,
} from "@/features/departments/types/department.types";

export type {
  Department,
  DepartmentStats,
  DeptFormValues,
} from "@/features/departments/types/department.types";

const BASE = "/departments";

export const departmentService = {
  getAll: (params?: Record<string, string>): Promise<DepartmentListResponse> =>
    api.get(BASE, { params }).then((r) => r.data),

  getById: (id: number): Promise<Department> =>
    api.get(`${BASE}/${id}`).then((r) => r.data),

  create: (data: Partial<DeptFormValues> & { manager_id?: number | null }) =>
    api.post(BASE, data).then((r) => r.data),

  update: (
    id: number,
    data: Partial<DeptFormValues> & { manager_id?: number | null },
  ) => api.put(`${BASE}/${id}`, data).then((r) => r.data),

  delete: (id: number) => api.delete(`${BASE}/${id}`).then((r) => r.data),

  toggleStatus: (id: number): Promise<{ status: string }> =>
    api.patch(`${BASE}/${id}/toggle-status`).then((r) => r.data),

  assignManager: (id: number, manager_id: number) =>
    api
      .patch(`${BASE}/${id}/assign-manager`, { manager_id })
      .then((r) => r.data),
};
