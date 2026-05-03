import { useEffect, useMemo, useState } from "react";
import { alocacaoService } from "@/services/entities";
import type {
  GradeHorario,
  Sala,
  Turma,
  User as Usuario,
} from "@/types/entities";

type TabMode = "turma" | "sala" | "prof";

export function useGradeHorarios() {
  const [tab, setTab] = useState<TabMode>("turma");
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [salas, setSalas] = useState<Sala[]>([]);
  const [professores, setProfessores] = useState<Usuario[]>([]);
  const [gridConfig, setGridConfig] = useState<{
    dias: Array<{ key: string; label: string }>;
    codigos: string[];
  } | null>(null);

  const [turmaId, setTurmaId] = useState<string>("");
  const [salaId, setSalaId] = useState<string>("");
  const [profId, setProfId] = useState<string>("");
  const [grade, setGrade] = useState<GradeHorario | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const [periodoAtivoNome, setPeriodoAtivoNome] = useState<string>("");
  const [periodos, setPeriodos] = useState<
    Array<{ id: string; nome: string; status: string }>
  >([]);
  const [periodoSelecionadoId, setPeriodoSelecionadoId] = useState<string>("");

  useEffect(() => {
    const carregarBootstrap = async () => {
      try {
        const bootstrap = await alocacaoService.getGradeHorariosBootstrap({
          regime: "SUPERIOR",
        });

        setTurmas((bootstrap.turmas as unknown as Turma[]) || []);
        setSalas((bootstrap.salas as unknown as Sala[]) || []);
        setProfessores((bootstrap.professores as unknown as Usuario[]) || []);

        if (bootstrap.turmas && bootstrap.turmas.length > 0) {
          setTurmaId(bootstrap.turmas[0]!.id);
        }

        setPeriodoAtivoNome(bootstrap.periodoAtivo?.nome || "");
        setPeriodos(
          (bootstrap.periodos || []).map((p) => ({
            id: p.id,
            nome: p.nome,
            status: p.status,
          })),
        );

        setGridConfig({
          dias: bootstrap.gradeConfig.dias,
          codigos: bootstrap.gradeConfig.codigos,
        });
      } catch {
        setTurmas([]);
        setSalas([]);
        setProfessores([]);
        setGridConfig(null);
        setPeriodos([]);
      }
    };

    carregarBootstrap();
  }, []);

  const disciplinasDaGrade = useMemo(() => {
    if (!grade) return [];
    const map = new Map<string, string>();
    Object.values(grade).forEach((dia) => {
      Object.values(dia).forEach((alocacoes) => {
        if (!Array.isArray(alocacoes)) return;
        alocacoes.forEach((a) => {
          if (a.disciplina) {
            map.set(a.disciplina.id, a.disciplina.nome);
          }
        });
      });
    });
    return Array.from(map.entries()).map(([id, nome]) => ({ id, nome }));
  }, [grade]);

  const carregarGrade = async () => {
    try {
      setLoading(true);

      const filtros: {
        id_turma?: string;
        id_user?: string;
        id_sala?: string;
        periodoId?: string;
      } = {};

      if (tab === "turma") {
        if (!turmaId) {
          setGrade(null);
          return;
        }
        filtros.id_turma = turmaId;
      }

      if (tab === "sala") {
        if (!salaId) {
          setGrade(null);
          return;
        }
        filtros.id_sala = salaId;
      }

      if (tab === "prof") {
        if (!profId) {
          setGrade(null);
          return;
        }
        filtros.id_user = profId;
      }

      if (periodoSelecionadoId) {
        filtros.periodoId = periodoSelecionadoId;
      }

      const data = await alocacaoService.getGradeHorarios(filtros);
      setGrade(data || ({} as GradeHorario));
    } catch (err) {
      console.error("Falha ao carregar grade:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (gridConfig?.dias?.length && gridConfig?.codigos?.length) {
      carregarGrade();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    tab,
    turmaId,
    salaId,
    profId,
    periodoSelecionadoId,
    gridConfig?.codigos?.length,
  ]);

  return {
    tab,
    setTab,
    turmas,
    salas,
    professores,
    gridConfig,
    turmaId,
    setTurmaId,
    salaId,
    setSalaId,
    profId,
    setProfId,
    grade,
    loading,
    periodoAtivoNome,
    periodos,
    periodoSelecionadoId,
    setPeriodoSelecionadoId,
    disciplinasDaGrade,
    carregarGrade,
  };
}
