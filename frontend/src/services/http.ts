import axios from "axios";
import {
  clearAuthSession,
  getAccessToken,
  setAccessToken,
} from "@/features/auth/services/authSession";

axios.defaults.baseURL = import.meta.env.VITE_API_URL ?? "";
axios.defaults.withCredentials = true;

const isRefreshRequest = (url?: string) =>
  (url || "").includes("/auth/refresh");

const isAuthPage = () =>
  ["/login", "/forgot-password", "/reset-password"].includes(
    window.location.pathname,
  );

axios.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

axios.interceptors.response.use(
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
        const refreshResponse = await axios.post("/api/auth/refresh");
        const nextAccessToken =
          refreshResponse.data?.accessToken || refreshResponse.data?.token;

        if (nextAccessToken) {
          setAccessToken(nextAccessToken);
          originalRequest.headers = originalRequest.headers ?? {};
          originalRequest.headers.Authorization = `Bearer ${nextAccessToken}`;
          return axios(originalRequest);
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
