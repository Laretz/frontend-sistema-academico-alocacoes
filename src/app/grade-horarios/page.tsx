"use client";

import { useEffect, useState } from "react";
import { MainLayout } from "@/components/layout/main-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CalendarDays, GraduationCap, MapPin, User } from "lucide-react";
import { alocacaoService } from "@/services/entities";
import { turmaService } from "@/services/entities";
import { salaService } from "@/services/entities";
import { userService } from "@/services/users";
import type {
  Turma,
  Sala,
  User as Usuario,
  GradeHorario,
  Alocacao,
} from "@/types/entities";
import { converterHorarioParaCodigo } from "@/utils/horario-consolidado";
import { Fragment } from "react";

const diasSemana = [
  { key: "SEGUNDA", label: "Segunda" },
  { key: "TERCA", label: "Terça" },
  { key: "QUARTA", label: "Quarta" },
  { key: "QUINTA", label: "Quinta" },
  { key: "SEXTA", label: "Sexta" },
  { key: "SABADO", label: "Sábado" },
];

const codigosHorario = [
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

export default function GradeHorariosPage() {
  const [tab, setTab] = useState<string>("turma");
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [salas, setSalas] = useState<Sala[]>([]);
  const [professores, setProfessores] = useState<Usuario[]>([]);
  const [turmaId, setTurmaId] = useState<string>("");
  const [salaId, setSalaId] = useState<string>("");
  const [profId, setProfId] = useState<string>("");
  const [grade, setGrade] = useState<GradeHorario | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const carregarListas = async () => {
      try {
        const [turmasRes, salasRes, profsRes] = await Promise.all([
          turmaService.getAll(1, 100).catch(() => ({ turmas: [] as Turma[] })),
          salaService.getAll(1).catch(() => ({ salas: [] as Sala[] })),
          userService.getAll(1).catch(() => ({ usuarios: [] as Usuario[] })),
        ]);
        setTurmas(turmasRes.turmas || []);
        setSalas(salasRes.salas || []);
        const profs = (profsRes.usuarios || []).filter(
          (u) => u.role === "PROFESSOR"
        );
        setProfessores(profs);
        if (turmasRes.turmas && turmasRes.turmas.length > 0)
          setTurmaId(turmasRes.turmas[0].id);
      } catch (err) {
        setTurmas([]);
        setSalas([]);
        setProfessores([]);
      }
    };
    carregarListas();
  }, []);

  const carregarGrade = async () => {
    try {
      setLoading(true);
      let filtros: { id_turma?: string; id_user?: string; id_sala?: string } =
        {};
      if (tab === "turma" && turmaId) filtros.id_turma = turmaId;
      if (tab === "sala" && salaId) filtros.id_sala = salaId;
      if (tab === "prof" && profId) filtros.id_user = profId;
      const data = await alocacaoService.getGradeHorarios(filtros);
      // O backend pode retornar em diferentes formatos:
      // 1) { gradeHorarios: { segunda: HorarioAlocacao[], ... } }
      // 2) { grade: GradeHorario }
      // 3) GradeHorario direto
      const dataMap = data as unknown as { grade?: unknown; gradeHorarios?: unknown };
      const gradeObj = (dataMap.grade ?? dataMap.gradeHorarios ?? data) as unknown;

      // Normalizar para o formato esperado pelo componente: GradeHorario
      // Estrutura: { DIA: { CODIGO: Alocacao[] } }
      const normalizeGrade = (raw: unknown): GradeHorario => {
        if (!raw || typeof raw !== "object") return {} as GradeHorario;

        const dias = Object.keys(raw);
        const result: GradeHorario = {} as GradeHorario;

        const diaMap: Record<string, string> = {
          segunda: "SEGUNDA",
          "segunda-feira": "SEGUNDA",
          terca: "TERCA",
          "terca-feira": "TERCA",
          terça: "TERCA",
          "terça-feira": "TERCA",
          quarta: "QUARTA",
          "quarta-feira": "QUARTA",
          quinta: "QUINTA",
          "quinta-feira": "QUINTA",
          sexta: "SEXTA",
          "sexta-feira": "SEXTA",
          sabado: "SABADO",
          sábado: "SABADO",
        };

        dias.forEach((diaKey) => {
          const lista = raw[diaKey];
          const destKey =
            diaMap[String(diaKey).toLowerCase()] ||
            String(diaKey).toUpperCase();
          // Se veio como mapa por código (turma/sala endpoints), converter cada entrada em array
          if (lista && !Array.isArray(lista)) {
            result[destKey] = {} as Record<string, Alocacao[]>;
            const map = lista as Record<string, unknown>;
            Object.keys(map || {}).forEach((codigo: string) => {
              const item = map[codigo] as unknown as {
                id?: string;
                disciplina?: { id?: string; nome?: string; cargaHoraria?: number; cargaHorariaTotal?: number; codigo?: string; horario_consolidado?: string };
                professor?: { id?: string; nome?: string; email?: string };
                turma?: { id?: string; nome?: string; num_alunos?: number; periodo?: number; turno?: string };
                sala?: { id?: string; nome?: string; capacidade?: number; tipo?: string; predio?: string };
                horario?: { id?: string; codigo?: string; dia_semana?: string; horario_inicio?: string; horario_fim?: string };
              };
              if (!item) {
                result[destKey][codigo] = [];
                return;
              }
              // item tem estrutura AlocacaoInfo
              const alocacaoLike: Alocacao = {
                id: String(item.id || ""),
                id_user: String(item.professor?.id || ""),
                id_disciplina: String(item.disciplina?.id || ""),
                id_turma: String(item.turma?.id || ""),
                id_sala: String(item.sala?.id || ""),
                id_horario: String(item.horario?.id || ""),
                is_modulo_principal: false,
                created_at: new Date().toISOString(),
                user: item.professor
                  ? {
                      id: String(item.professor.id || ""),
                      nome: String(item.professor.nome || ""),
                      email: String(item.professor.email || ""),
                      role: "PROFESSOR",
                    }
                  : undefined,
                disciplina: item.disciplina
                  ? {
                      id: String(item.disciplina.id || ""),
                      nome: String(item.disciplina.nome || ""),
                      carga_horaria: Number(
                        item.disciplina.cargaHoraria ?? item.disciplina.cargaHorariaTotal ?? 0
                      ),
                      total_aulas: 0,
                      tipo_de_sala: "Sala",
                      periodo_letivo: "",
                      semestre: 0,
                      obrigatoria: true,
                      codigo: item.disciplina.codigo || undefined,
                      horario_consolidado: item.disciplina.horario_consolidado || undefined,
                      id_curso: "",
                    }
                  : undefined,
                turma: item.turma
                  ? {
                      id: String(item.turma.id || ""),
                      nome: String(item.turma.nome || ""),
                      num_alunos: Number(item.turma.num_alunos || 0),
                      periodo: Number(item.turma.periodo || 0),
                      turno: String(item.turma.turno || ""),
                      id_curso: "",
                    }
                  : undefined,
                sala: item.sala
                  ? {
                      id: String(item.sala.id || ""),
                      nome: String(item.sala.nome || ""),
                      predio: {
                        id: "",
                        nome: String(item.sala.predio || ""),
                        codigo: "",
                      },
                      capacidade: Number(item.sala.capacidade || 0),
                      tipo: String(item.sala.tipo || "Sala"),
                      computadores: 0,
                    }
                  : undefined,
                horario: {
                  id: String(item.horario?.id || ""),
                  codigo: String(item.horario?.codigo || codigo),
                  dia_semana: String(item.horario?.dia_semana || destKey),
                  horario_inicio: String(item.horario?.horario_inicio || ""),
                  horario_fim: String(item.horario?.horario_fim || ""),
                },
              };
              result[destKey][codigo] = [alocacaoLike];
            });
            return;
          }

          // Caso seja uma lista de HorarioAlocacao, converter para mapa por código
          result[destKey] = {} as Record<string, Alocacao[]>;
          type RawItem = {
            id?: string;
            professor?: { id?: string; nome?: string; email?: string };
            user?: { id?: string; nome?: string; email?: string };
            disciplina?: {
              id?: string;
              nome?: string;
              cargaHoraria?: number;
              carga_horaria?: number;
              total_aulas?: number;
              tipo_de_sala?: string;
              periodo_letivo?: string;
              semestre?: number;
              obrigatoria?: boolean;
              codigo?: string;
              horario_consolidado?: string;
              id_curso?: string;
              curso?: { id?: string };
            };
            turma?: {
              id?: string;
              nome?: string;
              num_alunos?: number;
              periodo?: number;
              turno?: string;
              id_curso?: string;
              curso?: { id?: string };
            };
            sala?: {
              id?: string;
              nome?: string;
              predio?: string | { nome?: string };
              capacidade?: number;
              tipo?: string;
            };
            horario?: {
              id?: string;
              codigo?: string;
              dia_semana?: string;
              horario_inicio?: string;
              horario_fim?: string;
            };
            horario_inicio?: string;
            horario_fim?: string;
          };
          const items: RawItem[] = Array.isArray(lista) ? (lista as RawItem[]) : [];
          items.forEach((item: RawItem) => {
            // Tentar obter/derivar o código do horário
            const codigo =
              item?.horario?.codigo ||
              item?.codigo ||
              (item?.horario_inicio || item?.horario?.horario_inicio
                ? converterHorarioParaCodigo(
                    String(
                      item?.horario_inicio || item?.horario?.horario_inicio
                    )
                  )
                : undefined);
            if (!codigo) return;
            if (!result[destKey][codigo]) result[destKey][codigo] = [];

            // Converter para um objeto semelhante a Alocacao usado na UI
            const alocacaoLike: Alocacao = {
              id: String(item?.id || ""),
              id_user: String(item?.professor?.id || item?.user?.id || ""),
              id_disciplina: String(item?.disciplina?.id || ""),
              id_turma: String(item?.turma?.id || ""),
              id_sala: String(item?.sala?.id || ""),
              id_horario: String(item?.horario?.id || ""),
              is_modulo_principal: false,
              created_at: new Date().toISOString(),
              user: item?.professor
                ? {
                    id: String(item.professor.id || ""),
                    nome: String(item.professor.nome || ""),
                    email: String(item.professor.email || ""),
                    role: "PROFESSOR",
                  }
                : item?.user,
              disciplina: item?.disciplina
                ? {
                    id: String(item.disciplina.id || ""),
                    nome: String(item.disciplina.nome || ""),
                    carga_horaria: Number(
                      item.disciplina.cargaHoraria ||
                        item.disciplina.carga_horaria ||
                        0
                    ),
                    total_aulas: Number(item.disciplina.total_aulas || 0),
                    tipo_de_sala: String(
                      item.disciplina.tipo_de_sala || "Sala"
                    ),
                    periodo_letivo: String(item.disciplina.periodo_letivo || ""),
                    semestre: Number(item.disciplina.semestre || 0),
                    obrigatoria: Boolean(item.disciplina.obrigatoria ?? true),
                    codigo: (item.disciplina.codigo as string) || undefined,
                    horario_consolidado:
                      (item.disciplina.horario_consolidado as string) ||
                      undefined,
                    id_curso: String(
                      item.disciplina.id_curso ||
                        item.disciplina.curso?.id ||
                        ""
                    ),
                  }
                : undefined,
              turma: item?.turma
                ? {
                    id: String(item.turma.id || ""),
                    nome: String(item.turma.nome || ""),
                    num_alunos: Number(item.turma.num_alunos || 0),
                    periodo: Number(item.turma.periodo || 0),
                    turno: String(item.turma.turno || ""),
                    id_curso: String(
                      item.turma.id_curso || item.turma.curso?.id || ""
                    ),
                  }
                : undefined,
              sala: item?.sala
                ? {
                    id: String(item.sala.id || ""),
                    nome: String(item.sala.nome || ""),
                    predio: {
                      id: "",
                      nome: (() => {
                        const p = item.sala?.predio;
                        if (typeof p === "object" && p) return String((p as { nome?: string }).nome || "");
                        return String(p || "");
                      })(),
                      codigo: "",
                    },
                    capacidade: Number(item.sala.capacidade || 0),
                    tipo: String(item.sala.tipo || "Sala"),
                    computadores: Number(item.sala.computadores || 0),
                  }
                : undefined,
              horario: {
                id: String(item?.horario?.id || ""),
                codigo: String(item?.horario?.codigo || codigo),
                dia_semana: String(item?.horario?.dia_semana || destKey),
                horario_inicio: String(
                  item?.horario_inicio || item?.horario?.horario_inicio || ""
                ),
                horario_fim: String(
                  item?.horario_fim || item?.horario?.horario_fim || ""
                ),
              },
            };

            result[destKey][codigo].push(alocacaoLike);
          });
        });

        return result;
      };

      const normalized = normalizeGrade(gradeObj);
      // Garantir presença de todas as colunas M/T/N, mesmo sem alocação
      const ensureCodes = (obj: GradeHorario) => {
        const allDays = ["SEGUNDA","TERCA","QUARTA","QUINTA","SEXTA","SABADO"];
        allDays.forEach((dia) => {
          if (!obj[dia]) obj[dia] = {} as Record<string, Alocacao[]>;
          codigosHorario.forEach((c) => {
            if (!obj[dia]![c]) obj[dia]![c] = [] as Alocacao[];
          });
        });
        return obj;
      };
      const completed = ensureCodes(normalized);
      setGrade(completed);
    } catch (err) {
      // Mantém a grade atual em caso de erro para evitar "sumir"
      console.error("Falha ao carregar grade:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // carregar automaticamente a grade quando mudar filtros
    carregarGrade();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, turmaId, salaId, profId]);

  const renderCelula = (diaKey: string, codigo: string) => {
    const lista: Alocacao[] = grade?.[diaKey]?.[codigo] || [];
    if (!lista.length) {
      return <div className="text-xs text-muted-foreground">Livre</div>;
    }
    // Mostrar a primeira alocação e um contador se houver mais
    const a = lista[0];
    const extra = lista.length > 1 ? ` (+${lista.length - 1})` : "";
    return (
      <div className="space-y-1">
        {a.disciplina && (
          <div className="text-xs font-medium truncate">
            {a.disciplina.nome}
            {extra}
          </div>
        )}
        <div className="flex gap-1 items-center">
          {a.user && (
            <Badge variant="secondary" className="text-[10px]">
              {typeof a.user === "object" ? a.user.nome : "Professor"}
            </Badge>
          )}
          {a.turma && (
            <Badge variant="outline" className="text-[10px]">
              {a.turma.nome}
            </Badge>
          )}
          {a.sala && (
            <Badge variant="outline" className="text-[10px]">
              {a.sala.nome}
            </Badge>
          )}
        </div>
      </div>
    );
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Grade de Horários
            </h1>
            <p className="text-muted-foreground">
              Visualize a grade por Turma, Sala ou Professor
            </p>
          </div>
        </div>

        <Tabs value={tab} onValueChange={setTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="turma" className="flex items-center gap-2">
              <GraduationCap className="h-4 w-4" /> Turma
            </TabsTrigger>
            <TabsTrigger value="sala" className="flex items-center gap-2">
              <MapPin className="h-4 w-4" /> Sala
            </TabsTrigger>
            <TabsTrigger value="prof" className="flex items-center gap-2">
              <User className="h-4 w-4" /> Professor
            </TabsTrigger>
          </TabsList>

          <TabsContent value="turma">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GraduationCap className="h-5 w-5" /> Selecionar Turma
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="max-w-sm">
                  <Select value={turmaId} onValueChange={setTurmaId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Escolha uma turma" />
                    </SelectTrigger>
                    <SelectContent>
                      {turmas.map((t) => (
                        <SelectItem key={t.id} value={t.id}>
                          {t.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <GradeGrid grade={grade} loading={loading} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sala">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" /> Selecionar Sala
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="max-w-sm">
                  <Select value={salaId} onValueChange={setSalaId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Escolha uma sala" />
                    </SelectTrigger>
                    <SelectContent>
                      {salas.map((s) => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.nome} - {s.predio?.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <GradeGrid grade={grade} loading={loading} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="prof">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" /> Selecionar Professor
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="max-w-sm">
                  <Select value={profId} onValueChange={setProfId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Escolha um professor" />
                    </SelectTrigger>
                    <SelectContent>
                      {professores.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <GradeGrid grade={grade} loading={loading} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}

function GradeGrid({
  grade,
  loading,
}: {
  grade: GradeHorario | null;
  loading: boolean;
}) {
  return (
    <div className="overflow-x-auto">
      <div className="min-w-[900px]">
        <div className="grid grid-cols-[120px_repeat(6,1fr)] gap-2">
          {/* Cabeçalhos */}
          <div />
          {codigosHorario.slice(0, 6).map((c) => (
            <div
              key={c}
              className="text-xs font-medium text-center py-2 bg-muted rounded"
            >
              {c}
            </div>
          ))}
          {/* Linhas Manhã */}
          {diasSemana.map((d) => (
            <Fragment key={`m-${d.key}`}>
              <div
                key={`${d.key}-label`}
                className="flex items-center gap-2 text-sm font-semibold"
              >
                <CalendarDays className="h-4 w-4" /> {d.label}
              </div>
              {codigosHorario.slice(0, 6).map((c) => (
                <div
                  key={`${d.key}-${c}`}
                  className="border rounded p-2 min-h-[72px]"
                >
                  {loading ? (
                    <div className="text-xs text-muted-foreground">
                      Carregando...
                    </div>
                  ) : (
                    <CellContent grade={grade} diaKey={d.key} codigo={c} />
                  )}
                </div>
              ))}
            </Fragment>
          ))}
          {/* Cabeçalhos Tarde */}
          <div />
          {codigosHorario.slice(6, 12).map((c) => (
            <div
              key={`t-${c}`}
              className="text-xs font-medium text-center py-2 bg-muted rounded"
            >
              {c}
            </div>
          ))}
          {/* Linhas Tarde */}
          {diasSemana.map((d) => (
            <Fragment key={`t-${d.key}`}>
              <div
                key={`${d.key}-label-t`}
                className="flex items-center gap-2 text-sm font-semibold"
              >
                <CalendarDays className="h-4 w-4" /> {d.label}
              </div>
              {codigosHorario.slice(6, 12).map((c) => (
                <div
                  key={`${d.key}-${c}`}
                  className="border rounded p-2 min-h-[72px]"
                >
                  {loading ? (
                    <div className="text-xs text-muted-foreground">
                      Carregando...
                    </div>
                  ) : (
                    <CellContent grade={grade} diaKey={d.key} codigo={c} />
                  )}
                </div>
              ))}
            </Fragment>
          ))}
          {/* Cabeçalhos Noite */}
          <div />
          {codigosHorario.slice(12).map((c) => (
            <div
              key={`n-${c}`}
              className="text-xs font-medium text-center py-2 bg-muted rounded"
            >
              {c}
            </div>
          ))}
          {/* Linhas Noite */}
          {diasSemana.map((d) => (
            <Fragment key={`n-${d.key}`}>
              <div
                key={`${d.key}-label-n`}
                className="flex items-center gap-2 text-sm font-semibold"
              >
                <CalendarDays className="h-4 w-4" /> {d.label}
              </div>
              {codigosHorario.slice(12).map((c) => (
                <div
                  key={`${d.key}-${c}`}
                  className="border rounded p-2 min-h-[72px]"
                >
                  {loading ? (
                    <div className="text-xs text-muted-foreground">
                      Carregando...
                    </div>
                  ) : (
                    <CellContent grade={grade} diaKey={d.key} codigo={c} />
                  )}
                </div>
              ))}
            </Fragment>
          ))}
        </div>
      </div>
    </div>
  );
}

function CellContent({
  grade,
  diaKey,
  codigo,
}: {
  grade: GradeHorario | null;
  diaKey: string;
  codigo: string;
}) {
  const lista: Alocacao[] = grade?.[diaKey]?.[codigo] || [];
  if (!lista.length)
    return <div className="text-xs text-muted-foreground">Livre</div>;
  const a = lista[0];
  const extra = lista.length > 1 ? ` (+${lista.length - 1})` : "";
  return (
    <div className="space-y-1">
      {a.disciplina && (
        <div className="text-xs font-medium truncate">
          {a.disciplina.nome}
          {extra}
        </div>
      )}
      <div className="flex gap-1 flex-wrap">
        {a.user && (
          <Badge variant="secondary" className="text-[10px]">
            {typeof a.user === "object" ? a.user.nome : "Professor"}
          </Badge>
        )}
        {a.turma && (
          <Badge variant="outline" className="text-[10px]">
            {a.turma.nome}
          </Badge>
        )}
        {a.sala && (
          <Badge variant="outline" className="text-[10px]">
            {a.sala.nome}
          </Badge>
        )}
      </div>
    </div>
  );
}
