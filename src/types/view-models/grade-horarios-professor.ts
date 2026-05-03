export type GradeHorariosProfessorPropsVM = {
  professorId: string;
  isOpen: boolean;
  onClose: () => void;
};

export type GradeHorariosProfessorAlocacaoVM = {
  id: string;
  disciplina: {
    id: string;
    nome: string;
    codigo?: string;
    carga_horaria: number;
    horario_consolidado?: string;
  };
  turma: {
    id: string;
    nome: string;
    num_alunos: number;
  };
  horario: {
    codigo: string;
    dia_semana: string;
    horario_inicio: string;
    horario_fim: string;
  };
  sala: {
    id: string;
    nome: string | { nome: string };
    numero: string | { nome: string };
    predio: string | { nome: string };
    capacidade: number;
  };
};

export type GradeHorariosProfessorDataVM = {
  id: string;
  nome: string;
  email: string;
  role?: string;
  carga_horaria_max?: number | null;
  preferencia?: string | null;
  especializacao?:
    | string
    | {
        id: string;
        codigo: string;
        nome: string;
        descricao: string;
        created_at: string;
        updated_at: string;
      };
};

export type GradeHorariosProfessorCursoVinculadoVM = {
  id: string;
  codigo: string;
  nome: string;
  turno: string;
  duracao_semestres: number;
  vinculo: { id: string; ativo: boolean; created_at: string };
};

export type GradeHorariosProfessorDisciplinaVinculadaVM = {
  id: string;
  nome: string;
  codigo: string | null;
  carga_horaria: number;
  total_aulas: number;
  tipo_de_sala: "Sala" | "Lab";
  semestre: number;
  obrigatoria: boolean;
  curso: { id: string; nome: string; codigo: string };
  vinculo: { id: string; ativo: boolean; created_at: string };
};
