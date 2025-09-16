"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, GraduationCap, User } from "lucide-react";
import { Turma } from "@/types/entities";

interface AlocacaoInfo {
  id: string;
  disciplina: {
    id: string;
    nome: string;
    codigo: string;
    cargaHoraria: number;
  };
  professor: {
    id: string;
    nome: string;
    email: string;
  };
  sala: {
    id: string;
    nome: string;
    predio: string;
    capacidade: number;
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

interface GradeHorariosTurmaResponse {
  turmaId: string;
  grade: GradeHorarios;
  resumo: {
    totalAlocacoes: number;
    disciplinasUnicas: number;
    professoresUnicos: number;
  };
}

interface GradeHorariosTurmaProps {
  turma: Turma;
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
];

// Função para mapear períodos para horários
const getStatusColor = (vagas: number, demanda: number) => {
  if (demanda === 0) return "bg-gray-100 text-gray-800";
  if (vagas >= demanda) return "bg-green-100 text-green-800";
  if (vagas >= demanda * 0.8) return "bg-yellow-100 text-yellow-800";
  return "bg-red-100 text-red-800";
};

const getStatusText = (vagas: number, demanda: number) => {
  if (demanda === 0) return "Sem demanda";
  if (vagas >= demanda) return "Adequada";
  if (vagas >= demanda * 0.8) return "Atenção";
  return "Superlotada";
};

const getPeriodoHorario = (periodo: string): string => {
  const horarios: { [key: string]: string } = {
    M1: "07:00-07:50",
    M2: "07:50-08:40",
    M3: "08:40-09:30",
    M4: "09:50-10:40",
    M5: "10:40-11:30",
    M6: "11:30-12:20",
    T1: "13:00-13:50",
    T2: "13:50-14:40",
    T3: "14:40-15:30",
    T4: "15:50-16:40",
    T5: "16:40-17:30",
    T6: "17:30-18:20",
    N1: "18:45-19:35",
    N2: "19:35-20:25",
    N3: "20:35-21:25",
    N4: "21:25-22:15",
  };
  return horarios[periodo] || "";
};

export function GradeHorariosTurma({
  turma,
  trigger,
}: GradeHorariosTurmaProps) {
  const [open, setOpen] = useState(false);
  const [gradeData, setGradeData] = useState<GradeHorariosTurmaResponse | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchGradeHorarios = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `http://localhost:3333/turmas/${turma.id}/grade-horarios`
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
  }, [turma.id]);

  useEffect(() => {
    if (open) {
      fetchGradeHorarios();
    }
  }, [open, fetchGradeHorarios]);

  // Função para determinar a cor baseada no turno da turma vs horário da alocação
  const getAlocacaoColor = (codigoHorario: string) => {
    const turnoTurma = turma.turno.toUpperCase();
    const periodoHorario = codigoHorario.charAt(0); // M, T ou N
    
    // Se o horário está no turno correto da turma, usa azul (normal)
    if (
      (turnoTurma === 'MATUTINO' && periodoHorario === 'M') ||
      (turnoTurma === 'VESPERTINO' && periodoHorario === 'T') ||
      (turnoTurma === 'NOTURNO' && periodoHorario === 'N')
    ) {
      return {
        border: 'border-blue-200',
        bg: 'bg-blue-50',
        textPrimary: 'text-blue-900',
        textSecondary: 'text-blue-700',
        textTertiary: 'text-blue-600'
      };
    }
    
    // Se é horário noturno fora do turno, usa vermelho
    if (periodoHorario === 'N') {
      return {
        border: 'border-red-200',
        bg: 'bg-red-50',
        textPrimary: 'text-red-900',
        textSecondary: 'text-red-700',
        textTertiary: 'text-red-600'
      };
    }
    
    // Para outros casos (manhã em turma vespertina, tarde em turma matutina), usa amarelo
    return {
      border: 'border-yellow-200',
      bg: 'bg-yellow-50',
      textPrimary: 'text-yellow-900',
      textSecondary: 'text-yellow-700',
      textTertiary: 'text-yellow-600'
    };
  };

  const renderAlocacao = (alocacao: AlocacaoInfo | null) => {
    if (!alocacao) {
      return (
        <div className="h-16 border border-gray-200 bg-gray-50 rounded p-1 text-center text-xs text-gray-400">
          Livre
        </div>
      );
    }

    const colors = getAlocacaoColor(alocacao.horario.codigo);

    return (
      <div className={`h-16 border ${colors.border} ${colors.bg} rounded p-1 text-xs overflow-hidden`}>
        <div
          className={`font-semibold ${colors.textPrimary} truncate`}
          title={alocacao.disciplina.nome}
        >
          {alocacao.disciplina.nome}
        </div>
        <div className={`${colors.textSecondary} truncate`} title={alocacao.professor.nome}>
          {alocacao.professor.nome}
        </div>
        <div
          className={`${colors.textTertiary} truncate`}
          title={`${alocacao.sala.nome} - ${alocacao.sala.predio}`}
        >
          {alocacao.sala.nome}
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
            Grade de Horários - {turma.nome}
          </DialogTitle>
          <DialogDescription>
            {turma.periodo}º período • {turma.turno} • {turma.num_alunos} alunos
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
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
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
            </div>

            {/* Tabela de Disciplinas */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Disciplinas da Turma</CardTitle>
                <CardDescription>
                  Detalhes completos das disciplinas alocadas para esta turma
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full border border-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase border-r">
                          Código
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase border-r">
                          Prefixo
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase border-r">
                          Disciplina
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase border-r">
                          CH
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase border-r">
                          Horário
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase border-r">
                          Professor
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase border-r">
                          Local
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase border-r">
                          Vagas
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase border-r">
                          Demanda
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {Object.values(gradeData.grade)
                        .flatMap(dia => Object.values(dia))
                        .filter((alocacao): alocacao is AlocacaoInfo => alocacao !== null)
                        .reduce((unique, alocacao) => {
                          const exists = unique.find(item => 
                            item.disciplina.id === alocacao.disciplina.id
                          );
                          if (!exists) {
                            unique.push(alocacao);
                          }
                          return unique;
                        }, [] as AlocacaoInfo[])
                        .map((alocacao, index) => {
                          // Usar horário consolidado da disciplina se disponível, senão buscar dos horários
                          let horarioConsolidado = alocacao.disciplina.horario_consolidado || "";
                          
                          if (!horarioConsolidado) {
                            // Buscar todos os horários desta disciplina
                            const horariosAlocacao: string[] = [];
                            Object.entries(gradeData.grade).forEach(([dia, horarios]) => {
                              Object.entries(horarios).forEach(([horario, alocacaoHorario]) => {
                                if (alocacaoHorario?.disciplina.codigo === alocacao.disciplina.codigo) {
                                  horariosAlocacao.push(horario);
                                }
                              });
                            });
                            horarioConsolidado = horariosAlocacao.length > 0 ? horariosAlocacao.join(', ') : "-";
                          }
                          
                          return (
                            <tr
                              key={alocacao.disciplina.id}
                              className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                            >
                              <td className="px-3 py-2 text-sm font-medium text-gray-900 border-r">
                                {alocacao.disciplina.codigo || "---"}
                              </td>
                              <td className="px-3 py-2 border-r">
                                <Badge variant="outline" className="font-mono text-xs">
                                  ---
                                </Badge>
                              </td>
                              <td className="px-3 py-2 text-sm text-gray-900 border-r max-w-xs">
                                {alocacao.disciplina.nome}
                              </td>
                              <td className="px-3 py-2 text-sm text-gray-900 border-r">
                                {alocacao.disciplina.cargaHoraria}h
                              </td>
                              <td className="px-3 py-2 text-sm text-gray-900 font-mono border-r">
                                {horarioConsolidado}
                              </td>
                              <td className="px-3 py-2 text-sm text-gray-900 border-r">
                                {alocacao.professor.nome}
                              </td>
                              <td className="px-3 py-2 text-sm text-gray-900 border-r">
                                {alocacao.sala.predio} {alocacao.sala.nome}
                              </td>
                              <td className="px-3 py-2 text-sm text-gray-900 border-r">
                                {turma.num_alunos}
                              </td>
                              <td className="px-3 py-2 text-sm text-gray-900 border-r">
                                {turma.num_alunos}
                              </td>
                              <td className="px-3 py-2">
                                <Badge
                                  className={getStatusColor(turma.num_alunos, turma.num_alunos)}
                                >
                                  {getStatusText(turma.num_alunos, turma.num_alunos)}
                                </Badge>
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Grade de Horários */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Grade Semanal</CardTitle>
                <CardDescription>
                  Visualização completa dos horários da turma por dia da semana
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
