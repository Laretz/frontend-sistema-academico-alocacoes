"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Calendar, Edit, Trash2, Users } from "lucide-react";
import type { Turma } from "@/types/entities";
import { GradeHorariosTurma } from "@/components/turmas/GradeHorariosTurma";

type TurmaWithCurso = Turma & {
  curso?: { id: string; nome: string; codigo?: string; turno?: string };
};

export function TurmasGrid({
  turmas,
  cursoLabelById,
  onEdit,
  onDelete,
}: {
  turmas: Turma[];
  cursoLabelById: Map<string, string>;
  onEdit: (turma: Turma) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {turmas.map((turma, index) => (
        <Card key={turma.id} className={index % 2 === 0 ? "bg-background" : "bg-muted/30"}>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-lg">{turma.nome}</CardTitle>
                <CardDescription className="mt-1">
                  Turma {turma.semestre}º semestre
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Curso:</span>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="font-medium truncate max-w-[180px]">
                        {(() => {
                          const turmaWithCurso = turma as TurmaWithCurso;
                          return (
                            cursoLabelById.get(turma.id_curso || "") ||
                            turmaWithCurso.curso?.nome ||
                            "—"
                          );
                        })()}
                      </span>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs p-2 text-sm bg-popover text-popover-foreground border rounded shadow-lg">
                      <p className="break-words">
                        {(() => {
                          const turmaWithCurso = turma as TurmaWithCurso;
                          return (
                            cursoLabelById.get(turma.id_curso || "") ||
                            turmaWithCurso.curso?.nome ||
                            "—"
                          );
                        })()}
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Turno:</span>
                <span className="font-medium">{turma.turno}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Semestre:</span>
                <span>{turma.semestre}º</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground flex items-center">
                  <Users className="mr-1 h-3 w-3" />
                  Alunos:
                </span>
                <span className="font-medium text-primary">{turma.num_alunos}</span>
              </div>
            </div>

            <div className="flex justify-end space-x-2 mt-4">
              <GradeHorariosTurma
                turma={turma}
                trigger={
                  <Button variant="outline" size="sm">
                    <Calendar className="h-4 w-4" />
                  </Button>
                }
              />
              <Button variant="outline" size="sm" onClick={() => onEdit(turma)}>
                <Edit className="h-4 w-4 text-shadblue-primary" />
              </Button>
              <Button variant="outline" size="sm" onClick={() => onDelete(turma.id)}>
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
