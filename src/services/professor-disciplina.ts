import { api } from '@/lib/api'
import {
  ProfessorDisciplina,
  DisciplinaComVinculo,
  ProfessorComVinculo,
  VincularProfessorDisciplinaRequest,
  DesvincularProfessorDisciplinaRequest,
} from '@/types/entities'

export const professorDisciplinaService = {
  async bootstrap(): Promise<{
    professores: Array<{
      id: string;
      nome: string;
      email: string;
      especializacao: string | null;
    }>;
    disciplinas: Array<{
      id: string;
      nome: string;
      codigo: string | null;
      carga_horaria: number;
      tipo_de_sala: "Sala" | "Lab";
      semestre: number;
      obrigatoria: boolean;
      curso: { id: string; nome: string; codigo: string };
    }>;
    cursos: Array<{ id: string; nome: string; codigo: string }>;
  }> {
    const response = await api.get("/professor-disciplina/bootstrap");
    return response.data;
  },

  // vincular professor a uma disciplina
  async vincular(data: VincularProfessorDisciplinaRequest): Promise<{ professorDisciplina: ProfessorDisciplina }> {
    const response = await api.post('/professor-disciplina/vincular', data)
    return response.data
  },

  // desvincular professor de uma disciplina
  async desvincular(data: DesvincularProfessorDisciplinaRequest): Promise<{ message: string }> {
    const response = await api.delete('/professor-disciplina/desvincular', { data })
    return response.data
  },

  // buscar disciplinas de um professor
  async buscarDisciplinasProfessor(id_user: string): Promise<{ disciplinas: DisciplinaComVinculo[] }> {
    const response = await api.get(`/professores/${id_user}/disciplinas`)
    return response.data
  },

  // buscar professores de uma disciplina
  async buscarProfessoresDisciplina(id_disciplina: string): Promise<{ professores: ProfessorComVinculo[] }> {
    const response = await api.get(`/disciplinas/${id_disciplina}/professores`)
    return response.data
  },
}
