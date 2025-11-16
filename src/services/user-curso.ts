import { api } from '@/lib/api'
import { Curso } from '@/types/entities'

export const userCursoService = {
  // Vincular usuário (professor) a curso
  async vincular(data: { id_user: string; id_curso: string }): Promise<{ message?: string }> {
    const response = await api.post('/user-curso/vincular', data)
    return response.data
  },

  // Desvincular usuário (professor) de curso
  async desvincular(data: { id_user: string; id_curso: string }): Promise<{ message?: string }> {
    const response = await api.delete('/user-curso/desvincular', { data })
    return response.data
  },

  // Buscar cursos vinculados de um usuário
  async getCursosByUser(id_user: string, query?: { search?: string }): Promise<{ cursos: Curso[] }> {
    const params = new URLSearchParams()
    if (query?.search) params.set('search', query.search)
    const url = `/user-curso/cursos/${id_user}${params.toString() ? `?${params.toString()}` : ''}`
    const response = await api.get<{ cursos: Curso[] }>(url)
    return response.data
  },

  // Buscar usuários de um curso (não utilizado nesta tela, mas disponível)
  async getUsuariosByCurso(id_curso: string, query?: { search?: string }): Promise<{ usuarios: any[] }> {
    const params = new URLSearchParams()
    if (query?.search) params.set('search', query.search)
    const url = `/user-curso/usuarios/${id_curso}${params.toString() ? `?${params.toString()}` : ''}`
    const response = await api.get(url)
    return response.data
  },
}