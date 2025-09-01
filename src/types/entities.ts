export interface Disciplina {
  id: string;
  nome: string;
  codigo: string;
  cargaHoraria: number;
  createdAt: string;
  updatedAt: string;
}

export interface Turma {
  id: string;
  nome: string;
  ano: number;
  semestre: number;
  createdAt: string;
  updatedAt: string;
}

export interface Sala {
  id: string;
  nome: string;
  capacidade: number;
  tipo: string;
  recursos?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Horario {
  id: string;
  diaSemana: "SEGUNDA" | "TERCA" | "QUARTA" | "QUINTA" | "SEXTA" | "SABADO";
  horaInicio: string;
  horaFim: string;
  turno: "MANHA" | "TARDE" | "NOITE";
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  nome: string;
  email: string;
  senha: string;
  role: "PROFESSOR" | "ADMIN" | "COORDENADOR";
  especializacao?: string;
  cargaHorariaMax?: number;
  preferencia?: string;
}

export interface Alocacao {
  id: string;
  disciplinaId: string;
  turmaId: string;
  salaId: string;
  horarioId: string;
  userId: string;
  disciplina?: Disciplina;
  turma?: Turma;
  sala?: Sala;
  horario?: Horario;
  user?: User;
  createdAt: string;
  updatedAt: string;
}

export interface GradeHorario {
  [key: string]: {
    [key: string]: Alocacao[];
  };
}

// Tipos para formulários
export interface CreateDisciplinaRequest {
  nome: string;
  codigo: string;
  cargaHoraria: number;
}

export interface CreateTurmaRequest {
  nome: string;
  ano: number;
  semestre: number;
}

export interface CreateSalaRequest {
  nome: string;
  capacidade: number;
  tipo: string;
  recursos?: string;
}

export interface CreateAlocacaoRequest {
  disciplinaId: string;
  turmaId: string;
  salaId: string;
  horarioId: string;
  userId: string;
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
