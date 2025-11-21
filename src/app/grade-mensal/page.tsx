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
import { disciplinaService, salaService, turmaService, alocacaoService } from "@/services/entities";
import { disciplinasProgressoService } from "@/services/disciplinas-progresso";

// Usando as interfaces do sistema de tipos
import type { Disciplina as DisciplinaBase, Turma, Sala, Horario, Alocacao } from '@/types/entities';

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
  const [novoModulo, setNovoModulo] = useState<Partial<NovoModulo>>({});
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
      
      setSalas(Array.from(salasMap.values()));
      setHorarios(Array.from(horariosMap.values()));
      
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

  const handleAdicionarModulo = async () => {
    try {
      // Em produção, isso seria uma chamada para a API
      console.log("Adicionando módulo:", novoModulo);

      // Simular adição do módulo
      const disciplinaAtualizada = disciplinas.find(
        (d) => d.id === novoModulo.id_disciplina
      );
      if (disciplinaAtualizada) {
        const novoModuloCompleto = {
          id: Date.now().toString(),
          data_inicio: novoModulo.data_inicio!,
          data_fim: novoModulo.data_fim!,
          ativo: true,
          horario: horarios.find((h) => h.id === novoModulo.id_horario)!,
          sala: salas.find((s) => s.id === novoModulo.id_sala)!,
        };

        disciplinaAtualizada.modulos.push(novoModuloCompleto);
        setDisciplinas([...disciplinas]);
      }

      setDialogAberto(false);
      setNovoModulo({});
    } catch (error) {
      console.error("Erro ao adicionar módulo:", error);
    }
  };

  const handleRemoverModulo = async (
    disciplinaId: string,
    moduloId: string
  ) => {
    try {
      // Em produção, isso seria uma chamada para a API
      console.log("Removendo módulo:", moduloId);

      const disciplina = disciplinas.find((d) => d.id === disciplinaId);
      if (disciplina) {
        disciplina.modulos = disciplina.modulos.filter(
          (m) => m.id !== moduloId
        );
        setDisciplinas([...disciplinas]);
      }
    } catch (error) {
      console.error("Erro ao remover módulo:", error);
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
                Adicionar Módulo
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Adicionar Módulo Extra</DialogTitle>
              </DialogHeader>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="disciplina">Disciplina</Label>
                  <Select
                    value={novoModulo.id_disciplina || ""}
                    onValueChange={(value) =>
                      setNovoModulo({ ...novoModulo, id_disciplina: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma disciplina" />
                    </SelectTrigger>
                    <SelectContent>
                      {disciplinas.map((disciplina) => (
                        <SelectItem key={disciplina.id} value={disciplina.id}>
                          {disciplina.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="sala">Sala</Label>
                  <Select
                    value={novoModulo.id_sala || ""}
                    onValueChange={(value) =>
                      setNovoModulo({ ...novoModulo, id_sala: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma sala" />
                    </SelectTrigger>
                    <SelectContent>
                      {salas.map((sala) => (
                        <SelectItem key={sala.id} value={sala.id}>
                          {sala.nome} - {sala.predio?.nome || 'Prédio não informado'}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="horario">Horário</Label>
                  <Select
                    value={novoModulo.id_horario || ""}
                    onValueChange={(value) =>
                      setNovoModulo({ ...novoModulo, id_horario: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um horário" />
                    </SelectTrigger>
                    <SelectContent>
                      {horarios.map((horario) => (
                        <SelectItem key={horario.id} value={horario.id}>
                          {horario.dia_semana} - {horario.codigo} (
                          {horario.horario_inicio} - {horario.horario_fim})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="data_inicio">Data de Início</Label>
                  <Input
                    id="data_inicio"
                    type="date"
                    value={novoModulo.data_inicio || ""}
                    onChange={(e) =>
                      setNovoModulo({
                        ...novoModulo,
                        data_inicio: e.target.value,
                      })
                    }
                  />
                </div>

                <div>
                  <Label htmlFor="data_fim">Data de Fim</Label>
                  <Input
                    id="data_fim"
                    type="date"
                    value={novoModulo.data_fim || ""}
                    onChange={(e) =>
                      setNovoModulo({ ...novoModulo, data_fim: e.target.value })
                    }
                  />
                </div>

                <div className="flex gap-2 pt-4">
                  <Button
                    onClick={handleAdicionarModulo}
                    disabled={
                      !novoModulo.id_disciplina ||
                      !novoModulo.id_sala ||
                      !novoModulo.id_horario ||
                      !novoModulo.data_inicio ||
                      !novoModulo.data_fim
                    }
                    className="flex-1"
                  >
                    Adicionar
                  </Button>
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
            <TabsTrigger value="modulos" className="flex items-center space-x-2">
              <Clock className="h-4 w-4" />
              <span>Gerenciar Módulos</span>
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

          {/* Gerenciamento de Módulos */}
          <TabsContent value="modulos">
            <Card>
              <CardHeader>
                <CardTitle>Gerenciar Módulos</CardTitle>
              </CardHeader>
              <CardContent>
            <div className="space-y-6">
              {disciplinas.map((disciplina) => (
                <div key={disciplina.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-medium text-lg">{disciplina.nome}</h3>
                      <p className="text-sm text-muted-foreground">
                        Carga horária: {disciplina.carga_horaria}/
                        {disciplina.total_aulas}h
                      </p>
                    </div>
                    <Badge variant="outline">
                      {disciplina.modulos.filter((m) => m.ativo).length}{" "}
                      módulo(s)
                    </Badge>
                  </div>

                  {/* Alocações principais */}
                  <div className="mb-4">
                    <h4 className="font-medium text-sm mb-2">
                      Alocações Principais:
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {disciplina.alocacoes.map((alocacao) => (
                        <div
                          key={alocacao.id}
                          className="bg-primary/10 border border-primary/20 rounded p-2"
                        >
                          <div className="text-sm font-medium">
                            {alocacao.horario.dia_semana} -{" "}
                            {alocacao.horario.codigo}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {alocacao.sala.nome} ({alocacao.sala.predio.nome})
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {alocacao.horario.horario_inicio} -{" "}
                            {alocacao.horario.horario_fim}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Módulos extras */}
                  {disciplina.modulos.length > 0 && (
                    <div>
                      <h4 className="font-medium text-sm mb-2">
                        Módulos Extras:
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {disciplina.modulos
                          .filter((m) => m.ativo)
                          .map((modulo) => (
                            <div
                              key={modulo.id}
                              className="bg-secondary/50 border border-secondary rounded p-2"
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex-1">
                                  <div className="text-sm font-medium">
                                    {modulo.horario.dia_semana} -{" "}
                                    {modulo.horario.codigo}
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    {modulo.sala.nome} ({modulo.sala.predio})
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    {modulo.horario.horario_inicio} -{" "}
                                    {modulo.horario.horario_fim}
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    {format(
                                      new Date(modulo.data_inicio),
                                      "dd/MM/yyyy",
                                      { locale: ptBR }
                                    )}{" "}
                                    -{" "}
                                    {format(
                                      new Date(modulo.data_fim),
                                      "dd/MM/yyyy",
                                      { locale: ptBR }
                                    )}
                                  </div>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    handleRemoverModulo(
                                      disciplina.id,
                                      modulo.id
                                    )
                                  }
                                  className="text-destructive hover:text-destructive/80"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
