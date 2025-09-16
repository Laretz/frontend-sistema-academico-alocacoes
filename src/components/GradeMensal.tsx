"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, Calendar, Clock } from "lucide-react";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
} from "date-fns";
import { ptBR } from "date-fns/locale";

interface Disciplina {
  id: string;
  nome: string;
  carga_horaria: number;
  total_aulas: number;
  data_inicio?: string;
  data_fim_prevista?: string;
  data_fim_real?: string;
  tipo_de_sala: string;
  alocacoes: Array<{
    id: string;
    horario: {
      codigo: string;
      dia_semana: string;
      horario_inicio: string;
      horario_fim: string;
    };
    sala: {
      nome: string;
      predio: string;
    };
  }>;
  modulos: Array<{
    id: string;
    data_inicio: string;
    data_fim: string;
    ativo: boolean;
    horario: {
      codigo: string;
      dia_semana: string;
      horario_inicio: string;
      horario_fim: string;
    };
    sala: {
      nome: string;
      predio: string;
    };
  }>;
}

interface GradeMensalProps {
  disciplinas: Disciplina[];
}

const DIAS_SEMANA = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

const CORES_DISCIPLINAS = [
  "bg-blue-100 text-blue-800 border-blue-200",
  "bg-green-100 text-green-800 border-green-200",
  "bg-purple-100 text-purple-800 border-purple-200",
  "bg-orange-100 text-orange-800 border-orange-200",
  "bg-pink-100 text-pink-800 border-pink-200",
  "bg-indigo-100 text-indigo-800 border-indigo-200",
  "bg-yellow-100 text-yellow-800 border-yellow-200",
  "bg-red-100 text-red-800 border-red-200",
];

export function GradeMensal({ disciplinas }: GradeMensalProps) {
  const [mesAtual, setMesAtual] = useState(new Date());
  const [disciplinasSelecionadas, setDisciplinasSelecionadas] = useState<
    string[]
  >([]);

  const inicioMes = startOfMonth(mesAtual);
  const fimMes = endOfMonth(mesAtual);
  const diasDoMes = eachDayOfInterval({ start: inicioMes, end: fimMes });

  const proximoMes = () => {
    setMesAtual(addMonths(mesAtual, 1));
  };

  const mesAnterior = () => {
    setMesAtual(subMonths(mesAtual, 1));
  };

  const toggleDisciplina = (disciplinaId: string) => {
    setDisciplinasSelecionadas((prev) =>
      prev.includes(disciplinaId)
        ? prev.filter((id) => id !== disciplinaId)
        : [...prev, disciplinaId]
    );
  };

  const getDisciplinasNoDia = (dia: Date) => {
    return disciplinas
      .filter((disciplina) => {
        if (!disciplina.data_inicio) return false;

        const dataInicio = new Date(disciplina.data_inicio);
        const dataFim = disciplina.data_fim_real
          ? new Date(disciplina.data_fim_real)
          : disciplina.data_fim_prevista
          ? new Date(disciplina.data_fim_prevista)
          : null;

        if (!dataFim) return false;

        // Verificar se o dia está no período da disciplina
        const dentroPeríodo = dia >= dataInicio && dia <= dataFim;

        if (!dentroPeríodo) return false;

        // Verificar se há aula neste dia da semana
        const diaSemana = dia.getDay(); // 0 = domingo, 1 = segunda, etc.
        const diasSemanaMap: { [key: string]: number } = {
          domingo: 0,
          segunda: 1,
          terca: 2,
          quarta: 3,
          quinta: 4,
          sexta: 5,
          sabado: 6,
        };

        // Verificar alocações principais
        const temAulaRegular = disciplina.alocacoes.some((alocacao) => {
          const diaAlocacao =
            diasSemanaMap[alocacao.horario.dia_semana.toLowerCase()];
          return diaAlocacao === diaSemana;
        });

        // Verificar módulos extras
        const temModulo = disciplina.modulos.some((modulo) => {
          if (!modulo.ativo) return false;
          const dataInicioModulo = new Date(modulo.data_inicio);
          const dataFimModulo = new Date(modulo.data_fim);
          const dentroPeríodoModulo =
            dia >= dataInicioModulo && dia <= dataFimModulo;

          if (!dentroPeríodoModulo) return false;

          const diaModulo =
            diasSemanaMap[modulo.horario.dia_semana.toLowerCase()];
          return diaModulo === diaSemana;
        });

        return temAulaRegular || temModulo;
      })
      .filter(
        (disciplina) =>
          disciplinasSelecionadas.length === 0 ||
          disciplinasSelecionadas.includes(disciplina.id)
      );
  };

  const getCorDisciplina = (disciplinaId: string) => {
    const index = disciplinas.findIndex((d) => d.id === disciplinaId);
    return CORES_DISCIPLINAS[index % CORES_DISCIPLINAS.length];
  };

  const calcularProgresso = (disciplina: Disciplina) => {
    if (!disciplina.data_inicio) return 0;

    const dataInicio = new Date(disciplina.data_inicio);
    const dataFim = disciplina.data_fim_real
      ? new Date(disciplina.data_fim_real)
      : disciplina.data_fim_prevista
      ? new Date(disciplina.data_fim_prevista)
      : null;

    if (!dataFim) return 0;

    const hoje = new Date();
    const totalDias = Math.ceil(
      (dataFim.getTime() - dataInicio.getTime()) / (1000 * 60 * 60 * 24)
    );
    const diasDecorridos = Math.ceil(
      (hoje.getTime() - dataInicio.getTime()) / (1000 * 60 * 60 * 24)
    );

    return Math.min(Math.max((diasDecorridos / totalDias) * 100, 0), 100);
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho do calendário */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Grade Mensal de Disciplinas
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={mesAnterior}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="font-medium min-w-[150px] text-center">
                {format(mesAtual, "MMMM yyyy", { locale: ptBR })}
              </span>
              <Button variant="outline" size="sm" onClick={proximoMes}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Filtros de disciplinas */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Filtrar Disciplinas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button
              variant={
                disciplinasSelecionadas.length === 0 ? "default" : "outline"
              }
              size="sm"
              onClick={() => setDisciplinasSelecionadas([])}
            >
              Todas
            </Button>
            {disciplinas.map((disciplina) => (
              <Button
                key={disciplina.id}
                variant={
                  disciplinasSelecionadas.includes(disciplina.id)
                    ? "default"
                    : "outline"
                }
                size="sm"
                onClick={() => toggleDisciplina(disciplina.id)}
                className={
                  disciplinasSelecionadas.includes(disciplina.id)
                    ? getCorDisciplina(disciplina.id)
                    : ""
                }
              >
                {disciplina.nome}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Calendário */}
      <Card>
        <CardContent className="p-6">
          {/* Cabeçalho dos dias da semana */}
          <div className="grid grid-cols-7 gap-1 mb-4">
            {DIAS_SEMANA.map((dia) => (
              <div
                key={dia}
                className="p-2 text-center font-medium text-gray-500 text-sm"
              >
                {dia}
              </div>
            ))}
          </div>

          {/* Dias do mês */}
          <div className="grid grid-cols-7 gap-1">
            {diasDoMes.map((dia) => {
              const disciplinasNoDia = getDisciplinasNoDia(dia);
              const isHoje = isSameDay(dia, new Date());

              return (
                <div
                  key={dia.toISOString()}
                  className={`
                    min-h-[100px] p-2 border rounded-lg
                    ${isSameMonth(dia, mesAtual) ? "bg-white" : "bg-gray-50"}
                    ${isHoje ? "ring-2 ring-blue-500" : ""}
                  `}
                >
                  <div
                    className={`text-sm font-medium mb-1 ${
                      isHoje
                        ? "text-blue-600"
                        : isSameMonth(dia, mesAtual)
                        ? "text-gray-900"
                        : "text-gray-400"
                    }`}
                  >
                    {format(dia, "d")}
                  </div>

                  <div className="space-y-1">
                    {disciplinasNoDia.slice(0, 3).map((disciplina) => (
                      <div
                        key={`${disciplina.id}-${dia.toISOString()}`}
                        className={`text-xs p-1 rounded border ${getCorDisciplina(
                          disciplina.id
                        )}`}
                        title={`${disciplina.nome} - ${disciplina.carga_horaria}/${disciplina.total_aulas}h`}
                      >
                        <div className="truncate font-medium">
                          {disciplina.nome}
                        </div>
                        {disciplina.modulos.some((m) => m.ativo) && (
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>
                              +
                              {disciplina.modulos.filter((m) => m.ativo).length}
                            </span>
                          </div>
                        )}
                      </div>
                    ))}
                    {disciplinasNoDia.length > 3 && (
                      <div className="text-xs text-gray-500 p-1">
                        +{disciplinasNoDia.length - 3} mais
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Resumo das disciplinas */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Resumo das Disciplinas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {disciplinas.map((disciplina) => {
              const progresso = calcularProgresso(disciplina);
              const modulosAtivos = disciplina.modulos.filter((m) => m.ativo);

              return (
                <div key={disciplina.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium">{disciplina.nome}</h3>
                    <Badge variant="outline">
                      {disciplina.carga_horaria}/${disciplina.total_aulas}h
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <span>Progresso temporal:</span>
                      <span>{progresso.toFixed(1)}%</span>
                    </div>

                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${progresso}%` }}
                      />
                    </div>

                    {disciplina.data_inicio && (
                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <span>Início:</span>
                        <span>
                          {format(
                            new Date(disciplina.data_inicio),
                            "dd/MM/yyyy",
                            { locale: ptBR }
                          )}
                        </span>
                      </div>
                    )}

                    {disciplina.data_fim_real && (
                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <span>Fim previsto:</span>
                        <span>
                          {format(
                            new Date(disciplina.data_fim_real),
                            "dd/MM/yyyy",
                            { locale: ptBR }
                          )}
                        </span>
                      </div>
                    )}

                    {modulosAtivos.length > 0 && (
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="h-4 w-4 text-orange-500" />
                        <span className="text-orange-600">
                          {modulosAtivos.length} módulo(s) extra(s) ativo(s)
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
