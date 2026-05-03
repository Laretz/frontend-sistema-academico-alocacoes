import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { cursoService, disciplinaService } from "@/services/entities";
import type { Curso, CreateCursoRequest, Disciplina } from "@/types/entities";
import { getApiErrorMessage } from "@/lib/api";

type SemestreFilter = "ALL" | number;

export function useCursos() {
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCurso, setEditingCurso] = useState<Curso | null>(null);
  const [formData, setFormData] = useState<CreateCursoRequest>({
    nome: "",
    turno: "MATUTINO",
    duracao_semestres: 1,
    codigo: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const [disciplinasPorCurso, setDisciplinasPorCurso] = useState<
    Record<string, Disciplina[]>
  >({});
  const [loadingDisciplinas, setLoadingDisciplinas] = useState(false);

  const [disciplinasModalOpen, setDisciplinasModalOpen] = useState(false);
  const [cursoSelecionadoParaDisciplinas, setCursoSelecionadoParaDisciplinas] =
    useState<Curso | null>(null);
  const [disciplinasSemestreFilter, setDisciplinasSemestreFilter] =
    useState<SemestreFilter>("ALL");

  const [vincularDialogOpen, setVincularDialogOpen] = useState(false);
  const [cursoIdForVinculo, setCursoIdForVinculo] = useState<string | null>(null);
  const [allDisciplinas, setAllDisciplinas] = useState<Disciplina[]>([]);
  const [loadingAllDisciplinas, setLoadingAllDisciplinas] = useState(false);
  const [linking, setLinking] = useState(false);
  const [linkingDisciplinaId, setLinkingDisciplinaId] = useState<string | null>(
    null,
  );
  const [unlinkingId, setUnlinkingId] = useState<string | null>(null);
  const [vincularSemestreFilter, setVincularSemestreFilter] =
    useState<SemestreFilter>("ALL");

  const filteredCursos = useMemo(() => {
    return (
      cursos?.filter((curso) =>
        curso.nome.toLowerCase().includes(searchTerm.toLowerCase()),
      ) || []
    );
  }, [cursos, searchTerm]);

  const carregarCursos = async () => {
    try {
      setLoading(true);
      const response = await cursoService.getAll();
      setCursos(response.cursos);
    } catch {
      toast.error("Erro ao carregar cursos");
    } finally {
      setLoading(false);
    }
  };

  const carregarDisciplinasDoCurso = async (id_curso: string) => {
    try {
      setLoadingDisciplinas(true);
      const response = await cursoService.getDisciplinas(id_curso);
      setDisciplinasPorCurso((prev) => ({ ...prev, [id_curso]: response.disciplinas }));
    } catch {
      toast.error("Erro ao carregar disciplinas do curso");
    } finally {
      setLoadingDisciplinas(false);
    }
  };

  const abrirModalDisciplinas = (curso: Curso) => {
    setCursoSelecionadoParaDisciplinas(curso);
    setDisciplinasModalOpen(true);
    setDisciplinasSemestreFilter("ALL");
    if (!disciplinasPorCurso[curso.id]) {
      carregarDisciplinasDoCurso(curso.id);
    }
  };

  const abrirVincularDialog = async (id_curso: string) => {
    setCursoIdForVinculo(id_curso);
    setVincularDialogOpen(true);
    setVincularSemestreFilter("ALL");
    try {
      setLoadingAllDisciplinas(true);
      const response = await disciplinaService.getAll();
      setAllDisciplinas(response.disciplinas);
    } catch {
      toast.error("Erro ao carregar lista de disciplinas");
    } finally {
      setLoadingAllDisciplinas(false);
    }
  };

  const availableDisciplinas = useMemo(() => {
    if (!cursoIdForVinculo) return allDisciplinas;
    const linked = disciplinasPorCurso[cursoIdForVinculo] || [];
    return allDisciplinas.filter((d) => !linked.some((ld) => ld.id === d.id));
  }, [allDisciplinas, cursoIdForVinculo, disciplinasPorCurso]);

  const vincularPorId = async (id_disciplina: string) => {
    if (!cursoIdForVinculo) {
      toast.error("Curso não definido para vínculo");
      return;
    }
    try {
      setLinking(true);
      setLinkingDisciplinaId(id_disciplina);
      await cursoService.vincularDisciplina(cursoIdForVinculo, id_disciplina);
      toast.success("Disciplina vinculada com sucesso!");
      await carregarDisciplinasDoCurso(cursoIdForVinculo);
    } catch (error: unknown) {
      toast.error(getApiErrorMessage(error, "Erro ao vincular disciplina"));
    } finally {
      setLinking(false);
      setLinkingDisciplinaId(null);
    }
  };

  const desvincular = async (id_curso: string, id_disciplina: string) => {
    try {
      setUnlinkingId(id_disciplina);
      await cursoService.desvincularDisciplina(id_curso, id_disciplina);
      toast.success("Disciplina desvinculada!");
      setDisciplinasPorCurso((prev) => ({
        ...prev,
        [id_curso]: (prev[id_curso] || []).filter((d) => d.id !== id_disciplina),
      }));
    } catch (error: unknown) {
      toast.error(getApiErrorMessage(error, "Erro ao desvincular disciplina"));
    } finally {
      setUnlinkingId(null);
    }
  };

  const salvarCurso = async () => {
    if (!formData.nome || !formData.turno) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    try {
      setSubmitting(true);
      const payload = { ...formData };
      if (editingCurso) {
        await cursoService.update(editingCurso.id, payload);
        toast.success("Curso atualizado com sucesso!");
      } else {
        await cursoService.create(payload);
        toast.success("Curso criado com sucesso!");
      }
      fecharDialogEdicao();
      await carregarCursos();
    } catch {
      toast.error(editingCurso ? "Erro ao atualizar curso" : "Erro ao criar curso");
    } finally {
      setSubmitting(false);
    }
  };

  const editarCurso = (curso: Curso) => {
    setEditingCurso(curso);
    setFormData({
      nome: curso.nome,
      turno: curso.turno,
      duracao_semestres: curso.duracao_semestres,
      codigo: curso.codigo,
    });
    setDialogOpen(true);
  };

  const fecharDialogEdicao = () => {
    setDialogOpen(false);
    setEditingCurso(null);
    setFormData({
      nome: "",
      turno: "MATUTINO",
      duracao_semestres: 1,
      codigo: "",
    });
  };

  const excluirCurso = async (id: string) => {
    try {
      await cursoService.delete(id);
      toast.success("Curso excluído com sucesso!");
      await carregarCursos();
    } catch (error: unknown) {
      toast.error(getApiErrorMessage(error, "Erro ao excluir curso"));
    }
  };

  useEffect(() => {
    carregarCursos();
  }, []);

  return {
    cursos,
    filteredCursos,
    searchTerm,
    setSearchTerm,
    loading,

    dialogOpen,
    setDialogOpen,
    editingCurso,
    formData,
    setFormData,
    submitting,
    salvarCurso,
    editarCurso,
    fecharDialogEdicao,
    excluirCurso,

    disciplinasPorCurso,
    loadingDisciplinas,
    carregarDisciplinasDoCurso,

    disciplinasModalOpen,
    setDisciplinasModalOpen,
    cursoSelecionadoParaDisciplinas,
    disciplinasSemestreFilter,
    setDisciplinasSemestreFilter,
    abrirModalDisciplinas,

    vincularDialogOpen,
    setVincularDialogOpen,
    cursoIdForVinculo,
    vincularSemestreFilter,
    setVincularSemestreFilter,
    availableDisciplinas,
    loadingAllDisciplinas,
    linking,
    linkingDisciplinaId,
    unlinkingId,
    abrirVincularDialog,
    vincularPorId,
    desvincular,
  };
}

