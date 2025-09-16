export interface User {
  id: string;
  nome: string;
  email: string;
  role: "ADMIN" | "PROFESSOR" | "COORDENADOR";
  especializacao?: string;
  cargaHorariaMax?: number;
  preferencia?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LoginRequest {
  email: string;
  senha: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface RegisterRequest {
  nome: string;
  email: string;
  senha: string;
  role: "ADMIN" | "PROFESSOR" | "COORDENADOR";
  especializacao?: string;
  cargaHorariaMax?: number;
  preferencia?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
