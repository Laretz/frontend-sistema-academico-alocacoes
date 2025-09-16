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

  checkAuth: () => {
    if (typeof window === "undefined") return;

    const userStr = localStorage.getItem("user");
    const token = localStorage.getItem("token");
    const cookieToken = getCookie("token");

    if (!token || !userStr || userStr === "undefined" || userStr === "null") {
      // Limpar dados corrompidos
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      deleteCookie("token");
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

      if (token !== cookieToken) {
        setCookie("token", token, 7);
      }
    } catch {
      // Se parsing falhar, limpar
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
