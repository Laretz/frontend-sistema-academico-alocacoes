import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import React from "react";
import { Horario } from "@/types/entities";

export type ConflictType =
  | "professor"
  | "sala"
  | "turma"
  | "professor_sala"
  | "professor_turma"
  | "sala_turma"
  | "todos";

interface HorariosGridProps {
  horarios: Horario[];
  selectedIds: string[];
  originalHorarioId?: string;
  onToggle: (horarioId: string, checked: boolean) => void;
  editingAlocacao: boolean;
  conflictingHorarios: Map<string, ConflictType>;
  getDiaSemanaLabel: (dia: string) => string;
  getDiaSemanaAbrev: (dia: string) => string;
  getHorariosAgrupados: () => Record<string, Horario[]>;
}

export const HorariosGrid: React.FC<HorariosGridProps> = ({
  horarios,
  selectedIds,
  originalHorarioId,
  onToggle,
  editingAlocacao,
  conflictingHorarios,
  getDiaSemanaLabel,
  getDiaSemanaAbrev,
  getHorariosAgrupados,
}) => {
  const getConflictStyles = (
    isConflicting: boolean,
    isOriginal: boolean,
    isSelected: boolean,
  ) => {
    if (isOriginal) {
      if (isSelected)
        return "bg-primary/10 border-primary border-2 text-primary font-bold";
      return "bg-muted/30 border-dashed border-2 border-muted-foreground/50 opacity-70";
    }

    if (isSelected) {
      return "bg-primary/20 border-primary/50 border text-primary";
    }

    if (!isConflicting)
      return "cursor-pointer hover:bg-muted/50 border border-transparent";
    return "bg-destructive/10 text-destructive border-destructive/20 hover:bg-destructive/20 border";
  };

  const getConflictTextColor = (isConflicting: boolean) => {
    if (!isConflicting) return "";
    return "text-destructive";
  };

  const getConflictLabel = (conflictType?: ConflictType) => {
    switch (conflictType) {
      case "professor":
        return "(Prof. ocupado)";
      case "sala":
        return "(Sala ocupada)";
      case "turma":
        return "(Turma ocupada)";
      case "professor_sala":
        return "(Prof. e Sala)";
      case "professor_turma":
        return "(Prof. e Turma)";
      case "sala_turma":
        return "(Sala e Turma)";
      case "todos":
        return "(Sala Turma e Prof)";
      default:
        return "";
    }
  };

  return (
    <div className="space-y-3">
      <Label>
        Horários{" "}
        {editingAlocacao ? "(selecione apenas um)" : "(selecione um ou mais)"}
      </Label>
      <div className="max-h-64 overflow-y-auto border rounded-lg p-4 bg-muted/20">
        {Object.entries(getHorariosAgrupados()).map(([dia, horariosGrupo]) => (
          <div key={dia} className="mb-4 last:mb-0">
            <div className="flex items-center gap-2 mb-3 pb-2 border-b border-border/50">
              <Badge variant="outline" className="font-medium">
                {getDiaSemanaAbrev(dia)}
              </Badge>
              <span className="text-sm text-muted-foreground font-medium">
                {getDiaSemanaLabel(dia)}
              </span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 pl-2">
              {horariosGrupo.map((horario) => {
                const isSelected = selectedIds.includes(horario.id);
                const isOriginal = originalHorarioId === horario.id;
                const conflictType = conflictingHorarios.get(horario.id);
                const isConflicting = !!conflictType;
                const isDisabled =
                  isConflicting &&
                  (conflictType === "turma" ||
                    conflictType === "professor_turma" ||
                    conflictType === "sala_turma" ||
                    conflictType === "todos" ||
                    !isSelected) &&
                  !isOriginal; // Permitir selecionar o original mesmo com conflito (já estava alocado)

                return (
                  <label
                    key={horario.id}
                    className={`flex items-center space-x-2 p-2 rounded-md transition-colors border ${getConflictStyles(
                      isConflicting,
                      isOriginal,
                      isSelected,
                    )} ${isDisabled ? "cursor-not-allowed opacity-60" : ""}`}
                  >
                    <input
                      type={editingAlocacao ? "radio" : "checkbox"}
                      name={editingAlocacao ? "horario" : undefined}
                      checked={isSelected}
                      disabled={isDisabled}
                      onChange={(e) => onToggle(horario.id, e.target.checked)}
                      className={`rounded ${isDisabled ? "cursor-not-allowed" : ""}`}
                    />
                    <div className="flex flex-col flex-1">
                      <span
                        className={`text-sm font-medium flex items-center gap-1 ${
                          isDisabled ? "text-muted-foreground" : ""
                        }`}
                      >
                        {horario.codigo}
                        {isOriginal && (
                          <Badge
                            variant="secondary"
                            className="text-[10px] h-4 px-1 ml-auto"
                          >
                            Atual
                          </Badge>
                        )}
                        {!isOriginal && isSelected && editingAlocacao && (
                          <Badge className="text-[10px] h-4 px-1 ml-auto bg-green-500 hover:bg-green-600">
                            Novo
                          </Badge>
                        )}
                      </span>
                      {isConflicting && (
                        <span className="text-[10px] text-destructive leading-tight">
                          {getConflictLabel(conflictType)}
                        </span>
                      )}
                    </div>
                  </label>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
