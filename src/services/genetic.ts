import api from '@/lib/api';

export interface GeneticExecutionRequest {
  id_turma: string;
  configuracoes?: {
    tamanho_populacao?: number;
    numero_geracoes?: number;
    taxa_mutacao?: number;
    taxa_crossover?: number;
  };
}

export interface GeneticExecutionResponse {
  id_execucao: string;
  status: 'INICIADO' | 'EM_PROGRESSO' | 'CONCLUIDO' | 'ERRO' | 'CANCELADO';
  mensagem: string;
}

export interface GeneticStatusResponse {
  id_execucao: string;
  status: 'INICIADO' | 'EM_PROGRESSO' | 'CONCLUIDO' | 'ERRO' | 'CANCELADO';
  progresso?: {
    geracao_atual: number;
    total_geracoes: number;
    melhor_fitness: number;
    tempo_execucao: number;
  };
  resultado?: {
    alocacoes_criadas: number;
    conflitos_resolvidos: number;
    fitness_final: number;
  };
  erro?: string;
}

export interface GeneticReportResponse {
  id_execucao: string;
  turma: {
    id: string;
    nome: string;
    periodo: number;
    turno: string;
  };
  configuracoes: {
    tamanho_populacao: number;
    numero_geracoes: number;
    taxa_mutacao: number;
    taxa_crossover: number;
  };
  resultado: {
    alocacoes_criadas: number;
    conflitos_resolvidos: number;
    fitness_final: number;
    tempo_execucao: number;
  };
  alocacoes: Array<{
    id: string;
    disciplina: {
      id: string;
      nome: string;
      codigo: string;
    };
    professor: {
      id: string;
      nome: string;
    };
    sala: {
      id: string;
      nome: string;
      predio: string;
    };
    horario: {
      id: string;
      dia_semana: string;
      horario_inicio: string;
      horario_fim: string;
      codigo: string;
    };
  }>;
  data_execucao: string;
}

export const geneticService = {
  /**
   * Executa o algoritmo genético para uma turma
   */
  executar: async (data: GeneticExecutionRequest): Promise<GeneticExecutionResponse> => {
    const response = await api.post<GeneticExecutionResponse>('/alocacoes-geneticas/executar', data);
    return response.data;
  },

  /**
   * Verifica o status de uma execução do algoritmo genético
   */
  verificarStatus: async (id_execucao?: string): Promise<GeneticStatusResponse> => {
    const params = id_execucao ? `?id_execucao=${id_execucao}` : '';
    const response = await api.get<GeneticStatusResponse>(`/alocacoes-geneticas/status${params}`);
    return response.data;
  },

  /**
   * Cancela uma execução em andamento
   */
  cancelar: async (id_execucao?: string): Promise<{ mensagem: string }> => {
    const params = id_execucao ? `?id_execucao=${id_execucao}` : '';
    const response = await api.delete<{ mensagem: string }>(`/alocacoes-geneticas/cancelar${params}`);
    return response.data;
  },

  /**
   * Obtém o relatório detalhado de uma execução
   */
  obterRelatorio: async (id_execucao?: string): Promise<GeneticReportResponse> => {
    const params = id_execucao ? `?id_execucao=${id_execucao}` : '';
    const response = await api.get<GeneticReportResponse>(`/alocacoes-geneticas/relatorio${params}`);
    return response.data;
  },

  /**
   * Polling para acompanhar o progresso de uma execução
   */
  acompanharProgresso: async (
    id_execucao: string,
    onProgress: (status: GeneticStatusResponse) => void,
    onComplete: (status: GeneticStatusResponse) => void,
    onError: (error: string) => void,
    intervalMs: number = 2000
  ): Promise<() => void> => {
    let isActive = true;
    
    const poll = async () => {
      if (!isActive) return;
      
      try {
        const status = await geneticService.verificarStatus(id_execucao);
        
        if (status.status === 'EM_PROGRESSO' || status.status === 'INICIADO') {
          onProgress(status);
          setTimeout(poll, intervalMs);
        } else if (status.status === 'CONCLUIDO') {
          onComplete(status);
        } else if (status.status === 'ERRO') {
          onError(status.erro || 'Erro desconhecido na execução');
        } else if (status.status === 'CANCELADO') {
          onError('Execução cancelada');
        }
      } catch (error) {
        onError(`Erro ao verificar status: ${error}`);
      }
    };
    
    // Iniciar polling
    poll();
    
    // Retornar função para cancelar o polling
    return () => {
      isActive = false;
    };
  }
};