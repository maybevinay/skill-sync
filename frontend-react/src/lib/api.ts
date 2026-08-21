import axios, { type InternalAxiosRequestConfig } from "axios";
import { authStore } from "@/lib/auth";

export function serviceBase(path: string): string {
  if (path.includes("/api/chat") || path.includes("/api/rag") || path.includes("/api/documents") || path.includes("/api/admin/ai-stats")) {
    return "http://localhost:8083";
  }
  if (
    path.includes("/api/profile") ||
    path.includes("/api/skills") ||
    path.includes("/api/mentors") ||
    path.includes("/api/requests") ||
    path.includes("/api/reviews") ||
    path.includes("/api/admin/analytics")
  ) {
    return "http://localhost:8082";
  }
  return "http://localhost:8081";
}

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8081",
});

api.interceptors.request.use((config) => {
  const url = config.url ?? "";
  if (!url.startsWith("http")) {
    config.baseURL = serviceBase(url);
  }
  const token = localStorage.getItem("ss_access");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

function isAuthAttempt(config?: InternalAxiosRequestConfig) {
  const url = `${config?.baseURL ?? ""}${config?.url ?? ""}`;
  return /\/api\/auth\/(login|register|refresh|forgot-password|reset-password)/.test(url);
}

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    if (error.response?.status === 401 && !original?._retry && !isAuthAttempt(original)) {
      original._retry = true;
      const refresh = localStorage.getItem("ss_refresh");
      if (refresh) {
        try {
          const { data } = await axios.post(`${serviceBase("/api/auth")}/api/auth/refresh`, {
            refreshToken: refresh,
          });
          localStorage.setItem("ss_access", data.accessToken);
          localStorage.setItem("ss_refresh", data.refreshToken);
          original.headers = original.headers ?? {};
          original.headers.Authorization = `Bearer ${data.accessToken}`;
          return api(original);
        } catch {
          authStore.clear();
          window.location.href = "/login";
        }
      }
    }
    return Promise.reject(error);
  },
);

export default api;

export function apiErrorMessage(error: unknown, fallback: string) {
  const err = error as {
    response?: { data?: { message?: string }; status?: number };
  };
  const status = err.response?.status;
  const server = err.response?.data?.message;
  if (server) return server;
  if (status === 401) return "Invalid credentials";
  if (!err.response) {
    return fallback === "Invalid credentials"
      ? "Cannot reach auth-service. Confirm it is running on http://localhost:8081."
      : /document|RAG|assistant|process/i.test(fallback)
        ? `${fallback} Confirm ai-service is running on http://localhost:8083.`
        : `${fallback} Confirm matching-service is running on http://localhost:8082.`;
  }
  return fallback;
}
