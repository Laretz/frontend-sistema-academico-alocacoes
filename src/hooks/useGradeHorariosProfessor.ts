import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { userService } from "@/services/users";
import type {
  GradeHorariosProfessorAlocacaoVM,
  GradeHorariosProfessorCursoVinculadoVM,
  GradeHorariosProfessorDataVM,
  GradeHorariosProfessorDisciplinaVinculadaVM,
} from "@/types/view-models/grade-horarios-professor";

type GradeConfig = {
  regime: "SUPERIOR" | "TECNICO";
  dias: Array<{ key: string; label: string }>;
  codigos: string[];
};

type Bootstrap = {
  professor: GradeHorariosProfessorDataVM;
  alocacoes: GradeHorariosProfessorAlocacaoVM[];
  cursos: GradeHorariosProfessorCursoVinculadoVM[];
  disciplinas: GradeHorariosProfessorDisciplinaVinculadaVM[];
  gradeConfig: GradeConfig;
};

export function useGradeHorariosProfessor(params: {
  professorId: string;
  isOpen: boolean;
}) {
  const { professorId, isOpen } = params;

  const [data, setData] = useState<Bootstrap | null>(null);
  const [loading, setLoading] = useState(false);

  const carregar = useCallback(async () => {
    if (!professorId) return;
    setLoading(true);
    try {
      const resp = await userService.getGradeHorariosBootstrap(professorId);
      setData({
        professor: resp.professor,
        alocacoes: resp.alocacoes,
        cursos: resp.cursos,
        disciplinas: resp.disciplinas,
        gradeConfig: resp.gradeConfig,
      });
    } catch {
      toast.error("Erro ao carregar grade de horários do professor");
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [professorId]);

  useEffect(() => {
    if (isOpen && professorId) {
      carregar();
    }
  }, [carregar, isOpen, professorId]);

  const dias = data?.gradeConfig?.dias ?? [];
  const codigos = data?.gradeConfig?.codigos ?? [];

  const alocacaoPorDiaECodigo = useMemo(() => {
    const map = new Map<string, Map<string, GradeHorariosProfessorAlocacaoVM>>();
    (data?.alocacoes || []).forEach((a) => {
      const dia = String(a.horario?.dia_semana || "").toUpperCase();
      const codigo = String(a.horario?.codigo || "");
      if (!dia || !codigo) return;
      if (!map.has(dia)) map.set(dia, new Map());
      map.get(dia)!.set(codigo, a);
    });
    return map;
  }, [data?.alocacoes]);

  const getAlocacao = useCallback(
    (diaKey: string, codigo: string) => {
      return alocacaoPorDiaECodigo.get(diaKey)?.get(codigo) || null;
    },
    [alocacaoPorDiaECodigo],
  );

  return {
    professor: data?.professor || null,
    alocacoes: data?.alocacoes || [],
    cursos: data?.cursos || [],
    disciplinas: data?.disciplinas || [],
    cargaHoraria: (data?.alocacoes || []).length,
    dias,
    codigos,
    loading,
    carregar,
    getAlocacao,
  };
}

