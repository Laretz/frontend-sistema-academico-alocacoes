import axios from "axios";
import { toast } from "sonner";

// Configuração base da API
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3333";

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
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

// Flag para evitar múltiplas tentativas de refresh simultâneas
let isRefreshing = false;
let failedQueue: Array<{ resolve: (value?: any) => void; reject: (reason?: any) => void }> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token);
    }
  });
  
  failedQueue = [];
};

// Interceptor para tratar respostas e erros
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    const message = error.response?.data?.message || "Erro interno do servidor";

    // Se o token expirou (401) e não é uma tentativa de refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Verificar se não estamos já na página de login ou refresh
      if (typeof window !== 'undefined' && 
          !window.location.pathname.includes('/login') && 
          !originalRequest.url?.includes('/token/refresh')) {
        
        if (isRefreshing) {
          // Se já está fazendo refresh, adicionar à fila
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          }).then(token => {
            if (token) {
              originalRequest.headers['Authorization'] = 'Bearer ' + token;
              return api(originalRequest);
            }
            return Promise.reject(error);
          }).catch(err => {
            return Promise.reject(err);
          });
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
          // Tentar fazer refresh do token
          const refreshResponse = await api.patch('/token/refresh');
          
          if (refreshResponse.data?.token) {
            const newToken = refreshResponse.data.token;
            
            // Atualizar localStorage
            localStorage.setItem('token', newToken);
            
            // Processar fila de requisições pendentes
            processQueue(null, newToken);
            
            // Repetir a requisição original com o novo token
            originalRequest.headers['Authorization'] = 'Bearer ' + newToken;
            
            console.log('✅ Token renovado automaticamente via interceptor');
            
            return api(originalRequest);
          }
        } catch (refreshError) {
          // Se o refresh falhar, limpar dados e redirecionar
          processQueue(refreshError, null);
          
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          
          console.log('❌ Refresh falhou, redirecionando para login');
          
          if (window.location.pathname !== '/login') {
            window.location.href = "/login?redirect=" + encodeURIComponent(window.location.pathname);
          }
          
          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      } else {
        // Se estamos na página de login ou é uma tentativa de refresh, apenas rejeitar
        return Promise.reject(error);
      }
    }

    // Mostrar toast de erro apenas para erros que não sejam 401
    if (error.response?.status !== 401) {
      toast.error(message);
    }

    return Promise.reject(error);
   }
 );

export default api;
