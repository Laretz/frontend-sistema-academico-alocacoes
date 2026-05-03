import axios from "axios";
import { toast } from "sonner";
import type { InternalAxiosRequestConfig } from "axios";


  // Cliente HTTP (Axios) do front.
  // - Injeta Authorization via token do localStorage.
  // - Em 401, tenta renovar token (/token/refresh) e reexecuta a requisição original.
  // - Exibe toast apenas para erros que não sejam 401.

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3333";

export function getApiErrorMessage(
  error: unknown,
  fallback = "Erro interno do servidor",
): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as unknown;
    const messageFromData =
      typeof data === "object" && data !== null && "message" in data
        ? (data as { message?: unknown }).message
        : undefined;
    if (typeof messageFromData === "string" && messageFromData.trim()) {
      return messageFromData;
    }

    const errorFromData =
      typeof data === "object" && data !== null && "error" in data
        ? (data as { error?: unknown }).error
        : undefined;
    if (typeof errorFromData === "string" && errorFromData.trim()) {
      return errorFromData;
    }
  }

  if (error instanceof Error && error.message.trim()) return error.message;
  return fallback;
}

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: string | null) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token);
    }
  });
  
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error: unknown) => {
    if (!axios.isAxiosError(error)) {
      toast.error("Erro interno do servidor");
      return Promise.reject(error);
    }

    const originalRequest = (error.config || {}) as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    const data = error.response?.data as unknown;
    const messageFromData =
      typeof data === "object" && data !== null && "message" in data
        ? (data as { message?: unknown }).message
        : undefined;
    const message =
      typeof messageFromData === "string"
        ? messageFromData
        : "Erro interno do servidor";

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (typeof window !== 'undefined' && 
          !window.location.pathname.includes('/login') && 
          !originalRequest.url?.includes('/token/refresh')) {
        
        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          })
            .then((token) => {
              if (typeof token === "string" && token) {
                originalRequest.headers = originalRequest.headers ?? {};
                originalRequest.headers["Authorization"] = "Bearer " + token;
                return api(originalRequest);
              }
              return Promise.reject(error);
            })
            .catch((err: unknown) => {
              return Promise.reject(err);
            });
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
          const refreshResponse = await api.patch('/token/refresh');
          
          const refreshData = refreshResponse.data as unknown;
          const tokenCandidate =
            typeof refreshData === "object" && refreshData !== null && "token" in refreshData
              ? (refreshData as { token?: unknown }).token
              : undefined;

          if (typeof tokenCandidate === "string" && tokenCandidate) {
            const newToken = tokenCandidate;
            
            localStorage.setItem('token', newToken);
            
            processQueue(null, newToken);
            
            originalRequest.headers = originalRequest.headers ?? {};
            originalRequest.headers["Authorization"] = "Bearer " + newToken;
            
            return api(originalRequest);
          }
        } catch (refreshError) {
          processQueue(refreshError, null);
          
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          
          if (window.location.pathname !== '/login') {
            window.location.href = "/login?redirect=" + encodeURIComponent(window.location.pathname);
          }
          
          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      } else {
        return Promise.reject(error);
      }
    }

    if (error.response?.status !== 401) {
      toast.error(message);
    }

    return Promise.reject(error);
   }
 );

export default api;
