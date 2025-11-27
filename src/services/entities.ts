import api from '@/lib/api';
import {
  Curso,
  Disciplina,
  Turma,
  Sala,
  Predio,
  Horario,
  Alocacao,
  CreateCursoRequest,
  CreateDisciplinaRequest,
  CreateTurmaRequest,
  CreateSalaRequest,
  CreatePredioRequest,
  CreateAlocacaoRequest,
  GradeHorario,
} from '@/types/entities';

// Cursos
export const cursoService = {
  getAll: async (page = 1): Promise<{ cursos: Curso[] }> => {
    const response = await api.get<{ cursos: Curso[] }>(`/cursos?page=${page}`);
    return response.data;
  },

  getById: async (id: string): Promise<Curso> => {
    const response = await api.get<{ curso: Curso }>(`/cursos/${id}`);
    return response.data.curso;
  },

  create: async (data: CreateCursoRequest): Promise<Curso> => {
    const response = await api.post<{ curso: Curso }>('/cursos', data);
    return response.data.curso;
  },

  update: async (id: string, data: Partial<CreateCursoRequest>): Promise<Curso> => {
    const response = await api.put<{ curso: Curso }>(`/cursos/${id}`, data);
    return response.data.curso;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/cursos/${id}`);
  },
  
  // Disciplinas por curso (sem paginação, ordenadas por semestre)
  getDisciplinas: async (id_curso: string): Promise<{ disciplinas: Disciplina[] }> => {
    const response = await api.get<{ disciplinas: Disciplina[] }>(`/cursos/${id_curso}/disciplinas`);
    return response.data;
  },
  vincularDisciplina: async (id_curso: string, id_disciplina: string): Promise<{ message: string }> => {
    const response = await api.post(`/cursos/${id_curso}/disciplinas`, { idDisciplina: id_disciplina });
    return response.data;
  },
  desvincularDisciplina: async (id_curso: string, id_disciplina: string): Promise<void> => {
    await api.delete(`/cursos/${id_curso}/disciplinas/${id_disciplina}`);
  },
  // Novo: vínculos CursoDisciplina com IDs
  getDisciplinaVinculos: async (id_curso: string): Promise<{ vinculos: Array<{ id: string; id_curso: string; id_disciplina: string }> }> => {
    const response = await api.get<{ vinculos: Array<{ id: string; id_curso: string; id_disciplina: string }> }>(`/cursos/${id_curso}/disciplinas-vinculos`);
    return response.data;
  },
};

// Prédios
export const predioService = {
  getAll: async (): Promise<{ predios: Predio[] }> => {
    const response = await api.get<{ predios: Predio[] }>('/predios');
    return response.data;
  },

  getById: async (id: string): Promise<Predio> => {
    const response = await api.get<{ predio: Predio }>(`/predios/${id}`);
    return response.data.predio;
  },

  create: async (data: CreatePredioRequest): Promise<Predio> => {
    const response = await api.post<{ predio: Predio }>('/predios', data);
    return response.data.predio;
  },

  update: async (id: string, data: Partial<CreatePredioRequest>): Promise<Predio> => {
    const response = await api.put<{ predio: Predio }>(`/predios/${id}`, data);
    return response.data.predio;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/predios/${id}`);
  },
};

// Disciplinas
export const disciplinaService = {
  getAll: async (): Promise<{ disciplinas: Disciplina[] }> => {
    const response = await api.get<{ disciplinas: Disciplina[] }>('/disciplinas');
    return response.data;
  },

  getById: async (id: string): Promise<Disciplina> => {
    const response = await api.get<{ disciplina: Disciplina }>(`/disciplinas/${id}`);
    return response.data.disciplina;
  },

  create: async (data: CreateDisciplinaRequest): Promise<Disciplina> => {
    const response = await api.post<{ disciplina: Disciplina }>('/disciplinas', data);
    return response.data.disciplina;
  },

  update: async (id: string, data: Partial<CreateDisciplinaRequest>): Promise<Disciplina> => {
    const response = await api.put<{ disciplina: Disciplina }>(`/disciplinas/${id}`, data);
    return response.data.disciplina;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/disciplinas/${id}`);
  },

  getByProfessor: async (id_user: string): Promise<{ disciplinas: Disciplina[] }> => {
    const response = await api.get<{ disciplinas: Disciplina[] }>(`/professores/${id_user}/disciplinas`);
    return response.data;
  },
};

// Turmas
export const turmaService = {
  getAll: async (page = 1, limit = 10): Promise<{ turmas: Turma[] }> => {
    const response = await api.get<{ turmas: Turma[] }>(`/turmas?page=${page}&limit=${limit}`);
    return response.data;
  },

  getById: async (id: string): Promise<Turma> => {
    const response = await api.get<{ turma: Turma }>(`/turmas/${id}`);
    return response.data.turma;
  },

  create: async (data: CreateTurmaRequest): Promise<Turma> => {
    const response = await api.post<Turma>('/turmas', data);
    return response.data;
  },

  update: async (id: string, data: Partial<CreateTurmaRequest>): Promise<Turma> => {
    const response = await api.put<{ turma: Turma }>(`/turmas/${id}`, data);
    return response.data.turma;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/turmas/${id}`);
  },
};

// Salas
export const salaService = {
  getAll: async (page = 1): Promise<{ salas: Sala[] }> => {
    const response = await api.get<{ salas: Sala[] }>(`/salas?page=${page}`);
    return response.data;
  },

  getById: async (id: string): Promise<Sala> => {
    const response = await api.get<{ sala: Sala }>(`/salas/${id}`);
    return response.data.sala;
  },

  getByPredioId: async (predioId: string): Promise<{ salas: Sala[] }> => {
    const response = await api.get<{ salas: Sala[] }>(`/predios/${predioId}/salas`);
    return response.data;
  },

  create: async (data: CreateSalaRequest): Promise<Sala> => {
    const response = await api.post<{ sala: Sala }>('/salas', data);
    return response.data.sala;
  },

  update: async (id: string, data: Partial<CreateSalaRequest>): Promise<Sala> => {
    const response = await api.put<{ sala: Sala }>(`/salas/${id}`, data);
    return response.data.sala;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/salas/${id}`);
  },
};

// Horários
export const horarioService = {
  getAll: async (
    regime?: 'SUPERIOR' | 'TECNICO',
    options?: { dia_semana?: string; page?: number; limit?: number }
  ): Promise<Horario[]> => {
    const params: Partial<{ regime: 'SUPERIOR'|'TECNICO'; dia_semana: string; page: number; limit: number }> = {};
    if (regime) params.regime = regime;
    if (options?.dia_semana) params.dia_semana = options.dia_semana;
    if (options && options.page !== undefined) params.page = options.page;
    if (options && options.limit !== undefined) params.limit = options.limit;

    const response = await api.get<{ horarios: Horario[]; total?: number; page?: number; limit?: number; totalPages?: number }>(
      '/horarios',
      { params: Object.keys(params).length ? params : undefined }
    );
    return response.data.horarios;
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
  getAll: async (page = 1): Promise<{ alocacoes: Alocacao[] }> => {
    const response = await api.get<{ alocacoes: Alocacao[] }>(`/alocacoes?page=${page}`);
    return response.data;
  },

  getByProfessor: async (id_professor: string, page = 1): Promise<{ alocacoes: Alocacao[] }> => {
    const response = await api.get<{ alocacoes: Alocacao[] }>(`/alocacoes/professor/${id_professor}?page=${page}`);
    return response.data;
  },

  getById: async (id: string): Promise<Alocacao> => {
    const response = await api.get<{ alocacao: Alocacao }>(`/alocacoes/${id}`);
    return response.data.alocacao;
  },

  create: async (data: CreateAlocacaoRequest): Promise<void> => {
    // A resposta do backend pode ser { alocacao } ou { alocacoes } dependendo de id_horario vs id_horarios.
    // Como o caller não usa o retorno, apenas aguardamos o sucesso.
    await api.post('/alocacoes', data);
  },

  update: async (id: string, data: Partial<CreateAlocacaoRequest>): Promise<Alocacao> => {
    const response = await api.put<{ alocacao: Alocacao }>(`/alocacoes/${id}`, data);
    return response.data.alocacao;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/alocacoes/${id}`);
  },

  getGradeHorarios: async (filters?: {
    id_turma?: string;
    id_user?: string;
    id_sala?: string;
  }): Promise<GradeHorario> => {
    // Preferir endpoints específicos quando disponíveis para garantir grade completa
    if (filters?.id_turma) {
      const response = await api.get<unknown>(`/turmas/${filters.id_turma}/grade-horarios`);
      const data = response.data as { grade?: Record<string, unknown> };
      return (data.grade || {}) as unknown as GradeHorario;
    }
    if (filters?.id_sala) {
      const response = await api.get<unknown>(`/salas/${filters.id_sala}/grade-horarios`);
      const data = response.data as { grade?: Record<string, unknown> };
      return (data.grade || {}) as unknown as GradeHorario;
    }

    const params = new URLSearchParams();
    if (filters?.id_user) params.append('id_user', filters.id_user);
    const response = await api.get<unknown>(`/grade-horarios?${params.toString()}`);
    return response.data as GradeHorario;
  },

  // Buscar alocações do período manhã
  getByPeriodoManha: async (page = 1): Promise<{ alocacoes: Alocacao[] }> => {
    const response = await api.get<{ alocacoes: Alocacao[] }>(`/alocacoes/periodo/manha?page=${page}`);
    return response.data;
  },

  // Buscar alocações por turma e período
  getByTurmaPeriodo: async (id_turma: string, periodo: string, page = 1): Promise<{ alocacoes: Alocacao[] }> => {
    const response = await api.get<{ alocacoes: Alocacao[] }>(`/alocacoes/turma/${id_turma}/periodo?periodo=${periodo}&page=${page}`);
    return response.data;
  },

  // Excluir todas as alocações de uma turma
  deleteAllByTurma: async (id_turma: string): Promise<{ message: string }> => {
    const response = await api.delete<{ message: string }>(`/alocacoes/turma/${id_turma}`);
    return response.data;
  },
};

// Professor-Disciplina
export const professorDisciplinaService = {
  vincular: async (data: { id_user: string; id_disciplina: string }): Promise<unknown> => {
    const response = await api.post('/professor-disciplina/vincular', data);
    return response.data;
  },
};