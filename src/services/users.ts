import api from '@/lib/api';
import { User } from '@/types/auth';
import { PaginatedResponse } from '@/types/entities';

export interface CreateUserRequest {
  nome: string;
  email: string;
  senha: string;
  role: 'ADMIN' | 'PROFESSOR' | 'COORDENADOR';
  especializacao?: string;
  carga_horaria_max?: number;
  preferencia?: string;
}

export interface UpdateUserRequest {
  nome?: string;
  email?: string;
  role?: 'ADMIN' | 'PROFESSOR' | 'COORDENADOR';
  especializacao?: string;
  carga_horaria_max?: number;
  preferencia?: string;
}

export const userService = {
  getAll: async (page = 1): Promise<{ usuarios: User[] }> => {
    const response = await api.get<{ usuarios: User[] }>(`/users?page=${page}`);
    // Transformar os dados para compatibilidade com o frontend
    const usuarios = response.data.usuarios.map(user => ({
      ...user,
      curso: user.cursos?.map(uc => uc.curso) || []
    }));
    return { usuarios };
  },

  getById: async (id: string): Promise<User> => {
    const response = await api.get<{ usuario: User }>(`/users/${id}`);
    const usuario = {
      ...response.data.usuario,
      curso: response.data.usuario.cursos?.map(uc => uc.curso) || []
    };
    return usuario;
  },

  create: async (data: CreateUserRequest): Promise<void> => {
    await api.post('/register', data);
  },

  update: async (id: string, data: UpdateUserRequest): Promise<User> => {
    const response = await api.put<{ usuario: User }>(`/users/${id}`, data);
    return response.data.usuario;
  },

  updateRole: async (id: string, role: string): Promise<User> => {
    const response = await api.put<{ usuario: User }>(`/users/${id}`, { role });
    return response.data.usuario;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/users/${id}`);
  },

  search: async (query: string, page = 1, limit = 10): Promise<PaginatedResponse<User>> => {
    const response = await api.get<PaginatedResponse<User>>(`/users/search?q=${encodeURIComponent(query)}&page=${page}&limit=${limit}`);
    return response.data;
  },
};