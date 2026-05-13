import api from "@/services/axios";
import { normalizeUser } from "@/features/users/utils/normalizeUsers";
import type {
  AddUserFormValues,
  EditUserFormValues,
  EmployeeInsightsResponse,
  User,
  UserListResponse,
} from "@/features/users/types/user.types";

export type {
  User,
  UserRole,
  AddUserFormValues,
  EditUserFormValues,
  EmployeeInsightsResponse,
} from "@/features/users/types/user.types";

export const userService = {
  // ── Employees ──────────────────────────────────────────────────────────
  getEmployees: (
    params?: Record<string, string | null>,
  ): Promise<UserListResponse> =>
    api.get<UserListResponse>("/user/employees/", { params }).then((r) => ({
      ...r.data,
      data: Array.isArray(r.data.data) ? r.data.data.map(normalizeUser) : [],
    })),

  getEmployeeById: (id: number): Promise<User> =>
    api.get<User>(`/user/employees/${id}`).then((r) => normalizeUser(r.data)),

  getInsights: (id: number): Promise<EmployeeInsightsResponse> =>
    api
      .get<EmployeeInsightsResponse>(`/user/employees/${id}/insights`)
      .then((r) => r.data),

  // ── Managers ───────────────────────────────────────────────────────────
  getManagers: (
    params?: Record<string, string | null>,
  ): Promise<UserListResponse> =>
    api.get<UserListResponse>("/user/managers", { params }).then((r) => ({
      ...r.data,
      data: Array.isArray(r.data.data) ? r.data.data.map(normalizeUser) : [],
    })),

  getManagerById: (id: number): Promise<User> =>
    api.get<User>(`/user/managers/${id}`).then((r) => normalizeUser(r.data)),

  // ── Shared CRUD ────────────────────────────────────────────────────────
  create: (data: AddUserFormValues) =>
    api.post("/user/create-user", data).then((r) => r.data),

  update: (id: number, data: EditUserFormValues) =>
    api.put(`/user/update-user/${id}`, data).then((r) => r.data),

  delete: (id: number) =>
    api.delete(`/user/delete-user/${id}`).then((r) => r.data),
};
