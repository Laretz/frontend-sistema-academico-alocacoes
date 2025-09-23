"use client";

import React, { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { disciplinasProgressoService } from '@/services/disciplinas-progresso';

import { ChevronLeft, ChevronRight, Calendar, Clock, TrendingUp, Filter, ChevronDown } from "lucide-react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths, getDay, parseISO, differenceInWeeks, addWeeks } from "date-fns";
import { ptBR } from "date-fns/locale";
import { calcularAulasPorSemana, calcularTotalAulasSemestre, temAulaNoDia, calcularAulasNoDia, extrairDiasSemana } from "@/utils/horario-consolidado-cronograma";

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
  horario_consolidado?: string;
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
  }>;
}

const DIAS_SEMANA_MAP: { [key: string]: number } = {
  'segunda': 1,
  'terca': 2,
  'quarta': 3,
  'quinta': 4,
  'sexta': 5,
  'sabado': 6
};

const CORES_DISCIPLINAS = [
  'bg-blue-500',
  'bg-green-500',
  'bg-purple-500',
  'bg-orange-500',
  'bg-pink-500',
  'bg-indigo-500',
  'bg-red-500',
  'bg-yellow-500'
];

export function CalendarioProgressoDisciplinas({ disciplinas: disciplinasIniciais, turma, turmaId }: CalendarioProgressoDisciplinasProps) {
  const [disciplinas, setDisciplinas] = useState<Disciplina[]>(disciplinasIniciais);
  const [loading, setLoading] = useState(false);
  const [disciplinasSelecionadas, setDisciplinasSelecionadas] = useState<string[]>(
    disciplinasIniciais.map(d => d.id)
  );
  const [filtrosAbertos, setFiltrosAbertos] = useState(false);
  const [mostrarFiltros, setMostrarFiltros] = useState(false);

  // Função para carregar disciplinas com progresso atualizado
  const carregarDisciplinas = async () => {
    if (!turmaId) return
    
    setLoading(true)
    try {
      // Primeiro, atualizar o progresso das disciplinas
      await disciplinasProgressoService.atualizarProgresso({ turmaId })
      
      // Depois, buscar as disciplinas com progresso atualizado
      const { disciplinas: disciplinasAtualizadas } = await disciplinasProgressoService.buscarComProgresso({ turmaId })
      
      setDisciplinas(disciplinasAtualizadas)
      setDisciplinasSelecionadas(disciplinasAtualizadas.map(d => d.id))
    } catch (error) {
      console.error('Erro ao carregar disciplinas:', error)
      // Em caso de erro, tentar buscar sem atualizar progresso
      try {
        const { disciplinas: disciplinasAtualizadas } = await disciplinasProgressoService.buscarComProgresso({ turmaId })
        setDisciplinas(disciplinasAtualizadas)
        setDisciplinasSelecionadas(disciplinasAtualizadas.map(d => d.id))
      } catch (fallbackError) {
        console.error('Erro no fallback:', fallbackError)
        setDisciplinas(disciplinasIniciais)
      }
    } finally {
      setLoading(false)
    }
  }

  // Atualizar disciplinas selecionadas quando as disciplinas mudarem
  useEffect(() => {
    setDisciplinasSelecionadas(disciplinas.map(d => d.id));
  }, [disciplinas]);

  // Carregar disciplinas com progresso atualizado na montagem do componente
  useEffect(() => {
    if (turmaId) {
      carregarDisciplinas();
    }
  }, [turmaId]);

  const disciplinasFiltradas = disciplinas.filter(d => 
    disciplinasSelecionadas.includes(d.id)
  );

  const toggleDisciplina = (disciplinaId: string) => {
    setDisciplinasSelecionadas(prev => 
      prev.includes(disciplinaId)
        ? prev.filter(id => id !== disciplinaId)
        : [...prev, disciplinaId]
    );
  };

  const selecionarTodas = () => {
    setDisciplinasSelecionadas(disciplinas.map(d => d.id));
  };

  const deselecionarTodas = () => {
    setDisciplinasSelecionadas([]);
  };
  const [mesAtual, setMesAtual] = useState(new Date());
  const [disciplinaSelecionada, setDisciplinaSelecionada] = useState<string | null>(null);

  // Função para calcular quantas aulas por semana uma disciplina tem
  const calcularAulasPorSemanaDisciplina = (disciplina: Disciplina): number => {
    if (disciplina.horario_consolidado) {
      return calcularAulasPorSemana(disciplina.horario_consolidado);
    }
    // Fallback para o método antigo se não houver horário consolidado
    return disciplina.alocacoes.length * 2;
  };

  // Função para formatar a duração das aulas
  const formatarDuracaoAulas = (quantidadeAulas: number): string => {
    if (quantidadeAulas === 1) {
      return "1 aula";
    }
    return `${quantidadeAulas} aulas`;
  };

  // Função para verificar se uma disciplina tem aula em um determinado dia
  const temAulaNodia = (disciplina: Disciplina, diaSemana: number): boolean => {
    if (!disciplina.horarios || disciplina.horarios.length === 0) {
      return false;
    }

    const diasComAula = disciplina.horarios.map(h => h.dia_semana);
    return diasComAula.includes(diaSemana);
  };

  // Função para verificar se uma data está dentro do período letivo da disciplina
  const estaNoPeridoLetivo = (disciplina: Disciplina, data: Date): boolean => {
    if (!disciplina.data_inicio) return true;
    
    const dataInicio = parseISO(disciplina.data_inicio);
    const dataFim = disciplina.data_fim_prevista ? parseISO(disciplina.data_fim_prevista) : addMonths(dataInicio, 6);
    
    return data >= dataInicio && data <= dataFim;
  };

  // Função para calcular o cronograma de aulas de uma disciplina
  const calcularCronogramaAulas = (disciplina: Disciplina, dataInicio: Date, dataFim: Date): AulasDia[] => {
    const cronograma: AulasDia[] = [];
    const diasDoMes = eachDayOfInterval({ start: dataInicio, end: dataFim });
    const dataInicioDisc = disciplina.data_inicio ? parseISO(disciplina.data_inicio) : dataInicio;
    
    // Calcular aulas acumuladas até o início do mês atual
    let aulasAcumuladas = disciplina.carga_horaria_atual || 0;
    
    // Se estamos visualizando um mês posterior ao início da disciplina,
    // precisamos calcular as aulas que já aconteceram antes deste mês
    if (dataInicio > dataInicioDisc) {
      const diasAnteriores = eachDayOfInterval({ start: dataInicioDisc, end: subMonths(dataInicio, 0) });
      diasAnteriores.forEach(dia => {
        if (dia < dataInicio) {
          const diaSemana = getDay(dia);
          let temAula = false;
          let aulasNoDia = 0;
          
          if (disciplina.horario_consolidado && disciplina.horario_consolidado.trim() !== '') {
            temAula = temAulaNoDia(disciplina.horario_consolidado, diaSemana);
            aulasNoDia = calcularAulasNoDia(disciplina.horario_consolidado, diaSemana);
          } else if (disciplina.alocacoes && disciplina.alocacoes.length > 0) {
            // Fallback para o método antigo
            temAula = disciplina.alocacoes.some(alocacao => 
              DIAS_SEMANA_MAP[alocacao.horario.dia_semana] === diaSemana
            );
            aulasNoDia = disciplina.alocacoes.filter(alocacao => 
              DIAS_SEMANA_MAP[alocacao.horario.dia_semana] === diaSemana
            ).length * 2;
          } else {
            // Se não há horário consolidado nem alocações, assumir 2 aulas por dia útil
            temAula = true;
            aulasNoDia = 2;
          }
          
          if (temAula && estaNoPeridoLetivo(disciplina, dia)) {
            aulasAcumuladas += aulasNoDia;
          }
        }
      });
    }
    
    diasDoMes.forEach(dia => {
      const diaSemana = getDay(dia);
      let temAula = false;
      let aulasNoDia = 0;
      
      // Não há aulas nos fins de semana
      if (diaSemana === 0 || diaSemana === 6) {
        temAula = false;
        aulasNoDia = 0;
      } else if (disciplina.horario_consolidado && disciplina.horario_consolidado.trim() !== '') {
        temAula = temAulaNoDia(disciplina.horario_consolidado, diaSemana);
        aulasNoDia = calcularAulasNoDia(disciplina.horario_consolidado, diaSemana);
      } else if (disciplina.alocacoes && disciplina.alocacoes.length > 0) {
        // Fallback para o método antigo
        temAula = disciplina.alocacoes.some(alocacao => 
          DIAS_SEMANA_MAP[alocacao.horario.dia_semana] === diaSemana
        );
        aulasNoDia = disciplina.alocacoes.filter(alocacao => 
          DIAS_SEMANA_MAP[alocacao.horario.dia_semana] === diaSemana
        ).length * 2;
      } else {
        // Se não há horário consolidado nem alocações, assumir 2 aulas por dia útil
        temAula = true;
        aulasNoDia = 2;
      }
      

      
      // Verificar se a data está no período letivo da disciplina
      if (temAula && estaNoPeridoLetivo(disciplina, dia)) {
        aulasAcumuladas += aulasNoDia;
        const percentualConcluido = Math.min((aulasAcumuladas / disciplina.total_aulas) * 100, 100);
        

        
        const aulaExistente = cronograma.find(item => 
          item.data.getTime() === dia.getTime()
        );
        
        if (aulaExistente) {
          aulaExistente.disciplinas.push({
            disciplina,
            quantidadeAulas: aulasNoDia,
            aulasCumulativas: aulasAcumuladas,
            percentualConcluido
          });
        } else {
          cronograma.push({
            data: dia,
            disciplinas: [{
              disciplina,
              quantidadeAulas: aulasNoDia,
              aulasCumulativas: aulasAcumuladas,
              percentualConcluido
            }]
          });
        }
      }
    });
    

    return cronograma;
  };

  // Calcular previsão de conclusão
  const calcularPrevisaoConclusao = (disciplina: Disciplina): Date | null => {
    if (!disciplina.data_inicio) return null;
    
    const dataInicio = parseISO(disciplina.data_inicio);
    const aulasPorSemana = calcularAulasPorSemanaDisciplina(disciplina);
    const aulasRestantes = disciplina.total_aulas - (disciplina.carga_horaria_atual || 0);
    const semanasRestantes = Math.ceil(aulasRestantes / aulasPorSemana);
    
    return addWeeks(dataInicio, semanasRestantes);
  };

  // Dados do calendário para o mês atual
  const dadosCalendario = useMemo(() => {
    const inicioMes = startOfMonth(mesAtual);
    const fimMes = endOfMonth(mesAtual);
    
    const cronogramaCompleto: AulasDia[] = [];
    
    disciplinasFiltradas.forEach(disciplina => {
      const cronogramaDisciplina = calcularCronogramaAulas(disciplina, inicioMes, fimMes);
      
      cronogramaDisciplina.forEach(item => {
        const itemExistente = cronogramaCompleto.find(existing => 
          existing.data.getTime() === item.data.getTime()
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
    end: endOfMonth(mesAtual)
  });

  const navegarMes = (direcao: 'anterior' | 'proximo') => {
    if (direcao === 'anterior') {
      setMesAtual(subMonths(mesAtual, 1));
    } else {
      setMesAtual(addMonths(mesAtual, 1));
    }
  };

  const obterDadosDia = (dia: Date): AulasDia | undefined => {
    return dadosCalendario.find(item => isSameDay(item.data, dia));
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5" />
              <span>Calendário de Progresso das Disciplinas</span>
              {turma && (
                <Badge variant="outline">
                  {turma.nome}
                </Badge>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={carregarDisciplinas}
                disabled={loading || !turmaId}
              >
                <TrendingUp className="h-4 w-4 mr-2" />
                {loading ? 'Atualizando...' : 'Atualizar Progresso'}
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setMostrarFiltros(!mostrarFiltros)}
              >
                <Filter className="h-4 w-4 mr-2" />
                Filtros
                <ChevronDown className={`h-4 w-4 ml-2 transition-transform ${mostrarFiltros ? 'rotate-180' : ''}`} />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navegarMes('anterior')}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-lg font-semibold min-w-[200px] text-center">
                {format(mesAtual, 'MMMM yyyy', { locale: ptBR })}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navegarMes('proximo')}
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
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={selecionarTodas}
                  >
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
                  <div key={disciplina.id} className="flex items-center space-x-2">
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
                {disciplinasSelecionadas.length} de {disciplinas.length} disciplinas selecionadas
              </div>
            </div>
          )}
        </CardHeader>
        <CardContent>
          {/* Resumo das disciplinas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {disciplinasFiltradas.map((disciplina, index) => {
          const previsaoConclusao = calcularPrevisaoConclusao(disciplina);
          const percentualAtual = ((disciplina.aulas_ministradas || 0) / disciplina.total_aulas) * 100;
          const corDisciplina = CORES_DISCIPLINAS[index % CORES_DISCIPLINAS.length];
          
          return (
            <Card key={disciplina.id} className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => setDisciplinaSelecionada(
                    disciplinaSelecionada === disciplina.id ? null : disciplina.id
                  )}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${corDisciplina}`}></div>
                  <span>{disciplina.nome}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progresso:</span>
                  <span className="font-medium">{Math.round(percentualAtual)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${corDisciplina}`}
                    style={{ width: `${percentualAtual}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-xs text-gray-600">
                  <span>{disciplina.aulas_ministradas || 0}/{disciplina.total_aulas} aulas</span>
                  {previsaoConclusao && (
                    <span>Conclusão: {format(previsaoConclusao, 'dd/MM', { locale: ptBR })}</span>
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
            {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(dia => (
              <div key={dia} className="p-2 text-center text-sm font-medium text-muted-foreground">
                {dia}
              </div>
            ))}
          </div>
          
          {/* Dias do mês */}
          <div className="grid grid-cols-7 gap-1">
            {/* Células vazias para alinhar o primeiro dia do mês */}
            {Array.from({ length: getDay(startOfMonth(mesAtual)) }, (_, index) => (
              <div key={`empty-${index}`} className="min-h-[80px]"></div>
            ))}
            
            {diasDoMes.map(dia => {
              const dadosDia = obterDadosDia(dia);
              const temAulas = dadosDia && dadosDia.disciplinas.length > 0;
              const disciplinasVisveis = disciplinaSelecionada 
                ? dadosDia?.disciplinas.filter(d => d.disciplina.id === disciplinaSelecionada)
                : dadosDia?.disciplinas;
              
              return (
                <div
                  key={dia.toISOString()}
                  className={`
                    min-h-[80px] p-1 border rounded-lg transition-colors
                    ${temAulas ? 'bg-accent/50 border-accent' : 'bg-muted/30 border-border'}
                    ${disciplinasVisveis && disciplinasVisveis.length > 0 ? 'ring-2 ring-primary/50' : ''}
                  `}
                >
                  <div className="text-xs font-medium text-foreground/80 mb-1">
                    {format(dia, 'd')}
                  </div>
                  
                  {disciplinasVisveis && disciplinasVisveis.map((item, index) => {
                    const corIndex = disciplinas.findIndex(d => d.id === item.disciplina.id);
                    const cor = CORES_DISCIPLINAS[corIndex % CORES_DISCIPLINAS.length];
                    
                    return (
                      <div key={`${item.disciplina.id}-${index}`} className="mb-1">
                        <Badge 
                          variant="secondary" 
                          className={`text-xs p-1 ${cor} text-white`}
                        >
                          {formatarDuracaoAulas(item.quantidadeAulas)}
                        </Badge>
                        <div className="text-xs text-gray-600 mt-1">
                          {Math.round(item.percentualConcluido)}%
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

      {/* Legenda */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Legenda</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-50 border border-blue-200 rounded"></div>
              <span>Dias com aulas</span>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="secondary" className="text-xs">2 aulas</Badge>
              <span>Duração das aulas (50 min cada)</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-xs text-gray-600">45%</span>
              <span>Progresso acumulado</span>
            </div>
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4 text-green-500" />
              <span>Previsão de conclusão</span>
            </div>
          </div>
        </CardContent>
      </Card>
        </CardContent>
      </Card>
    </div>
  );
}