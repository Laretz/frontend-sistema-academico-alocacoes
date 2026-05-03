export type GradeHorariosTurmaAlocacaoInfoVM = {
  id: string;
  disciplina: {
    id: string;
    nome: string;
    codigo: string;
    cargaHoraria: number;
    horario_consolidado?: string;
  };
  professor: {
    id: string;
    nome: string;
    email: string;
  };
  sala: {
    id: string;
    nome: string;
    predio: {
      nome: string;
    };
    capacidade: number;
  };
  horario: {
    id: string;
    codigo: string;
    dia_semana: string;
    horario_inicio: string;
    horario_fim: string;
  };
};

export type GradeHorariosTurmaGradeVM = Record<
  string,
  Record<string, GradeHorariosTurmaAlocacaoInfoVM | null>
>;

export type GradeHorariosTurmaResponseVM = {
  turmaId: string;
  grade: GradeHorariosTurmaGradeVM;
  resumo: {
    totalAlocacoes: number;
    disciplinasUnicas: number;
    professoresUnicos: number;
  };
};
