import type { DisciplinaComProgresso } from "@/types/entities";

export type CalendarioProgressoDisciplinaVM = DisciplinaComProgresso & {
  alocacoes?: Array<{
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
  }>;
};
