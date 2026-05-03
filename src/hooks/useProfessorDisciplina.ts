import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { professorDisciplinaService } from "@/services/professor-disciplina";
import type {
  Disciplina,
  DisciplinaComVinculo,
  ProfessorComVinculo,
  User,
} from "@/types/entities";

type ViewMode = "professor" | "disciplina";

export function useProfessorDisciplina() {
  const [professores, setProfessores] = useState<User[]>([]);
  const [disciplinas, setDisciplinas] = useState<Disciplina[]>([]);
  const [cursos, setCursos] = useState<{ id: string; nome: string }[]>([]);

  const [viewMode, setViewMode] = useState<ViewMode>("professor");
  const [selectedProfessorId, setSelectedProfessorId] = useState<string>("");
  const [selectedDisciplinaId, setSelectedDisciplinaId] = useState<string>("");

  const [selectedDisciplinasIds, setSelectedDisciplinasIds] = useState<string[]>(
    [],
  );
  const [selectedProfessoresIds, setSelectedProfessoresIds] = useState<string[]>(
    [],
  );

  const [disciplinasProfessor, setDisciplinasProfessor] = useState<
    DisciplinaComVinculo[]
  >([]);
  const [professoresDisciplina, setProfessoresDisciplina] = useState<
    ProfessorComVinculo[]
  >([]);

  const [loading, setLoading] = useState(false);

  const [selectedSemestre, setSelectedSemestre] = useState<string>("all");
  const [selectedCurso, setSelectedCurso] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");

  useEffect(() => {
    (async () => {
      try {
        const bootstrap = await professorDisciplinaService.bootstrap();
        setProfessores(bootstrap.professores as unknown as User[]);
        setDisciplinas(bootstrap.disciplinas as unknown as Disciplina[]);
        setCursos(
          (bootstrap.cursos || []).map((c) => ({ id: c.id, nome: c.nome })),
        );
      } catch {
        toast.error("Erro ao carregar dados");
      }
    })();
  }, []);

  useEffect(() => {
    if (viewMode === "professor" && selectedProfessorId) {
      (async () => {
        try {
          const response =
            await professorDisciplinaService.buscarDisciplinasProfessor(
              selectedProfessorId,
            );
          setDisciplinasProfessor(response.disciplinas);
        } catch {
          toast.error("Erro ao carregar disciplinas do professor");
        }
      })();
      return;
    }

    if (viewMode === "disciplina" && selectedDisciplinaId) {
      (async () => {
        try {
          const response =
            await professorDisciplinaService.buscarProfessoresDisciplina(
              selectedDisciplinaId,
            );
          setProfessoresDisciplina(response.professores);
        } catch {
          toast.error("Erro ao carregar professores da disciplina");
        }
      })();
    }
  }, [viewMode, selectedProfessorId, selectedDisciplinaId]);

  const filteredDisciplinas = useMemo(() => {
    return disciplinas.filter((disciplina) => {
      const matchesSemestre =
        !selectedSemestre ||
        selectedSemestre === "all" ||
        disciplina.semestre.toString() === selectedSemestre;
      const matchesCurso =
        !selectedCurso ||
        selectedCurso === "all" ||
        disciplina.curso?.id === selectedCurso;
      const lower = searchTerm.toLowerCase();
      const matchesSearch =
        !searchTerm ||
        disciplina.nome.toLowerCase().includes(lower) ||
        (disciplina.codigo ?? "").toLowerCase().includes(lower);

      return matchesSemestre && matchesCurso && matchesSearch;
    });
  }, [disciplinas, searchTerm, selectedCurso, selectedSemestre]);

  const disciplinasGroupedBySemestre = useMemo(() => {
    const grouped = filteredDisciplinas.reduce((acc, disciplina) => {
      const semestre = disciplina.semestre.toString();
      if (!acc[semestre]) acc[semestre] = [];
      acc[semestre].push(disciplina);
      return acc;
    }, {} as Record<string, Disciplina[]>);

    const sortedSemestres = Object.keys(grouped).sort(
      (a, b) => parseInt(a) - parseInt(b),
    );

    return sortedSemestres.map((semestre) => ({
      semestre,
      disciplinas: grouped[semestre],
    }));
  }, [filteredDisciplinas]);

  const toggleSelectAllDisciplinas = () => {
    if (selectedDisciplinasIds.length === filteredDisciplinas.length) {
      setSelectedDisciplinasIds([]);
      return;
    }
    setSelectedDisciplinasIds(filteredDisciplinas.map((d) => d.id));
  };

  const clearSelection = () => {
    setSelectedDisciplinasIds([]);
    setSelectedProfessoresIds([]);
    setSelectedProfessorId("");
    setSelectedDisciplinaId("");
  };

  const vincular = async () => {
    if (viewMode === "professor") {
      if (!selectedProfessorId || selectedDisciplinasIds.length === 0) {
        toast.error("Selecione um professor e pelo menos uma disciplina");
        return;
      }
      setLoading(true);
      try {
        await Promise.all(
          selectedDisciplinasIds.map((disciplinaId) =>
            professorDisciplinaService.vincular({
              id_user: selectedProfessorId,
              id_disciplina: disciplinaId,
            }),
          ),
        );
        toast.success(
          `Professor vinculado a ${selectedDisciplinasIds.length} disciplina(s) com sucesso!`,
        );
        const response =
          await professorDisciplinaService.buscarDisciplinasProfessor(
            selectedProfessorId,
          );
        setDisciplinasProfessor(response.disciplinas);
        setSelectedDisciplinasIds([]);
      } catch {
        toast.error("Erro ao vincular professor às disciplinas");
      } finally {
        setLoading(false);
      }
      return;
    }

    if (!selectedDisciplinaId || selectedProfessoresIds.length === 0) {
      toast.error("Selecione uma disciplina e pelo menos um professor");
      return;
    }
    setLoading(true);
    try {
      await Promise.all(
        selectedProfessoresIds.map((professorId) =>
          professorDisciplinaService.vincular({
            id_user: professorId,
            id_disciplina: selectedDisciplinaId,
          }),
        ),
      );
      toast.success(
        `${selectedProfessoresIds.length} professor(es) vinculado(s) à disciplina com sucesso!`,
      );
      const response = await professorDisciplinaService.buscarProfessoresDisciplina(
        selectedDisciplinaId,
      );
      setProfessoresDisciplina(response.professores);
      setSelectedProfessoresIds([]);
    } catch {
      toast.error("Erro ao vincular professores à disciplina");
    } finally {
      setLoading(false);
    }
  };

  const desvincular = async (id_user: string, id_disciplina: string) => {
    try {
      await professorDisciplinaService.desvincular({ id_user, id_disciplina });
      toast.success("Professor desvinculado da disciplina com sucesso!");

      if (viewMode === "professor") {
        const response =
          await professorDisciplinaService.buscarDisciplinasProfessor(
            selectedProfessorId,
          );
        setDisciplinasProfessor(response.disciplinas);
        return;
      }

      const response = await professorDisciplinaService.buscarProfessoresDisciplina(
        selectedDisciplinaId,
      );
      setProfessoresDisciplina(response.professores);
    } catch {
      toast.error("Erro ao desvincular professor da disciplina");
    }
  };

  return {
    professores,
    disciplinas,
    cursos,
    viewMode,
    setViewMode,
    selectedProfessorId,
    setSelectedProfessorId,
    selectedDisciplinaId,
    setSelectedDisciplinaId,
    selectedDisciplinasIds,
    setSelectedDisciplinasIds,
    selectedProfessoresIds,
    setSelectedProfessoresIds,
    disciplinasProfessor,
    professoresDisciplina,
    loading,
    selectedSemestre,
    setSelectedSemestre,
    selectedCurso,
    setSelectedCurso,
    searchTerm,
    setSearchTerm,
    filteredDisciplinas,
    disciplinasGroupedBySemestre,
    toggleSelectAllDisciplinas,
    clearSelection,
    vincular,
    desvincular,
  };
}

