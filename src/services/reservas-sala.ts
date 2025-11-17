import { api } from '@/lib/api'
import {
  CreateReservaSalaRequest,
  ReservaSala,
  ReservasSalaQuery,
  ReservaSalaResponse,
  ReservasSalaListResponse,
} from '@/types/entities'

export const reservasSalaService = {
  /** Criar reserva de sala (suporta recorrência semanal/mensal) */
  async create(data: CreateReservaSalaRequest): Promise<ReservaSalaResponse> {
    const response = await api.post<ReservaSalaResponse>('/reservas-sala', data)
    return response.data
  },

  /** Buscar reservas com filtros opcionais */
  async list(params?: ReservasSalaQuery): Promise<ReservasSalaListResponse> {
    const searchParams = new URLSearchParams()
    if (params?.salaId) searchParams.append('salaId', params.salaId)
    if (params?.horarioId) searchParams.append('horarioId', params.horarioId)
    if (params?.dateFrom) searchParams.append('dateFrom', params.dateFrom)
    if (params?.dateTo) searchParams.append('dateTo', params.dateTo)
    if (params?.page) searchParams.append('page', String(params.page))
    if (params?.limit) searchParams.append('limit', String(params.limit))

    const qs = searchParams.toString()
    const response = await api.get<ReservasSalaListResponse>(`/reservas-sala${qs ? `?${qs}` : ''}`)
    return response.data
  },

  /** Cancelar uma reserva específica */
  async cancel(id: string): Promise<{ message: string }> {
    const response = await api.delete<{ message: string }>(`/reservas-sala/${id}`)
    return response.data
  },

  /** Cancelar toda a série de reservas por seriesId */
  async cancelSeries(seriesId: string): Promise<{ message: string; cancelledCount: number }> {
    const response = await api.delete<{ message: string; cancelledCount: number }>(`/reservas-sala/series/${seriesId}`)
    return response.data
  },
}