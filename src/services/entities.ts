import api from "@/lib/api";
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
  PeriodoLetivo,
} from "@/types/entities";

// cursos
export const cursoService = {
  // get cursos (paginado)
  getAll: async (page = 1): Promise<{ cursos: Curso[] }> => {
    const response = await api.get<{ cursos: Curso[] }>(`/cursos?page=${page}`);
    return response.data;
  },

  // get curso por id
  getById: async (id: string): Promise<Curso> => {
    const response = await api.get<{ curso: Curso }>(`/cursos/${id}`);
    return response.data.curso;
  },

  // create curso
  create: async (data: CreateCursoRequest): Promise<Curso> => {
    const response = await api.post<{ curso: Curso }>("/cursos", data);
    return response.data.curso;
  },

  // update curso
  update: async (
    id: string,
    data: Partial<CreateCursoRequest>,
  ): Promise<Curso> => {
    const response = await api.put<{ curso: Curso }>(`/cursos/${id}`, data);
    return response.data.curso;
  },

  // delete curso
  delete: async (id: string): Promise<void> => {
    await api.delete(`/cursos/${id}`);
  },

  // get disciplinas do curso
  getDisciplinas: async (
    id_curso: string,
  ): Promise<{ disciplinas: Disciplina[] }> => {
    const response = await api.get<{ disciplinas: Disciplina[] }>(
      `/cursos/${id_curso}/disciplinas`,
    );
    return response.data;
  },

  // vincular disciplina ao curso
  vincularDisciplina: async (
    id_curso: string,
    id_disciplina: string,
  ): Promise<{ message: string }> => {
    const response = await api.post(`/cursos/${id_curso}/disciplinas`, {
      idDisciplina: id_disciplina,
    });
    return response.data;
  },

  // desvincular disciplina do curso
  desvincularDisciplina: async (
    id_curso: string,
    id_disciplina: string,
  ): Promise<void> => {
    await api.delete(`/cursos/${id_curso}/disciplinas/${id_disciplina}`);
  },

  // get vinculos de disciplinas do curso
  getDisciplinaVinculos: async (
    id_curso: string,
  ): Promise<{
    vinculos: Array<{ id: string; id_curso: string; id_disciplina: string }>;
  }> => {
    const response = await api.get<{
      vinculos: Array<{ id: string; id_curso: string; id_disciplina: string }>;
    }>(`/cursos/${id_curso}/disciplinas-vinculos`);
    return response.data;
  },
};

// predios
export const predioService = {
  // get predios
  getAll: async (): Promise<{ predios: Predio[] }> => {
    const response = await api.get<{ predios: Predio[] }>("/predios");
    return response.data;
  },

  // get predio por id
  getById: async (id: string): Promise<Predio> => {
    const response = await api.get<{ predio: Predio }>(`/predios/${id}`);
    return response.data.predio;
  },

  // create predio
  create: async (data: CreatePredioRequest): Promise<Predio> => {
    const response = await api.post<{ predio: Predio }>("/predios", data);
    return response.data.predio;
  },

  // update predio
  update: async (
    id: string,
    data: Partial<CreatePredioRequest>,
  ): Promise<Predio> => {
    const response = await api.put<{ predio: Predio }>(`/predios/${id}`, data);
    return response.data.predio;
  },

  // delete predio
  delete: async (id: string): Promise<void> => {
    await api.delete(`/predios/${id}`);
  },
};

// disciplinas
export const disciplinaService = {
  // get disciplinas
  getAll: async (): Promise<{ disciplinas: Disciplina[] }> => {
    const response = await api.get<{ disciplinas: Disciplina[] }>(
      "/disciplinas",
    );
    return response.data;
  },

  // get disciplina por id
  getById: async (id: string): Promise<Disciplina> => {
    const response = await api.get<{ disciplina: Disciplina }>(
      `/disciplinas/${id}`,
    );
    return response.data.disciplina;
  },

  // create disciplina
  create: async (data: CreateDisciplinaRequest): Promise<Disciplina> => {
    const response = await api.post<{ disciplina: Disciplina }>(
      "/disciplinas",
      data,
    );
    return response.data.disciplina;
  },

  // update disciplina
  update: async (
    id: string,
    data: Partial<CreateDisciplinaRequest>,
  ): Promise<Disciplina> => {
    const response = await api.put<{ disciplina: Disciplina }>(
      `/disciplinas/${id}`,
      data,
    );
    return response.data.disciplina;
  },

  // delete disciplina
  delete: async (id: string): Promise<void> => {
    await api.delete(`/disciplinas/${id}`);
  },

  // get disciplinas por professor
  getByProfessor: async (
    id_user: string,
  ): Promise<{ disciplinas: Disciplina[] }> => {
    const response = await api.get<{ disciplinas: Disciplina[] }>(
      `/professores/${id_user}/disciplinas`,
    );
    return response.data;
  },
};

// turmas
export const turmaService = {
  // get turmas (paginado)
  getAll: async (page = 1, limit = 10): Promise<{ turmas: Turma[] }> => {
    const response = await api.get<{ turmas: Turma[] }>(
      `/turmas?page=${page}&limit=${limit}`,
    );
    return response.data;
  },

  // get turma por id
  getById: async (id: string): Promise<Turma> => {
    const response = await api.get<{ turma: Turma }>(`/turmas/${id}`);
    return response.data.turma;
  },

  // create turma
  create: async (data: CreateTurmaRequest): Promise<Turma> => {
    const response = await api.post<Turma>("/turmas", data);
    return response.data;
  },

  // update turma
  update: async (
    id: string,
    data: Partial<CreateTurmaRequest>,
  ): Promise<Turma> => {
    const response = await api.put<{ turma: Turma }>(`/turmas/${id}`, data);
    return response.data.turma;
  },

  // delete turma
  delete: async (id: string): Promise<void> => {
    await api.delete(`/turmas/${id}`);
  },

  // get turmas (lista simples)
  getAllSimple: async (): Promise<{ turmas: Turma[] }> => {
    const response = await api.get<{ turmas: Turma[] }>("/turmas/todas");
    return response.data;
  },
};

// salas
export const salaService = {
  // get salas (paginado)
  getAll: async (page = 1): Promise<{ salas: Sala[] }> => {
    const response = await api.get<{ salas: Sala[] }>(`/salas?page=${page}`);
    return response.data;
  },

  // get sala por id
  getById: async (id: string): Promise<Sala> => {
    const response = await api.get<{ sala: Sala }>(`/salas/${id}`);
    return response.data.sala;
  },

  // get salas por predio
  getByPredioId: async (predioId: string): Promise<{ salas: Sala[] }> => {
    const response = await api.get<{ salas: Sala[] }>(
      `/predios/${predioId}/salas`,
    );
    return response.data;
  },

  // create sala
  create: async (data: CreateSalaRequest): Promise<Sala> => {
    const response = await api.post<{ sala: Sala }>("/salas", data);
    return response.data.sala;
  },

  // update sala
  update: async (
    id: string,
    data: Partial<CreateSalaRequest>,
  ): Promise<Sala> => {
    const response = await api.put<{ sala: Sala }>(`/salas/${id}`, data);
    return response.data.sala;
  },

  // delete sala
  delete: async (id: string): Promise<void> => {
    await api.delete(`/salas/${id}`);
  },
};

// periodos letivos
export const periodoLetivoService = {
  // get periodo ativo
  getActive: async (): Promise<{ periodo: PeriodoLetivo }> => {
    const response = await api.get<{ periodo: PeriodoLetivo }>(
      "/periodos-letivos/ativo",
    );
    return response.data;
  },

  // get periodos (lista)
  list: async (options?: { order?: "asc" | "desc" }): Promise<{ periodos: PeriodoLetivo[] }> => {
    const response = await api.get<{ periodos: PeriodoLetivo[] }>(
      "/periodos-letivos",
      { params: options?.order ? { order: options.order } : undefined },
    );
    return response.data;
  },

  // ativar periodo
  activate: async (id: string): Promise<{ periodo: PeriodoLetivo }> => {
    const response = await api.patch<{ periodo: PeriodoLetivo }>(
      `/periodos-letivos/${id}/ativar`,
    );
    return response.data;
  },

  // avancar periodo
  advance: async (data: {
    nome: string;
    data_inicio: string;
    data_fim: string;
  }): Promise<{ encerrados: number; periodo: PeriodoLetivo }> => {
    const response = await api.post<{ encerrados: number; periodo: PeriodoLetivo }>(
      "/periodos-letivos/avancar",
      data,
    );
    return response.data;
  },
};

// horarios
export const horarioService = {
  // get horarios
  getAll: async (
    regime?: "SUPERIOR" | "TECNICO",
    options?: { dia_semana?: string; page?: number; limit?: number },
  ): Promise<Horario[]> => {
    const params: Partial<{
      regime: "SUPERIOR" | "TECNICO";
      dia_semana: string;
      page: number;
      limit: number;
    }> = {};
    if (regime) params.regime = regime;
    if (options?.dia_semana) params.dia_semana = options.dia_semana;
    if (options && options.page !== undefined) params.page = options.page;
    if (options && options.limit !== undefined) params.limit = options.limit;

    const response = await api.get<{
      horarios: Horario[];
      total?: number;
      page?: number;
      limit?: number;
      totalPages?: number;
    }>("/horarios", {
      params: Object.keys(params).length ? params : undefined,
    });
    return response.data.horarios;
  },

  // get horario por id
  getById: async (id: string): Promise<Horario> => {
    const response = await api.get<Horario>(`/horarios/${id}`);
    return response.data;
  },

  // create horarios por codigo
  createByCodigo: async (codigo: string): Promise<Horario[]> => {
    const response = await api.post<Horario[]>("/horarios/codigo", { codigo });
    return response.data;
  },

  // get configuracao da grade (dias e codigos)
  getGradeConfig: async (regime?: "SUPERIOR" | "TECNICO"): Promise<{
    regime: "SUPERIOR" | "TECNICO";
    dias: Array<{ key: string; label: string }>;
    codigos: string[];
  }> => {
    const response = await api.get<{
      regime: "SUPERIOR" | "TECNICO";
      dias: Array<{ key: string; label: string }>;
      codigos: string[];
    }>("/horarios/grade-config", {
      params: regime ? { regime } : undefined,
    });
    return response.data;
  },
};

// alocacoes
export const alocacaoService = {
  // get alocacoes (paginado)
  getAll: async (
    page = 1,
    id_turma?: string,
  ): Promise<{ alocacoes: Alocacao[] }> => {
    let url = `/alocacoes?page=${page}`;
    if (id_turma) {
      url += `&id_turma=${id_turma}`;
    }
    const response = await api.get<{ alocacoes: Alocacao[] }>(url);
    return response.data;
  },

  // get alocacoes por turma (completa)
  getAllByTurma: async (
    id_turma: string,
  ): Promise<{ alocacoes: Alocacao[] }> => {
    const response = await api.get<{ alocacoes: Alocacao[] }>(
      `/alocacoes/turma/${id_turma}/completa`,
    );
    return response.data;
  },

  // get alocacoes por professor (paginado)
  getByProfessor: async (
    id_professor: string,
    page = 1,
  ): Promise<{ alocacoes: Alocacao[] }> => {
    const response = await api.get<{ alocacoes: Alocacao[] }>(
      `/alocacoes/professor/${id_professor}?page=${page}`,
    );
    return response.data;
  },

  // get alocacao por id
  getById: async (id: string): Promise<Alocacao> => {
    const response = await api.get<{ alocacao: Alocacao }>(`/alocacoes/${id}`);
    return response.data.alocacao;
  },

  // create alocacao
  create: async (data: CreateAlocacaoRequest): Promise<void> => {
    await api.post("/alocacoes", data);
  },

  // update alocacao
  update: async (
    id: string,
    data: Partial<CreateAlocacaoRequest>,
  ): Promise<Alocacao> => {
    const response = await api.put<{ alocacao: Alocacao }>(
      `/alocacoes/${id}`,
      data,
    );
    return response.data.alocacao;
  },

  // delete alocacao
  delete: async (id: string): Promise<void> => {
    await api.delete(`/alocacoes/${id}`);
  },

  // get grade de horarios
  getGradeHorarios: async (filters?: {
    id_turma?: string;
    id_user?: string;
    id_sala?: string;
    periodoId?: string;
  }): Promise<GradeHorario> => {
    const periodoId = filters?.periodoId;

    const params = new URLSearchParams();
    if (filters?.id_turma) params.append("id_turma", filters.id_turma);
    if (filters?.id_sala) params.append("id_sala", filters.id_sala);
    if (filters?.id_user) params.append("id_user", filters.id_user);
    if (periodoId) params.append("periodoId", periodoId);
    const response = await api.get<{
      gradeHorarios: unknown;
      grade: GradeHorario;
    }>(`/grade-horarios?${params.toString()}`);
    return response.data.grade;
  },

  // get bootstrap da grade de horarios
  getGradeHorariosBootstrap: async (params?: {
    regime?: "SUPERIOR" | "TECNICO";
  }): Promise<{
    turmas: Array<{ id: string; nome: string }>;
    salas: Array<{
      id: string;
      nome: string;
      predio: { id: string; nome: string; codigo: string; descricao: string | null } | null;
    }>;
    professores: Array<{ id: string; nome: string; email: string; role: "ADMIN" | "PROFESSOR" | "COORDENADOR" }>;
    periodoAtivo: { id: string; nome: string } | null;
    periodos: Array<{ id: string; nome: string; status: "ATIVO" | "ENCERRADO" | "FUTURO" }>;
    gradeConfig: { regime: "SUPERIOR" | "TECNICO"; dias: Array<{ key: string; label: string }>; codigos: string[] };
  }> => {
    const response = await api.get<{
      turmas: Array<{ id: string; nome: string }>;
      salas: Array<{
        id: string;
        nome: string;
        predio: { id: string; nome: string; codigo: string; descricao: string | null } | null;
      }>;
      professores: Array<{ id: string; nome: string; email: string; role: "ADMIN" | "PROFESSOR" | "COORDENADOR" }>;
      periodoAtivo: { id: string; nome: string } | null;
      periodos: Array<{ id: string; nome: string; status: "ATIVO" | "ENCERRADO" | "FUTURO" }>;
      gradeConfig: { regime: "SUPERIOR" | "TECNICO"; dias: Array<{ key: string; label: string }>; codigos: string[] };
    }>("/grade-horarios/bootstrap", {
      params: params?.regime ? { regime: params.regime } : undefined,
    });
    return response.data;
  },

  // get bootstrap de alocacoes
  getAlocacoesBootstrap: async (params?: {
    regime?: "SUPERIOR" | "TECNICO";
  }): Promise<{
    turmas: Array<{
      id: string;
      nome: string;
      id_curso: string;
      turno: string;
      semestre: number;
    }>;
    salas: Array<{
      id: string;
      nome: string;
      capacidade: number;
      tipo: string;
      computadores: number;
      predio: { id: string; nome: string; codigo: string };
    }>;
    professores: Array<{
      id: string;
      nome: string;
      email: string;
      role: "ADMIN" | "PROFESSOR" | "COORDENADOR";
    }>;
    disciplinas: Array<{
      id: string;
      nome: string;
      codigo: string | null;
      carga_horaria: number;
      tipo_de_sala: "Sala" | "Lab";
      semestre: number;
      obrigatoria: boolean;
      id_curso: string;
    }>;
    horarios: Array<{
      id: string;
      codigo: string;
      dia_semana: string;
      horario_inicio: string;
      horario_fim: string;
    }>;
  }> => {
    const response = await api.get<{
      turmas: Array<{
        id: string;
        nome: string;
        id_curso: string;
        turno: string;
        semestre: number;
      }>;
      salas: Array<{
        id: string;
        nome: string;
        capacidade: number;
        tipo: string;
        computadores: number;
        predio: { id: string; nome: string; codigo: string };
      }>;
      professores: Array<{
        id: string;
        nome: string;
        email: string;
        role: "ADMIN" | "PROFESSOR" | "COORDENADOR";
      }>;
      disciplinas: Array<{
        id: string;
        nome: string;
        codigo: string | null;
        carga_horaria: number;
        tipo_de_sala: "Sala" | "Lab";
        semestre: number;
        obrigatoria: boolean;
        id_curso: string;
      }>;
      horarios: Array<{
        id: string;
        codigo: string;
        dia_semana: string;
        horario_inicio: string;
        horario_fim: string;
      }>;
    }>("/alocacoes/bootstrap", {
      params: params?.regime ? { regime: params.regime } : undefined,
    });
    return response.data;
  },

  // get conflitos de horarios
  getHorarioConflicts: async (filters: {
    id_turma?: string;
    id_user?: string;
    id_sala?: string;
    periodoId?: string;
    regime?: "SUPERIOR" | "TECNICO";
  }): Promise<{
    conflitos: Record<
      string,
      | "professor"
      | "sala"
      | "turma"
      | "professor_sala"
      | "professor_turma"
      | "sala_turma"
      | "todos"
    >;
  }> => {
    const params = new URLSearchParams();
    if (filters.id_turma) params.append("id_turma", filters.id_turma);
    if (filters.id_user) params.append("id_user", filters.id_user);
    if (filters.id_sala) params.append("id_sala", filters.id_sala);
    if (filters.periodoId) params.append("periodoId", filters.periodoId);
    if (filters.regime) params.append("regime", filters.regime);

    const response = await api.get<{
      conflitos: Record<
        string,
        | "professor"
        | "sala"
        | "turma"
        | "professor_sala"
        | "professor_turma"
        | "sala_turma"
        | "todos"
      >;
    }>(`/alocacoes/horarios-conflitos?${params.toString()}`);
    return response.data;
  },

  // get alocacoes do turno da manha
  getByTurnoManha: async (page = 1): Promise<{ alocacoes: Alocacao[] }> => {
    const response = await api.get<{ alocacoes: Alocacao[] }>(
      `/alocacoes/turno/manha?page=${page}`,
    );
    return response.data;
  },

  // get alocacoes por turma e turno
  getByTurmaTurno: async (
    id_turma: string,
    turno: string,
    page = 1,
  ): Promise<{ alocacoes: Alocacao[] }> => {
    const response = await api.get<{ alocacoes: Alocacao[] }>(
      `/alocacoes/turma/${id_turma}/turno?turno=${turno}&page=${page}`,
    );
    return response.data;
  },

  // delete todas as alocacoes de uma turma
  deleteAllByTurma: async (id_turma: string): Promise<{ message: string }> => {
    const response = await api.delete<{ message: string }>(
      `/alocacoes/turma/${id_turma}/todas`,
    );
    return response.data;
  },

  // delete todas as alocacoes de uma disciplina em uma turma
  deleteAllByTurmaAndDisciplina: async (
    id_turma: string,
    id_disciplina: string,
  ): Promise<{ message: string }> => {
    const response = await api.delete<{ message: string }>(
      `/alocacoes/turma/${id_turma}/disciplina/${id_disciplina}`,
    );
    return response.data;
  },
};

// professor-disciplina
export const professorDisciplinaService = {
  // vincular professor a disciplina
  vincular: async (data: {
    id_user: string;
    id_disciplina: string;
  }): Promise<unknown> => {
    const response = await api.post("/professor-disciplina/vincular", data);
    return response.data;
  },

  // get professores por disciplina
  getByDisciplina: async (
    id_disciplina: string,
  ): Promise<{ professores: import("@/types/entities").ProfessorComVinculo[] }> => {
    const response = await api.get<{ professores: import("@/types/entities").ProfessorComVinculo[] }>(
      `/disciplinas/${id_disciplina}/professores`,
    );
    return response.data;
  },
};
