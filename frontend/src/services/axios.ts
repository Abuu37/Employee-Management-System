import axios from "axios";
import {
  clearAuthSession,
  getAccessToken,
  setAccessToken,
} from "@/features/auth/services/authSession";

const api = axios.create({
  baseURL: "/api",
  withCredentials: true,
});

const isRefreshRequest = (url?: string) =>
  (url || "").includes("/auth/refresh");

const isAuthPage = () =>
  ["/login", "/forgot-password", "/reset-password"].includes(
    window.location.pathname,
  );

api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !isRefreshRequest(originalRequest.url)
    ) {
      originalRequest._retry = true;

      try {
        const refreshResponse = await api.post("/auth/refresh");
        const nextAccessToken =
          refreshResponse.data?.accessToken || refreshResponse.data?.token;

        if (nextAccessToken) {
          setAccessToken(nextAccessToken);
          originalRequest.headers = originalRequest.headers ?? {};
          originalRequest.headers.Authorization = `Bearer ${nextAccessToken}`;
          return api(originalRequest);
        }
      } catch {
        // Fall through to clear auth state below.
      }

      clearAuthSession();
      if (!isAuthPage()) {
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  },
);

export default api;
