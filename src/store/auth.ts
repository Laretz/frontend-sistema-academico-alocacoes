import { create } from "zustand";
import { AuthState, User, LoginRequest, LoginResponse } from "@/types/auth";
import api from "@/lib/api";
import { toast } from "sonner";
import { setCookie, deleteCookie, getCookie } from "@/lib/cookies";

interface AuthStore extends AuthState {
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => void;
  setUser: (user: User) => void;
  setLoading: (loading: boolean) => void;
  checkAuth: () => void;
  refreshToken: () => Promise<boolean>;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,

  login: async (credentials: LoginRequest) => {
    set({ isLoading: true });

    try {
      const response = await api.post<LoginResponse>("/session", credentials);
      const { token, user } = response.data;

      if (!user || !token) {
        throw new Error("Usuário ou token inválidos");
      }

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      setCookie("token", token, 7);

      set({
        user,
        token,
        isAuthenticated: true,
        isLoading: false,
      });

      toast.success("Login realizado com sucesso!");
    } catch (error: unknown) {
      set({ isLoading: false });
      const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || "Erro ao fazer login";
      toast.error(message);
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    deleteCookie("token");

    set({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
    });

    toast.success("Logout realizado com sucesso!");
  },

  setUser: (user: User) => set({ user }),
  setLoading: (loading: boolean) => set({ isLoading: loading }),

  refreshToken: async () => {
    try {
      const response = await api.patch("/token/refresh");
      const { token } = response.data;

      if (!token) {
        throw new Error("Token não recebido");
      }

      localStorage.setItem("token", token);
      setCookie("token", token, 7);

      set({ token });

      return true;
    } catch (error: unknown) {
      console.error("Erro ao renovar token:", error);
      
      // Se falhar, fazer logout
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      deleteCookie("token");

      set({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
      });

      return false;
    }
  },

  checkAuth: () => {
    if (typeof window === "undefined") return;

    const userStr = localStorage.getItem("user");
    const token = localStorage.getItem("token");
    const cookieToken = getCookie("token");

    // Se não há token ou dados de usuário, apenas definir como não autenticado
    if (!token || !userStr || userStr === "undefined" || userStr === "null") {
      set({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
      });
      return;
    }

    try {
      const user = JSON.parse(userStr);
      if (!user || typeof user !== "object" || !user.id) {
        throw new Error("Usuário inválido");
      }

      set({
        user,
        token,
        isAuthenticated: true,
        isLoading: false,
      });

      // Sincronizar cookie apenas se necessário
      if (token !== cookieToken) {
        setCookie("token", token, 7);
      }
    } catch (error) {
      console.warn("Erro ao fazer parse dos dados de usuário:", error);
      // Limpar apenas se houver erro de parsing
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      deleteCookie("token");
      set({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  },
}));
