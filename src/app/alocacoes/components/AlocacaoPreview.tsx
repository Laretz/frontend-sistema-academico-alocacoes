import React from "react";
import { ScrollArea } from "@/components/ui/scroll-area";

import { cn } from "@/lib/utils";
import type { GradeHorario, Horario } from "@/types/entities";

interface AlocacaoPreviewProps {
  grade: GradeHorario | null | undefined; // Estrutura de GradeHorarios
  selectedSlots: string[]; // Lista de IDs de horários
  horarios: Horario[]; // Lista de todos os horários para mapear ID -> Código/Hora
  disciplinaSelecionada?: { id: string; nome: string; codigo?: string };
  professorSelecionado?: { nome: string };
  title?: string;
}

export const AlocacaoPreview: React.FC<AlocacaoPreviewProps> = ({
  grade,
  selectedSlots,
  horarios,
  disciplinaSelecionada,
  professorSelecionado,
  title = "Pré-visualização da Grade",
}) => {
  // Agrupar horários por período (Manhã, Tarde, Noite) para linhas
  // e Dias para colunas
  const days = ["SEGUNDA", "TERCA", "QUARTA", "QUINTA", "SEXTA", "SABADO"];
  const periods = [
    "M1",
    "M2",
    "M3",
    "M4",
    "M5",
    "M6",
    "T1",
    "T2",
    "T3",
    "T4",
    "T5",
    "T6",
    "N1",
    "N2",
    "N3",
    "N4",
  ];

  return (
    <div className="h-full flex flex-col">
      <h3 className="font-semibold text-lg mb-4">{title}</h3>
      <ScrollArea className="flex-1 h-[600px] border rounded-md p-2">
        <div className="grid grid-cols-7 gap-1 min-w-[600px]">
          {/* Header Row */}
          <div className="font-bold text-center text-xs p-1">Horário</div>
          {days.map((d) => (
            <div
              key={d}
              className="font-bold text-center text-xs p-1 bg-muted rounded"
            >
              {d.substring(0, 3)}
            </div>
          ))}

          {/* Linhas da Grade */}
          {periods.map((code) => {
            // Encontra o objeto de horário para este código (assumindo códigos padrão)
            // Precisamos corresponder o código às linhas.
            return (
              <React.Fragment key={code}>
                <div className="text-xs font-medium flex items-center justify-center bg-muted/50 rounded p-1">
                  {code}
                </div>
                {days.map((day) => {
                  // Verifica se está ocupado na grade
                  const rawCell = grade?.[day]?.[code];
                  const cell = rawCell?.[0];

                  // Verifica se foi selecionado no formulário
                  // Precisamos encontrar o ID do horário que corresponde a este dia+código
                  const horarioObj = horarios.find(
                    (h) => h.dia_semana === day && h.codigo === code,
                  );
                  const isSelected =
                    horarioObj && selectedSlots.includes(horarioObj.id);

                  // Verifica se é uma alocação existente DA MESMA DISCIPLINA selecionada
                  const isExistingSameDiscipline =
                    cell &&
                    disciplinaSelecionada &&
                    cell.disciplina?.id === disciplinaSelecionada.id;

                  return (
                    <div
                      key={`${day}-${code}`}
                      className={cn(
                        "border rounded p-1 text-[10px] min-h-[40px] flex flex-col justify-center items-center text-center transition-colors",
                        isSelected
                          ? "bg-blue-100 border-2 border-shadblue-primary dark:bg-blue-900/30"
                          : isExistingSameDiscipline
                            ? "bg-gray-100 border-2 border-shadblue-primary dark:bg-gray-800"
                            : cell
                              ? "bg-gray-100 dark:bg-gray-800 border"
                              : "bg-white dark:bg-background border",
                      )}
                    >
                      {isSelected ? (
                        <div className="truncate w-full">
                          <span className="block font-bold text-blue-600 dark:text-blue-400 truncate">
                            {disciplinaSelecionada?.codigo ||
                              disciplinaSelecionada?.nome?.substring(0, 6) ||
                              "Novo"}
                          </span>
                          <span className="block text-blue-500/80 dark:text-blue-400/80 truncate">
                            {(professorSelecionado?.nome || "").split(" ")[0]}
                          </span>
                        </div>
                      ) : cell ? (
                        <div
                          className="truncate w-full"
                          title={`${cell.disciplina?.nome} - ${cell.user?.nome || ""}`}
                        >
                          <span className="block font-medium truncate">
                            {cell.disciplina?.codigo ||
                              cell.disciplina?.nome?.substring(0, 6)}
                          </span>
                          <span className="block text-muted-foreground truncate">
                            {
                              (
                                cell.user?.nome || ""
                              ).split(" ")[0]
                            }
                          </span>
                        </div>
                      ) : null}
                    </div>
                  );
                })}
              </React.Fragment>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
};
