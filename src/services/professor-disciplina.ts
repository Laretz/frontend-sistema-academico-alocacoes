import { api } from '@/lib/api'
import {
  ProfessorDisciplina,
  DisciplinaComVinculo,
  ProfessorComVinculo,
  VincularProfessorDisciplinaRequest,
  DesvincularProfessorDisciplinaRequest,
} from '@/types/entities'

export const professorDisciplinaService = {
  // Vincular professor a disciplina
  async vincular(data: VincularProfessorDisciplinaRequest): Promise<{ professorDisciplina: ProfessorDisciplina }> {
    const response = await api.post('/professor-disciplina/vincular', data)
    return response.data
  },

  // Desvincular professor de disciplina
  async desvincular(data: DesvincularProfessorDisciplinaRequest): Promise<{ message: string }> {
    const response = await api.post('/professor-disciplina/desvincular', data)
    return response.data
  },

  // Buscar disciplinas de um professor
  async buscarDisciplinasProfessor(id_user: string): Promise<{ disciplinas: DisciplinaComVinculo[] }> {
    const response = await api.get(`/professores/${id_user}/disciplinas`)
    return response.data
  },

  // Buscar professores de uma disciplina
  async buscarProfessoresDisciplina(id_disciplina: string): Promise<{ professores: ProfessorComVinculo[] }> {
    const response = await api.get(`/disciplinas/${id_disciplina}/professores`)
    return response.data
  },
}