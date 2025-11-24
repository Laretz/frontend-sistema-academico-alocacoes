"use client";
import { AlocacoesToolbar } from "@/app/alocacoes/components/AlocacoesToolbar";



import { MainLayout } from "@/components/layout/main-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import { Badge } from "@/components/ui/badge";
// Removed Dialog components (encapsulated in AlocacaoDialog)
// import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
// Keep Select components (used in Filtros Avançados)
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// Clean lucide-react imports: remove Plus, Search (moved to AlocacoesToolbar)
import { Edit, Trash2, Calendar, Clock, MapPin, User as UserIcon, BookOpen, GraduationCap } from "lucide-react";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useAuthStore } from "@/store/auth";
import { useRouter } from "next/navigation";
import {
  alocacaoService,
  disciplinaService,
  turmaService,
  salaService,
  horarioService,
  professorDisciplinaService,
} from "@/services/entities";
import { userService } from "@/services/users";
import {
  Alocacao,
  CreateAlocacaoRequest,
  Disciplina,
  Turma,
  Sala,
  Horario,
} from "@/types/entities";
import { User } from "@/types/entities";


import { cursoService } from "@/services/entities";


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

  // Dados para os selects
  const [usuarios, setUsuarios] = useState<User[]>([]);

  const [disciplinas, setDisciplinas] = useState<Disciplina[]>([]);
  const [disciplinasProfessor, setDisciplinasProfessor] = useState<
    Disciplina[]
  >([]);
  const [todasDisciplinas, setTodasDisciplinas] = useState<Disciplina[]>([]);
  const [mostrarTodasDisciplinas, setMostrarTodasDisciplinas] = useState(false);
  const [todasDisciplinasCurso, setTodasDisciplinasCurso] = useState<Disciplina[]>([]);
  // Novos: ids de disciplinas vinculadas ao curso da turma selecionada
  const [disciplinasVinculadasCurso, setDisciplinasVinculadasCurso] = useState<string[]>([]);
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
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [salas, setSalas] = useState<Sala[]>([]);
  const [horarios, setHorarios] = useState<Horario[]>([]);
  //estados para filtros
  const [filtroDataInicio, setFiltroDataInicio] = useState<Date | undefined>(
    undefined
  );
  const [filtroDataFim, setFiltroDataFim] = useState<Date | undefined>(
    undefined
  );
  const [filtroDiaSemana, setFiltroDiaSemana] = useState("");
  const [filtroPeriodo, setFiltroPeriodo] = useState("");
  const [filtroTurmaId, setFiltroTurmaId] = useState("");

  useEffect(() => {
    if (user?.role === "PROFESSOR") {
      router.replace("/dashboard");
    }
  }, [user?.role, router]);
  useEffect(() => {
    fetchAlocacoes();
    fetchSelectData();
  }, []);

  useEffect(() => {
    checkHorarioConflicts(
      formData.id_user,
      formData.id_sala,
      formData.id_turma
    );
  }, [formData.id_user, formData.id_sala, formData.id_turma]);

  // Carregar disciplinas do curso da turma selecionada quando turma/toggle mudarem
  useEffect(() => {
    const loadCursoDisciplinas = async () => {
      try {
        if (!formData.id_turma) {
          setTodasDisciplinasCurso([]);
          if (mostrarTodasDisciplinas) setDisciplinas(todasDisciplinas);
          return;
        }
        const turma = turmas.find((t) => t.id === formData.id_turma);
        const idCurso = turma?.id_curso;
        if (!idCurso) {
          setTodasDisciplinasCurso([]);
          if (mostrarTodasDisciplinas) setDisciplinas([]);
          return;
        }
        const disciplinasData = await cursoService.getDisciplinas(idCurso);
        const cursoDisciplinas = disciplinasData?.disciplinas || [];
        setTodasDisciplinasCurso(cursoDisciplinas);
        if (mostrarTodasDisciplinas) {
          setDisciplinas(cursoDisciplinas);
        }
      } catch (error) {
        console.error("Erro ao buscar disciplinas do curso:", error);
        setTodasDisciplinasCurso([]);
        if (mostrarTodasDisciplinas) setDisciplinas([]);
      }
    };
    loadCursoDisciplinas();
  }, [formData.id_turma, turmas, mostrarTodasDisciplinas]);

  // Recomputar a lista exibida ao alternar o toggle
  useEffect(() => {
    if (mostrarTodasDisciplinas) {
      setDisciplinas(todasDisciplinasCurso.length ? todasDisciplinasCurso : todasDisciplinas);
    } else {
      setDisciplinas(disciplinasProfessor || []);
    }
    // limpar seleção de disciplina ao alternar
    setFormData((prev) => ({ ...prev, id_disciplina: "" }));
  }, [mostrarTodasDisciplinas, disciplinasProfessor, todasDisciplinasCurso, todasDisciplinas]);

  const fetchAlocacoes = async () => {
    try {
      setLoading(true);
      const response = await alocacaoService.getAll(1);
      setAlocacoes(response.alocacoes || []);
    } catch (error) {
      console.error("Erro ao buscar alocações:", error);
      setAlocacoes([]);
    } finally {
      setLoading(false);
    }
  };

  const excluirTodasAlocacoesTurma = async () => {
    if (!filtroTurmaId) {
      alert("Selecione uma turma");
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
      alert("Todas as alocações da turma foram excluídas com sucesso!");
      fetchAlocacoes(); // Recarregar a lista
    } catch (error) {
      console.error("Erro ao excluir alocações da turma:", error);
      alert("Erro ao excluir alocações da turma");
    } finally {
      setLoading(false);
    }
  };

  const fetchSelectData = async () => {
    try {
      const [
        usuariosData,
        disciplinasData,
        turmasData,
        salasData,
        horariosData,
      ] = await Promise.all([
        userService.getAll(1),
        disciplinaService.getAll(),
        turmaService.getAll(1),
        salaService.getAll(1),
        horarioService.getAll(),
      ]);

      setUsuarios(usuariosData.usuarios || []);
      setTodasDisciplinas(disciplinasData.disciplinas || []);
      setDisciplinas(disciplinasData.disciplinas || []);
      setTurmas(turmasData.turmas || []);
      setSalas(salasData.salas || []);
      setHorarios(horariosData || []);
    } catch (error) {
      console.error("Erro ao buscar dados para os selects:", error);
    }
  };

  const fetchDisciplinasProfessor = async (id_user: string) => {
    try {
      const response = await disciplinaService.getByProfessor(id_user);
      setDisciplinasProfessor(response.disciplinas || []);

      // Se não está mostrando todas as disciplinas, filtrar apenas as do professor
      if (!mostrarTodasDisciplinas) {
        setDisciplinas(response.disciplinas || []);
      }
    } catch (error) {
      console.error("Erro ao buscar disciplinas do professor:", error);
      setDisciplinasProfessor([]);
      if (!mostrarTodasDisciplinas) {
        setDisciplinas([]);
      }
    }
  };

  const checkHorarioConflicts = async (
    professorId: string,
    salaId: string,
    turmaId: string
  ) => {
    if (!professorId && !salaId && !turmaId) {
      setConflictingHorarios(new Map());
      return;
    }

    try {
      const conflicts = new Map<
        string,
        | "professor"
        | "sala"
        | "turma"
        | "professor_sala"
        | "professor_turma"
        | "sala_turma"
        | "todos"
      >();

      const response = await alocacaoService.getAll(1);
      const alocacoes = response.alocacoes || [];

      alocacoes.forEach((alocacao: any) => {
        const conflictTypes: string[] = [];

        // Verificar conflitos do professor
        if (professorId && alocacao.id_user === professorId) {
          conflictTypes.push("professor");
        }

        // Verificar conflitos da sala
        if (salaId && alocacao.id_sala === salaId) {
          conflictTypes.push("sala");
        }

        // Verificar conflitos da turma
        if (turmaId && alocacao.id_turma === turmaId) {
          conflictTypes.push("turma");
        }

        // Definir o tipo de conflito baseado nas combinações
        if (conflictTypes.length > 0) {
          let conflictType:
            | "professor"
            | "sala"
            | "turma"
            | "professor_sala"
            | "professor_turma"
            | "sala_turma"
            | "todos";

          if (conflictTypes.length === 3) {
            conflictType = "todos";
          } else if (conflictTypes.length === 2) {
            if (
              conflictTypes.includes("professor") &&
              conflictTypes.includes("sala")
            ) {
              conflictType = "professor_sala";
            } else if (
              conflictTypes.includes("professor") &&
              conflictTypes.includes("turma")
            ) {
              conflictType = "professor_turma";
            } else {
              conflictType = "sala_turma";
            }
          } else {
            conflictType = conflictTypes[0] as "professor" | "sala" | "turma";
          }

          conflicts.set(alocacao.id_horario, conflictType);
        }
      });

      setConflictingHorarios(conflicts);
    } catch (error) {
      console.error("Erro ao verificar conflitos de horário:", error);
      setConflictingHorarios(new Map());
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    try {
      // Obter id_curso da turma selecionada
      const turmaSelecionada = turmas.find((t) => t.id === formData.id_turma);
      if (!turmaSelecionada) {
        toast.error("Turma inválida");
        return;
      }
      const idCurso = turmaSelecionada.id_curso;

      // Buscar vínculos CursoDisciplina do curso para mapear disciplina → id_curso_disciplina
      const { vinculos } = await cursoService.getDisciplinaVinculos(idCurso);
      const vinculo = vinculos.find((v) => v.id_disciplina === formData.id_disciplina);
      if (!vinculo) {
        toast.error("Disciplina não está vinculada ao curso da turma selecionada");
        return;
      }

      // Verificar vínculo professor-disciplina; se ausente, criar automaticamente
      const professorPossuiVinculo = disciplinasProfessor.some((d) => d.id === formData.id_disciplina);
      if (!professorPossuiVinculo) {
        try {
          await professorDisciplinaService.vincular({ id_user: formData.id_user, id_disciplina: formData.id_disciplina });
          toast.success("Vínculo professor-disciplina criado automaticamente");
        } catch (err: any) {
          console.error("Erro ao criar vínculo professor-disciplina:", err);
          if (err?.response?.status === 409) {
            // Vínculo já existe; seguir adiante
            console.warn("Vínculo professor-disciplina já existente (409). Prosseguindo.");
          } else {
            toast.error("Falha ao criar vínculo professor-disciplina");
            setSubmitting(false);
            return;
          }
        }
      }

      if (editingAlocacao) {
        // Atualização de alocação existente
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
        // Criação de alocação nova (suporta múltiplos horários)
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
    setFormData({
      id_user: alocacao.id_user,
      id_disciplina: alocacao.id_disciplina,
      id_turma: alocacao.id_turma,
      id_sala: alocacao.id_sala,
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
    setFormData({ ...formData, id_user: value, id_disciplina: "" });

    if (value) {
      fetchDisciplinasProfessor(value);
    } else {
      setDisciplinasProfessor([]);
      setDisciplinas(todasDisciplinas);
      setMostrarTodasDisciplinas(false);
    }
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

    if (filtroPeriodo && filtroPeriodo !== "todos") {
      const codigoHorario = alocacao.horario?.codigo?.toLowerCase();
      if (
        filtroPeriodo === "M" ||
        filtroPeriodo === "T" ||
        filtroPeriodo === "N"
      ) {
        if (!codigoHorario?.startsWith(filtroPeriodo.toLowerCase()))
          return false;
      } else {
        if (codigoHorario !== filtroPeriodo.toLowerCase()) return false;
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
    const grupos: { [key: string]: typeof horarios } = {};
    horarios.forEach((horario) => {
      if (!grupos[horario.dia_semana]) {
        grupos[horario.dia_semana] = [];
      }
      grupos[horario.dia_semana].push(horario);
    });
    return grupos;
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header movido para AlocacoesToolbar */}
        <AlocacoesToolbar
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          filtroDataInicio={filtroDataInicio}
          setFiltroDataInicio={setFiltroDataInicio}
          filtroDataFim={filtroDataFim}
          setFiltroDataFim={setFiltroDataFim}
          filtroDiaSemana={filtroDiaSemana}
          setFiltroDiaSemana={setFiltroDiaSemana}
          filtroPeriodo={filtroPeriodo}
          setFiltroPeriodo={setFiltroPeriodo}
          isDialogOpen={isDialogOpen}
          setIsDialogOpen={setIsDialogOpen}
          editingAlocacao={editingAlocacao}
          setEditingAlocacao={setEditingAlocacao}
          formData={formData}
          setFormData={setFormData}
          usuarios={usuarios}
          disciplinas={disciplinas}
          mostrarTodasDisciplinas={mostrarTodasDisciplinas}
          handleProfessorChange={handleProfessorChange}
          handleMostrarTodasDisciplinasChange={handleMostrarTodasDisciplinasChange}
          turmas={turmas}
          salas={salas}
          horarios={horarios}
          conflictingHorarios={conflictingHorarios}
          handleHorarioChange={handleHorarioChange}
          getDiaSemanaLabel={getDiaSemanaLabel}
          getDiaSemanaAbrev={getDiaSemanaAbrev}
          getHorariosAgrupados={getHorariosAgrupados}
          handleCloseDialog={handleCloseDialog}
          submitting={submitting}
          handleSubmit={handleSubmit}
          todasDisciplinas={todasDisciplinas}
        />

        {/* Filtros Avançados */}
        <Card>
          <CardContent className="p-4">
            <div>
              <h3 className="text-lg font-medium text-foreground mb-4">
                Filtros Avançados
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Filtro por Turma */}
                <div>
                  <label className="text-sm font-medium text-foreground mb-1 block">
                    Turma
                  </label>
                  <Select value={filtroTurmaId} onValueChange={setFiltroTurmaId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma turma" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todas">Todas as turmas</SelectItem>
                      {turmas.map((turma) => (
                        <SelectItem key={turma.id} value={turma.id}>
                          {turma.nome} - {turma.periodo}º período ({turma.turno})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Botões de Ação */}
                <div className="flex flex-col space-y-2 md:col-span-2">
                  <Button
                    onClick={excluirTodasAlocacoesTurma}
                    variant="destructive"
                    size="sm"
                    className="w-full"
                  >
                    Excluir Todas da Turma
                  </Button>
                </div>
              </div>
            </div>

            {/* Botão para limpar filtros */}
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
                  setFiltroPeriodo("");
                  setFiltroTurmaId("");
                  fetchAlocacoes();
                }}
              >
                Limpar Filtros
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Alocações List */}
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
                filtroPeriodo ||
                filtroTurmaId
                  ? "Nenhuma alocação encontrada com os filtros aplicados"
                  : "Nenhuma alocação cadastrada"}
              </p>
            </div>
          ) : (
            filteredAlocacoes.map((alocacao) => (
              <Card
                key={alocacao.id}
                className="hover:shadow-md transition-shadow"
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          <BookOpen className="h-4 w-4 text-primary" />
                          <span className="font-medium text-lg">
                            {alocacao.disciplina?.nome ||
                              "Disciplina não encontrada"}
                          </span>
                        </div>
                        <Badge variant="outline">
                          {alocacao.horario?.codigo || "Horário não encontrado"}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center space-x-2">
                          <UserIcon className="h-4 w-4" />
                          <span>
                            {alocacao.user?.nome || "Professor não encontrado"}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <GraduationCap className="h-4 w-4" />
                          <span>
                            {alocacao.turma?.nome || "Turma não encontrada"}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <MapPin className="h-4 w-4" />
                          <span>
                            {alocacao.sala?.nome || "Sala não encontrada"}
                            {alocacao.sala?.predio &&
                              ` - ${alocacao.sala.predio.nome}`}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Clock className="h-4 w-4" />
                          <span>
                            {alocacao.horario
                              ? getDiaSemanaLabel(alocacao.horario.dia_semana)
                              : "Horário não encontrado"}
                          </span>
                        </div>
                      </div>

                      {alocacao.horario && (
                        <div className="text-sm text-muted-foreground">
                          Horário: {alocacao.horario.codigo} -{" "}
                          {alocacao.horario.horario_inicio
                            ?.split("T")[1]
                            ?.substring(0, 5) ||
                            alocacao.horario.horario_inicio}{" "}
                          -{" "}
                          {alocacao.horario.horario_fim
                            ?.split("T")[1]
                            ?.substring(0, 5) || alocacao.horario.horario_fim}
                        </div>
                      )}
                    </div>

                    <div className="flex space-x-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(alocacao)}
                      >
                        <Edit className="h-4 w-4 text-shadblue-primary" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(alocacao.id)}
                        className="text-destructive hover:text-destructive/80"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </MainLayout>
  );
}
