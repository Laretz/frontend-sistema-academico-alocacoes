"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Edit, Trash2 } from "lucide-react";
import type { Disciplina } from "@/types/entities";

export function DisciplinasTableBySemestre({
  semestresOrdenados,
  disciplinasPorSemestre,
  onEdit,
  onDelete,
}: {
  semestresOrdenados: number[];
  disciplinasPorSemestre: Record<number, Disciplina[]>;
  onEdit: (disciplina: Disciplina) => void;
  onDelete: (id: string) => void;
}) {
  if (semestresOrdenados.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Nenhuma disciplina encontrada.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {semestresOrdenados.map((semestre) => (
        <div key={semestre} className="space-y-4">
          <div className="flex items-center space-x-2">
            <h2 className="text-2xl font-bold">{semestre}º Semestre</h2>
            <Badge variant="secondary" className="text-sm">
              {disciplinasPorSemestre[semestre]?.length || 0} disciplina
              {(disciplinasPorSemestre[semestre]?.length || 0) !== 1 ? "s" : ""}
            </Badge>
          </div>
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Código</TableHead>
                    <TableHead>Curso</TableHead>
                    <TableHead>Carga Horária</TableHead>
                    <TableHead>Tipo de Sala</TableHead>
                    <TableHead>Obrigatória</TableHead>
                    <TableHead>Período</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {disciplinasPorSemestre[semestre]?.map((disciplina) => (
                    <TableRow key={disciplina.id}>
                      <TableCell className="font-medium">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="truncate max-w-[200px] block">
                                {disciplina.nome}
                              </span>
                            </TooltipTrigger>
                            <TooltipContent className="max-w-xs p-2 text-sm bg-popover text-popover-foreground border rounded shadow-lg">
                              <p className="break-words">{disciplina.nome}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{disciplina.codigo || "N/A"}</Badge>
                      </TableCell>
                      <TableCell>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="truncate max-w-[150px] block">
                                {disciplina.curso?.nome || "N/A"}
                              </span>
                            </TooltipTrigger>
                            <TooltipContent className="max-w-xs p-2 text-sm bg-popover text-popover-foreground border rounded shadow-lg">
                              <p className="break-words">
                                {disciplina.curso?.nome || "N/A"}
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </TableCell>
                      <TableCell>
                        {disciplina.carga_horaria === 30
                          ? "30h (36 aulas)"
                          : disciplina.carga_horaria === 45
                            ? "45h (54 aulas)"
                            : disciplina.carga_horaria === 60
                              ? "60h (72 aulas)"
                              : "90h (108 aulas)"}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            disciplina.tipo_de_sala === "Lab" ? "default" : "secondary"
                          }
                        >
                          {disciplina.tipo_de_sala}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={disciplina.obrigatoria ? "default" : "outline"}
                        >
                          {disciplina.obrigatoria ? "Sim" : "Não"}
                        </Badge>
                      </TableCell>
                      <TableCell>{disciplina.periodo_letivo || "-"}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            title="Editar disciplina"
                            onClick={() => onEdit(disciplina)}
                          >
                            <Edit className="h-4 w-4 text-shadblue-primary" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            title="Excluir disciplina"
                            onClick={() => onDelete(disciplina.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      ))}
    </div>
  );
}

