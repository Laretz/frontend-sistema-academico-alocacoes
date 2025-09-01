import api from '@/lib/api';
import {
  Disciplina,
  Turma,
  Sala,
  Horario,
  Alocacao,
  CreateDisciplinaRequest,
  CreateTurmaRequest,
  CreateSalaRequest,
  CreateAlocacaoRequest,
  PaginatedResponse,
  GradeHorario,
} from '@/types/entities';

// Disciplinas
export const disciplinaService = {
  getAll: async (page = 1, limit = 10): Promise<PaginatedResponse<Disciplina>> => {
    const response = await api.get<PaginatedResponse<Disciplina>>(`/disciplinas?page=${page}&limit=${limit}`);
    return response.data;
  },

  getById: async (id: string): Promise<Disciplina> => {
    const response = await api.get<Disciplina>(`/disciplinas/${id}`);
    return response.data;
  },

  create: async (data: CreateDisciplinaRequest): Promise<Disciplina> => {
    const response = await api.post<Disciplina>('/disciplinas', data);
    return response.data;
  },

  update: async (id: string, data: Partial<CreateDisciplinaRequest>): Promise<Disciplina> => {
    const response = await api.put<Disciplina>(`/disciplinas/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/disciplinas/${id}`);
  },
};

// Turmas
export const turmaService = {
  getAll: async (page = 1, limit = 10): Promise<PaginatedResponse<Turma>> => {
    const response = await api.get<PaginatedResponse<Turma>>(`/turmas?page=${page}&limit=${limit}`);
    return response.data;
  },

  getById: async (id: string): Promise<Turma> => {
    const response = await api.get<Turma>(`/turmas/${id}`);
    return response.data;
  },

  create: async (data: CreateTurmaRequest): Promise<Turma> => {
    const response = await api.post<Turma>('/turmas', data);
    return response.data;
  },

  update: async (id: string, data: Partial<CreateTurmaRequest>): Promise<Turma> => {
    const response = await api.put<Turma>(`/turmas/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/turmas/${id}`);
  },
};

// Salas
export const salaService = {
  getAll: async (page = 1, limit = 10): Promise<PaginatedResponse<Sala>> => {
    const response = await api.get<PaginatedResponse<Sala>>(`/salas?page=${page}&limit=${limit}`);
    return response.data;
  },

  getById: async (id: string): Promise<Sala> => {
    const response = await api.get<Sala>(`/salas/${id}`);
    return response.data;
  },

  create: async (data: CreateSalaRequest): Promise<Sala> => {
    const response = await api.post<Sala>('/salas', data);
    return response.data;
  },

  update: async (id: string, data: Partial<CreateSalaRequest>): Promise<Sala> => {
    const response = await api.put<Sala>(`/salas/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/salas/${id}`);
  },
};

// Horários
export const horarioService = {
  getAll: async (): Promise<Horario[]> => {
    const response = await api.get<Horario[]>('/horarios');
    return response.data;
  },

  getById: async (id: string): Promise<Horario> => {
    const response = await api.get<Horario>(`/horarios/${id}`);
    return response.data;
  },

  createByCodigo: async (codigo: string): Promise<Horario[]> => {
    const response = await api.post<Horario[]>('/horarios/codigo', { codigo });
    return response.data;
  },
};

// Alocações
export const alocacaoService = {
  getAll: async (page = 1, limit = 10): Promise<PaginatedResponse<Alocacao>> => {
    const response = await api.get<PaginatedResponse<Alocacao>>(`/alocacoes?page=${page}&limit=${limit}`);
    return response.data;
  },

  getById: async (id: string): Promise<Alocacao> => {
    const response = await api.get<Alocacao>(`/alocacoes/${id}`);
    return response.data;
  },

  create: async (data: CreateAlocacaoRequest): Promise<Alocacao> => {
    const response = await api.post<Alocacao>('/alocacoes', data);
    return response.data;
  },

  update: async (id: string, data: Partial<CreateAlocacaoRequest>): Promise<Alocacao> => {
    const response = await api.put<Alocacao>(`/alocacoes/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/alocacoes/${id}`);
  },

  getGradeHorarios: async (filters?: {
    id_turma?: string;
    id_user?: string;
    id_sala?: string;
  }): Promise<GradeHorario> => {
    const params = new URLSearchParams();
    if (filters?.id_turma) params.append('id_turma', filters.id_turma);
    if (filters?.id_user) params.append('id_user', filters.id_user);
    if (filters?.id_sala) params.append('id_sala', filters.id_sala);
    
    const response = await api.get<GradeHorario>(`/grade-horarios?${params.toString()}`);
    return response.data;
  },
};