import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { HorariosGrid, ConflictType } from "./HorariosGrid";
import { User, Disciplina, Turma, Sala, Horario, Alocacao } from "@/types/entities";
import { DatePicker } from "@/components/ui/date-picker";

interface FormData {
  id_user: string;
  id_disciplina: string;
  id_turma: string;
  id_sala: string;
  id_horarios: string[];
}

interface AlocacaoFormProps {
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
  conflictingHorarios: Map<string, ConflictType>;
  editingAlocacao: Alocacao | null;
  handleHorarioChange: (horarioId: string, checked: boolean) => void;
  getDiaSemanaLabel: (dia: string) => string;
  getDiaSemanaAbrev: (dia: string) => string;
  getHorariosAgrupados: () => Record<string, Horario[]>;
  handleCloseDialog: () => void;
  submitting: boolean;
  handleSubmit: (e: React.FormEvent) => void;
  todasDisciplinas: Disciplina[];
}

export const AlocacaoForm: React.FC<AlocacaoFormProps> = ({
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
  editingAlocacao,
  handleHorarioChange,
  getDiaSemanaLabel,
  getDiaSemanaAbrev,
  getHorariosAgrupados,
  handleCloseDialog,
  submitting,
  handleSubmit,
  todasDisciplinas,
}) => {
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="id_user">Professor</Label>
          <Select
            value={formData.id_user}
            onValueChange={handleProfessorChange}
            required
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione um professor" />
            </SelectTrigger>
            <SelectContent>
              {usuarios
                .filter((user) => user.role === "PROFESSOR")
                .map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.nome}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between mb-1">
            <Label htmlFor="id_disciplina" className="font-medium">
              Disciplina
            </Label>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="mostrar-todas-disciplinas"
                checked={mostrarTodasDisciplinas}
                onCheckedChange={handleMostrarTodasDisciplinasChange}
              />
              <Label
                htmlFor="mostrar-todas-disciplinas"
                className="text-sm font-normal cursor-pointer whitespace-nowrap"
              >
                Mostrar todas
              </Label>
              {mostrarTodasDisciplinas && formData.id_disciplina && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span
                        aria-label="Informação"
                        className="text-xs text-muted-foreground cursor-help select-none"
                        title="Se esta disciplina não estiver vinculada ao professor, o vínculo será criado automaticamente."
                      >
                        💡
                      </span>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs p-2 text-sm bg-gray-900 text-white rounded shadow-lg">
                      <p className="break-words">
                        Se esta disciplina não estiver vinculada ao professor, o vínculo será criado automaticamente.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
          </div>
          <div className={`relative`}>
            <Select
              value={formData.id_disciplina}
              onValueChange={(value) =>
                setFormData({ ...formData, id_disciplina: value })
              }
              required
            >
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <SelectTrigger className="w-full">
                      <div className="truncate max-w-[250px]">
                        {formData.id_disciplina ? (
                          <span className="truncate block">
                            {(() => {
                              const disciplina = disciplinas.find(
                                (d) => d.id === formData.id_disciplina
                              );
                              if (!disciplina)
                                return "Disciplina não encontrada";
                              const nome = disciplina.nome;
                              return nome.length > 25
                                ? nome.substring(0, 25) + "..."
                                : nome;
                            })()}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">
                            Selecione uma disciplina
                          </span>
                        )}
                      </div>
                    </SelectTrigger>
                  </TooltipTrigger>
                  {formData.id_disciplina && (
                    <TooltipContent className="max-w-sm p-3 text-sm bg-gray-900 text-white rounded shadow-lg z-50">
                      <p className="break-words">
                        {disciplinas.find(
                          (d) => d.id === formData.id_disciplina
                        )?.nome || ""}
                      </p>
                    </TooltipContent>
                  )}
                </Tooltip>
              </TooltipProvider>
              <SelectContent>
                {disciplinas.map((disciplina) => (
                  <SelectItem key={disciplina.id} value={disciplina.id}>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="truncate max-w-[300px] block">
                            {disciplina.nome}
                          </span>
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs p-2 text-sm bg-gray-900 text-white rounded shadow-lg">
                          <p className="break-words">
                            {disciplina.nome}
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Dica movida para tooltip ao lado do toggle 'Mostrar todas'. Nada a renderizar aqui. */}
          </div>
    </div>
  </div>
  <div className="px-4">
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor="id_turma">Turma</Label>
        <Select
          value={formData.id_turma}
          onValueChange={(value) =>
            setFormData({ ...formData, id_turma: value })
          }
          required
        >
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <SelectTrigger className="w-full">
                  <div className="truncate max-w-[300px]">
                    {formData.id_turma ? (
                      <span className="truncate block">
                        {(() => {
                          const turma = turmas.find((t) => t.id === formData.id_turma);
                          if (!turma) return "Turma não encontrada";
                          const full = `${turma.nome} - ${turma.periodo}º período (${turma.turno})`;
                          return full.length > 30 ? full.substring(0, 30) + "..." : full;
                        })()}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">Selecione uma turma</span>
                    )}
                  </div>
                </SelectTrigger>
              </TooltipTrigger>
              {formData.id_turma && (
                <TooltipContent className="max-w-sm p-3 text-sm bg-gray-900 text-white rounded shadow-lg z-50">
                  <p className="break-words">
                    {(() => {
                      const turma = turmas.find((t) => t.id === formData.id_turma);
                      return turma
                        ? `${turma.nome} - ${turma.periodo}º período (${turma.turno})`
                        : "";
                    })()}
                  </p>
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>
          <SelectContent>
            {turmas.map((turma) => {
              const full = `${turma.nome} - ${turma.periodo}º período (${turma.turno})`;
              return (
                <SelectItem key={turma.id} value={turma.id}>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="truncate max-w-[300px] block">{full}</span>
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs p-2 text-sm bg-gray-900 text-white rounded shadow-lg">
                        <p className="break-words">{full}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="id_sala">Sala</Label>
        <Select
          value={formData.id_sala}
          onValueChange={(value) =>
            setFormData({ ...formData, id_sala: value })
          }
          required
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Selecione uma sala" />
          </SelectTrigger>
          <SelectContent>
            {salas.map((sala) => (
              <SelectItem key={sala.id} value={sala.id}>
                {sala.nome} - {sala.predio.nome} (Cap: {sala.capacidade})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  </div>
      <HorariosGrid
        horarios={horarios}
        selectedIds={formData.id_horarios}
        onToggle={(horarioId: string, checked: boolean) => {
          if (editingAlocacao) {
            setFormData((prev) => ({
              ...prev,
              id_horarios: checked ? [horarioId] : [],
            }));
          } else {
            handleHorarioChange(horarioId, checked);
          }
        }}
        editingAlocacao={!!editingAlocacao}
        conflictingHorarios={conflictingHorarios}
        getDiaSemanaLabel={getDiaSemanaLabel}
        getDiaSemanaAbrev={getDiaSemanaAbrev}
        getHorariosAgrupados={getHorariosAgrupados}
      />
      <div className="pt-4">
        <div className="sticky bottom-0 bg-background pt-4 border-t flex items-center w-full">
          <div className="flex-1 flex items-center gap-1.5 text-xs pl-4">
            <div className="w-2.5 h-2.5 rounded-sm bg-destructive/20 border border-destructive"></div>
            <span className="text-muted-foreground">
              Conflito de horário
            </span>
          </div>

          {/* Botões alinhados à direita */}
          <div className="flex items-center gap-2 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={handleCloseDialog}
            >
              Cancelar
            </Button>

            <Button
              type="submit"
              disabled={submitting || formData.id_horarios.length === 0}
            >
              {submitting
                ? "Salvando..."
                : editingAlocacao
                ? "Atualizar Alocação"
                : "Criar Alocação"}
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
};
