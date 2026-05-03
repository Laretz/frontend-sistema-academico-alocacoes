import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { cursoService, disciplinaService } from "@/services/entities";
import type { Curso, Disciplina } from "@/types/entities";

type FormData = {
  nome: string;
  carga_horaria: 30 | 45 | 60 | 90;
  id_curso: string;
  tipo_de_sala: "Sala" | "Lab";
  periodo_letivo: string;
  codigo: string;
  semestre: number;
  obrigatoria: boolean;
  data_inicio: Date | undefined;
  data_fim_prevista: Date | undefined;
};

const emptyFormData: FormData = {
  nome: "",
  carga_horaria: 60,
  id_curso: "",
  tipo_de_sala: "Sala",
  periodo_letivo: "",
  codigo: "",
  semestre: 1,
  obrigatoria: true,
  data_inicio: undefined,
  data_fim_prevista: undefined,
};

export function useDisciplinas() {
  const [disciplinas, setDisciplinas] = useState<Disciplina[]>([]);
  const [cursos, setCursos] = useState<Curso[]>([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCurso, setSelectedCurso] = useState<string>("todos");
  const [selectedSemestre, setSelectedSemestre] = useState<string>("todos");
  const [loading, setLoading] = useState(true);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingDisciplina, setEditingDisciplina] =
    useState<Disciplina | null>(null);
  const [formData, setFormData] = useState<FormData>(emptyFormData);
  const [submitting, setSubmitting] = useState(false);

  const semestresDisponiveis = useMemo(() => {
    const semestres = Array.from(
      new Set(
        disciplinas
          .map((d) => d.semestre)
          .filter((s): s is number => typeof s === "number"),
      ),
    );
    semestres.sort((a, b) => a - b);
    return semestres;
  }, [disciplinas]);

  const cursoLabelById = useMemo(() => {
    const map = new Map<string, string>();
    cursos.forEach((c) => {
      map.set(c.id, `${c.nome} - ${c.turno}`);
    });
    return map;
  }, [cursos]);

  const limparFiltros = () => {
    setSearchTerm("");
    setSelectedCurso("todos");
    setSelectedSemestre("todos");
  };

  const filteredDisciplinas = useMemo(() => {
    return (
      disciplinas?.filter((disciplina) => {
        const matchesSearch = disciplina.nome
          .toLowerCase()
          .includes(searchTerm.toLowerCase());
        const matchesCurso =
          selectedCurso === "todos" ||
          selectedCurso === "" ||
          disciplina.id_curso === selectedCurso;
        const matchesSemestre =
          selectedSemestre === "todos" ||
          selectedSemestre === "" ||
          disciplina.semestre?.toString() === selectedSemestre;
        return matchesSearch && matchesCurso && matchesSemestre;
      }) || []
    );
  }, [disciplinas, searchTerm, selectedCurso, selectedSemestre]);

  const disciplinasPorSemestre = useMemo(() => {
    return filteredDisciplinas.reduce(
      (acc, disciplina) => {
        const semestre = disciplina.semestre || 1;
        if (!acc[semestre]) {
          acc[semestre] = [];
        }
        acc[semestre]!.push(disciplina);
        return acc;
      },
      {} as Record<number, Disciplina[]>,
    );
  }, [filteredDisciplinas]);

  const semestresOrdenados = useMemo(() => {
    return Object.keys(disciplinasPorSemestre)
      .map(Number)
      .sort((a, b) => a - b);
  }, [disciplinasPorSemestre]);

  const carregarDados = async () => {
    try {
      setLoading(true);
      const [disciplinasResp, cursosResp] = await Promise.all([
        disciplinaService.getAll(),
        cursoService.getAll(),
      ]);
      setDisciplinas(disciplinasResp.disciplinas);
      setCursos(cursosResp.cursos);
    } catch {
      toast.error("Erro ao carregar disciplinas");
    } finally {
      setLoading(false);
    }
  };

  const abrirNova = () => {
    setEditingDisciplina(null);
    setFormData(emptyFormData);
    setDialogOpen(true);
  };

  const editar = (disciplina: Disciplina) => {
    setEditingDisciplina(disciplina);
    setFormData({
      nome: disciplina.nome,
      carga_horaria: disciplina.carga_horaria as 30 | 45 | 60 | 90,
      id_curso: disciplina.id_curso || "",
      tipo_de_sala: disciplina.tipo_de_sala as "Sala" | "Lab",
      periodo_letivo: disciplina.periodo_letivo || "",
      codigo: disciplina.codigo || "",
      semestre: disciplina.semestre || 1,
      obrigatoria: disciplina.obrigatoria ?? true,
      data_inicio: disciplina.data_inicio
        ? new Date(disciplina.data_inicio)
        : undefined,
      data_fim_prevista: disciplina.data_fim_prevista
        ? new Date(disciplina.data_fim_prevista)
        : undefined,
    });
    setDialogOpen(true);
  };

  const fecharDialog = () => {
    setDialogOpen(false);
    setEditingDisciplina(null);
    setFormData(emptyFormData);
  };

  const salvar = async () => {
    if (
      !formData.nome ||
      !formData.carga_horaria ||
      !formData.id_curso ||
      !formData.data_inicio ||
      !formData.data_fim_prevista
    ) {
      toast.error("Preencha todos os campos corretamente");
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        ...formData,
        data_inicio: formData.data_inicio?.toISOString() || undefined,
        data_fim_prevista: formData.data_fim_prevista?.toISOString() || undefined,
      };

      if (editingDisciplina) {
        await disciplinaService.update(editingDisciplina.id, payload);
        toast.success("Disciplina atualizada com sucesso!");
      } else {
        await disciplinaService.create(payload);
        toast.success("Disciplina criada com sucesso!");
      }

      fecharDialog();
      await carregarDados();
    } catch {
      toast.error(
        editingDisciplina ? "Erro ao atualizar disciplina" : "Erro ao criar disciplina",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const excluir = async (id: string) => {
    try {
      await disciplinaService.delete(id);
      toast.success("Disciplina excluída com sucesso!");
      await carregarDados();
    } catch (error: unknown) {
      const message =
        (error as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || (error as { message?: string })?.message;
      toast.error(`Erro ao excluir disciplina${message ? `: ${message}` : ""}`);
    }
  };

  useEffect(() => {
    carregarDados();
  }, []);

  return {
    disciplinas,
    cursos,
    loading,
    submitting,

    searchTerm,
    setSearchTerm,
    selectedCurso,
    setSelectedCurso,
    selectedSemestre,
    setSelectedSemestre,
    limparFiltros,

    cursoLabelById,
    semestresDisponiveis,
    semestresOrdenados,
    filteredDisciplinas,
    disciplinasPorSemestre,

    dialogOpen,
    setDialogOpen,
    editingDisciplina,
    formData,
    setFormData,

    abrirNova,
    editar,
    fecharDialog,
    salvar,
    excluir,
    recarregar: carregarDados,
  };
}

