"use client";
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { DatePicker } from "@/components/ui/date-picker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search } from "lucide-react";
import { AlocacaoDialog } from "@/app/alocacoes/components/AlocacaoDialog";
import { User, Disciplina, Turma, Sala, Horario, Alocacao } from "@/types/entities";

interface FormData {
  id_user: string;
  id_disciplina: string;
  id_turma: string;
  id_sala: string;
  id_horarios: string[];
}

interface AlocacoesToolbarProps {
  // Busca
  searchTerm: string;
  setSearchTerm: React.Dispatch<React.SetStateAction<string>>;

  // Filtros rápidos
  filtroDataInicio: Date | undefined;
  setFiltroDataInicio: React.Dispatch<React.SetStateAction<Date | undefined>>;
  filtroDataFim: Date | undefined;
  setFiltroDataFim: React.Dispatch<React.SetStateAction<Date | undefined>>;
  filtroDiaSemana: string;
  setFiltroDiaSemana: (value: string) => void;
  filtroPeriodo: string;
  setFiltroPeriodo: (value: string) => void;

  // Props do Dialog/Form
  isDialogOpen: boolean;
  setIsDialogOpen: (open: boolean) => void;
  editingAlocacao: Alocacao | null;
  setEditingAlocacao: (alocacao: Alocacao | null) => void;

  formData: FormData;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
  usuarios: User[];
  disciplinas: Disciplina[];
  mostrarTodasDisciplinas: boolean;
  handleProfessorChange: (value: string) => void;
  handleMostrarTodasDisciplinasChange: (checked: boolean) => void;
  turmas: Turma[];
  salas: Sala[];
  horarios: Horario[];
  conflictingHorarios: Map<
    string,
    | "professor"
    | "sala"
    | "turma"
    | "professor_sala"
    | "professor_turma"
    | "sala_turma"
    | "todos"
  >;
  handleHorarioChange: (horarioId: string, checked: boolean) => void;
  getDiaSemanaLabel: (dia: string) => string;
  getDiaSemanaAbrev: (dia: string) => string;
  getHorariosAgrupados: () => Record<string, Horario[]>;
  handleCloseDialog: () => void;
  submitting: boolean;
  handleSubmit: (e: React.FormEvent) => void;
  todasDisciplinas: Disciplina[];
  regime: 'SUPERIOR' | 'TECNICO';
  setRegime: (value: 'SUPERIOR' | 'TECNICO') => void;
}

export const AlocacoesToolbar: React.FC<AlocacoesToolbarProps> = ({
  searchTerm,
  setSearchTerm,
  filtroDataInicio,
  setFiltroDataInicio,
  filtroDataFim,
  setFiltroDataFim,
  filtroDiaSemana,
  setFiltroDiaSemana,
  filtroPeriodo,
  setFiltroPeriodo,
  isDialogOpen,
  setIsDialogOpen,
  editingAlocacao,
  setEditingAlocacao,
  formData,
  setFormData,
  usuarios,
  disciplinas,
  mostrarTodasDisciplinas,
  handleProfessorChange,
  handleMostrarTodasDisciplinasChange,
  turmas,
  salas,
  horarios,
  conflictingHorarios,
  handleHorarioChange,
  getDiaSemanaLabel,
  getDiaSemanaAbrev,
  getHorariosAgrupados,
  handleCloseDialog,
  submitting,
  handleSubmit,
  todasDisciplinas,
  regime,
  setRegime,
}) => {
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Alocações</h1>
          <p className="text-muted-foreground">
            Gerencie as alocações de professores, disciplinas e horários
          </p>
        </div>
        <AlocacaoDialog
          isOpen={isDialogOpen}
          setIsOpen={setIsDialogOpen}
          editingAlocacao={editingAlocacao}
          setEditingAlocacao={setEditingAlocacao}
          formData={formData}
          setFormData={setFormData}
          usuarios={usuarios}
          disciplinas={disciplinas}
          mostrarTodasDisciplinas={mostrarTodasDisciplinas}
          handleProfessorChange={handleProfessorChange}
          handleMostrarTodasDisciplinasChange={handleMostrarTodasDisciplinasChange}
          turmas={turmas}
          salas={salas}
          horarios={horarios}
          conflictingHorarios={conflictingHorarios}
          handleHorarioChange={handleHorarioChange}
          getDiaSemanaLabel={getDiaSemanaLabel}
          getDiaSemanaAbrev={getDiaSemanaAbrev}
          getHorariosAgrupados={getHorariosAgrupados}
          handleCloseDialog={handleCloseDialog}
          submitting={submitting}
          handleSubmit={handleSubmit}
          todasDisciplinas={todasDisciplinas}
          regime={regime}
          setRegime={setRegime}
        />
      </div>

      {/* Filtros rápidos */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="relative">
              <label className="text-sm font-medium text-foreground mb-1 block">
                Filtrar por: Nome/Sala/Horario
              </label>
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4 mt-3" />
              <Input
                placeholder="Buscar alocações..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filtro por data de início */}
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">
                Data Início
              </label>
              <DatePicker
                date={filtroDataInicio}
                onDateChange={setFiltroDataInicio}
                placeholder="Selecione data de início"
              />
            </div>

            {/* Filtro por data de fim */}
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">
                Data Fim
              </label>
              <DatePicker
                date={filtroDataFim}
                onDateChange={setFiltroDataFim}
                placeholder="Selecione data de fim"
              />
            </div>

            {/* Filtro por dia da semana */}
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">
                Dia da Semana
              </label>
              <Select value={filtroDiaSemana} onValueChange={setFiltroDiaSemana}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os dias" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os dias</SelectItem>
                  <SelectItem value="segunda">Segunda-feira</SelectItem>
                  <SelectItem value="terca">Terça-feira</SelectItem>
                  <SelectItem value="quarta">Quarta-feira</SelectItem>
                  <SelectItem value="quinta">Quinta-feira</SelectItem>
                  <SelectItem value="sexta">Sexta-feira</SelectItem>
                  <SelectItem value="sabado">Sábado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Filtro por período */}
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">
                Período
              </label>
              <Select value={filtroPeriodo} onValueChange={setFiltroPeriodo}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os períodos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os períodos</SelectItem>
                  <SelectItem value="M">Manhã</SelectItem>
                  <SelectItem value="T">Tarde</SelectItem>
                  <SelectItem value="N">Noite</SelectItem>
                  <SelectItem value="M1">M1 - Manhã</SelectItem>
                  <SelectItem value="M2">M2 - Manhã</SelectItem>
                  <SelectItem value="M3">M3 - Manhã</SelectItem>
                  <SelectItem value="M4">M4 - Manhã</SelectItem>
                  <SelectItem value="M5">M5 - Manhã</SelectItem>
                  <SelectItem value="M6">M6 - Manhã</SelectItem>
                  <SelectItem value="T1">T1 - Tarde</SelectItem>
                  <SelectItem value="T2">T2 - Tarde</SelectItem>
                  <SelectItem value="T3">T3 - Tarde</SelectItem>
                  <SelectItem value="T4">T4 - Tarde</SelectItem>
                  <SelectItem value="T5">T5 - Tarde</SelectItem>
                  <SelectItem value="T6">T6 - Tarde</SelectItem>
                  <SelectItem value="N1">N1 - Noite</SelectItem>
                  <SelectItem value="N2">N2 - Noite</SelectItem>
                  <SelectItem value="N3">N3 - Noite</SelectItem>
                  <SelectItem value="N4">N4 - Noite</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};