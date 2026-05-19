// Auth endpoints are pre-authentication — use a plain instance without
// the 401-redirect interceptor to avoid redirect loops on the login page.
import axios from "axios";
import type {
  LoginFormValues,
  LoginResponse,
  ResetPasswordPayload,
} from "@/features/auth/types/auth.types";

const authApi = axios.create({ baseURL: "/api" });
authApi.defaults.withCredentials = true;

export const authService = {
  login: (values: LoginFormValues): Promise<LoginResponse> =>
    authApi.post("/auth/login", values).then((r) => r.data),

  refresh: (): Promise<{ accessToken?: string; token?: string }> =>
    authApi.post("/auth/refresh").then((r) => r.data),

  logout: (): Promise<{ message: string }> =>
    authApi.post("/auth/logout").then((r) => r.data),

  forgotPassword: (email: string): Promise<void> =>
    authApi.post("/auth/forgot-password", { email }).then((r) => r.data),

  resetPassword: (payload: ResetPasswordPayload): Promise<void> =>
    authApi.post("/auth/reset-password", payload).then((r) => r.data),
};
