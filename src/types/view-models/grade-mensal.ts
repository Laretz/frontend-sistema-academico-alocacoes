export type GradeMensalAlocacaoVM = {
  id: string;
  horario: {
    codigo: string;
    dia_semana: string;
    horario_inicio: string;
    horario_fim: string;
  };
  sala: {
    nome: string;
    predio: string;
  };
};

export type GradeMensalDisciplinaVM = {
  id: string;
  nome: string;
  codigo?: string;
  carga_horaria: number;
  total_aulas: number;
  aulas_ministradas?: number;
  carga_horaria_atual?: number;
  data_inicio?: string;
  data_fim_prevista?: string;
  data_fim_real?: string;
  tipo_de_sala: string;
  progresso_aulas?: number;
  progresso_temporal?: number;
  alocacoes: GradeMensalAlocacaoVM[];
  modulos?: unknown[];
};
