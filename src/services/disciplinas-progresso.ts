import { api } from '@/lib/api'
import { DisciplinaComProgresso } from '@/types/entities'

export interface AtualizarProgressoRequest {
  disciplinaId?: string
  turmaId?: string
}

export interface AtualizarProgressoResponse {
  message: string
  disciplinasAtualizadas: number
}

export interface BuscarDisciplinasComProgressoResponse {
  disciplinas: DisciplinaComProgresso[]
}

export const disciplinasProgressoService = {
  /**
   * Busca disciplinas com informações de progresso
   */
  buscarComProgresso: async (params?: {
    turmaId?: string
    cursoId?: string
  }): Promise<BuscarDisciplinasComProgressoResponse> => {
    const searchParams = new URLSearchParams()
    if (params?.turmaId) searchParams.append('turmaId', params.turmaId)
    if (params?.cursoId) searchParams.append('cursoId', params.cursoId)
    
    const response = await api.get<BuscarDisciplinasComProgressoResponse>(
      `/disciplinas/com-progresso?${searchParams.toString()}`
    )
    return response.data
  },

  /**
   * Atualiza o progresso das disciplinas
   */
  atualizarProgresso: async (data: AtualizarProgressoRequest): Promise<AtualizarProgressoResponse> => {
    const searchParams = new URLSearchParams()
    if (data.disciplinaId) searchParams.append('disciplinaId', data.disciplinaId)
    if (data.turmaId) searchParams.append('turmaId', data.turmaId)
    
    const response = await api.put<AtualizarProgressoResponse>(
      `/disciplinas/atualizar-progresso?${searchParams.toString()}`
    )
    return response.data
  },
}