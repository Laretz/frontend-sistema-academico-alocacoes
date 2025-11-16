"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface GradeHorariosProfessorProps {
  professorId: string;
  isOpen: boolean;
  onClose: () => void;
}

interface AlocacaoData {
  id: string;
  disciplina: {
    id: string;
    nome: string;
    codigo?: string;
    carga_horaria: number;
    horario_consolidado?: string;
  };
  turma: {
    id: string;
    nome: string;
    num_alunos: number;
  };
  horario: {
    codigo: string;
    dia_semana: string;
    horario_inicio: string;
    horario_fim: string;
  };
  sala: {
    id: string;
    nome: string | { nome: string };
    numero: string | { nome: string };
    predio: string | { nome: string };
    capacidade: number;
  };
}

interface ProfessorData {
  id: string;
  nome: string;
  email: string;
  role?: string;
  carga_horaria_max?: number | null;
  preferencia?: string | null;
  especializacao?:
    | string
    | {
        id: string;
        codigo: string;
        nome: string;
        descricao: string;
        created_at: string;
        updated_at: string;
      };
}

interface CursoVinculado {
  id: string;
  codigo: string;
  nome: string;
  turno: string;
  duracao_semestres: number;
  vinculo: { id: string; ativo: boolean; created_at: string };
}

interface DisciplinaVinculada {
  id: string;
  nome: string;
  codigo: string | null;
  carga_horaria: number;
  total_aulas: number;
  tipo_de_sala: "Sala" | "Lab";
  semestre: number;
  obrigatoria: boolean;
  curso: { id: string; nome: string; codigo: string };
  vinculo: { id: string; ativo: boolean; created_at: string };
}

const diasSemana = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta"];
const horarios = [
  { codigo: "M1", periodo: "Manhã", inicio: "07:00", fim: "07:50" },
  { codigo: "M2", periodo: "Manhã", inicio: "07:50", fim: "08:40" },
  { codigo: "M3", periodo: "Manhã", inicio: "08:40", fim: "09:30" },
  { codigo: "M4", periodo: "Manhã", inicio: "09:50", fim: "10:40" },
  { codigo: "M5", periodo: "Manhã", inicio: "10:40", fim: "11:30" },
  { codigo: "M6", periodo: "Manhã", inicio: "11:30", fim: "12:20" },
  { codigo: "T1", periodo: "Tarde", inicio: "13:00", fim: "13:50" },
  { codigo: "T2", periodo: "Tarde", inicio: "13:50", fim: "14:40" },
  { codigo: "T3", periodo: "Tarde", inicio: "14:40", fim: "15:30" },
  { codigo: "T4", periodo: "Tarde", inicio: "15:50", fim: "16:40" },
  { codigo: "T5", periodo: "Tarde", inicio: "16:40", fim: "17:30" },
  { codigo: "T6", periodo: "Tarde", inicio: "17:30", fim: "18:20" },
];

export function GradeHorariosProfessor({
  professorId,
  isOpen,
  onClose,
}: GradeHorariosProfessorProps) {
  const [professor, setProfessor] = useState<ProfessorData | null>(null);
  const [alocacoes, setAlocacoes] = useState<AlocacaoData[]>([]);
  const [loading, setLoading] = useState(true);
  const [cargaHoraria, setCargaHoraria] = useState(0);
  const [cursos, setCursos] = useState<CursoVinculado[]>([]);
  const [disciplinas, setDisciplinas] = useState<DisciplinaVinculada[]>([]);

  useEffect(() => {
    if (isOpen && professorId) {
      loadProfessorData();
      loadAlocacoes();
      loadCursos();
      loadDisciplinas();
    }
  }, [isOpen, professorId]);

  const loadProfessorData = async () => {
    try {
      // Usar axios API com Authorization automático
      const response = await api.get(`/users/${professorId}`);
      const data = response.data;
      const usuario = data?.usuario ?? data?.user;
      console.log("[GradeHorariosProfessor] GET /users/:id resposta:", data);
      console.log("[GradeHorariosProfessor] Usuario resolvido:", usuario);
      setProfessor(usuario);
    } catch (error) {
      console.error("Erro ao carregar dados do professor:", error);
      toast.error("Erro ao carregar dados do professor");
    }
  };

  const loadAlocacoes = async () => {
    try {
      setLoading(true);
      // Usar axios API com Authorization automático
      const response = await api.get(`/alocacoes/professor/${professorId}`);
      const data = response.data;
      const alocacoesData = data.alocacoes || [];
      setAlocacoes(alocacoesData);
      setCargaHoraria(alocacoesData.length);
    } catch (error) {
      console.error("Erro ao carregar alocações:", error);
      toast.error("Erro ao carregar grade de horários");
    } finally {
      setLoading(false);
    }
  };

  const loadCursos = async () => {
    try {
      const response = await api.get(`/user-curso/cursos/${professorId}`);
      setCursos(response.data?.cursos || []);
    } catch (error) {
      console.error("Erro ao carregar cursos do professor:", error);
      toast.error("Erro ao carregar cursos do professor");
    }
  };

  const loadDisciplinas = async () => {
    try {
      const response = await api.get(`/professores/${professorId}/disciplinas`);
      setDisciplinas(response.data?.disciplinas || []);
    } catch (error) {
      console.error("Erro ao carregar disciplinas do professor:", error);
      toast.error("Erro ao carregar disciplinas do professor");
    }
  };

  const getAlocacaoParaHorario = (diaSemana: string, codigoHorario: string) => {
    // Mapear nomes dos dias para números ou formato usado no backend
    const diasMap: { [key: string]: string[] } = {
      Segunda: ["segunda", "segunda-feira", "1", "seg"],
      Terça: ["terça", "terca", "terça-feira", "terca-feira", "2", "ter"],
      Quarta: ["quarta", "quarta-feira", "3", "qua"],
      Quinta: ["quinta", "quinta-feira", "4", "qui"],
      Sexta: ["sexta", "sexta-feira", "5", "sex"],
    };

    const possiveisDias = diasMap[diaSemana] || [diaSemana.toLowerCase()];

    return alocacoes.find((alocacao) => {
      const diaAlocacao = alocacao.horario.dia_semana.toLowerCase();
      return (
        possiveisDias.some((dia) => diaAlocacao.includes(dia)) &&
        alocacao.horario.codigo === codigoHorario
      );
    });
  };

  const formatarDisciplina = (alocacao: AlocacaoData) => {
    const codigo = alocacao.disciplina.codigo || "";
    const nome = alocacao.disciplina.nome;
    return codigo ? `${codigo}` : nome;
  };

  const getPeriodoHorario = (codigo: string) => {
    const periodos: { [key: string]: string } = {
      M1: "Matutino",
      M2: "Matutino",
      M3: "Matutino",
      M4: "Matutino",
      M5: "Matutino",
      M6: "Matutino",
      T1: "Vespertino",
      T2: "Vespertino",
      T3: "Vespertino",
      T4: "Vespertino",
      T5: "Vespertino",
      T6: "Vespertino",
      N1: "Noturno",
      N2: "Noturno",
      N3: "Noturno",
      N4: "Noturno",
    };
    return periodos[codigo] || "Indefinido";
  };

  const getAlocacaoColor = (alocacao: any, horario: string) => {
    if (!alocacao) return "";

    const periodo = getPeriodoHorario(horario);

    switch (periodo) {
      case "Matutino":
        return "border-blue-200 bg-blue-50 text-blue-900 hover:bg-blue-100";
      case "Vespertino":
        return "border-orange-200 bg-orange-50 text-orange-900 hover:bg-orange-100";
      case "Noturno":
        return "border-purple-200 bg-purple-50 text-purple-900 hover:bg-purple-100";
      default:
        return "border-gray-200 bg-gray-50 text-gray-900 hover:bg-gray-100";
    }
  };

  const formatSalaField = (value: string | { nome: string } | null | undefined): string => {
    if (value && typeof value === "object") {
      const nome = (value as any)?.nome;
      return typeof nome === "string" ? nome : "";
    }
    return value ? String(value) : "";
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="!max-w-[80vw] w-[98vw] max-h-[95vh] overflow-y-auto"
        showCloseButton={true}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Professor: {professor?.nome}</span>
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">Carregando grade...</span>
          </div>
        ) : (
          <>
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
                    <Badge variant="outline" className="ml-2">Alocações: {cargaHoraria}</Badge>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse border border-border text-sm">
                        <thead>
                          <tr className="bg-muted/30">
                            <th className="border border-border p-3 text-left font-semibold">
                              Horário
                            </th>
                            {diasSemana.map((dia) => (
                              <th
                                key={dia}
                                className="border border-border p-3 text-center font-semibold"
                              >
                                {dia}-feira
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {horarios.map((horario) => (
                            <tr key={horario.codigo} className="hover:bg-muted/50">
                              <td className="border border-border p-3 font-medium bg-primary/10">
                                <div className="text-center">
                                  <div className="font-bold text-primary text-sm">
                                    {horario.codigo}
                                  </div>
                                  <div className="text-primary/80 text-xs">
                                    {horario.inicio} - {horario.fim}
                                  </div>
                                </div>
                              </td>
                              {diasSemana.map((dia) => {
                                const alocacao = getAlocacaoParaHorario(
                                  dia,
                                  horario.codigo
                                );
                                return (
                                  <td
                                    key={`${dia}-${horario.codigo}`}
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

                    {/* Legenda */}
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

                    {professor?.especializacao && (
                      <div className="mt-4 text-sm text-gray-600">
                        <strong>Especialização:</strong>{" "}
                        {typeof professor.especializacao === "string"
                          ? professor.especializacao
                          : professor.especializacao?.nome || "Não informado"}
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
                          {alocacoes
                            .reduce((unique, alocacao) => {
                              const exists = unique.find(
                                (item) => item.disciplina.id === alocacao.disciplina.id
                              );
                              if (!exists) {
                                unique.push(alocacao);
                              }
                              return unique;
                            }, [] as AlocacaoData[])
                            .map((alocacao, index) => {
                              // Consolidar horários da disciplina
                              let horarioConsolidado =
                                alocacao.disciplina.horario_consolidado || "";

                              if (!horarioConsolidado) {
                                const horariosAlocacao: string[] = [];
                                alocacoes.forEach((a) => {
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
                                      : String(alocacao.sala.predio || "")}, {typeof alocacao.sala.nome === "object"
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
                      {alocacoes.length === 0 && (
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
                  {/* Disciplinas primeiro (esquerda) */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Disciplinas do Professor</CardTitle>
                      <div className="text-sm text-muted-foreground">Total: {disciplinas.length}</div>
                    </CardHeader>
                    <CardContent>
                      {disciplinas.length > 0 ? (
                        <ul className="space-y-2">
                          {disciplinas.map((disc) => (
                            <li key={disc.id} className="flex items-center justify-between">
                              <div>
                                <span className="font-medium">
                                  {disc.codigo ?? "---"} - {disc.nome}
                                </span>
                                <span className="ml-2 text-xs text-muted-foreground">
                                  ({disc.curso.codigo} - {disc.curso.nome})
                                </span>
                              </div>
                              <Badge variant="outline" className="text-xs">Sem {disc.semestre}</Badge>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <div className="text-muted-foreground">Nenhuma disciplina vinculada.</div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Cursos ao lado direito */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Cursos do Professor</CardTitle>
                      <div className="text-sm text-muted-foreground">Total: {cursos.length}</div>
                    </CardHeader>
                    <CardContent>
                      {cursos.length > 0 ? (
                        <ul className="space-y-2">
                          {cursos.map((curso) => (
                            <li key={curso.id} className="flex items-center justify-between">
                              <span className="font-medium">
                                {curso.codigo} - {curso.nome}
                              </span>
                              <Badge variant="outline" className="text-xs">{curso.turno}</Badge>
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
                        <div className="text-sm"><span className="font-semibold">Nome:</span> {professor?.nome}</div>
                        <div className="text-sm"><span className="font-semibold">Email:</span> {professor?.email}</div>
                        <div className="text-sm"><span className="font-semibold">Role:</span> {professor?.role ?? "-"}</div>
                        {professor?.especializacao && (
                          <div className="text-sm"><span className="font-semibold">Especialização:</span> {typeof professor.especializacao === "string" ? professor.especializacao : professor.especializacao?.nome || "Não informado"}</div>
                        )}
                        <div className="text-sm"><span className="font-semibold">Carga horária máx:</span> {typeof professor?.carga_horaria_max === "number" ? `${professor?.carga_horaria_max}h` : "-"}</div>
                        <div className="text-sm"><span className="font-semibold">Preferência:</span> {professor?.preferencia ?? "-"}</div>
                      </div>
                      <div>
                        <div className="text-sm"><span className="font-semibold">Alocações:</span> {cargaHoraria}</div>
                        <div className="text-sm"><span className="font-semibold">Disciplinas vinculadas:</span> {disciplinas.length}</div>
                        <div className="text-sm"><span className="font-semibold">Cursos vinculados:</span> {cursos.length}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
