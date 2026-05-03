import api from '@/lib/api';

export interface StatsTotals {
  usuarios: number;
  cursos: number;
  turmas: number;
  disciplinas: number;
  salas: number;
  horarios: number;
  alocacoes: number;
  reservasAtivas: number;
}

export interface StatsHoje {
  dia_semana: string;
  alocacoesHoje: number;
  reservasHojeAtivas: number;
  salasOcupadasAgora: number;
}

export interface StatsResponse {
  timestamp: string;
  totals: StatsTotals;
  hoje: StatsHoje;
}

export const statsService = {
  async get(): Promise<StatsResponse> {
    const resp = await api.get<StatsResponse>('/stats');
    return resp.data;
  }
};