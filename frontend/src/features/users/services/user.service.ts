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
  // =======================  Employees ============================================
  getEmployees: (
    params?: Record<string, string | null>,
  ): Promise<UserListResponse> =>
    api.get<UserListResponse>("/user/employees/", { params }).then((r) => ({
      ...r.data,
      data: Array.isArray(r.data.data) ? r.data.data.map(normalizeUser) : [],
    })),

  //========================== get employee by id =========================//
  getEmployeeById: (id: number): Promise<User> =>
    api.get<User>(`/user/employees/${id}`).then((r) => normalizeUser(r.data)),

  //========================== get employee insights =========================//
  getInsights: (id: number): Promise<EmployeeInsightsResponse> =>
    api
      .get<EmployeeInsightsResponse>(`/user/employees/${id}/insights`)
      .then((r) => r.data),

  // ======================== get Managers =========================
  getManagers: (
    params?: Record<string, string | null>,
  ): Promise<UserListResponse> =>
    api.get<UserListResponse>("/user/managers", { params }).then((r) => ({
      ...r.data,
      data: Array.isArray(r.data.data) ? r.data.data.map(normalizeUser) : [],
    })),

  //========================== get manager by id =========================//
  getManagerById: (id: number): Promise<User> =>
    api.get<User>(`/user/managers/${id}`).then((r) => normalizeUser(r.data)),

  // ==================Shared CRUD endpoints ========================================
  create: (data: AddUserFormValues) =>
    api.post("/user/create-user", data).then((r) => r.data),

  update: (id: number, data: EditUserFormValues) =>
    api.put(`/user/update-user/${id}`, data).then((r) => r.data),

  delete: (id: number) =>
    api.delete(`/user/delete-user/${id}`).then((r) => r.data),

  //================= getAdmin endpoints =================//

  getAdmins: (): Promise<{ id: number; name: string }[]> =>
    api
      .get("/user/view-users")
      .then((r) =>
        (Array.isArray(r.data) ? r.data : [])
          .filter((u: User) => u.role === "admin")
          .map((u: User) => ({ id: u.id, name: u.name })),
      ),
};
