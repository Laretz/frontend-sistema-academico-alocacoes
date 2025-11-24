"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  getDay,
} from "date-fns";
import { ptBR } from "date-fns/locale";

interface Disciplina {
  id: string;
  nome: string;
  carga_horaria: number;
  total_aulas: number;
  aulas_ministradas?: number;
  carga_horaria_atual?: number;
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
      predio: {
        id: string;
        nome: string;
        codigo: string;
      };
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
      predio: {
        id: string;
        nome: string;
        codigo: string;
      };
    };
  }>;
}

import type { Turma } from '@/types/entities';

interface GradeMensalProps {
  disciplinas: Disciplina[];
  turma?: Turma;
}

const DIAS_SEMANA = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

const CORES_DISCIPLINAS = [
  'bg-shadred-primary',
  'bg-shadred-chart-1',
  'bg-shadred-chart-5',
  'bg-shadred-destructive',
  'bg-shadblue-primary',
  'bg-shadblue-chart-1',
  'bg-shadblue-chart-5',
  'bg-shadyellow-primary',
  'bg-shadyellow-chart-1',
  'bg-shadyellow-chart-5',
  'bg-shadviolet-primary',
  'bg-shadviolet-chart-1',
  'bg-shadviolet-chart-5',
  'bg-shadpink-primary',
  'bg-shadpink-chart-1',
  'bg-shadpink-chart-5',
  'bg-shadorange-primary',
  'bg-shadorange-chart-1',
  'bg-shadorange-chart-5',
  'bg-shadgreen-primary',
  'bg-shadgreen-chart-1',
  'bg-shadgreen-chart-5',
];

// Função para obter cor consistente para cada disciplina baseada no ID
const obterCorDisciplina = (disciplinaId: string, todasDisciplinas: Disciplina[]): string => {
  // Criar um array ordenado de IDs únicos para garantir consistência
  const idsOrdenados = todasDisciplinas
    .map(d => d.id)
    .sort(); // Ordenar para garantir ordem consistente
  
  // Encontrar o índice da disciplina no array ordenado
  const indice = idsOrdenados.indexOf(disciplinaId);
  
  // Se não encontrar, usar hash do ID como fallback
  if (indice === -1) {
    let hash = 0;
    for (let i = 0; i < disciplinaId.length; i++) {
      const char = disciplinaId.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Converter para 32bit integer
    }
    return CORES_DISCIPLINAS[Math.abs(hash) % CORES_DISCIPLINAS.length];
  }
  
  // Usar o índice para selecionar a cor
  return CORES_DISCIPLINAS[indice % CORES_DISCIPLINAS.length];
};

export function GradeMensal({ disciplinas, turma }: GradeMensalProps) {
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
    const normalizar = (valor: string) =>
      valor
        ?.normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/[^a-z]/g, "");

    const resolveDiaIndex = (valor: string): number | null => {
      const v = normalizar(valor || "");
      if (!v) return null;
      if (v.startsWith("domingo") || v.startsWith("dom") || v.startsWith("sun")) return 0;
      if (v.startsWith("segunda") || v.startsWith("seg") || v.startsWith("mon")) return 1;
      if (v.startsWith("terca") || v.startsWith("tca") || v.startsWith("ter") || v.startsWith("tue")) return 2;
      if (v.startsWith("quarta") || v.startsWith("qua") || v.startsWith("wed")) return 3;
      if (v.startsWith("quinta") || v.startsWith("qui") || v.startsWith("thu")) return 4;
      if (v.startsWith("sexta") || v.startsWith("sex") || v.startsWith("fri")) return 5;
      if (v.startsWith("sabado") || v.startsWith("sabad") || v.startsWith("sab") || v.startsWith("sat")) return 6;
      return null;
    };

    const diaSemana = dia.getDay();

    const resultado = disciplinas
      .filter((disciplina) => {
        const temDatas = disciplina.data_inicio && disciplina.data_fim_prevista;
        const dataInicio = disciplina.data_inicio ? new Date(disciplina.data_inicio) : null;
        const dataFim = disciplina.data_fim_prevista ? new Date(disciplina.data_fim_prevista) : null;
        const dentroPeriodo = temDatas ? (dataInicio && dataFim ? dia >= dataInicio && dia <= dataFim : true) : true;
        if (!dentroPeriodo) return false;

        const temAulaRegular = disciplina.alocacoes?.some((alocacao) => {
          const idx = resolveDiaIndex(alocacao.horario?.dia_semana || "");
          return idx === diaSemana;
        }) || false;

        return temAulaRegular;
      })
      .filter(
        (disciplina) =>
          disciplinasSelecionadas.length === 0 ||
          disciplinasSelecionadas.includes(disciplina.id)
      );

    return resultado;
  };

  const getCorDisciplina = (disciplinaId: string) => {
    return obterCorDisciplina(disciplinaId, disciplinas);
  };

  const calcularProgresso = (disciplina: Disciplina) => {
    // Prioridade 1: Usar progresso_aulas calculado pelo backend se disponível
    if (disciplina.progresso_aulas !== undefined && disciplina.progresso_aulas >= 0) {
      return disciplina.progresso_aulas;
    }

    // Prioridade 2: Usar dados reais de aulas ministradas se disponíveis
    if (disciplina.aulas_ministradas !== undefined && disciplina.total_aulas > 0) {
      return Math.min((disciplina.aulas_ministradas / disciplina.total_aulas) * 100, 100);
    }

    // Prioridade 3: Usar progresso_temporal calculado pelo backend se disponível
    if (disciplina.progresso_temporal !== undefined && disciplina.progresso_temporal >= 0) {
      return disciplina.progresso_temporal;
    }

    // Fallback: Cálculo temporal local se dados do backend não estiverem disponíveis
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
                className="p-2 text-center font-medium text-muted-foreground text-sm"
              >
                {dia}
              </div>
            ))}
          </div>

          {/* Dias do mês */}
          <div className="grid grid-cols-7 gap-1">
            {/* Células vazias para alinhar o primeiro dia do mês */}
            {Array.from({ length: getDay(inicioMes) }).map((_, index) => (
              <div key={`empty-${index}`} className="min-h-[100px] p-2"></div>
            ))}
            {diasDoMes.map((dia) => {
              const disciplinasNoDia = getDisciplinasNoDia(dia);
              const isHoje = isSameDay(dia, new Date());

              return (
                <div
                  key={dia.toISOString()}
                  className={`
                    min-h-[100px] p-2 border rounded-lg
                    ${isSameMonth(dia, mesAtual) ? "bg-background" : "bg-muted/30"}
                    ${isHoje ? "ring-2 ring-primary" : ""}
                  `}
                >
                  <div
                    className={`text-sm font-medium mb-1 ${
                      isHoje
                        ? "text-primary"
                        : isSameMonth(dia, mesAtual)
                        ? "text-foreground"
                        : "text-muted-foreground"
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
                        title={`${disciplina.nome} - ${disciplina.aulas_ministradas || 0}/${disciplina.total_aulas} aulas (${disciplina.carga_horaria_atual || 0}h/${disciplina.carga_horaria}h)`}
                      >
                        <div className="truncate font-medium">
                          {disciplina.nome}
                        </div>
                        
                      </div>
                    ))}
                    {disciplinasNoDia.length > 3 && (
                      <div className="text-xs text-muted-foreground p-1">
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

              return (
                <div key={disciplina.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium">{disciplina.nome}</h3>
                    <div className="flex gap-2">
                      <Badge variant="secondary">
                        {disciplina.carga_horaria_atual || 0}h/{disciplina.carga_horaria}h
                      </Badge>
                      <Badge variant="outline">
                        {disciplina.aulas_ministradas || 0}/{disciplina.total_aulas} aulas
                      </Badge>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>Progresso de aulas:</span>
                      <span>{progresso.toFixed(1)}%</span>
                    </div>

                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all duration-300"
                        style={{ width: `${progresso}%` }}
                      />
                    </div>

                    {disciplina.data_inicio && (
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
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
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
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
