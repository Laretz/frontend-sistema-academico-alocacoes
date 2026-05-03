"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type {
  GradeHorariosProfessorAlocacaoVM,
  GradeHorariosProfessorPropsVM,
} from "@/types/view-models/grade-horarios-professor";
import { useGradeHorariosProfessor } from "@/hooks/useGradeHorariosProfessor";

function formatSalaField(
  value: string | { nome: string } | null | undefined,
): string {
  if (value && typeof value === "object") {
    const nome = "nome" in value ? (value as { nome?: unknown }).nome : undefined;
    return typeof nome === "string" ? nome : "";
  }
  return value ? String(value) : "";
}

function formatarDisciplina(alocacao: GradeHorariosProfessorAlocacaoVM) {
  const codigo = alocacao.disciplina.codigo || "";
  const nome = alocacao.disciplina.nome;
  return codigo ? `${codigo}` : nome;
}

export function GradeHorariosProfessor({
  professorId,
  isOpen,
  onClose,
}: GradeHorariosProfessorPropsVM) {
  const state = useGradeHorariosProfessor({ professorId, isOpen });

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent
        className="!max-w-[80vw] w-[98vw] max-h-[95vh] overflow-y-auto"
        showCloseButton={true}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Professor: {state.professor?.nome}</span>
          </DialogTitle>
        </DialogHeader>

        {state.loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">Carregando grade...</span>
          </div>
        ) : (
          <Tabs defaultValue="grade" className="space-y-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="grade">Grade</TabsTrigger>
              <TabsTrigger value="vinculos">Vínculos</TabsTrigger>
              <TabsTrigger value="resumo">Resumo</TabsTrigger>
            </TabsList>

            <TabsContent value="grade">
              <Card>
                <CardHeader className="flex items-center justify-between">
                  <CardTitle className="text-lg">Grade de Horários</CardTitle>
                  <Badge variant="outline" className="ml-2">
                    Alocações: {state.cargaHoraria}
                  </Badge>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse border border-border text-sm">
                      <thead>
                        <tr className="bg-muted/30">
                          <th className="border border-border p-3 text-left font-semibold">
                            Horário
                          </th>
                          {state.dias.map((dia) => (
                            <th
                              key={dia.key}
                              className="border border-border p-3 text-center font-semibold"
                            >
                              {dia.label}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {state.codigos.map((codigo) => (
                          <tr key={codigo} className="hover:bg-muted/50">
                            <td className="border border-border p-3 font-medium bg-primary/10">
                              <div className="text-center">
                                <div className="font-bold text-primary text-sm">
                                  {codigo}
                                </div>
                              </div>
                            </td>
                            {state.dias.map((dia) => {
                              const alocacao = state.getAlocacao(dia.key, codigo);
                              return (
                                <td
                                  key={`${dia.key}-${codigo}`}
                                  className="border border-border p-3 min-w-[150px]"
                                >
                                  {alocacao ? (
                                    <div className="bg-primary/10 p-2 rounded-md border-l-4 border-primary">
                                      <div className="font-semibold text-primary mb-1">
                                        {formatarDisciplina(alocacao)}
                                      </div>
                                      <div className="text-primary text-xs mb-1 font-medium">
                                        <span className="inline-block w-2 h-2 bg-primary rounded-full mr-1"></span>
                                        {String(alocacao.turma.nome || "")}
                                      </div>
                                      <div className="text-primary/80 text-xs mb-1">
                                        <span className="inline-block w-2 h-2 bg-secondary-foreground rounded-full mr-1"></span>
                                        Professor
                                      </div>
                                      <div className="text-primary/70 text-xs">
                                        <span className="inline-block w-2 h-2 bg-orange-500 rounded-full mr-1"></span>
                                        Sala{" "}
                                        {formatSalaField(alocacao.sala.numero)}
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="text-muted-foreground text-center py-4">
                                      <span className="text-xs">Livre</span>
                                    </div>
                                  )}
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-4 text-xs">
                    <div className="flex items-center gap-1">
                      <span className="inline-block w-2 h-2 bg-primary rounded-full"></span>
                      <span>Disciplina</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="inline-block w-2 h-2 bg-secondary-foreground rounded-full"></span>
                      <span>Professor</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="inline-block w-2 h-2 bg-orange-500 rounded-full"></span>
                      <span>Sala</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="inline-block w-3 h-3 bg-primary/10 border border-primary/30 rounded"></span>
                      <span>Aula agendada</span>
                    </div>
                  </div>

                  {state.professor?.especializacao && (
                    <div className="mt-4 text-sm text-gray-600">
                      <strong>Especialização:</strong>{" "}
                      {typeof state.professor.especializacao === "string"
                        ? state.professor.especializacao
                        : state.professor.especializacao?.nome || "Não informado"}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="text-lg">Disciplinas do Professor</CardTitle>
                  <div className="text-sm text-muted-foreground">
                    Detalhes completos das disciplinas ministradas por este professor
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full border border-border">
                      <thead className="bg-muted/30">
                        <tr>
                          <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground uppercase border-r border-border">
                            Código
                          </th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground uppercase border-r border-border">
                            Disciplina
                          </th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground uppercase border-r border-border">
                            CH
                          </th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground uppercase border-r border-border">
                            Horário
                          </th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground uppercase border-r border-border">
                            Turma
                          </th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground uppercase border-r border-border">
                            Local
                          </th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground uppercase">
                            Alunos
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-background divide-y divide-border">
                        {state.alocacoes
                          .reduce<GradeHorariosProfessorAlocacaoVM[]>((unique, alocacao) => {
                            const exists = unique.find(
                              (item) => item.disciplina.id === alocacao.disciplina.id,
                            );
                            if (!exists) {
                              unique.push(alocacao);
                            }
                            return unique;
                          }, [])
                          .map((alocacao, index) => {
                            let horarioConsolidado =
                              alocacao.disciplina.horario_consolidado || "";

                            if (!horarioConsolidado) {
                              const horariosAlocacao: string[] = [];
                              state.alocacoes.forEach((a) => {
                                if (a.disciplina.codigo === alocacao.disciplina.codigo) {
                                  horariosAlocacao.push(a.horario.codigo);
                                }
                              });
                              horarioConsolidado =
                                horariosAlocacao.length > 0
                                  ? [...new Set(horariosAlocacao)].join(", ")
                                  : "-";
                            }

                            return (
                              <tr
                                key={alocacao.disciplina.id}
                                className={index % 2 === 0 ? "bg-background" : "bg-muted/30"}
                              >
                                <td className="px-3 py-2 text-sm font-medium text-foreground border-r border-border">
                                  {String(alocacao.disciplina.codigo || "---")}
                                </td>
                                <td className="px-3 py-2 text-sm text-foreground border-r border-border max-w-xs">
                                  {String(alocacao.disciplina.nome || "")}
                                </td>
                                <td className="px-3 py-2 text-sm text-foreground border-r border-border">
                                  {String(alocacao.disciplina.carga_horaria || 0)}h
                                </td>
                                <td className="px-3 py-2 text-sm text-foreground font-mono border-r border-border">
                                  {String(horarioConsolidado || "")}
                                </td>
                                <td className="px-3 py-2 text-sm text-foreground border-r border-border">
                                  {String(alocacao.turma.nome || "")}
                                </td>
                                <td className="px-3 py-2 text-sm text-foreground border-r border-border">
                                  {typeof alocacao.sala.predio === "object"
                                    ? alocacao.sala.predio?.nome || ""
                                    : String(alocacao.sala.predio || "")}
                                  ,{" "}
                                  {typeof alocacao.sala.nome === "object"
                                    ? alocacao.sala.nome?.nome || ""
                                    : String(alocacao.sala.nome || "")}
                                </td>
                                <td className="px-3 py-2 text-sm text-foreground">
                                  {String(alocacao.turma.num_alunos || 0)}
                                </td>
                              </tr>
                            );
                          })}
                      </tbody>
                    </table>
                    {state.alocacoes.length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        Nenhuma disciplina encontrada para este professor.
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="vinculos">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Disciplinas do Professor</CardTitle>
                    <div className="text-sm text-muted-foreground">
                      Total: {state.disciplinas.length}
                    </div>
                  </CardHeader>
                  <CardContent>
                    {state.disciplinas.length > 0 ? (
                      <ul className="space-y-2">
                        {state.disciplinas.map((disc) => (
                          <li key={disc.id} className="flex items-center justify-between">
                            <div>
                              <span className="font-medium">
                                {disc.codigo ?? "---"} - {disc.nome}
                              </span>
                              <span className="ml-2 text-xs text-muted-foreground">
                                ({disc.curso.codigo} - {disc.curso.nome})
                              </span>
                            </div>
                            <Badge variant="outline" className="text-xs">
                              Sem {disc.semestre}
                            </Badge>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="text-muted-foreground">Nenhuma disciplina vinculada.</div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Cursos do Professor</CardTitle>
                    <div className="text-sm text-muted-foreground">
                      Total: {state.cursos.length}
                    </div>
                  </CardHeader>
                  <CardContent>
                    {state.cursos.length > 0 ? (
                      <ul className="space-y-2">
                        {state.cursos.map((curso) => (
                          <li key={curso.id} className="flex items-center justify-between">
                            <span className="font-medium">
                              {curso.codigo} - {curso.nome}
                            </span>
                            <Badge variant="outline" className="text-xs">
                              {curso.turno}
                            </Badge>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="text-muted-foreground">Nenhum curso vinculado.</div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="resumo">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Informações do Professor</CardTitle>
                  <div className="text-sm text-muted-foreground">Resumo geral</div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm">
                        <span className="font-semibold">Nome:</span> {state.professor?.nome}
                      </div>
                      <div className="text-sm">
                        <span className="font-semibold">Email:</span> {state.professor?.email}
                      </div>
                      <div className="text-sm">
                        <span className="font-semibold">Role:</span> {state.professor?.role ?? "-"}
                      </div>
                      {state.professor?.especializacao && (
                        <div className="text-sm">
                          <span className="font-semibold">Especialização:</span>{" "}
                          {typeof state.professor.especializacao === "string"
                            ? state.professor.especializacao
                            : state.professor.especializacao?.nome || "Não informado"}
                        </div>
                      )}
                      <div className="text-sm">
                        <span className="font-semibold">Carga horária máx:</span>{" "}
                        {typeof state.professor?.carga_horaria_max === "number"
                          ? `${state.professor?.carga_horaria_max}h`
                          : "-"}
                      </div>
                      <div className="text-sm">
                        <span className="font-semibold">Preferência:</span>{" "}
                        {state.professor?.preferencia ?? "-"}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm">
                        <span className="font-semibold">Alocações:</span> {state.cargaHoraria}
                      </div>
                      <div className="text-sm">
                        <span className="font-semibold">Disciplinas vinculadas:</span>{" "}
                        {state.disciplinas.length}
                      </div>
                      <div className="text-sm">
                        <span className="font-semibold">Cursos vinculados:</span>{" "}
                        {state.cursos.length}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  );
}
