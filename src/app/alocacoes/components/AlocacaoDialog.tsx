"use client";
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { AlocacaoForm } from "@/app/alocacoes/components/AlocacaoForm";
import { User, Disciplina, Turma, Sala, Horario, Alocacao } from "@/types/entities";

interface FormData {
  id_user: string;
  id_disciplina: string;
  id_turma: string;
  id_sala: string;
  id_horarios: string[];
}

export interface AlocacaoDialogProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
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

export const AlocacaoDialog: React.FC<AlocacaoDialogProps> = ({
  isOpen,
  setIsOpen,
  editingAlocacao,
  setEditingAlocacao,
  ...formProps
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button onClick={() => setEditingAlocacao(null)}>
          <Plus className="h-4 w-4 mr-2" />
          Nova Alocação
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editingAlocacao ? "Editar Alocação" : "Nova Alocação"}
          </DialogTitle>
          <DialogDescription>
            {editingAlocacao
              ? "Edite as informações da alocação"
              : "Preencha as informações para criar uma nova alocação"}
          </DialogDescription>
        </DialogHeader>
        <AlocacaoForm editingAlocacao={editingAlocacao} {...formProps} />
      </DialogContent>
    </Dialog>
  );
};