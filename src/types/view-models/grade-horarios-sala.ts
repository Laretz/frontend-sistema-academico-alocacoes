export type GradeHorariosSalaAlocacaoInfoVM = {
  id: string;
  disciplina: {
    id: string;
    nome: string;
  };
  professor: {
    id: string;
    nome: string;
    email: string;
  };
  turma: {
    id: string;
    nome: string;
    num_alunos: number;
    semestre: number;
    turno: string;
  };
  horario: {
    id: string;
    codigo: string;
    dia_semana: string;
    horario_inicio: string;
    horario_fim: string;
  };
};

export type GradeHorariosSalaGradeVM = Record<
  string,
  Record<string, GradeHorariosSalaAlocacaoInfoVM | null>
>;

export type GradeHorariosSalaResponseVM = {
  salaId: string;
  grade: GradeHorariosSalaGradeVM;
  resumo: {
    totalAlocacoes: number;
    disciplinasUnicas: number;
    professoresUnicos: number;
    turmasUnicas: number;
  };
};
