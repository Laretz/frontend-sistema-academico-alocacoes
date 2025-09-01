import axios from "axios";
import { toast } from "sonner";

// Configuração base da API
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3333";

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor para adicionar token de autenticação
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

// Interceptor para tratar respostas e erros
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    const message = error.response?.data?.message || "Erro interno do servidor";

    // Se o token expirou, redirecionar para login
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
      return Promise.reject(error);
    }

    // Mostrar toast de erro
    toast.error(message);

    return Promise.reject(error);
  }
);

export default api;
