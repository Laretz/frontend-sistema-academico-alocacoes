"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth";
import { MainLayout } from "@/components/layout/main-layout";
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
  Users,
  BookOpen,
  GraduationCap,
  MapPin,
  Calendar,
  CalendarDays,
  TrendingUp,
  Clock,
  Eye,
  EyeOff,
  Brain,
  Building,
  School,
  ArrowLeft,
  Library,
  Building2,
  Plus,
  Grid3X3,
  CalendarRange,
  Layers,
  Users2,
} from "lucide-react";
import Link from "next/link";

interface DashboardStats {
  totalUsuarios: number;
  totalDisciplinas: number;
  totalTurmas: number;
  totalSalas: number;
  totalAlocacoes: number;
  alocacoesHoje: number;
}

interface DiasHorario {
  segunda: string;
  terca: string;
  quarta: string;
  quinta: string;
  sexta: string;
}

interface GradeHorarios {
  [turma: string]: {
    [horario: string]: DiasHorario;
  };
}

// Dados das alocações serão carregados do backend

// Grade de horários será carregada do backend

export default function DashboardPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [stats, setStats] = useState<DashboardStats>({
    totalUsuarios: 0,
    totalDisciplinas: 0,
    totalTurmas: 0,
    totalSalas: 0,
    totalAlocacoes: 0,
    alocacoesHoje: 0,
  });
  const [loading, setLoading] = useState(true);
  const [showAlocacoes, setShowAlocacoes] = useState(true);

  useEffect(() => {
    // Simular carregamento de estatísticas
    setTimeout(() => {
      setStats({
        totalUsuarios: 45,
        totalDisciplinas: 14,
        totalTurmas: 2,
        totalSalas: 6,
        totalAlocacoes: 14,
        alocacoesHoje: 8,
      });
      setLoading(false);
    }, 1000);
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Bom dia";
    if (hour < 18) return "Boa tarde";
    return "Boa noite";
  };

  const getStatusColor = (vagas: number, demanda: number) => {
    const ocupacao = (demanda / vagas) * 100;
    if (ocupacao > 100) return "bg-destructive/10 text-destructive";
    if (ocupacao > 80) return "bg-yellow-50 text-yellow-700";
    return "bg-secondary/50 text-secondary-foreground";
  };

  const getStatusText = (vagas: number, demanda: number) => {
    const ocupacao = (demanda / vagas) * 100;
    if (ocupacao > 100) return "Superlotada";
    if (ocupacao > 80) return "Quase Cheia";
    return "Disponível";
  };

  const quickActions = [
    {
      title: "Alocação Automática",
      description: "Gerar alocações usando inteligência artificial",
      href: "/alocacao-automatica",
      icon: Brain,
      color: "bg-blue-600",
    },
    {
      title: "Gerenciar Cursos",
      description: "Visualizar e gerenciar cursos",
      href: "/cursos",
      icon: Library,
      color: "bg-emerald-600",
    },
    {
      title: "Gerenciar Prédios",
      description: "Visualizar e gerenciar prédios",
      href: "/predios",
      icon: Building2,
      color: "bg-slate-600",
    },
    {
      title: "Nova Alocação",
      description: "Criar uma nova alocação de horário",
      href: "/alocacoes/nova",
      icon: Plus,
      color: "bg-green-600",
    },
    {
      title: "Ver Grade",
      description: "Visualizar grade de horários",
      href: "/grade-horarios",
      icon: Grid3X3,
      color: "bg-teal-600",
    },
    {
      title: "Grade Mensal",
      description: "Visualizar cronograma mensal das disciplinas",
      href: "/grade-mensal",
      icon: CalendarRange,
      color: "bg-indigo-600",
    },
    {
      title: "Gerenciar Disciplinas",
      description: "Adicionar ou editar disciplinas",
      href: "/disciplinas",
      icon: Layers,
      color: "bg-purple-600",
    },
    {
      title: "Gerenciar Turmas",
      description: "Adicionar ou editar turmas",
      href: "/turmas",
      icon: Users2,
      color: "bg-orange-600",
    },
  ];

  const statsCards = [
    {
      title: "Total de Usuários",
      value: stats.totalUsuarios,
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
      adminOnly: true,
    },
    {
      title: "Disciplinas",
      value: stats.totalDisciplinas,
      icon: BookOpen,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
    {
      title: "Turmas",
      value: stats.totalTurmas,
      icon: GraduationCap,
      color: "text-orange-600",
      bgColor: "bg-orange-100",
    },
    {
      title: "Salas",
      value: stats.totalSalas,
      icon: MapPin,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      title: "Total de Alocações",
      value: stats.totalAlocacoes,
      icon: Calendar,
      color: "text-red-600",
      bgColor: "bg-red-100",
    },
    {
      title: "Alocações Hoje",
      value: stats.alocacoesHoje,
      icon: Clock,
      color: "text-indigo-600",
      bgColor: "bg-indigo-100",
    },
  ];

  const filteredStatsCards = statsCards.filter((card) => {
    if (card.adminOnly && user?.role !== "ADMIN") {
      return false;
    }
    return true;
  });

  const filteredQuickActions = quickActions.filter((action) => {
    // Filtrar ações baseadas no perfil do usuário se necessário
    return true;
  });

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.back()}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                {getGreeting()}, {user?.nome}!
              </h1>
              <p className="text-muted-foreground">
                Bem-vindo ao Sistema de Alocação Acadêmica
              </p>
            </div>
          </div>
          <Badge variant="outline" className="text-sm">
            {user?.role}
          </Badge>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStatsCards.map((stat, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      {stat.title}
                    </p>
                    <p className="text-2xl font-bold text-foreground">
                      {loading ? "..." : stat.value}
                    </p>
                  </div>
                  <div className={`p-3 rounded-full ${stat.bgColor}`}>
                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Ações Rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredQuickActions.map((action, index) => (
            <Card
              key={index}
              className="hover:shadow-md transition-shadow cursor-pointer"
            >
              <Link href={action.href}>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className={`p-3 rounded-full ${action.color}`}>
                      <action.icon className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">
                        {action.title}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {action.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Link>
            </Card>
          ))}
        </div>

        {/* Alocações por Turma */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl">Alocações por Turma</CardTitle>
                <CardDescription>
                  Visualização detalhada das disciplinas alocadas por período e
                  turno
                </CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAlocacoes(!showAlocacoes)}
              >
                {showAlocacoes ? (
                  <>
                    <EyeOff className="h-4 w-4 mr-2" /> Ocultar
                  </>
                ) : (
                  <>
                    <Eye className="h-4 w-4 mr-2" /> Mostrar
                  </>
                )}
              </Button>
            </div>
          </CardHeader>
          {showAlocacoes && (
            <CardContent className="p-0">
              <div className="space-y-8 p-6">
                {Object.entries({} as any).map(([turma, disciplinas]) => (
                  <div key={turma} className="space-y-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h3 className="text-lg font-semibold text-blue-900">
                        {turma}
                      </h3>
                      <p className="text-sm text-blue-700">
                        {disciplinas.length} disciplinas alocadas
                      </p>
                    </div>

                    {/* Tabela de Disciplinas */}
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
                              Local 1
                            </th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase border-r">
                              Local 2
                            </th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase border-r">
                              Vagas
                            </th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase border-r">
                              Demanda
                            </th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground uppercase">
                              Status
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-background divide-y divide-border">
                          {disciplinas.map((disciplina, index) => (
                            <tr
                              key={disciplina.codigo}
                              className={
                                index % 2 === 0 ? "bg-background" : "bg-muted/30"
                              }
                            >
                              <td className="px-3 py-2 text-sm font-medium text-foreground border-r border-border">
                                {disciplina.codigo}
                              </td>
                              <td className="px-3 py-2 border-r border-border">
                                <Badge
                                  variant="outline"
                                  className="font-mono text-xs"
                                >
                                  {disciplina.prefixo}
                                </Badge>
                              </td>
                              <td className="px-3 py-2 text-sm text-foreground border-r border-border max-w-xs">
                                {disciplina.disciplina}
                              </td>
                              <td className="px-3 py-2 text-sm text-foreground border-r border-border">
                                {disciplina.ch}h
                              </td>
                              <td className="px-3 py-2 text-sm text-foreground font-mono border-r border-border">
                                {(disciplina.horario1 && disciplina.horario2 ? 
                                  `${disciplina.horario1}, ${disciplina.horario2}` : 
                                  disciplina.horario1 || disciplina.horario2 || "-")}
                              </td>
                              <td className="px-3 py-2 text-sm text-foreground border-r border-border">
                                {disciplina.professor}
                              </td>
                              <td className="px-3 py-2 text-sm text-foreground border-r border-border">
                                {disciplina.local1}
                              </td>
                              <td className="px-3 py-2 text-sm text-gray-900 border-r">
                                {disciplina.local2 || "-"}
                              </td>
                              <td className="px-3 py-2 text-sm text-gray-900 border-r">
                                {disciplina.vagas}
                              </td>
                              <td className="px-3 py-2 text-sm text-gray-900 border-r">
                                {disciplina.demanda}
                              </td>
                              <td className="px-3 py-2">
                                <Badge
                                  className={getStatusColor(
                                    disciplina.vagas,
                                    disciplina.demanda
                                  )}
                                >
                                  {getStatusText(
                                    disciplina.vagas,
                                    disciplina.demanda
                                  )}
                                </Badge>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Grade de Horários */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="text-md font-semibold text-gray-900 mb-3">
                        Grade de Horários
                      </h4>
                      <div className="overflow-x-auto">
                        <table className="w-full border border-gray-300">
                          <thead>
                            <tr className="bg-gray-100">
                              <th className="border border-gray-300 px-2 py-1 text-sm font-medium text-gray-700">
                                Horário
                              </th>
                              <th className="border border-gray-300 px-2 py-1 text-sm font-medium text-gray-700">
                                Segunda
                              </th>
                              <th className="border border-gray-300 px-2 py-1 text-sm font-medium text-gray-700">
                                Terça
                              </th>
                              <th className="border border-gray-300 px-2 py-1 text-sm font-medium text-gray-700">
                                Quarta
                              </th>
                              <th className="border border-gray-300 px-2 py-1 text-sm font-medium text-gray-700">
                                Quinta
                              </th>
                              <th className="border border-gray-300 px-2 py-1 text-sm font-medium text-gray-700">
                                Sexta
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {Object.entries({} as { [horario: string]: DiasHorario }).map(
                              ([horario, dias]: [string, DiasHorario]) => (
                                <tr key={horario}>
                                  <td className="border border-gray-300 px-2 py-1 text-sm font-medium text-gray-900 bg-gray-50">
                                    {horario}
                                  </td>
                                  <td className="border border-gray-300 px-2 py-1 text-sm text-center">
                                    {dias.segunda && (
                                      <Badge
                                        variant="secondary"
                                        className="text-xs"
                                      >
                                        {dias.segunda}
                                      </Badge>
                                    )}
                                  </td>
                                  <td className="border border-gray-300 px-2 py-1 text-sm text-center">
                                    {dias.terca && (
                                      <Badge
                                        variant="secondary"
                                        className="text-xs"
                                      >
                                        {dias.terca}
                                      </Badge>
                                    )}
                                  </td>
                                  <td className="border border-gray-300 px-2 py-1 text-sm text-center">
                                    {dias.quarta && (
                                      <Badge
                                        variant="secondary"
                                        className="text-xs"
                                      >
                                        {dias.quarta}
                                      </Badge>
                                    )}
                                  </td>
                                  <td className="border border-gray-300 px-2 py-1 text-sm text-center">
                                    {dias.quinta && (
                                      <Badge
                                        variant="secondary"
                                        className="text-xs"
                                      >
                                        {dias.quinta}
                                      </Badge>
                                    )}
                                  </td>
                                  <td className="border border-gray-300 px-2 py-1 text-sm text-center">
                                    {dias.sexta && (
                                      <Badge
                                        variant="secondary"
                                        className="text-xs"
                                      >
                                        {dias.sexta}
                                      </Badge>
                                    )}
                                  </td>
                                </tr>
                              )
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          )}
        </Card>

        {/* Resumo Recente */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5" />
                <span>Atividade Recente</span>
              </CardTitle>
              <CardDescription>
                Últimas ações realizadas no sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Nova alocação criada</p>
                    <p className="text-xs text-gray-500">Há 2 horas</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Disciplina atualizada</p>
                    <p className="text-xs text-gray-500">Há 4 horas</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Nova turma cadastrada</p>
                    <p className="text-xs text-gray-500">Ontem</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="h-5 w-5" />
                <span>Próximas Aulas</span>
              </CardTitle>
              <CardDescription>Aulas agendadas para hoje</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">Banco de Dados</p>
                    <p className="text-sm text-gray-600">2º Período - Lab 2</p>
                  </div>
                  <Badge variant="outline">4M23</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">POO</p>
                    <p className="text-sm text-gray-600">2º Período - Lab 1</p>
                  </div>
                  <Badge variant="outline">3M23</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">Ciência de Dados</p>
                    <p className="text-sm text-gray-600">4º Período - Lab 1</p>
                  </div>
                  <Badge variant="outline">2T12</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}
