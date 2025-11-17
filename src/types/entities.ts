export interface Curso {
  id: string;
  codigo: string;
  nome: string;
  turno: "MATUTINO" | "VESPERTINO" | "NOTURNO" | "INTEGRAL";
  duracao_semestres: number;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

export interface Disciplina {
  id: string;
  nome: string;
  codigo?: string;
  carga_horaria: number; // 30, 45, 60 ou 90
  carga_horaria_atual?: number;
  total_aulas: number;
  aulas_ministradas: number;
  periodo_letivo: string;
  semestre: number;
  obrigatoria: boolean;
  id_curso: string;
  tipo_de_sala: "Sala" | "Lab";
  data_inicio?: string;
  data_fim_prevista?: string;
  data_fim_real?: string;
  horario_consolidado?: string;
  curso?: Curso;
}
export interface User {
  id: string;
  nome: string;
  email: string;
  role: "ADMIN" | "PROFESSOR" | "COORDENADOR";
  especializacao?: string;
  carga_horaria_max?: number;
  preferencia?: string;
  cursos?: {
    id: string;
    id_user: string;
    id_curso: string;
    ativo: boolean;
    created_at: string;
    updated_at: string;
    curso: Curso;
  }[];
  curso?: Curso[]; // Para compatibilidade com o código existente
}

export interface Turma {
  id: string;
  nome: string;
  num_alunos: number;
  periodo: number;
  turno: string;
  id_curso: string;
  curso?: Curso;
}

export interface Predio {
  id: string;
  codigo: string;
  nome: string;
  descricao?: string;
  created_at: string;
  updated_at: string;
  salas?: Sala[];
}

export interface Sala {
  id: string;
  nome: string;
  predio: {
    id: string;
    nome: string;
    codigo: string;
  };
  predioId?: string;
  capacidade: number;
  tipo: string;
  computadores: number;
}

export interface Horario {
  id: string;
  codigo: string;
  dia_semana: string;
  horario_inicio: string;
  horario_fim: string;
}

export interface Alocacao {
  id: string;
  id_user: string;
  id_disciplina: string;
  id_turma: string;
  id_sala: string;
  id_horario: string;
  is_modulo_principal: boolean;
  created_at: string;
  user?: User;
  disciplina?: Disciplina;
  turma?: Turma;
  sala?: Sala;
  horario?: Horario;
}

export interface GradeHorario {
  [key: string]: {
    [key: string]: Alocacao[];
  };
}

// Professor-Disciplina
export interface ProfessorDisciplina {
  id: string;
  id_user: string;
  id_disciplina: string;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

export interface DisciplinaComVinculo {
  id: string;
  nome: string;
  carga_horaria: number;
  total_aulas: number;
  tipo_de_sala: string;
  codigo: string | null;
  semestre: number;
  obrigatoria: boolean;
  curso: {
    id: string;
    nome: string;
    codigo: string;
  };
  vinculo: {
    id: string;
    ativo: boolean;
    created_at: string;
  };
}

export interface DisciplinaComProgresso {
  id: string;
  nome: string;
  codigo: string | null;
  carga_horaria: number;
  total_aulas: number;
  carga_horaria_atual: number;
  aulas_ministradas: number;
  tipo_de_sala: string;
  data_inicio: string | null;
  data_fim_prevista: string | null;
  data_fim_real: string | null;
  periodo_letivo: string | null;
  horario_consolidado: string | null;
  id_curso: string;
  semestre: number;
  obrigatoria: boolean;
  progresso_temporal: number;
  progresso_aulas: number;
  aulas_previstas_ate_hoje: number;
}

export interface ProfessorComVinculo {
  id: string;
  nome: string;
  email: string;
  especializacao: string | null;
  carga_horaria_max: number | null;
  preferencia: string | null;
  vinculo: {
    id: string;
    ativo: boolean;
    created_at: string;
  };
}

// Tipos para formulários
export interface ModuloDisciplina {
  id: string;
  id_disciplina: string;
  id_alocacao_principal: string;
  id_sala: string;
  id_horario: string;
  data_inicio: string;
  data_fim: string;
  ativo: boolean;
  created_at: string;
  disciplina?: Disciplina;
  sala?: Sala;
  horario?: Horario;
}

export interface CreateCursoRequest {
  codigo: string;
  nome: string;
  turno: "MATUTINO" | "VESPERTINO" | "NOTURNO" | "INTEGRAL";
  duracao_semestres: number;
}

export interface CreateDisciplinaRequest {
  nome: string;
  carga_horaria: number; // 30, 45, 60 ou 90
  id_curso: string;
  tipo_de_sala: "Lab" | "Sala";
  periodo_letivo: string;
  codigo: string;
  semestre: number;
  obrigatoria: boolean;
  data_inicio?: string;
  data_fim_prevista?: string;
}

export interface CreateTurmaRequest {
  nome: string;
  num_alunos: number;
  periodo: number;
  turno: string;
  id_curso: string;
}

export interface CreateSalaRequest {
  nome: string;
  predioId: string;
  capacidade: number;
  tipo: string;
  computadores?: number;
}

export interface CreateAlocacaoRequest {
  id_user: string;
  id_curso_disciplina: string;
  id_turma: string;
  id_sala: string;
  id_horario?: string;
  id_horarios?: string[];
}

export interface CreatePredioRequest {
  codigo: string;
  nome: string;
  descricao?: string;
}

export interface CreateModuloRequest {
  id_disciplina: string;
  id_alocacao_principal: string;
  id_sala: string;
  id_horario: string;
  data_inicio: string;
  data_fim: string;
}

export interface VincularProfessorDisciplinaRequest {
  id_user: string;
  id_disciplina: string;
}

export interface DesvincularProfessorDisciplinaRequest {
  id_user: string;
  id_disciplina: string;
}

// Tipos para API responses
export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface ApiError {
  message: string;
  statusCode: number;
  error?: string;
}

// Tipos de Reserva de Sala
export type ReservaStatus = "ATIVA" | "CANCELADA";

export interface ReservaSala {
  id: string;
  salaId: string;
  horarioId: string;
  date: string; // ISO ou YYYY-MM-DD
  titulo: string;
  descricao?: string | null;
  status: ReservaStatus;
  recurrenceRule?: "WEEKLY" | null;
  recurrenceEnd?: string | null; // YYYY-MM-DD
  seriesId?: string | null;
  criado_por?: string | null; // userId
  // Nome opcional do criador para exibição na grade
  criadorNome?: string;
  created_at?: string;
  updated_at?: string;
  sala?: Sala;
  horario?: Horario;
}

export interface CreateReservaSalaRequest {
  salaId: string;
  horarioId: string;
  date: string; // YYYY-MM-DD
  titulo: string;
  descricao?: string;
  recurrenceRule?: "WEEKLY";
  recurrenceEnd?: string; // YYYY-MM-DD
}

export interface ReservasSalaQuery {
  salaId?: string;
  horarioId?: string;
  dateFrom?: string; // YYYY-MM-DD
  dateTo?: string;   // YYYY-MM-DD
  page?: number;
  limit?: number;
}

export interface ReservaSalaResponse {
  reservas: ReservaSala[];
}

export interface ReservasSalaListResponse {
  reservas: ReservaSala[];
  meta?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
