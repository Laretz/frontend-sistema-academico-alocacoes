import api from '@/lib/api';
import { User, RegisterRequest } from '@/types/auth';
import { PaginatedResponse } from '@/types/entities';

export interface CreateUserRequest {
  nome: string;
  email: string;
  senha: string;
  perfil: 'ADMIN' | 'PROFESSOR' | 'ALUNO';
  especializacao?: string;
  cargaHorariaMax?: number;
  preferencia?: string;
}

export interface UpdateUserRequest {
  nome?: string;
  email?: string;
  perfil?: 'ADMIN' | 'PROFESSOR' | 'ALUNO';
  especializacao?: string;
  cargaHorariaMax?: number;
  preferencia?: string;
}

export const userService = {
  getAll: async (page = 1, limit = 10): Promise<PaginatedResponse<User>> => {
    const response = await api.get<PaginatedResponse<User>>(`/users?page=${page}&limit=${limit}`);
    return response.data;
  },

  getById: async (id: string): Promise<User> => {
    const response = await api.get<User>(`/users/${id}`);
    return response.data;
  },

  create: async (data: CreateUserRequest): Promise<User> => {
    const response = await api.post<User>('/users', data);
    return response.data;
  },

  update: async (id: string, data: UpdateUserRequest): Promise<User> => {
    const response = await api.put<User>(`/users/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/users/${id}`);
  },

  search: async (query: string, page = 1, limit = 10): Promise<PaginatedResponse<User>> => {
    const response = await api.get<PaginatedResponse<User>>(`/users/search?q=${encodeURIComponent(query)}&page=${page}&limit=${limit}`);
    return response.data;
  },
};