import { useEffect, useMemo, useState } from "react";
import { cursoService, turmaService } from "@/services/entities";
import type { CreateTurmaRequest, Curso, Turma } from "@/types/entities";
import { toast } from "sonner";

type TurmaWithCurso = Turma & {
  curso?: {
    id: string;
    nome: string;
    codigo?: string;
    turno?: string;
  };
};

const emptyFormData: CreateTurmaRequest = {
  nome: "",
  num_alunos: 0,
  semestre: 1,
  turno: "",
  id_curso: "",
};

export function useTurmas() {
  const [searchTerm, setSearchTerm] = useState("");
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [semestreFiltro, setSemestreFiltro] = useState<string>("todos");
  const [cursoFiltro, setCursoFiltro] = useState<string>("todos");
  const [loading, setLoading] = useState(true);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTurma, setEditingTurma] = useState<Turma | null>(null);
  const [formData, setFormData] = useState<CreateTurmaRequest>(emptyFormData);

  const fetchTurmas = async () => {
    try {
      setLoading(true);
      const response = await turmaService.getAllSimple();
      setTurmas(response.turmas);
    } catch {
      toast.error("Erro ao carregar turmas");
    } finally {
      setLoading(false);
    }
  };

  const fetchCursos = async () => {
    try {
      const response = await cursoService.getAll();
      setCursos(response.cursos);
    } catch {
      toast.error("Erro ao carregar cursos");
    }
  };

  useEffect(() => {
    fetchTurmas();
    fetchCursos();
  }, []);

  const semestresDisponiveis = useMemo(() => {
    const semestres = Array.from(
      new Set(
        turmas
          .map((t) => t.semestre)
          .filter((s): s is number => typeof s === "number"),
      ),
    );
    semestres.sort((a, b) => a - b);
    return semestres;
  }, [turmas]);

  const cursoLabelById = useMemo(() => {
    const map = new Map<string, string>();
    cursos.forEach((c) => {
      map.set(c.id, `${c.nome} - ${c.turno}`);
    });
    return map;
  }, [cursos]);

  const filteredTurmas = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return turmas
      .filter((turma) =>
        normalizedSearch ? turma.nome.toLowerCase().includes(normalizedSearch) : true,
      )
      .filter((turma) =>
        semestreFiltro === "todos" ? true : String(turma.semestre) === semestreFiltro,
      )
      .filter((turma) => {
        if (cursoFiltro === "todos") return true;
        const turmaWithCurso = turma as TurmaWithCurso;
        return turma.id_curso === cursoFiltro || turmaWithCurso.curso?.id === cursoFiltro;
      })
      .sort((a, b) => {
        const aSem = typeof a.semestre === "number" ? a.semestre : 9999;
        const bSem = typeof b.semestre === "number" ? b.semestre : 9999;
        if (aSem !== bSem) return aSem - bSem;
        return a.nome.localeCompare(b.nome);
      });
  }, [turmas, searchTerm, semestreFiltro, cursoFiltro]);

  const limparFiltros = () => {
    setSearchTerm("");
    setSemestreFiltro("todos");
    setCursoFiltro("todos");
  };

  const abrirNova = () => {
    setEditingTurma(null);
    setFormData(emptyFormData);
    setDialogOpen(true);
  };

  const editar = (turma: Turma) => {
    setEditingTurma(turma);
    setFormData({
      nome: turma.nome,
      num_alunos: turma.num_alunos,
      semestre: turma.semestre,
      turno: turma.turno,
      id_curso: turma.id_curso || "",
    });
    setDialogOpen(true);
  };

  const fecharDialog = () => {
    setDialogOpen(false);
    setEditingTurma(null);
    setFormData(emptyFormData);
  };

  const salvar = async () => {
    try {
      if (editingTurma) {
        await turmaService.update(editingTurma.id, formData);
      } else {
        await turmaService.create(formData);
      }
      await fetchTurmas();
      fecharDialog();
    } catch {
      toast.error("Erro ao salvar turma");
    }
  };

  const excluir = async (id: string) => {
    try {
      await turmaService.delete(id);
      await fetchTurmas();
    } catch {
      toast.error("Erro ao excluir turma");
    }
  };

  return {
    searchTerm,
    setSearchTerm,
    turmas,
    cursos,
    semestreFiltro,
    setSemestreFiltro,
    cursoFiltro,
    setCursoFiltro,
    loading,

    dialogOpen,
    setDialogOpen,
    editingTurma,
    formData,
    setFormData,
    abrirNova,
    editar,
    fecharDialog,
    salvar,
    excluir,

    semestresDisponiveis,
    cursoLabelById,
    filteredTurmas,
    limparFiltros,
  };
}

