"use client";

import React, { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { disciplinasProgressoService } from "@/services/disciplinas-progresso";
import {
  temAulaNoDia,
  calcularAulasNoDia,
  calcularUltimoDiaAula,
} from "@/utils/horario-consolidado-cronograma";

import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  Clock,
  TrendingUp,
  Filter,
  ChevronDown,
} from "lucide-react";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
  addMonths,
  subMonths,
  getDay,
  parseISO,
  differenceInWeeks,
  addWeeks,
  isToday,
} from "date-fns";
import { ptBR } from "date-fns/locale";
// Removidos imports de cálculos locais - agora usamos apenas dados do backend

interface Disciplina {
  id: string;
  nome: string;
  codigo: string | null;
  carga_horaria: number;
  total_aulas: number;
  aulas_ministradas: number;
  carga_horaria_atual: number;
  data_inicio: string | null;
  data_fim_prevista: string | null;
  data_fim_real: string | null;
  horario_consolidado: string | null;
  tipo_de_sala: string;
  periodo_letivo: string | null;
  id_curso: string;
  semestre: number;
  obrigatoria: boolean;
  progresso_temporal: number;
  progresso_aulas: number;
  aulas_previstas_ate_hoje: number;
  alocacoes?: Array<{
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
}

interface CalendarioProgressoDisciplinasProps {
  disciplinas: Disciplina[];
  turma?: {
    id: string;
    nome: string;
    periodo: number;
    turno: string;
  };
  turmaId?: string;
}

interface AulasDia {
  data: Date;
  disciplinas: Array<{
    disciplina: Disciplina;
    quantidadeAulas: number;
    aulasCumulativas: number;
    percentualConcluido: number;
    isUltimoDia: boolean;
  }>;
}

const DIAS_SEMANA_MAP: { [key: string]: number } = {
  DOMINGO: 1,
  SEGUNDA: 2,
  TERCA: 3,
  QUARTA: 4,
  QUINTA: 5,
  SEXTA: 6,
  SABADO: 7,
  // Manter compatibilidade com minúsculas
  domingo: 1,
  segunda: 2,
  terca: 3,
  quarta: 4,
  quinta: 5,
  sexta: 6,
  sabado: 7,
};

const CORES_DISCIPLINAS = [
  "bg-shadred-primary",
  "bg-shadred-chart-1",
  "bg-shadred-chart-5",
  "bg-shadred-destructive",
  "bg-shadgreen-primary",
  "bg-shadgreen-chart-1",
  "bg-shadgreen-chart-5",
  "bg-shadblue-primary",
  "bg-shadblue-chart-1",
  "bg-shadblue-chart-5",
  "bg-shadyellow-primary",
  "bg-shadyellow-chart-1",
  "bg-shadyellow-chart-5",
  "bg-shadviolet-primary",
  "bg-shadviolet-chart-1",
  "bg-shadviolet-chart-5",
  "bg-shadpink-primary",
  "bg-shadpink-chart-1",
  "bg-shadpink-chart-5",
  "bg-shadorange-primary",
  "bg-shadorange-chart-1",
  "bg-shadorange-chart-5",
];

// Função para obter cor consistente para cada disciplina baseada no ID
const obterCorDisciplina = (
  disciplinaId: string,
  todasDisciplinas: Disciplina[]
): string => {
  // Verificação de segurança
  if (!todasDisciplinas || todasDisciplinas.length === 0 || !disciplinaId) {
    return CORES_DISCIPLINAS[0]; // Retornar cor padrão
  }

  // Criar um array ordenado de IDs únicos para garantir consistência
  const idsOrdenados = todasDisciplinas
    .filter((d) => d && d.id) // Filtrar disciplinas válidas
    .map((d) => d.id)
    .sort(); // Ordenar para garantir ordem consistente

  // Encontrar o índice da disciplina no array ordenado
  const indice = idsOrdenados.indexOf(disciplinaId);

  // Se não encontrar, usar hash do ID como fallback
  if (indice === -1) {
    let hash = 0;
    for (let i = 0; i < disciplinaId.length; i++) {
      const char = disciplinaId.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Converter para 32bit integer
    }
    return CORES_DISCIPLINAS[Math.abs(hash) % CORES_DISCIPLINAS.length];
  }

  // Usar o índice para selecionar a cor
  return CORES_DISCIPLINAS[indice % CORES_DISCIPLINAS.length];
};

export function CalendarioProgressoDisciplinas({
  disciplinas: disciplinasIniciais,
  turma,
  turmaId,
}: CalendarioProgressoDisciplinasProps) {
  const [disciplinas, setDisciplinas] =
    useState<Disciplina[]>(disciplinasIniciais);
  const [loading, setLoading] = useState(false);
  const [disciplinasSelecionadas, setDisciplinasSelecionadas] = useState<
    string[]
  >(disciplinasIniciais.map((d) => d.id));
  const [filtrosAbertos, setFiltrosAbertos] = useState(false);
  const [mostrarFiltros, setMostrarFiltros] = useState(false);

  // Função para carregar disciplinas com progresso atualizado
  const carregarDisciplinas = async () => {
    if (!turmaId) return;

    setLoading(true);
    try {
      // Primeiro, atualizar o progresso das disciplinas
      await disciplinasProgressoService.atualizarProgresso({ turmaId });

      // Depois, buscar as disciplinas com progresso atualizado
      const { disciplinas: disciplinasAtualizadas } =
        await disciplinasProgressoService.buscarComProgresso({ turmaId });

      setDisciplinas(disciplinasAtualizadas);
      setDisciplinasSelecionadas(disciplinasAtualizadas.map((d) => d.id));
    } catch (error) {
      console.error("Erro ao carregar disciplinas:", error);
      // Em caso de erro, tentar buscar sem atualizar progresso
      try {
        const { disciplinas: disciplinasAtualizadas } =
          await disciplinasProgressoService.buscarComProgresso({ turmaId });
        setDisciplinas(disciplinasAtualizadas);
        setDisciplinasSelecionadas(disciplinasAtualizadas.map((d) => d.id));
      } catch (fallbackError) {
        console.error("Erro no fallback:", fallbackError);
        setDisciplinas(disciplinasIniciais);
      }
    } finally {
      setLoading(false);
    }
  };

  // Atualizar disciplinas selecionadas quando as disciplinas mudarem
  useEffect(() => {
    setDisciplinasSelecionadas(disciplinas.map((d) => d.id));
  }, [disciplinas]);

  // Carregar disciplinas com progresso atualizado na montagem do componente
  useEffect(() => {
    if (turmaId) {
      carregarDisciplinas();
    }
  }, [turmaId]);

  const disciplinasFiltradas = disciplinas.filter((d) =>
    disciplinasSelecionadas.includes(d.id)
  );

  const toggleDisciplina = (disciplinaId: string) => {
    setDisciplinasSelecionadas((prev) =>
      prev.includes(disciplinaId)
        ? prev.filter((id) => id !== disciplinaId)
        : [...prev, disciplinaId]
    );
  };

  const selecionarTodas = () => {
    setDisciplinasSelecionadas(disciplinas.map((d) => d.id));
  };

  const deselecionarTodas = () => {
    setDisciplinasSelecionadas([]);
  };
  const [mesAtual, setMesAtual] = useState(new Date());
  const [disciplinaSelecionada, setDisciplinaSelecionada] = useState<
    string | null
  >(null);

  // Função simplificada para formatar duração (mantida para UI)
  const formatarDuracaoAulas = (quantidadeAulas: number): string => {
    if (quantidadeAulas === 1) {
      return "1 aula";
    }
    return `${quantidadeAulas} aulas`;
  };

  // Funções antigas removidas - agora usamos apenas dados calculados pelo backend

  // Funções antigas de cálculo removidas - agora usamos apenas dados do backend

  // Dados do calendário para o mês atual
  const dadosCalendario = useMemo(() => {
    const inicioMes = startOfMonth(mesAtual);
    const fimMes = endOfMonth(mesAtual);

    const cronogramaCompleto: AulasDia[] = [];

    disciplinasFiltradas.forEach((disciplina) => {
      const cronogramaDisciplina = calcularCronogramaSimplificado(
        disciplina,
        inicioMes,
        fimMes
      );

      cronogramaDisciplina.forEach((item) => {
        const itemExistente = cronogramaCompleto.find(
          (existing) => existing.data.getTime() === item.data.getTime()
        );

        if (itemExistente) {
          itemExistente.disciplinas.push(...item.disciplinas);
        } else {
          cronogramaCompleto.push(item);
        }
      });
    });

    return cronogramaCompleto;
  }, [disciplinasFiltradas, mesAtual]);

  const diasDoMes = eachDayOfInterval({
    start: startOfMonth(mesAtual),
    end: endOfMonth(mesAtual),
  });

  const navegarMes = (direcao: "anterior" | "proximo") => {
    if (direcao === "anterior") {
      setMesAtual(subMonths(mesAtual, 1));
    } else {
      setMesAtual(addMonths(mesAtual, 1));
    }
  };

  const obterDadosDia = (dia: Date): AulasDia | undefined => {
    return dadosCalendario.find((item) => isSameDay(item.data, dia));
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5" />
              <span>Calendário de Progresso das Disciplinas</span>
              {turma && <Badge variant="outline">{turma.nome}</Badge>}
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={carregarDisciplinas}
                disabled={loading || !turmaId}
              >
                <TrendingUp className="h-4 w-4 mr-2" />
                {loading ? "Atualizando..." : "Atualizar Progresso"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setMostrarFiltros(!mostrarFiltros)}
              >
                <Filter className="h-4 w-4 mr-2" />
                Filtros
                <ChevronDown
                  className={`h-4 w-4 ml-2 transition-transform ${
                    mostrarFiltros ? "rotate-180" : ""
                  }`}
                />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navegarMes("anterior")}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-lg font-semibold min-w-[200px] text-center">
                {format(mesAtual, "MMMM yyyy", { locale: ptBR })}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navegarMes("proximo")}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </CardTitle>
          {mostrarFiltros && (
            <div className="mt-4 p-4 border rounded-lg bg-muted/50">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-medium">Filtrar Disciplinas</h4>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={selecionarTodas}>
                    Selecionar Todas
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={deselecionarTodas}
                  >
                    Desselecionar Todas
                  </Button>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {disciplinas.map((disciplina) => (
                  <div
                    key={disciplina.id}
                    className="flex items-center space-x-2"
                  >
                    <Checkbox
                      id={`disciplina-${disciplina.id}`}
                      checked={disciplinasSelecionadas.includes(disciplina.id)}
                      onCheckedChange={() => toggleDisciplina(disciplina.id)}
                    />
                    <label
                      htmlFor={`disciplina-${disciplina.id}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      {disciplina.nome}
                    </label>
                  </div>
                ))}
              </div>
              <div className="mt-3 text-sm text-muted-foreground">
                {disciplinasSelecionadas.length} de {disciplinas.length}{" "}
                disciplinas selecionadas
              </div>
            </div>
          )}
        </CardHeader>
        <CardContent>
          {/* Resumo das disciplinas */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {disciplinasFiltradas.map((disciplina, index) => {
              const previsaoConclusao =
                calcularPrevisaoConclusaoSimplificada(disciplina);
              // Usar progresso_aulas calculado pelo backend
              const aulasMinistradas = disciplina.aulas_ministradas;
              const percentualAtual = disciplina.progresso_aulas;
              const corDisciplina = obterCorDisciplina(
                disciplina.id,
                disciplinas
              );

              // Debug: log para verificar os valores
              console.log(
                `Disciplina ${disciplina.nome}: ${aulasMinistradas}/${disciplina.total_aulas} = ${percentualAtual}% (backend: ${disciplina.progresso_aulas}%)`
              );

              return (
                <Card
                  key={disciplina.id}
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() =>
                    setDisciplinaSelecionada(
                      disciplinaSelecionada === disciplina.id
                        ? null
                        : disciplina.id
                    )
                  }
                >
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center space-x-2">
                      <div
                        className={`w-3 h-3 rounded-full ${corDisciplina}`}
                      ></div>
                      <span>{disciplina.nome}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progresso:</span>
                      <span className="font-medium">
                        {Math.round(percentualAtual)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${corDisciplina}`}
                        style={{ width: `${percentualAtual}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-600">
                      <span>
                        {disciplina.aulas_ministradas}/{disciplina.total_aulas}{" "}
                        aulas
                      </span>
                      {previsaoConclusao && (
                        <span>
                          Conclusão:{" "}
                          {format(previsaoConclusao, "dd/MM", { locale: ptBR })}
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Calendário */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="h-5 w-5" />
                <span>Cronograma de Aulas</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Cabeçalho dos dias da semana */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map(
                  (dia) => (
                    <div
                      key={dia}
                      className="p-2 text-center text-sm font-medium text-muted-foreground"
                    >
                      {dia}
                    </div>
                  )
                )}
              </div>

              {/* Dias do mês */}
              <div className="grid grid-cols-7 gap-1">
                {/* Células vazias para alinhar o primeiro dia do mês */}
                {Array.from(
                  { length: getDay(startOfMonth(mesAtual)) },
                  (_, index) => (
                    <div
                      key={`empty-${index}`}
                      className="min-h-[80px] border border-transparent"
                    ></div>
                  )
                )}

                {diasDoMes.map((dia) => {
                  const dadosDia = obterDadosDia(dia);
                  const temAulas = dadosDia && dadosDia.disciplinas.length > 0;
                  const disciplinasVisveis = disciplinaSelecionada
                    ? dadosDia?.disciplinas.filter(
                        (d) => d.disciplina.id === disciplinaSelecionada
                      )
                    : dadosDia?.disciplinas;
                  const ehHoje = isToday(dia);

                  return (
                    <div
                      key={dia.toISOString()}
                      className={`
                    min-h-[80px] p-1 border rounded-lg transition-colors
                    ${
                      temAulas
                        ? "bg-accent/50 border-accent"
                        : "bg-muted/30 border-border"
                    }
                    ${
                      disciplinasVisveis && disciplinasVisveis.length > 0
                        ? "ring-2 ring-primary/50"
                        : ""
                    }
                    ${
                      ehHoje
                        ? "ring-4 ring-blue-500 bg-blue-50 border-blue-300"
                        : ""
                    }
                  `}
                    >
                      <div
                        className={`text-xs font-medium mb-1 ${
                          ehHoje
                            ? "text-blue-700 font-bold"
                            : "text-foreground/80"
                        }`}
                      >
                        {format(dia, "d")}
                        {ehHoje && (
                          <span className="ml-1 text-blue-600">•</span>
                        )}
                      </div>

                      {disciplinasVisveis &&
                        disciplinasVisveis
                          .filter(
                            (item) =>
                              item && item.disciplina && item.disciplina.id
                          )
                          .map((item, index) => {
                            const cor = obterCorDisciplina(
                              item.disciplina.id,
                              disciplinas
                            );

                            return (
                              <div
                                key={`${item.disciplina.id}-${index}`}
                                className="mb-1"
                              >
                                <div className="flex items-center gap-1">
                                  <Badge
                                    variant="secondary"
                                    className={`text-xs p-1 ${cor} text-white`}
                                  >
                                    {formatarDuracaoAulas(item.quantidadeAulas)}
                                    {item.isUltimoDia && (
                                      <span className="ml-1 text-yellow-500">📍</span>
                                    )}
                                  </Badge>
                                </div>
                                <div className={`text-xs mt-1 ${dia.getTime() > Date.now() ? 'text-gray-500 italic underline decoration-dotted' : 'text-gray-600'}`}>
                                  {`${Math.round(item.percentualConcluido)}%`}
                                </div>
                              </div>
                            );
                          })}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <div className="mt-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-50 border border-blue-200 rounded"></div>
              <span>Dias com aulas</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-xs text-gray-600">45%</span>
              <span>Progresso acumulado</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-xs text-gray-500 italic underline decoration-dotted">45%</span>
              <span>Projeção</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-yellow-500">📍</span>
              <span> Último dia da disciplina</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Simplificar função para usar apenas dados do backend
const calcularCronogramaSimplificado = (
  disciplina: Disciplina,
  dataInicio: Date,
  dataFim: Date
): AulasDia[] => {
  const cronograma: AulasDia[] = [];
  const diasDoMes = eachDayOfInterval({ start: dataInicio, end: dataFim });
  let aulasAcumuladas = 0;

  // Usar apenas dados calculados pelo backend
  const aulasMinistradas = disciplina.aulas_ministradas || 0;
  const totalAulas = disciplina.total_aulas || 0;
  const progressoAtual = disciplina.progresso_aulas || 0;

  // Verificar se a disciplina tem horário consolidado para determinar dias com aula
  const temHorarioConsolidado =
    disciplina.horario_consolidado &&
    disciplina.horario_consolidado.trim() !== "";

  // Verificar se a disciplina já começou (data_inicio)
  const dataInicioDisc = disciplina.data_inicio
    ? new Date(disciplina.data_inicio)
    : null;

  // Calcular o último dia de aula baseado no horário consolidado
  const ultimoDiaAula =
    temHorarioConsolidado && dataInicioDisc
      ? calcularUltimoDiaAula(
          disciplina.horario_consolidado,
          dataInicioDisc,
          totalAulas
        )
      : null;

  // Usar o último dia calculado ou fallback para data_fim_real do backend
  const dataFimDisc =
    ultimoDiaAula ||
    (disciplina.data_fim_real ? new Date(disciplina.data_fim_real) : null);

  // Pré-acúmulo antes do início do mês selecionado
  if (dataInicioDisc) {
    const preRangeEnd = new Date(dataInicio);
    preRangeEnd.setDate(preRangeEnd.getDate() - 1);
    if (preRangeEnd >= dataInicioDisc) {
      const diasPreMes = eachDayOfInterval({
        start: dataInicioDisc,
        end: preRangeEnd,
      });
      diasPreMes.forEach((diaPre) => {
        const d = getDay(diaPre);
        if (d === 0 || d === 6) return;
        if (dataFimDisc && diaPre > dataFimDisc) return;
        let temAulaPre = false;
        let qtdPre = 0;
        if (temHorarioConsolidado) {
          const diaSemanaParaHorario = d + 1;
          temAulaPre = temAulaNoDia(
            disciplina.horario_consolidado,
            diaSemanaParaHorario
          );
          if (temAulaPre) {
            qtdPre = calcularAulasNoDia(
              disciplina.horario_consolidado,
              diaSemanaParaHorario
            );
          }
        } else {
          temAulaPre = true;
          qtdPre = 1;
        }
        if (temAulaPre) {
          aulasAcumuladas += qtdPre;
        }
      });
    }
  }
  diasDoMes.forEach((dia) => {
    const diaSemanaGetDay = getDay(dia);

    // Não há aulas nos fins de semana
    if (diaSemanaGetDay === 0 || diaSemanaGetDay === 6) {
      return; // Não adicionar fins de semana ao cronograma
    }

    // Verificar se a disciplina já começou
    if (dataInicioDisc && dia < dataInicioDisc) {
      return; // Não exibir dias antes do início da disciplina
    }

    // Verificar se a disciplina já terminou
    if (dataFimDisc && dia > dataFimDisc) {
      return; // Não exibir dias após o fim da disciplina
    }

    // Verificar se há aula neste dia baseado no horário consolidado
    let temAulaNoDiaAtual = false;
    let quantidadeAulasNoDia = 0;

    if (temHorarioConsolidado) {
      // Converter getDay() para o formato usado pelas funções utilitárias
      // getDay(): 0=domingo, 1=segunda, 2=terça, 3=quarta, 4=quinta, 5=sexta, 6=sábado
      // horario_consolidado: 1=domingo, 2=segunda, 3=terça, 4=quarta, 5=quinta, 6=sexta, 7=sábado
      const diaSemanaParaHorario = diaSemanaGetDay + 1;

      // Usar a função utilitária para verificar se tem aula no dia
      temAulaNoDiaAtual = temAulaNoDia(
        disciplina.horario_consolidado,
        diaSemanaParaHorario
      );

      // Calcular quantas aulas há neste dia
      if (temAulaNoDiaAtual) {
        quantidadeAulasNoDia = calcularAulasNoDia(
          disciplina.horario_consolidado,
          diaSemanaParaHorario
        );
      }
    } else {
      // Se não há horário consolidado, assumir que há aulas em dias úteis
      temAulaNoDiaAtual = true;
      quantidadeAulasNoDia = 1; // Assumir 1 aula por dia útil se não há horário consolidado
    }

    // Só adicionar dias que têm aula
    if (temAulaNoDiaAtual) {
      // Verificar se é o último dia de aula (comparar apenas a data, ignorando horário)
      const isUltimoDia = ultimoDiaAula
        ? dia.toDateString() === ultimoDiaAula.toDateString()
        : false;
      aulasAcumuladas += quantidadeAulasNoDia;
      const totalAulasValidas = totalAulas || 0;
      const percentualDia =
        totalAulasValidas > 0
          ? Math.min((aulasAcumuladas / totalAulasValidas) * 100, 100)
          : 0;

      cronograma.push({
        data: dia,
        disciplinas: [
          {
            disciplina: disciplina,
            quantidadeAulas: quantidadeAulasNoDia,
            aulasCumulativas: aulasAcumuladas,
            percentualConcluido: percentualDia,
            isUltimoDia: isUltimoDia,
          },
        ],
      });
    }
  });

  return cronograma;
};

// Usar data_fim_real calculada corretamente pelo backend
const calcularPrevisaoConclusaoSimplificada = (
  disciplina: Disciplina
): Date | null => {
  // Usar data_fim_real calculada pelo backend (agora com lógica correta)
  if (disciplina.data_fim_real) {
    return parseISO(disciplina.data_fim_real);
  }

  // Fallback para data_fim_prevista
  if (disciplina.data_fim_prevista) {
    return parseISO(disciplina.data_fim_prevista);
  }

  return null;
};
