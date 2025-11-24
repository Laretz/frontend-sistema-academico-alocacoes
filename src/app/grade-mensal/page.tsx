"use client";

import React, { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/main-layout";
import { GradeMensal } from "@/components/GradeMensal";
import { CalendarioProgressoDisciplinas } from "@/components/CalendarioProgressoDisciplinas";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Calendar, Clock, Trash2, Edit, BarChart3, Users } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { disciplinaService, salaService, turmaService, alocacaoService, horarioService } from "@/services/entities";
import { reservasSalaService } from "@/services/reservas-sala";
import { disciplinasProgressoService } from "@/services/disciplinas-progresso";

// Usando as interfaces do sistema de tipos
import type { Disciplina as DisciplinaBase, Turma, Sala, Horario, Alocacao, ReservaSala, CreateReservaSalaRequest } from '@/types/entities';

// Interface local estendida para compatibilidade com o componente
interface Disciplina extends Omit<DisciplinaBase, 'periodo_letivo' | 'semestre' | 'obrigatoria'> {
  aulas_ministradas?: number; // Campo essencial para exibir progresso correto
  horario_consolidado?: string;
  alocacoes: AlocacaoLocal[];
  modulos: NovoModulo[];
}

interface AlocacaoLocal {
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
}

interface NovoModulo {
  id_disciplina: string;
  id_alocacao_principal: string;
  id_sala: string;
  id_horario: string;
  data_inicio: string;
  data_fim: string;
}

export default function GradeMensalPage() {
  const [disciplinas, setDisciplinas] = useState<Disciplina[]>([]);
  const [salas, setSalas] = useState<Sala[]>([]);
  const [horarios, setHorarios] = useState<Horario[]>([]);
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [turmaSelecionada, setTurmaSelecionada] = useState<Turma | null>(null);
  const [loading, setLoading] = useState(true);
  const [dialogAberto, setDialogAberto] = useState(false);
  const [novaReserva, setNovaReserva] = useState<Partial<CreateReservaSalaRequest & { titulo: string; descricao?: string }>>({});
  const [reservas, setReservas] = useState<ReservaSala[]>([]);
  const [filtroSalaId, setFiltroSalaId] = useState<string>("");
  const [filtroHorarioId, setFiltroHorarioId] = useState<string>("");
  const [filtroDe, setFiltroDe] = useState<string>("");
  const [filtroAte, setFiltroAte] = useState<string>("");
  const [disciplinaSelecionada, setDisciplinaSelecionada] =
    useState<string>("");

  const carregarTurmas = async () => {
    try {
      const response = await turmaService.getAll(1, 50);
      setTurmas(response.turmas);
      
      // Selecionar a primeira turma por padrão
      if (response.turmas.length > 0 && !turmaSelecionada) {
        setTurmaSelecionada(response.turmas[0]);
      }
      console.log('Turmas carregadas:', response.turmas.length);
    } catch (error) {
      console.error("Erro ao carregar turmas:", error);
      setTurmas([]);
    }
  };

  // Função para carregar disciplinas da turma selecionada
  const carregarDisciplinasDaTurma = async (turmaId: string) => {
    console.log('🔍 Carregando disciplinas para turma:', turmaId);
    try {
      // Primeiro, atualizar o progresso das disciplinas
      await disciplinasProgressoService.atualizarProgresso({ turmaId });
      
      // Buscar disciplinas com progresso atualizado
      const { disciplinas: disciplinasComProgresso } = await disciplinasProgressoService.buscarComProgresso({ turmaId });
      console.log('📊 Disciplinas com progresso encontradas:', disciplinasComProgresso.length);
      
      if (disciplinasComProgresso.length === 0) {
        console.log('Nenhuma disciplina encontrada para a turma:', turmaId);
        setDisciplinas([]);
        setSalas([]);
        setHorarios([]);
        return;
      }
      
      // Buscar grade de horários diretamente por turma (compatível com backend atual)
      // O backend retorna { gradeHorarios: { segunda: [], terca: [], ... } }
      const gradeResponse: any = await alocacaoService.getGradeHorarios({ id_turma: turmaId });
      const gradeHorarios = gradeResponse?.gradeHorarios ?? {};
      // Achatar as alocações por dia para um array único
      const alocacoesDaTurma: Array<{
        id: string;
        horario: { codigo: string; dia_semana: string; horario_inicio: string; horario_fim: string };
        disciplina: { id: string; nome: string; cargaHorariaTotal: number };
        sala: { id: string; nome: string; predio: string; capacidade: number; tipo: string };
      }> = [
        ...(gradeHorarios.segunda || []),
        ...(gradeHorarios.terca || []),
        ...(gradeHorarios.quarta || []),
        ...(gradeHorarios.quinta || []),
        ...(gradeHorarios.sexta || []),
        ...(gradeHorarios.sabado || []),
      ];
      
      // Converter disciplinas com progresso para o formato esperado pelo componente
      const disciplinasFormatadas: Disciplina[] = disciplinasComProgresso.map(disciplina => {
        // Buscar alocações desta disciplina
        // Compatibilidade com backend atual: usar o id da disciplina vindo nas relações da alocação
        // Alguns ambientes não retornam mais id_disciplina diretamente na alocação.
        const alocacoesDisciplina = alocacoesDaTurma.filter(a => a.disciplina?.id === disciplina.id);
        
        return {
          id: disciplina.id,
          nome: disciplina.nome,
          codigo: disciplina.codigo,
          carga_horaria: disciplina.carga_horaria,
          total_aulas: disciplina.total_aulas,
          aulas_ministradas: disciplina.aulas_ministradas, // Campo importante com progresso real
          carga_horaria_atual: disciplina.carga_horaria_atual,
          id_curso: disciplina.id_curso,
          tipo_de_sala: disciplina.tipo_de_sala,
          horario_consolidado: disciplina.horario_consolidado || '',
          data_inicio: disciplina.data_inicio ? new Date(disciplina.data_inicio).toISOString().split('T')[0] : '2024-01-01',
          data_fim_prevista: disciplina.data_fim_prevista ? new Date(disciplina.data_fim_prevista).toISOString().split('T')[0] : '2024-12-31',
          data_fim_real: disciplina.data_fim_real ? new Date(disciplina.data_fim_real).toISOString().split('T')[0] : undefined,
          alocacoes: alocacoesDisciplina.map(a => ({
            id: a.id,
            horario: {
              codigo: a.horario?.codigo || '',
              dia_semana: a.horario?.dia_semana || '',
              horario_inicio: a.horario?.horario_inicio || '',
              horario_fim: a.horario?.horario_fim || '',
            },
            sala: {
              nome: a.sala?.nome || 'Sala não informada',
              predio: a.sala?.predio || 'Prédio não informado',
            }
          })),
          modulos: []
        };
      });
      
      setDisciplinas(disciplinasFormatadas);
      console.log('✅ Disciplinas carregadas com progresso:', disciplinasFormatadas.map(d => ({ nome: d.nome, aulas_ministradas: d.aulas_ministradas, total_aulas: d.total_aulas })));
      
      // Extrair salas e horários únicos das alocações
      const salasMap = new Map<string, Sala>();
      const horariosMap = new Map<string, Horario>();
      
      alocacoesDaTurma.forEach(alocacao => {
        if (alocacao.sala && !salasMap.has(alocacao.id_sala)) {
          salasMap.set(alocacao.id_sala, alocacao.sala);
        }
        if (alocacao.horario && !horariosMap.has(alocacao.id_horario)) {
          horariosMap.set(alocacao.id_horario, alocacao.horario);
        }
      });
      
      try {
        const [salasAll, horariosAll] = await Promise.all([
          salaService.getAll(1).catch(() => ({ salas: [] as Sala[] })),
          horarioService.getAll().catch(() => ([] as Horario[])),
        ]);
        setSalas(salasAll.salas || []);
        setHorarios(horariosAll || []);
      } catch {
        setSalas(Array.from(salasMap.values()));
        setHorarios(Array.from(horariosMap.values()));
      }
      
    } catch (error) {
      console.error('Erro ao carregar disciplinas da turma:', error);
      // Em caso de erro, limpar os dados
      setDisciplinas([]);
      setSalas([]);
      setHorarios([]);
    }
  };

  // Carregar dados iniciais
  useEffect(() => {
    const carregarDados = async () => {
      try {
        // Carregar turmas primeiro
        await carregarTurmas();
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
      } finally {
        setLoading(false);
      }
    };

    carregarDados();
  }, []);

  // Carregar disciplinas quando a turma selecionada mudar
  useEffect(() => {
    if (turmaSelecionada) {
      carregarDisciplinasDaTurma(turmaSelecionada.id);
    }
  }, [turmaSelecionada]);

  const carregarReservas = async () => {
    try {
      const qs: any = {};
      if (filtroSalaId) qs.salaId = filtroSalaId;
      if (filtroHorarioId) qs.horarioId = filtroHorarioId;
      if (filtroDe) qs.dateFrom = filtroDe;
      if (filtroAte) qs.dateTo = filtroAte;
      const resp = await reservasSalaService.list(qs);
      setReservas(resp.reservas || []);
    } catch (e) {
      setReservas([]);
    }
  };

  useEffect(() => {
    const hoje = new Date();
    const yyyy = hoje.getFullYear();
    const mm = String(hoje.getMonth() + 1).padStart(2, '0');
    const de = `${yyyy}-${mm}-01`;
    const ate = `${yyyy}-${mm}-28`;
    setFiltroDe(de);
    setFiltroAte(ate);
    carregarReservas();
  }, [turmaSelecionada]);

  const handleCriarReserva = async () => {
    try {
      if (!novaReserva.salaId || !novaReserva.horarioId || !novaReserva.date || !novaReserva.titulo) return;
      await reservasSalaService.create({
        salaId: novaReserva.salaId,
        horarioId: novaReserva.horarioId,
        date: novaReserva.date,
        titulo: novaReserva.titulo,
        descricao: novaReserva.descricao,
        recurrenceRule: novaReserva.recurrenceRule,
        recurrenceEnd: novaReserva.recurrenceEnd,
      } as CreateReservaSalaRequest);
      setDialogAberto(false);
      setNovaReserva({});
      await carregarReservas();
    } catch (error) {
      console.error("Erro ao criar reserva:", error);
    }
  };

  const handleCancelarReserva = async (id: string) => {
    try {
      await reservasSalaService.cancel(id);
      await carregarReservas();
    } catch (error) {
      console.error("Erro ao cancelar reserva:", error);
    }
  };

  const handleCancelarSerie = async (seriesId: string) => {
    try {
      await reservasSalaService.cancelSeries(seriesId);
      await carregarReservas();
    } catch (error) {
      console.error("Erro ao cancelar série:", error);
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Carregando...</div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Cabeçalho */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Grade Mensal</h1>
            <p className="text-muted-foreground">
              Visualize e gerencie a programação das disciplinas
            </p>
          </div>

          <Dialog open={dialogAberto} onOpenChange={setDialogAberto}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Reserva
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Adicionar Reserva de Sala</DialogTitle>
              </DialogHeader>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="sala">Sala</Label>
                  <Select
                    value={novaReserva.salaId || ""}
                    onValueChange={(value) =>
                      setNovaReserva({ ...novaReserva, salaId: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma sala" />
                    </SelectTrigger>
                    <SelectContent>
                      {salas.map((sala) => (
                        <SelectItem key={sala.id} value={sala.id}>
                          {sala.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="horario">Horário</Label>
                  <Select
                    value={novaReserva.horarioId || ""}
                    onValueChange={(value) =>
                      setNovaReserva({ ...novaReserva, horarioId: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um horário" />
                    </SelectTrigger>
                    <SelectContent>
                      {horarios.map((horario) => (
                        <SelectItem key={horario.id} value={horario.id}>
                          {horario.dia_semana} - {horario.codigo} ({horario.horario_inicio} - {horario.horario_fim})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="date">Data</Label>
                  <Input
                    id="date"
                    type="date"
                    value={novaReserva.date || ""}
                    onChange={(e) => setNovaReserva({ ...novaReserva, date: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="titulo">Título</Label>
                  <Input
                    id="titulo"
                    type="text"
                    value={novaReserva.titulo || ""}
                    onChange={(e) => setNovaReserva({ ...novaReserva, titulo: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="descricao">Descrição</Label>
                  <Input
                    id="descricao"
                    type="text"
                    value={novaReserva.descricao || ""}
                    onChange={(e) => setNovaReserva({ ...novaReserva, descricao: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="recorrencia">Recorrência semanal (opcional)</Label>
                  <Select
                    value={novaReserva.recurrenceRule || ""}
                    onValueChange={(value) => setNovaReserva({ ...novaReserva, recurrenceRule: value as any })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sem recorrência" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="WEEKLY">Semanal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {novaReserva.recurrenceRule === 'WEEKLY' && (
                  <div>
                    <Label htmlFor="recurrenceEnd">Fim da recorrência</Label>
                    <Input
                      id="recurrenceEnd"
                      type="date"
                      value={novaReserva.recurrenceEnd || ""}
                      onChange={(e) => setNovaReserva({ ...novaReserva, recurrenceEnd: e.target.value })}
                    />
                  </div>
                )}

                <div className="flex gap-2 pt-4">
                  <Button onClick={handleCriarReserva} disabled={!novaReserva.salaId || !novaReserva.horarioId || !novaReserva.date || !novaReserva.titulo} className="flex-1">Salvar</Button>
                  <Button
                    variant="outline"
                    onClick={() => setDialogAberto(false)}
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Seleção de Turma */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Turma Selecionada
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <Label htmlFor="turma-select">Selecionar Turma</Label>
                <Select
                  value={turmaSelecionada?.id || ""}
                  onValueChange={(value) => {
                    const turma = turmas.find(t => t.id === value);
                    if (turma) {
                      setTurmaSelecionada(turma);
                    }
                  }}
                >
                  <SelectTrigger id="turma-select">
                    <SelectValue placeholder="Selecione uma turma" />
                  </SelectTrigger>
                  <SelectContent>
                    {turmas.map((turma) => (
                      <SelectItem key={turma.id} value={turma.id}>
                        {turma.nome} - {turma.turno} ({turma.num_alunos} alunos)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {turmaSelecionada && (
                <div className="flex gap-2">
                  <Badge variant="outline">
                    {turmaSelecionada.periodo}º Período
                  </Badge>
                  <Badge variant="outline">
                    {turmaSelecionada.turno}
                  </Badge>
                  <Badge variant="outline">
                    {turmaSelecionada.num_alunos} alunos
                  </Badge>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Abas principais */}
         <Tabs defaultValue="calendario" className="space-y-6">
           <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="calendario" className="flex items-center space-x-2">
              <BarChart3 className="h-4 w-4" />
              <span>Calendário de Progresso</span>
            </TabsTrigger>
            <TabsTrigger value="grade" className="flex items-center space-x-2">
              <Calendar className="h-4 w-4" />
              <span>Grade Mensal</span>
            </TabsTrigger>
            <TabsTrigger value="reservas" className="flex items-center space-x-2">
              <Clock className="h-4 w-4" />
              <span>Gerenciar Reservas</span>
            </TabsTrigger>
          </TabsList>

          {/* Calendário de Progresso das Disciplinas */}
          <TabsContent value="calendario">
            <CalendarioProgressoDisciplinas 
              disciplinas={disciplinas} 
              turma={turmaSelecionada || undefined}
              turmaId={turmaSelecionada?.id}
            />
          </TabsContent>

          {/* Grade Mensal Original */}
          <TabsContent value="grade">
            <GradeMensal disciplinas={disciplinas} turma={turmaSelecionada || undefined} />
          </TabsContent>

          {/* Gerenciamento de Reservas */}
          <TabsContent value="reservas">
            <Card>
              <CardHeader>
                <CardTitle>Gerenciar Reservas</CardTitle>
              </CardHeader>
              <CardContent>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <Label>Sala</Label>
                  <Select value={filtroSalaId} onValueChange={setFiltroSalaId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Todas as salas" />
                    </SelectTrigger>
                    <SelectContent>
                      {salas.map((s) => (
                        <SelectItem key={s.id} value={s.id}>{s.nome}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Horário</Label>
                  <Select value={filtroHorarioId} onValueChange={setFiltroHorarioId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Todos os horários" />
                    </SelectTrigger>
                    <SelectContent>
                      {horarios.map((h) => (
                        <SelectItem key={h.id} value={h.id}>{h.dia_semana} - {h.codigo}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Data inicial</Label>
                  <Input type="date" value={filtroDe} onChange={(e) => setFiltroDe(e.target.value)} />
                </div>
                <div>
                  <Label>Data final</Label>
                  <Input type="date" value={filtroAte} onChange={(e) => setFiltroAte(e.target.value)} />
                </div>
              </div>
              <div className="flex justify-end">
                <Button onClick={carregarReservas}>Buscar</Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {reservas.map((r) => (
                  <div key={r.id} className="border rounded p-3 flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="font-medium">{r.titulo}</div>
                      <div className="text-sm text-muted-foreground">{r.sala?.nome} • {r.horario?.dia_semana} {r.horario?.codigo}</div>
                      <div className="text-sm text-muted-foreground">{r.date}</div>
                      {r.recurrenceRule === 'WEEKLY' && (
                        <div className="text-xs font-semibold text-primary">Recorrente até {r.recurrenceEnd}</div>
                      )}
                      <Badge variant={r.status === 'ATIVA' ? 'secondary' : 'outline'}>{r.status}</Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      {r.seriesId ? (
                        <Button variant="outline" size="sm" onClick={() => handleCancelarSerie(r.seriesId!)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      ) : (
                        <Button variant="outline" size="sm" onClick={() => handleCancelarReserva(r.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
                {reservas.length === 0 && (
                  <div className="text-sm text-muted-foreground">Nenhuma reserva encontrada para os filtros.</div>
                )}
              </div>
            </div>
              </CardContent>
            </Card>
          </TabsContent>
          </Tabs>
      </div>
    </MainLayout>
  );
}
