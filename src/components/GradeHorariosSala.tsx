"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Calendar, Clock, User, GraduationCap, X } from "lucide-react";
import { Sala } from "@/types/entities";

interface AlocacaoInfo {
  id: string;
  disciplina: {
    id: string;
    nome: string;
  };
  professor: {
    id: string;
    nome: string;
    email: string;
  };
  turma: {
    id: string;
    nome: string;
    num_alunos: number;
    periodo: number;
    turno: string;
  };
  horario: {
    id: string;
    codigo: string;
    dia_semana: string;
    horario_inicio: string;
    horario_fim: string;
  };
}

interface GradeHorarios {
  [dia_semana: string]: {
    [codigoHorario: string]: AlocacaoInfo | null;
  };
}

interface GradeHorariosSalaResponse {
  salaId: string;
  grade: GradeHorarios;
  resumo: {
    totalAlocacoes: number;
    disciplinasUnicas: number;
    professoresUnicos: number;
    turmasUnicas: number;
  };
}

interface GradeHorariosSalaProps {
  sala: Sala;
  trigger?: React.ReactNode;
}

const diasSemana = [
  { key: "SEGUNDA", label: "Segunda" },
  { key: "TERCA", label: "Terça" },
  { key: "QUARTA", label: "Quarta" },
  { key: "QUINTA", label: "Quinta" },
  { key: "SEXTA", label: "Sexta" },
  { key: "SABADO", label: "Sábado" },
];

const horariosDisponiveis = [
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
  "N5",
  "N6",
];


function getPeriodoHorario(periodo: string): string {
  const horarios: { [key: string]: string } = {
    M1: "07:00 - 07:50",
    M2: "07:50 - 08:40",
    M3: "08:55 - 09:45",
    M4: "09:45 - 10:35",
    M5: "10:50 - 11:40",
    M6: "11:40 - 12:30",
    T1: "13:00 - 13:50",
    T2: "13:50 - 14:40",
    T3: "14:55 - 15:45",
    T4: "15:45 - 16:35",
    T5: "16:50 - 17:40",
    T6: "17:40 - 18:30",
    N1: "18:45 - 19:35",
    N2: "19:35 - 20:25",
    N3: "20:35 - 21:25",
    N4: "21:25 - 22:15",
  };
  return horarios[periodo] || "";
}



export function GradeHorariosSala({ sala, trigger }: GradeHorariosSalaProps) {
  const [gradeData, setGradeData] = useState<GradeHorariosSalaResponse | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  const fetchGradeHorarios = useCallback(async () => {
    if (!sala.id) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `http://localhost:3333/salas/${sala.id}/grade-horarios`
      );

      if (!response.ok) {
        throw new Error("Erro ao buscar grade de horários");
      }

      const data = await response.json();
      setGradeData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido");
    } finally {
      setLoading(false);
    }
  }, [sala.id]);

  useEffect(() => {
    if (open) {
      fetchGradeHorarios();
    }
  }, [open, fetchGradeHorarios]);

  const renderAlocacao = (alocacao: AlocacaoInfo | null) => {
    if (!alocacao) {
      return (
        <div className="h-16 border border-gray-200 bg-gray-50 rounded p-1 text-center text-xs text-gray-400">
          Livre
        </div>
      );
    }

    return (
      <div className="h-16 border border-blue-200 bg-blue-50 rounded p-1 text-xs overflow-hidden">
        <div
          className="font-semibold text-blue-900 truncate"
          title={alocacao.disciplina.nome}
        >
          {alocacao.disciplina.nome}
        </div>
        <div className="text-blue-700 truncate" title={alocacao.professor.nome}>
          {alocacao.professor.nome}
        </div>
        <div
          className="text-blue-600 truncate"
          title={`${alocacao.turma.nome} - ${alocacao.turma.periodo}º período`}
        >
          {alocacao.turma.nome}
        </div>
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <Calendar className="h-4 w-4 mr-2" />
            Ver Grade
          </Button>
        )}
      </DialogTrigger>
      <DialogContent
        className="!max-w-[80vw] w-[98vw] max-h-[95vh] overflow-y-auto"
        showCloseButton={true}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Grade de Horários - {sala.nome}
          </DialogTitle>
          <DialogDescription>
            {sala.predio} • Capacidade: {sala.capacidade} pessoas
            {gradeData && (
              <span className="ml-4">
                {gradeData.resumo.totalAlocacoes} alocações •
                {gradeData.resumo.disciplinasUnicas} disciplinas •
                {gradeData.resumo.professoresUnicos} professores
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        {loading && (
          <div className="flex justify-center items-center py-8">
            <div className="text-center">
              <Clock className="h-8 w-8 animate-spin mx-auto mb-2" />
              <p>Carregando grade de horários...</p>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded p-4 text-center">
            <p className="text-red-600">{error}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchGradeHorarios}
              className="mt-2"
            >
              Tentar novamente
            </Button>
          </div>
        )}

        {gradeData && !loading && (
          <div className="space-y-4">
            {/* Resumo */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-3">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-blue-600" />
                    <div>
                      <p className="text-sm font-medium">
                        {gradeData.resumo.totalAlocacoes}
                      </p>
                      <p className="text-xs text-gray-600">Alocações</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-3">
                  <div className="flex items-center space-x-2">
                    <GraduationCap className="h-4 w-4 text-green-600" />
                    <div>
                      <p className="text-sm font-medium">
                        {gradeData.resumo.disciplinasUnicas}
                      </p>
                      <p className="text-xs text-gray-600">Disciplinas</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-3">
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-purple-600" />
                    <div>
                      <p className="text-sm font-medium">
                        {gradeData.resumo.professoresUnicos}
                      </p>
                      <p className="text-xs text-gray-600">Professores</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-3">
                  <div className="flex items-center space-x-2">
                    <GraduationCap className="h-4 w-4 text-orange-600" />
                    <div>
                      <p className="text-sm font-medium">
                        {gradeData.resumo.turmasUnicas}
                      </p>
                      <p className="text-xs text-gray-600">Turmas</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Grade de Horários */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Grade Semanal</CardTitle>
                <CardDescription>
                  Visualização completa dos horários da sala por dia da semana
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="w-full">
                  <table className="w-full border-collapse table-fixed">
                    <thead>
                      <tr>
                        <th className="border border-gray-300 p-1 bg-gray-50 text-xs font-medium text-left w-[10%]">
                          Horário
                        </th>
                        {diasSemana.map((dia) => (
                          <th
                            key={dia.key}
                            className="border border-gray-300 p-1 bg-gray-50 text-xs font-medium text-center w-[15%]"
                          >
                            {dia.label}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {horariosDisponiveis.map((horario) => (
                        <tr key={horario}>
                          <td className="border border-gray-300 p-1 bg-gray-50 text-xs font-medium text-center w-[10%]">
                            <div className="font-semibold">{horario}</div>
                            <div className="text-gray-600 text-xs">
                              {getPeriodoHorario(horario)}
                            </div>
                          </td>
                          {diasSemana.map((dia) => {
                            const alocacao =
                              gradeData.grade[dia.key]?.[horario] || null;
                            return (
                              <td
                                key={`${dia.key}-${horario}`}
                                className="border border-gray-300 p-1 w-[15%]"
                              >
                                {renderAlocacao(alocacao)}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
