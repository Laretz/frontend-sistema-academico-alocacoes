import React from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { HorariosGrid, ConflictType } from "./HorariosGrid";
import {
  User,
  Disciplina,
  Turma,
  Sala,
  Horario,
  Alocacao,
  GradeHorario,
} from "@/types/entities";

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
  regime: "SUPERIOR" | "TECNICO";
  setRegime: (value: "SUPERIOR" | "TECNICO") => void;
  previewGrade?: GradeHorario | null;
}

export const AlocacaoForm: React.FC<AlocacaoFormProps> = ({
  formData,
  setFormData,
  usuarios,
  disciplinas,
  handleProfessorChange,
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
  regime,
  setRegime,
  previewGrade,
}) => {
  const selectedTurma = turmas.find((t) => t.id === formData.id_turma);
  const selectedDisciplina = disciplinas.find(
    (d) => d.id === formData.id_disciplina,
  );

  // Helper para contar alocações existentes para a disciplina selecionada na turma atual
  const countExistingAllocations = React.useMemo(() => {
    if (!previewGrade || !selectedDisciplina) return 0;

    let count = 0;
    // Itera sobre dias e períodos no previewGrade
    Object.values(previewGrade).forEach((daySlots) => {
      Object.values(daySlots).forEach((allocations) => {
        (allocations || []).forEach((alocacao) => {
          if (alocacao?.disciplina?.id === selectedDisciplina.id) {
            if (editingAlocacao && alocacao.id === editingAlocacao.id) return;
            count++;
          }
        });
      });
    });
    return count;
  }, [previewGrade, selectedDisciplina, editingAlocacao]);

  // Ordenar disciplinas: semestre atual primeiro, depois outros
  const sortedDisciplinas = React.useMemo(() => {
    if (!selectedTurma) return disciplinas;

    return [...disciplinas].sort((a, b) => {
      const aIsCurrent = a.semestre === selectedTurma.semestre;
      const bIsCurrent = b.semestre === selectedTurma.semestre;

      if (aIsCurrent && !bIsCurrent) return -1;
      if (!aIsCurrent && bIsCurrent) return 1;
      return a.nome.localeCompare(b.nome);
    });
  }, [disciplinas, selectedTurma]);

  // Validação de Carga Horária
  const weeklyClasses = selectedDisciplina
    ? Math.ceil(selectedDisciplina.carga_horaria / 15)
    : 0;

  const currentSelectionCount = formData.id_horarios.length;
  const totalAllocated = countExistingAllocations + currentSelectionCount;

  const isWorkloadCorrect = totalAllocated === weeklyClasses;

  const showWorkloadWarning = selectedDisciplina && !isWorkloadCorrect;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 gap-4">
        {/* 1. Turma Selection */}
        <div className="space-y-2">
          <Label htmlFor="id_turma">Turma</Label>
          <Select
            value={formData.id_turma}
            onValueChange={(value) => {
              if (value === formData.id_turma) return;
              setFormData({
                ...formData,
                id_turma: value,
                id_disciplina: "",
                id_user: "",
              });
            }}
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
                            const turma = turmas.find(
                              (t) => t.id === formData.id_turma,
                            );
                            if (!turma) return "Turma não encontrada";
                            const full = `${turma.nome} - ${turma.semestre}º semestre (${turma.turno})`;
                            return full.length > 40
                              ? full.substring(0, 40) + "..."
                              : full;
                          })()}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">
                          Selecione uma turma
                        </span>
                      )}
                    </div>
                  </SelectTrigger>
                </TooltipTrigger>
                {formData.id_turma && (
                  <TooltipContent className="max-w-sm p-3 text-sm bg-gray-900 text-white rounded shadow-lg z-50">
                    <p className="break-words">
                      {(() => {
                        const turma = turmas.find(
                          (t) => t.id === formData.id_turma,
                        );
                        return turma
                          ? `${turma.nome} - ${turma.semestre}º semestre (${turma.turno})`
                          : "";
                      })()}
                    </p>
                  </TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>
            <SelectContent>
              {turmas.map((turma) => {
                const full = `${turma.nome} - ${turma.semestre}º semestre (${turma.turno})`;
                return (
                  <SelectItem key={turma.id} value={turma.id}>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="truncate max-w-[300px] block">
                            {full}
                          </span>
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

        {/* 2. Disciplina Selection */}
        <div className="space-y-2">
          <div className="flex items-center justify-between mb-1">
            <Label htmlFor="id_disciplina" className="font-medium">
              Disciplina
            </Label>
            {/* 'Mostrar todas' toggle removed as requested flow implies specific sorting */}
          </div>
          <div className={`relative`}>
            <Select
              value={formData.id_disciplina}
              onValueChange={(value) => {
                if (value === formData.id_disciplina) return;
                setFormData({ ...formData, id_disciplina: value, id_user: "" });
              }}
              required
              disabled={!formData.id_turma}
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
                                (d) => d.id === formData.id_disciplina,
                              );

                              if (disciplina) {
                                const nome = disciplina.nome;
                                return nome.length > 35
                                  ? nome.substring(0, 35) + "..."
                                  : nome;
                              }

                              // Fallback: Tentar usar o nome da disciplina da alocação em edição
                              if (
                                editingAlocacao &&
                                editingAlocacao.id_disciplina ===
                                  formData.id_disciplina &&
                                editingAlocacao.disciplina
                              ) {
                                const nome = editingAlocacao.disciplina.nome;
                                return nome.length > 35
                                  ? nome.substring(0, 35) + "..."
                                  : nome;
                              }

                              return "Disciplina não encontrada";
                            })()}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">
                            {formData.id_turma
                              ? "Selecione uma disciplina"
                              : "Selecione uma turma primeiro"}
                          </span>
                        )}
                      </div>
                    </SelectTrigger>
                  </TooltipTrigger>
                  {formData.id_disciplina && (
                    <TooltipContent className="max-w-sm p-3 text-sm bg-gray-900 text-white rounded shadow-lg z-50">
                      <p className="break-words">
                        {disciplinas.find(
                          (d) => d.id === formData.id_disciplina,
                        )?.nome || ""}
                      </p>
                    </TooltipContent>
                  )}
                </Tooltip>
              </TooltipProvider>
              <SelectContent>
                {sortedDisciplinas.map((disciplina) => {
                  const isCurrentSemester =
                    selectedTurma &&
                    disciplina.semestre === selectedTurma.semestre;
                  return (
                    <SelectItem
                      key={disciplina.id}
                      value={disciplina.id}
                      className={
                        !isCurrentSemester
                          ? "text-yellow-600 dark:text-yellow-500 bg-yellow-50/50 dark:bg-yellow-900/10"
                          : ""
                      }
                    >
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="truncate max-w-[300px] block">
                              {disciplina.nome}{" "}
                              {!isCurrentSemester && "(Outro semestre)"}
                            </span>
                          </TooltipTrigger>
                          <TooltipContent className="max-w-xs p-2 text-sm bg-gray-900 text-white rounded shadow-lg">
                            <p className="break-words">{disciplina.nome}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* 3. Professor Selection */}
        <div className="space-y-2">
          <Label htmlFor="id_user">Professor</Label>
          <Select
            value={formData.id_user}
            onValueChange={handleProfessorChange}
            required
            disabled={!formData.id_disciplina}
          >
            <SelectTrigger>
              <SelectValue
                placeholder={
                  formData.id_disciplina
                    ? "Selecione um professor"
                    : "Selecione uma disciplina primeiro"
                }
              />
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

        {/* 4. Sala Selection */}
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

      <div className="space-y-2">
        <Label htmlFor="regime">Regime</Label>
        <Select
          value={regime}
          onValueChange={(value) => setRegime(value as "SUPERIOR" | "TECNICO")}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Selecione o regime" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="SUPERIOR">Superior</SelectItem>
            <SelectItem value="TECNICO">Técnico</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <HorariosGrid
        horarios={horarios}
        selectedIds={formData.id_horarios}
        originalHorarioId={editingAlocacao?.id_horario}
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

      {/* Workload Warning */}
      {showWorkloadWarning && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 p-3 rounded-md flex items-start gap-2 text-sm text-yellow-800 dark:text-yellow-200">
          <span className="text-xl">⚠️</span>
          <div>
            <p className="font-semibold">Carga horária divergente</p>
            <p>
              A disciplina exige {weeklyClasses} aulas semanais.
              <br />
              Você está alocando <strong>{totalAllocated}</strong> no total (
              <strong>{countExistingAllocations}</strong> existentes +{" "}
              <strong>{currentSelectionCount}</strong> nesta seleção).
            </p>
          </div>
        </div>
      )}

      <div className="pt-4">
        <div className="sticky bottom-0 bg-background pt-4 border-t flex items-center w-full">
          <div className="flex-1 flex items-center gap-1.5 text-xs pl-4">
            <div className="w-2.5 h-2.5 rounded-sm bg-destructive/20 border border-destructive"></div>
            <span className="text-muted-foreground">Conflito de horário</span>
          </div>

          {/* Botões alinhados à direita */}
          <div className="flex items-center gap-2 justify-end">
            <Button type="button" variant="outline" onClick={handleCloseDialog}>
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
