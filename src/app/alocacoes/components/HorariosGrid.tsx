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
  onToggle,
  editingAlocacao,
  conflictingHorarios,
  getDiaSemanaLabel,
  getDiaSemanaAbrev,
  getHorariosAgrupados,
}) => {
  const getConflictStyles = (isConflicting: boolean) => {
    if (!isConflicting) return "cursor-pointer hover:bg-muted/50";
    return "bg-destructive/10 text-destructive border-destructive/20 hover:bg-destructive/20";
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
        Horários {editingAlocacao ? "(selecione apenas um)" : "(selecione um ou mais)"}
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
                const conflictType = conflictingHorarios.get(horario.id);
                const isConflicting = !!conflictType;
                const isDisabled =
                  isConflicting &&
                  (conflictType === "turma" ||
                    conflictType === "professor_turma" ||
                    conflictType === "sala_turma" ||
                    conflictType === "todos" ||
                    !isSelected);

                return (
                  <label
                    key={horario.id}
                    className={`flex items-center space-x-3 p-2 rounded-md transition-colors ${getConflictStyles(isConflicting)} ${
                      isDisabled ? "cursor-not-allowed opacity-60" : ""
                    }`}
                  >
                    <input
                      type={editingAlocacao ? "radio" : "checkbox"}
                      name={editingAlocacao ? "horario" : undefined}
                      checked={isSelected}
                      disabled={isDisabled}
                      onChange={(e) => onToggle(horario.id, e.target.checked)}
                      className={`rounded ${isDisabled ? "cursor-not-allowed" : ""}`}
                    />
                    <span className={`text-sm font-medium ${isDisabled ? getConflictTextColor(isConflicting) : ""}`}>
                      {horario.codigo}
                      {isConflicting && (
                        <span className={`ml-1 text-xs ${getConflictTextColor(isConflicting)}`}>
                          {getConflictLabel(conflictType)}
                        </span>
                      )}
                    </span>
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
