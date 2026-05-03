"use client";
import { AlocacoesToolbar } from "@/app/alocacoes/components/AlocacoesToolbar";

import { MainLayout } from "@/components/layout/main-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LimparDisciplinaDialog } from "@/app/grade-horarios/components/LimparDisciplinaDialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Edit,
  Trash2,
  Calendar,
} from "lucide-react";

import { useState, useEffect, useRef, useCallback } from "react";
import { toast } from "sonner";
import { useAuthStore } from "@/store/auth";
import { useRouter } from "next/navigation";
import {
  alocacaoService,
  cursoService,
  professorDisciplinaService,
} from "@/services/entities";
import {
  Alocacao,
  CreateAlocacaoRequest,
  Disciplina,
  GradeHorario,
  Turma,
  Sala,
  Horario,
} from "@/types/entities";
import { User } from "@/types/entities";

interface FormData {
  id_user: string;
  id_disciplina: string;
  id_turma: string;
  id_sala: string;
  id_horarios: string[];
}

const initialFormData: FormData = {
  id_user: "",
  id_disciplina: "",
  id_turma: "",
  id_sala: "",
  id_horarios: [],
};

export default function AlocacoesPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [alocacoes, setAlocacoes] = useState<Alocacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAlocacao, setEditingAlocacao] = useState<Alocacao | null>(null);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [submitting, setSubmitting] = useState(false);

  const [usuarios, setUsuarios] = useState<User[]>([]);

  const [disciplinas, setDisciplinas] = useState<Disciplina[]>([]);
  const [disciplinasProfessor, setDisciplinasProfessor] = useState<
    Disciplina[]
  >([]);
  const [todasDisciplinas, setTodasDisciplinas] = useState<Disciplina[]>([]);
  const [mostrarTodasDisciplinas, setMostrarTodasDisciplinas] = useState(false);
  const [conflictingHorarios, setConflictingHorarios] = useState<
    Map<
      string,
      | "professor"
      | "sala"
      | "turma"
      | "professor_sala"
      | "professor_turma"
      | "sala_turma"
      | "todos"
    >
  >(new Map());
  const conflictCheckSeq = useRef(0);
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [salas, setSalas] = useState<Sala[]>([]);
  const [horarios, setHorarios] = useState<Horario[]>([]);
  const [regime, setRegime] = useState<"SUPERIOR" | "TECNICO">("SUPERIOR");

  const [filtroDataInicio, setFiltroDataInicio] = useState<Date | undefined>(
    undefined,
  );
  const [filtroDataFim, setFiltroDataFim] = useState<Date | undefined>(
    undefined,
  );
  const [filtroDiaSemana, setFiltroDiaSemana] = useState("");
  const [filtroTurno, setFiltroTurno] = useState("");
  const [filtroTurmaId, setFiltroTurmaId] = useState("");


  const [previewGrade, setPreviewGrade] = useState<GradeHorario | null>(null);
  const [qualifiedProfessorIds, setQualifiedProfessorIds] = useState<string[]>(
    [],
  );

  useEffect(() => {
    if (user?.role === "PROFESSOR") {
      router.replace("/dashboard");
    }
  }, [user?.role, router]);
  const [dialogDataLoaded, setDialogDataLoaded] = useState(false);

  const fetchAlocacoes = useCallback(async () => {
    if (!filtroTurmaId) {
      setAlocacoes([]);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const response = await alocacaoService.getAllByTurma(filtroTurmaId);
      setAlocacoes(response.alocacoes || []);
    } catch (error) {
      console.error("Erro ao buscar alocações:", error);
      setAlocacoes([]);
    } finally {
      setLoading(false);
    }
  }, [filtroTurmaId]);

  const fetchTurmas = useCallback(async () => {
    try {
      const bootstrap = await alocacaoService.getAlocacoesBootstrap({ regime });
      setTurmas((bootstrap.turmas as unknown as Turma[]) || []);
      setHorarios((bootstrap.horarios as unknown as Horario[]) || []);
    } catch (error) {
      console.error("Erro ao buscar turmas:", error);
    }
  }, [regime]);

  const fetchDialogData = useCallback(async () => {
    try {
      const bootstrap = await alocacaoService.getAlocacoesBootstrap({ regime });
      setUsuarios((bootstrap.professores as unknown as User[]) || []);
      setTodasDisciplinas((bootstrap.disciplinas as unknown as Disciplina[]) || []);
      setDisciplinas((bootstrap.disciplinas as unknown as Disciplina[]) || []);
      setSalas((bootstrap.salas as unknown as Sala[]) || []);
      setHorarios((bootstrap.horarios as unknown as Horario[]) || []);

      setDialogDataLoaded(true);
    } catch (error) {
      console.error("Erro ao buscar dados para o diálogo:", error);
    }
  }, [regime]);

  const checkHorarioConflicts = useCallback(
    async (professorId: string, salaId: string, turmaId: string) => {
      const seq = ++conflictCheckSeq.current;
      if (!professorId && !salaId && !turmaId) {
        setConflictingHorarios(new Map());
        return;
      }

      setConflictingHorarios(new Map());

      try {
        const periodoIdFromStorage = (() => {
          if (typeof window === "undefined") return undefined;
          const modo = window.localStorage.getItem("periodo.modo");
          if (modo !== "consulta") return undefined;
          return window.localStorage.getItem("periodo.consultaId") || undefined;
        })();

        const result = await alocacaoService.getHorarioConflicts({
          id_user: professorId || undefined,
          id_sala: salaId || undefined,
          id_turma: turmaId || undefined,
          periodoId: periodoIdFromStorage,
          regime,
        });
        const conflicts = new Map(Object.entries(result.conflitos || {}));

        if (seq !== conflictCheckSeq.current) return;
        setConflictingHorarios(conflicts);
      } catch (error) {
        console.error("Erro ao verificar conflitos de horário:", error);
        if (seq !== conflictCheckSeq.current) return;
        setConflictingHorarios(new Map());
      }
    },
    [regime],
  );

  useEffect(() => {
    fetchTurmas();
  }, [fetchTurmas]);

  useEffect(() => {
    if (isDialogOpen && !dialogDataLoaded) {
      fetchDialogData();
    }
  }, [isDialogOpen, dialogDataLoaded, fetchDialogData]);

  useEffect(() => {
    fetchAlocacoes();
  }, [fetchAlocacoes]);

  useEffect(() => {
    checkHorarioConflicts(formData.id_user, formData.id_sala, formData.id_turma);
  }, [formData.id_user, formData.id_sala, formData.id_turma, checkHorarioConflicts]);

  useEffect(() => {
    checkHorarioConflicts(formData.id_user, formData.id_sala, formData.id_turma);
  }, [horarios, formData.id_user, formData.id_sala, formData.id_turma, checkHorarioConflicts]);

  // disciplinas disponíveis no contexto da turma (curso) + compatibilidade com edição
  useEffect(() => {
    const loadCursoDisciplinas = async () => {
      if (!formData.id_turma) {
        setDisciplinas([]);
        return;
      }

      try {
        const turma = turmas.find((t) => t.id === formData.id_turma);
        const idCurso = turma?.id_curso;

        if (!idCurso) {
          setDisciplinas(todasDisciplinas);
          return;
        }

        const disciplinasData = await cursoService.getDisciplinas(idCurso);
        const cursoDisciplinas = disciplinasData?.disciplinas || [];

        let finalDisciplinas = cursoDisciplinas;
        if (editingAlocacao && editingAlocacao.id_turma === formData.id_turma) {
          const disciplinaId = editingAlocacao.id_disciplina;
          const exists = cursoDisciplinas.some((d) => d.id === disciplinaId);
          if (!exists) {
            let disciplina = todasDisciplinas.find(
              (d) => d.id === disciplinaId,
            );

            if (!disciplina && editingAlocacao.disciplina) {
              disciplina = editingAlocacao.disciplina;
            }

            if (disciplina) {
              finalDisciplinas = [...cursoDisciplinas, disciplina];
            }
          }
        }

        setDisciplinas(finalDisciplinas);
      } catch (error) {
        console.error("Erro ao buscar disciplinas do curso:", error);
        setDisciplinas([]);
      }
    };
    loadCursoDisciplinas();
  }, [formData.id_turma, turmas, todasDisciplinas, editingAlocacao]);

  // preview da grade da turma (para ajudar na visualização durante criação/edição)
  useEffect(() => {
    const fetchPreview = async () => {
      if (!formData.id_turma) {
        setPreviewGrade(null);
        return;
      }
      try {
        const grade = await alocacaoService.getGradeHorarios({
          id_turma: formData.id_turma,
        });
        setPreviewGrade(grade);
      } catch (error) {
        console.error("Erro ao buscar grade de preview:", error);
      }
    };
    fetchPreview();
  }, [formData.id_turma]);

  // professores qualificados pela disciplina selecionada
  useEffect(() => {
    setQualifiedProfessorIds([]);
    const fetchProfessores = async () => {
      if (!formData.id_disciplina) {
        return;
      }
      try {
        const data = await professorDisciplinaService.getByDisciplina(
          formData.id_disciplina,
        );
        const ids = data.professores.map((p) => p.id);
        setQualifiedProfessorIds(ids);
      } catch (error) {
        console.error("Erro ao buscar professores qualificados:", error);
        setQualifiedProfessorIds([]);
      }
    };
    fetchProfessores();
  }, [formData.id_disciplina]);

  const excluirTodasAlocacoesTurma = async () => {
    if (!filtroTurmaId) {
      toast.error("Selecione uma turma");
      return;
    }
    if (
      !confirm("Tem certeza que deseja excluir todas as alocações desta turma?")
    ) {
      return;
    }
    try {
      setLoading(true);
      await alocacaoService.deleteAllByTurma(filtroTurmaId);
      toast.success("Todas as alocações da turma foram excluídas com sucesso!");
      fetchAlocacoes(); // Recarregar a lista
    } catch (error) {
      console.error("Erro ao excluir alocações da turma:", error);
      toast.error("Erro ao excluir alocações da turma");
    } finally {
      setLoading(false);
    }
  };

  const disciplinasDaTurma = alocacoes
    .filter((a) => a.id_turma === filtroTurmaId)
    .map((a) => a.disciplina)
    .filter((d): d is Disciplina => !!d)
    .reduce((acc, curr) => {
      if (!acc.some((d) => d.id === curr.id)) {
        acc.push(curr);
      }
      return acc;
    }, [] as Disciplina[]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    // validação de carga horária (confirmação do usuário quando está abaixo do esperado)
    const selectedDisciplina = todasDisciplinas.find(
      (d) => d.id === formData.id_disciplina,
    );
    if (selectedDisciplina) {
      const weeklyClasses = Math.ceil(selectedDisciplina.carga_horaria / 15);
      const selectedCount = formData.id_horarios.length;

      if (selectedCount < weeklyClasses) {
        const confirmMessage = `A disciplina "${selectedDisciplina.nome}" exige aproximadamente ${weeklyClasses} aulas semanais, mas você selecionou apenas ${selectedCount}.\n\nDeseja continuar mesmo assim?`;
        if (!confirm(confirmMessage)) {
          return;
        }
      }
    }

    setSubmitting(true);
    try {
      const turmaSelecionada = turmas.find((t) => t.id === formData.id_turma);
      if (!turmaSelecionada) {
        toast.error("Turma inválida");
        return;
      }
      const idCurso = turmaSelecionada.id_curso;

      const { vinculos } = await cursoService.getDisciplinaVinculos(idCurso);
      const vinculo = vinculos.find(
        (v) => v.id_disciplina === formData.id_disciplina,
      );
      if (!vinculo) {
        toast.error(
          "Disciplina não está vinculada ao curso da turma selecionada",
        );
        return;
      }

      const professorPossuiVinculo = disciplinasProfessor.some(
        (d) => d.id === formData.id_disciplina,
      );
      if (!professorPossuiVinculo) {
        try {
          await professorDisciplinaService.vincular({
            id_user: formData.id_user,
            id_disciplina: formData.id_disciplina,
          });
          toast.success("Vínculo professor-disciplina criado automaticamente");
        } catch (err: unknown) {
          console.error("Erro ao criar vínculo professor-disciplina:", err);
          const status =
            typeof err === "object" && err !== null && "response" in err
              ? (err as { response?: { status?: unknown } }).response?.status
              : undefined;
          if (status !== 409) {
            toast.error("Falha ao criar vínculo professor-disciplina");
            setSubmitting(false);
            return;
          }
        }
      }

      if (editingAlocacao) {
        const updateData: Partial<CreateAlocacaoRequest> = {
          id_user: formData.id_user,
          id_turma: formData.id_turma,
          id_sala: formData.id_sala,
          id_horario: formData.id_horarios[0],
          id_curso_disciplina: vinculo.id,
        };
        await alocacaoService.update(editingAlocacao.id, updateData);
        toast.success("Alocação atualizada com sucesso!");
      } else {
        const createData: CreateAlocacaoRequest = {
          id_user: formData.id_user,
          id_turma: formData.id_turma,
          id_sala: formData.id_sala,
          id_horarios: formData.id_horarios,
          id_curso_disciplina: vinculo.id,
        };
        await alocacaoService.create(createData);
        toast.success("Alocação criada com sucesso!");
      }

      await fetchAlocacoes();
      setIsDialogOpen(false);
      setEditingAlocacao(null);
      setFormData(initialFormData);
    } catch (error) {
      console.error("Erro ao salvar alocação:", error);
      toast.error("Erro ao salvar alocação");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (alocacao: Alocacao) => {
    setEditingAlocacao(alocacao);
    setIsDialogOpen(true);

    const idDisciplina =
      alocacao.id_disciplina || alocacao.disciplina?.id || "";

    setFormData({
      id_user: alocacao.id_user || "",
      id_disciplina: idDisciplina,
      id_turma: alocacao.id_turma || "",
      id_sala: alocacao.id_sala || "",
      id_horarios: [alocacao.id_horario],
    });
  };

  const handleDelete = async (id: string) => {
    if (confirm("Tem certeza que deseja excluir esta alocação?")) {
      try {
        await alocacaoService.delete(id);
        await fetchAlocacoes();
        toast.success("Alocação excluída com sucesso!");
      } catch (error) {
        console.error("Erro ao excluir alocação:", error);
        toast.error("Erro ao excluir alocação. Tente novamente.");
      }
    }
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingAlocacao(null);
    setFormData(initialFormData);
    setMostrarTodasDisciplinas(false);
    setDisciplinas(todasDisciplinas);
    setDisciplinasProfessor([]);
  };

  const handleProfessorChange = (value: string) => {
    setFormData({ ...formData, id_user: value });
  };

  const handleMostrarTodasDisciplinasChange = (checked: boolean) => {
    setMostrarTodasDisciplinas(checked);
    setFormData({ ...formData, id_disciplina: "" });

    // A lista de disciplinas será recalculada pelo efeito acima considerando vínculos do curso
  };

  const handleHorarioChange = (horarioId: string, checked: boolean) => {
    if (editingAlocacao) {
      // Para edição, apenas um horário
      setFormData((prev) => ({
        ...prev,
        id_horarios: checked ? [horarioId] : [],
      }));
    } else {
      // Para criação, múltiplos horários
      setFormData((prev) => ({
        ...prev,
        id_horarios: checked
          ? [...prev.id_horarios, horarioId]
          : prev.id_horarios.filter((id) => id !== horarioId),
      }));
    }
  };

  const filteredAlocacoes = alocacoes.filter((alocacao) => {
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
        alocacao.disciplina?.nome.toLowerCase().includes(searchLower) ||
        alocacao.user?.nome.toLowerCase().includes(searchLower) ||
        alocacao.turma?.nome.toLowerCase().includes(searchLower) ||
        alocacao.sala?.nome.toLowerCase().includes(searchLower) ||
        alocacao.horario?.codigo.toLowerCase().includes(searchLower);
      if (!matchesSearch) return false;
    }

    if (filtroDataInicio) {
      const dataAlocacao = new Date(alocacao.created_at);
      const dataInicio = new Date(filtroDataInicio);
      if (dataAlocacao < dataInicio) return false;
    }

    if (filtroDataFim) {
      const dataAlocacao = new Date(alocacao.created_at);
      const dataFim = new Date(filtroDataFim);
      dataFim.setHours(23, 59, 59, 999);
      if (dataAlocacao > dataFim) return false;
    }

    if (filtroDiaSemana && filtroDiaSemana !== "todos") {
      const diaSemanaAlocacao = alocacao.horario?.dia_semana?.toLowerCase();
      if (diaSemanaAlocacao !== filtroDiaSemana.toLowerCase()) return false;
    }

    if (filtroTurno && filtroTurno !== "todos") {
      const codigoHorario = alocacao.horario?.codigo?.toLowerCase();
      if (filtroTurno === "M" || filtroTurno === "T" || filtroTurno === "N") {
        if (!codigoHorario?.startsWith(filtroTurno.toLowerCase())) return false;
      } else {
        if (codigoHorario !== filtroTurno.toLowerCase()) return false;
      }
    }

    if (filtroTurmaId && filtroTurmaId !== "todas") {
      if (alocacao.id_turma !== filtroTurmaId) return false;
    }

    return true;
  });

  const getDiaSemanaLabel = (dia: string) => {
    const dias: { [key: string]: string } = {
      SEGUNDA: "Segunda-feira",
      TERCA: "Terça-feira",
      QUARTA: "Quarta-feira",
      QUINTA: "Quinta-feira",
      SEXTA: "Sexta-feira",
      SABADO: "Sábado",
    };
    return dias[dia] || dia;
  };

  const getDiaSemanaAbrev = (dia: string) => {
    const dias: { [key: string]: string } = {
      SEGUNDA: "Seg",
      TERCA: "Ter",
      QUARTA: "Qua",
      QUINTA: "Qui",
      SEXTA: "Sex",
      SABADO: "Sáb",
    };
    return dias[dia] || dia;
  };

  const getHorariosAgrupados = () => {
    const ordemDias = [
      "SEGUNDA",
      "TERCA",
      "QUARTA",
      "QUINTA",
      "SEXTA",
      "SABADO",
    ];

    const gruposTmp: { [key: string]: typeof horarios } = {};

    const horariosUnicos = horarios.reduce((acc, current) => {
      const isDuplicate = acc.some(
        (h) =>
          h.dia_semana === current.dia_semana && h.codigo === current.codigo,
      );
      if (!isDuplicate) {
        acc.push(current);
      }
      return acc;
    }, [] as Horario[]);

    horariosUnicos.forEach((horario) => {
      const dia = horario.dia_semana;
      if (!gruposTmp[dia]) gruposTmp[dia] = [];
      gruposTmp[dia].push(horario);
    });

    const ordenarCodigo = (a: Horario, b: Horario) => {
      const rank = (codigo: string) => {
        const p = codigo.charAt(0);
        const n = parseInt(codigo.slice(1)) || 0;
        const base = p === "M" ? 0 : p === "T" ? 100 : p === "N" ? 200 : 300;
        return base + n;
      };
      return rank(a.codigo) - rank(b.codigo);
    };

    Object.keys(gruposTmp).forEach((dia) => {
      gruposTmp[dia] = gruposTmp[dia].slice().sort(ordenarCodigo);
    });

    const gruposOrdenados: { [key: string]: typeof horarios } = {};
    ordemDias.forEach((dia) => {
      gruposOrdenados[dia] = gruposTmp[dia] || [];
    });
    return gruposOrdenados;
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <AlocacoesToolbar
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          filtroDataInicio={filtroDataInicio}
          setFiltroDataInicio={setFiltroDataInicio}
          filtroDataFim={filtroDataFim}
          setFiltroDataFim={setFiltroDataFim}
          filtroDiaSemana={filtroDiaSemana}
          setFiltroDiaSemana={setFiltroDiaSemana}
          filtroTurno={filtroTurno}
          setFiltroTurno={setFiltroTurno}
          isDialogOpen={isDialogOpen}
          setIsDialogOpen={setIsDialogOpen}
          editingAlocacao={editingAlocacao}
          setEditingAlocacao={setEditingAlocacao}
          formData={formData}
          setFormData={setFormData}
          usuarios={
            formData.id_disciplina && qualifiedProfessorIds.length > 0
              ? usuarios.filter((u) => qualifiedProfessorIds.includes(u.id))
              : usuarios
          }
          disciplinas={disciplinas}
          mostrarTodasDisciplinas={mostrarTodasDisciplinas}
          handleProfessorChange={handleProfessorChange}
          handleMostrarTodasDisciplinasChange={
            handleMostrarTodasDisciplinasChange
          }
          turmas={turmas}
          salas={salas}
          horarios={horarios}
          regime={regime}
          setRegime={setRegime}
          conflictingHorarios={conflictingHorarios}
          handleHorarioChange={handleHorarioChange}
          getDiaSemanaLabel={getDiaSemanaLabel}
          getDiaSemanaAbrev={getDiaSemanaAbrev}
          getHorariosAgrupados={getHorariosAgrupados}
          handleCloseDialog={handleCloseDialog}
          submitting={submitting}
          handleSubmit={handleSubmit}
          todasDisciplinas={todasDisciplinas}
          previewGrade={previewGrade}
        />

        <Card>
          <CardContent className="p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-foreground">
                Filtros Avançados
              </h3>
              <div className="flex gap-2">
                {filtroTurmaId && (
                  <LimparDisciplinaDialog
                    turmaId={filtroTurmaId}
                    disciplinas={disciplinasDaTurma}
                    onSuccess={fetchAlocacoes}
                  />
                )}
                <Button
                  onClick={excluirTodasAlocacoesTurma}
                  variant="destructive"
                  size="sm"
                  disabled={!filtroTurmaId}
                >
                  Excluir Todas da Turma
                </Button>
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-4 items-end">
              <div className="flex-1">
                <label className="text-sm font-medium text-foreground mb-1 block">
                  Turma
                </label>
                <Select value={filtroTurmaId} onValueChange={setFiltroTurmaId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma turma" />
                  </SelectTrigger>
                  <SelectContent>
                    {turmas.map((turma) => (
                      <SelectItem key={turma.id} value={turma.id}>
                        {turma.nome} - {turma.semestre}º semestre (
                        {turma.turno || "Sem Turno"})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="mt-4 flex justify-between">
              <Button onClick={fetchAlocacoes} variant="default" size="sm">
                Mostrar Todas as Alocações
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchTerm("");
                  setFiltroDataInicio(undefined);
                  setFiltroDataFim(undefined);
                  setFiltroDiaSemana("");
                  setFiltroTurno("");
                  setFiltroTurmaId("");
                  fetchAlocacoes();
                }}
              >
                Limpar Filtros
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4">
          {loading ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Carregando alocações...</p>
            </div>
          ) : filteredAlocacoes.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                {searchTerm ||
                filtroDataInicio ||
                filtroDataFim ||
                filtroDiaSemana ||
                filtroTurno ||
                filtroTurmaId
                  ? "Nenhuma alocação encontrada com os filtros aplicados"
                  : "Nenhuma alocação cadastrada"}
              </p>
            </div>
          ) : (
            <div className="rounded-md border bg-card">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Dia</TableHead>
                    <TableHead>Horário</TableHead>
                    <TableHead>Disciplina</TableHead>
                    <TableHead>Professor</TableHead>
                    <TableHead>Sala</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAlocacoes.map((alocacao) => (
                    <TableRow key={alocacao.id}>
                      <TableCell className="font-medium">
                        {alocacao.horario
                          ? getDiaSemanaLabel(alocacao.horario.dia_semana)
                          : "N/A"}
                      </TableCell>
                      <TableCell>
                        {alocacao.horario ? (
                          <div className="flex flex-col">
                            <span className="font-medium">
                              {alocacao.horario.codigo}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {alocacao.horario.horario_inicio
                                ?.split("T")[1]
                                ?.substring(0, 5) ||
                                alocacao.horario.horario_inicio}{" "}
                              -{" "}
                              {alocacao.horario.horario_fim
                                ?.split("T")[1]
                                ?.substring(0, 5) ||
                                alocacao.horario.horario_fim}
                            </span>
                          </div>
                        ) : (
                          "N/A"
                        )}
                      </TableCell>
                      <TableCell>
                        {alocacao.disciplina?.nome ||
                          "Disciplina não encontrada"}
                      </TableCell>
                      <TableCell>
                        {alocacao.user?.nome || "Professor não encontrado"}
                      </TableCell>
                      <TableCell>
                        {alocacao.sala ? (
                          <span>
                            {alocacao.sala.nome}
                            {alocacao.sala.predio &&
                              ` - ${alocacao.sala.predio.nome}`}
                          </span>
                        ) : (
                          "Sala não encontrada"
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(alocacao)}
                            title="Editar"
                          >
                            <Edit className="h-4 w-4 text-shadblue-primary" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(alocacao.id)}
                            className="text-destructive hover:text-destructive/80"
                            title="Excluir"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
