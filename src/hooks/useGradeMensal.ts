import { useCallback, useEffect, useMemo, useState } from "react";
import { alocacaoService, horarioService, periodoLetivoService, turmaService } from "@/services/entities";
import { disciplinasProgressoService } from "@/services/disciplinas-progresso";
import type { DisciplinaComProgresso, Turma } from "@/types/entities";
import type { GradeMensalAlocacaoVM, GradeMensalDisciplinaVM } from "@/types/view-models/grade-mensal";

type PeriodoAtivo = { data_inicio: string; data_fim: string; nome: string };

type GradeConfig = {
  dias: Array<{ key: string; label: string }>;
  codigos: string[];
};

const normalizeTipoDeSala = (value: unknown): "Sala" | "Lab" => {
  if (typeof value !== "string") return "Sala";
  const v = value.trim().toLowerCase();
  if (v === "lab" || v === "laboratorio" || v === "laboratório") return "Lab";
  return "Sala";
};

const getPredioNome = (predio: unknown): string => {
  if (typeof predio === "string") return predio;
  if (predio && typeof predio === "object") {
    const nome = (predio as { nome?: unknown }).nome;
    if (typeof nome === "string") return nome;
  }
  return "";
};

function resolveYmd(value?: string | null): string | undefined {
  if (!value) return undefined;
  return new Date(value).toISOString().split("T")[0];
}

function clampToPeriodo(inicio?: string, fim?: string, periodo?: PeriodoAtivo | null) {
  if (!periodo?.data_inicio || !periodo?.data_fim) return { inicio, fim };
  if (!inicio || !fim) return { inicio, fim };
  const start = new Date(`${inicio}T00:00:00Z`);
  const end = new Date(`${fim}T23:59:59Z`);
  const pStart = new Date(`${periodo.data_inicio}T00:00:00Z`);
  const pEnd = new Date(`${periodo.data_fim}T23:59:59Z`);
  const clampedStart = start < pStart ? pStart : start;
  const clampedEnd = end > pEnd ? pEnd : end;
  return {
    inicio: clampedStart.toISOString().split("T")[0],
    fim: clampedEnd.toISOString().split("T")[0],
  };
}

export function useGradeMensal() {
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [turmaSelecionadaId, setTurmaSelecionadaId] = useState<string>("");
  const [periodoAtivo, setPeriodoAtivo] = useState<PeriodoAtivo | null>(null);
  const [gradeConfig, setGradeConfig] = useState<GradeConfig | null>(null);

  const [disciplinasCalendario, setDisciplinasCalendario] = useState<DisciplinaComProgresso[]>([]);
  const [disciplinasGradeMensal, setDisciplinasGradeMensal] = useState<GradeMensalDisciplinaVM[]>([]);

  const [loadingBootstrap, setLoadingBootstrap] = useState(true);
  const [loadingTurma, setLoadingTurma] = useState(false);
  const [loadingProgresso, setLoadingProgresso] = useState(false);

  const turmaSelecionada = useMemo(() => {
    if (!turmaSelecionadaId) return null;
    return turmas.find((t) => t.id === turmaSelecionadaId) || null;
  }, [turmaSelecionadaId, turmas]);

  const carregarBootstrap = useCallback(async () => {
    setLoadingBootstrap(true);
    try {
      const [turmasResp, periodoResp, gradeCfg] = await Promise.all([
        turmaService.getAllSimple(),
        periodoLetivoService.getActive().catch(() => null),
        horarioService.getGradeConfig().catch(() => null),
      ]);

      setTurmas(turmasResp.turmas);
      setPeriodoAtivo(
        periodoResp
          ? {
              nome: periodoResp.periodo.nome,
              data_inicio: periodoResp.periodo.data_inicio,
              data_fim: periodoResp.periodo.data_fim,
            }
          : null,
      );

      setGradeConfig(
        gradeCfg
          ? {
              dias: gradeCfg.dias,
              codigos: gradeCfg.codigos,
            }
          : null,
      );

      if (turmasResp.turmas.length > 0) {
        setTurmaSelecionadaId((prev) => prev || turmasResp.turmas[0].id);
      }
    } finally {
      setLoadingBootstrap(false);
    }
  }, []);

  useEffect(() => {
    carregarBootstrap();
  }, [carregarBootstrap]);

  const buscarDisciplinasComProgresso = useCallback(
    async (turmaId: string) => {
      setLoadingProgresso(true);
      try {
        await disciplinasProgressoService.atualizarProgresso({ turmaId });
      } finally {
        const { disciplinas } = await disciplinasProgressoService.buscarComProgresso({ turmaId });
        setDisciplinasCalendario(disciplinas);
        setLoadingProgresso(false);
        return disciplinas;
      }
    },
    [],
  );

  const atualizarProgressoManual = useCallback(async () => {
    if (!turmaSelecionadaId) return;
    await buscarDisciplinasComProgresso(turmaSelecionadaId);
  }, [buscarDisciplinasComProgresso, turmaSelecionadaId]);

  const carregarDisciplinasDaTurma = useCallback(
    async (turmaId: string) => {
      if (!turmaId) return;
      if (!gradeConfig) return;

      setLoadingTurma(true);
      try {
        const disciplinasComProgresso = await buscarDisciplinasComProgresso(turmaId);

        if (!disciplinasComProgresso || disciplinasComProgresso.length === 0) {
          setDisciplinasGradeMensal([]);
          return;
        }

        const grade = await alocacaoService.getGradeHorarios({ id_turma: turmaId });

        const dias = gradeConfig.dias.map((d) => d.key) as Array<keyof typeof grade>;
        const alocacoesDaTurma = dias.flatMap((dia) =>
          gradeConfig.codigos.flatMap((codigo) => grade?.[dia]?.[codigo] ?? []),
        );

        const disciplinasFormatadas: GradeMensalDisciplinaVM[] = disciplinasComProgresso.map((disciplina) => {
          const alocacoesDisciplina = alocacoesDaTurma.filter(
            (a) => a.disciplina?.id === disciplina.id,
          );

          const inicioBase = resolveYmd(disciplina.data_inicio) || periodoAtivo?.data_inicio;
          const fimBase =
            resolveYmd(disciplina.data_fim_real) ||
            resolveYmd(disciplina.data_fim_prevista) ||
            periodoAtivo?.data_fim;

          const { inicio: dataInicioClamped, fim: dataFimClamped } = clampToPeriodo(
            inicioBase,
            fimBase,
            periodoAtivo,
          );

          return {
            id: disciplina.id,
            nome: disciplina.nome,
            codigo: disciplina.codigo ?? undefined,
            carga_horaria: disciplina.carga_horaria,
            total_aulas: disciplina.total_aulas,
            aulas_ministradas: disciplina.aulas_ministradas ?? 0,
            carga_horaria_atual: disciplina.carga_horaria_atual,
            id_curso: disciplina.id_curso,
            tipo_de_sala: normalizeTipoDeSala(disciplina.tipo_de_sala),
            progresso_temporal: disciplina.progresso_temporal,
            progresso_aulas: disciplina.progresso_aulas,
            horario_consolidado: disciplina.horario_consolidado || "",
            data_inicio: dataInicioClamped,
            data_fim_prevista: dataFimClamped,
            data_fim_real: disciplina.data_fim_real
              ? new Date(disciplina.data_fim_real).toISOString().split("T")[0]
              : undefined,
            alocacoes: alocacoesDisciplina.map<GradeMensalAlocacaoVM>((a) => ({
              id: a.id,
              horario: {
                codigo: a.horario?.codigo || "",
                dia_semana: a.horario?.dia_semana || "",
                horario_inicio: a.horario?.horario_inicio || "",
                horario_fim: a.horario?.horario_fim || "",
              },
              sala: {
                nome: a.sala?.nome || "Sala não informada",
                predio: getPredioNome(a.sala?.predio) || "Prédio não informado",
              },
            })),
          };
        });

        setDisciplinasGradeMensal(disciplinasFormatadas);
      } finally {
        setLoadingTurma(false);
      }
    },
    [buscarDisciplinasComProgresso, gradeConfig, periodoAtivo],
  );

  useEffect(() => {
    if (!turmaSelecionadaId) return;
    if (!gradeConfig) return;
    carregarDisciplinasDaTurma(turmaSelecionadaId);
  }, [carregarDisciplinasDaTurma, gradeConfig, turmaSelecionadaId]);

  return {
    turmas,
    turmaSelecionada,
    turmaSelecionadaId,
    setTurmaSelecionadaId,

    periodoAtivo,
    gradeConfig,

    disciplinasCalendario,
    disciplinasGradeMensal,

    loading: loadingBootstrap,
    loadingTurma,
    loadingProgresso,

    recarregar: carregarBootstrap,
    atualizarProgressoManual,
  };
}

