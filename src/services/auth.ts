import api from "@/lib/api";
import {
  LoginRequest,
  LoginResponse,
  User,
} from "@/types/auth";

export interface LoginData {
  email: string;
  senha: string;
}

export interface RegisterData {
  nome: string;
  email: string;
  senha: string;
  role: "PROFESSOR" | "ADMIN" | "COORDENADOR";
  especializacao?: string;
  cargaHorariaMax?: number;
  preferencia?: string;
}

export const authService = {
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>("/session", credentials);
    console.log("🔹 Resposta da API:", response.data);
    return response.data;
  },

  register: async (data: RegisterData): Promise<void> => {
    // Backend espera POST /register para criar usuário
    await api.post("/register", data);
  },

  getProfile: async (): Promise<User> => {
    const response = await api.get<User>("/profile");
    return response.data;
  },

  updateProfile: async (userData: Partial<User>): Promise<User> => {
    const response = await api.put<User>("/profile", userData);
    return response.data;
  },

  refreshToken: async (): Promise<{ token: string }> => {
    const response = await api.post<{ token: string }>("/token/refresh");
    return response.data;
  },
};
