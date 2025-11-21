"use client";

import { useEffect, useMemo, useState } from "react";
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
  Clock,
  Brain,
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
import { statsService, StatsResponse } from "@/services/stats";
import api from "@/lib/api";

interface ProximaAulaItem {
  titulo: string;
  detalhe: string;
  codigoHorario: string;
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
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [errorStats, setErrorStats] = useState<string | null>(null);
  const [proximasAulas, setProximasAulas] = useState<ProximaAulaItem[]>([]);
  const [loadingAulas, setLoadingAulas] = useState(true);
  const [errorAulas, setErrorAulas] = useState<string | null>(null);

  useEffect(() => {
    async function fetchStats() {
      setLoadingStats(true);
      setErrorStats(null);
      try {
        const data = await statsService.get();
        setStats(data);
      } catch (err: any) {
        setErrorStats(err?.message || "Falha ao carregar estatísticas");
      } finally {
        setLoadingStats(false);
      }
    }
    fetchStats();
  }, []);

  useEffect(() => {
    async function fetchProximasAulas() {
      setLoadingAulas(true);
      setErrorAulas(null);
      try {
        // Importante: usar a rota correta para evitar colisão com /alocacoes/:id
        const resp = await api.get('/grade-horarios');
        const grade = resp.data?.gradeHorarios || resp.data?.grade || resp.data || {};

        // Normalizar chaves de dias para facilitar
        const hojeIdx = new Date().getDay(); // 0-dom ... 6-sab
        const diaMap = ["domingo","segunda","terca","quarta","quinta","sexta","sabado"];
        const hojeKey = diaMap[hojeIdx];

        const candidates: any[] = grade[hojeKey] || grade[hojeKey.toUpperCase()] || [];

        // Gerar lista simplificada das próximas 3 aulas do dia, ordenadas por início
        const now = new Date();
        const proximas = (candidates || [])
          .filter((item: any) => item?.horario_inicio)
          .sort((a: any, b: any) => new Date(a.horario_inicio).getTime() - new Date(b.horario_inicio).getTime())
          .filter((item: any) => new Date(item.horario_fim).getTime() >= now.getTime())
          .slice(0, 3)
          .map((item: any): ProximaAulaItem => ({
            titulo: item?.disciplina?.nome || item?.disciplina_nome || 'Aula',
            detalhe: `${item?.turma?.nome || item?.turma_nome || ''} - ${item?.sala?.nome || item?.sala_nome || ''}`.trim(),
            codigoHorario: item?.horario?.codigo || item?.horario_codigo || '',
          }));

        setProximasAulas(proximas);
      } catch (err: any) {
        setErrorAulas(err?.message || "Falha ao carregar próximas aulas");
      } finally {
        setLoadingAulas(false);
      }
    }
    fetchProximasAulas();
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

  const statsCards = useMemo(() => [
    {
      title: "Total de Usuários",
      value: stats?.totals.usuarios || 0,
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
      adminOnly: true,
    },
    {
      title: "Disciplinas",
      value: stats?.totals.disciplinas || 0,
      icon: BookOpen,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
    {
      title: "Turmas",
      value: stats?.totals.turmas || 0,
      icon: GraduationCap,
      color: "text-orange-600",
      bgColor: "bg-orange-100",
    },
    {
      title: "Salas",
      value: stats?.totals.salas || 0,
      icon: MapPin,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      title: "Total de Alocações",
      value: stats?.totals.alocacoes || 0,
      icon: Calendar,
      color: "text-red-600",
      bgColor: "bg-red-100",
    },
    {
      title: "Alocações Hoje",
      value: stats?.hoje.alocacoesHoje || 0,
      icon: Clock,
      color: "text-indigo-600",
      bgColor: "bg-indigo-100",
    },
    {
      title: "Reservas Ativas",
      value: stats?.totals.reservasAtivas || 0,
      icon: CalendarRange,
      color: "text-teal-600",
      bgColor: "bg-teal-100",
    },
  ], [stats]);

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
                      {loadingStats ? "..." : stat.value}
                    </p>
                  </div>
                  <div className={`p-3 rounded-full ${stat.bgColor}`}>
                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
                {errorStats && (
                  <p className="text-xs text-destructive mt-2">{errorStats}</p>
                )}
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

        {/* Próximas Aulas (hoje) */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" /> Próximas Aulas (hoje)
            </CardTitle>
            <CardDescription>Baseadas na grade geral de alocações</CardDescription>
          </CardHeader>
          <CardContent>
            {loadingAulas && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="h-4 w-4 animate-spin" /> Carregando...
              </div>
            )}
            {errorAulas && (
              <p className="text-sm text-destructive">{errorAulas}</p>
            )}
            {!loadingAulas && !errorAulas && (
              <div className="space-y-3">
                {proximasAulas.length === 0 && (
                  <p className="text-sm text-muted-foreground">Nenhuma aula próxima para hoje.</p>
                )}
                {proximasAulas.map((aula, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <div>
                      <p className="font-medium text-foreground">{aula.titulo}</p>
                      <p className="text-sm text-muted-foreground">{aula.detalhe}</p>
                    </div>
                    <Badge variant="outline">{aula.codigoHorario || "-"}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Link para visão completa de Alocações */}
        <div className="flex justify-end">
          <Link href="/alocacoes" className="text-sm text-primary hover:underline">
            Ver todas as alocações →
          </Link>
        </div>
      </div>
    </MainLayout>
  );
}
