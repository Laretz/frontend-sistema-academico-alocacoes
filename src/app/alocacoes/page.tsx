"use client";

import { MainLayout } from "@/components/layout/main-layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Calendar,
  Clock,
  MapPin,
  User as UserIcon,
  BookOpen,
  GraduationCap,
} from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { useState, useEffect } from "react";
import { toast } from "sonner";
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
import { User } from "@/types/auth";
import { DatePicker } from "@/components/ui/date-picker";

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
        disciplinaService.getAll(1),
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

    try {
      setSubmitting(true);

      // Verificar se precisa criar relação professor-disciplina
      const professorSelecionado = usuarios.find(
        (u) => u.id === formData.id_user
      );
      const disciplinaSelecionada = todasDisciplinas.find(
        (d) => d.id === formData.id_disciplina
      );

      if (
        professorSelecionado &&
        disciplinaSelecionada &&
        mostrarTodasDisciplinas
      ) {
        // Verificar se a disciplina não está nas disciplinas do professor
        const disciplinaJaVinculada = disciplinasProfessor.some(
          (d) => d.id === formData.id_disciplina
        );

        if (!disciplinaJaVinculada) {
          // Criar relação professor-disciplina automaticamente
          try {
            await professorDisciplinaService.vincular({
              id_user: formData.id_user,
              id_disciplina: formData.id_disciplina,
            });
            console.log("Relação professor-disciplina criada automaticamente");
          } catch (error) {
            console.error("Erro ao criar relação professor-disciplina:", error);
            // Continuar mesmo se houver erro na criação da relação
          }
        }
      }

      if (editingAlocacao) {
        // Para edição, enviamos apenas um horário
        const updateData = {
          id_user: formData.id_user,
          id_disciplina: formData.id_disciplina,
          id_turma: formData.id_turma,
          id_sala: formData.id_sala,
          id_horario: formData.id_horarios[0],
        };
        await alocacaoService.update(editingAlocacao.id, updateData);
      } else {
        // Para criação, enviamos múltiplos horários
        const createData: CreateAlocacaoRequest = {
          id_user: formData.id_user,
          id_disciplina: formData.id_disciplina,
          id_turma: formData.id_turma,
          id_sala: formData.id_sala,
          id_horarios: formData.id_horarios,
        };
        await alocacaoService.create(createData);
      }

      await fetchAlocacoes();
      handleCloseDialog();

      // Mensagem de confirmação
      if (editingAlocacao) {
        toast.success("Alocação atualizada com sucesso!");
      } else {
        toast.success("Alocação criada com sucesso!");
      }
    } catch (error) {
      console.error("Erro ao salvar alocação:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (alocacao: Alocacao) => {
    setEditingAlocacao(alocacao);
    setFormData({
      id_user: alocacao.id_user,
      id_disciplina: alocacao.id_disciplina,
      id_turma: alocacao.id_turma,
      id_sala: alocacao.id_sala,
      id_horarios: [alocacao.id_horario],
    });
    setIsDialogOpen(true);
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

    if (checked) {
      setDisciplinas(todasDisciplinas);
    } else {
      setDisciplinas(disciplinasProfessor);
    }
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
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Alocações</h1>
            <p className="text-muted-foreground">
              Gerencie as alocações de professores, disciplinas e horários
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setEditingAlocacao(null)}>
                <Plus className="h-4 w-4 mr-2" />
                Nova Alocação
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[85vh]">
              <DialogHeader>
                <DialogTitle>
                  {editingAlocacao ? "Editar Alocação" : "Nova Alocação"}
                </DialogTitle>
                <DialogDescription>
                  {editingAlocacao
                    ? "Edite as informações da alocação"
                    : "Preencha as informações para criar uma nova alocação"}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="id_user">Professor</Label>
                    <Select
                      value={formData.id_user}
                      onValueChange={handleProfessorChange}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um professor" />
                      </SelectTrigger>
                      <SelectContent>
                        {usuarios
                          .filter((user) => user.role === "PROFESSOR")
                          .map((user) => (
                            <SelectItem key={user.id} value={user.id}>
                              {user.nome}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between mb-1">
                      <Label htmlFor="id_disciplina" className="font-medium">
                        Disciplina
                      </Label>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="mostrar-todas-disciplinas"
                          checked={mostrarTodasDisciplinas}
                          onCheckedChange={handleMostrarTodasDisciplinasChange}
                        />
                        <Label
                          htmlFor="mostrar-todas-disciplinas"
                          className="text-sm font-normal cursor-pointer whitespace-nowrap"
                        >
                          Mostrar todas
                        </Label>
                      </div>
                    </div>
                    <Select
                      value={formData.id_disciplina}
                      onValueChange={(value) =>
                        setFormData({ ...formData, id_disciplina: value })
                      }
                      required
                    >
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <SelectTrigger className="w-full">
                              <div className="truncate max-w-[250px]">
                                {formData.id_disciplina ? (
                                  <span className="truncate block">
                                    {(() => {
                                      const disciplina = disciplinas.find(
                                        (d) => d.id === formData.id_disciplina
                                      );
                                      if (!disciplina)
                                        return "Disciplina não encontrada";
                                      const nome = disciplina.nome;
                                      return nome.length > 25
                                        ? nome.substring(0, 25) + "..."
                                        : nome;
                                    })()}
                                  </span>
                                ) : (
                                  <span className="text-muted-foreground">
                                    Selecione uma disciplina
                                  </span>
                                )}
                              </div>
                            </SelectTrigger>
                          </TooltipTrigger>
                          {formData.id_disciplina && (
                            <TooltipContent className="max-w-sm p-3 text-sm bg-gray-900 text-white rounded shadow-lg z-50">
                              <p className="break-words">
                                {disciplinas.find(
                                  (d) => d.id === formData.id_disciplina
                                )?.nome || ""}
                              </p>
                            </TooltipContent>
                          )}
                        </Tooltip>
                      </TooltipProvider>
                      <SelectContent>
                        {disciplinas.map((disciplina) => (
                          <SelectItem key={disciplina.id} value={disciplina.id}>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <span className="truncate max-w-[300px] block">
                                    {disciplina.nome}
                                  </span>
                                </TooltipTrigger>
                                <TooltipContent className="max-w-xs p-2 text-sm bg-gray-900 text-white rounded shadow-lg">
                                  <p className="break-words">
                                    {disciplina.nome}
                                  </p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {mostrarTodasDisciplinas && formData.id_disciplina && (
                      <p className="text-sm text-muted-foreground">
                        💡 Se esta disciplina não estiver vinculada ao
                        professor, o vínculo será criado automaticamente.
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-4 px-4">
                  <div className="space-y-2">
                    <Label htmlFor="id_turma">Turma</Label>
                    <Select
                      value={formData.id_turma}
                      onValueChange={(value) =>
                        setFormData({ ...formData, id_turma: value })
                      }
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma turma" />
                      </SelectTrigger>
                      <SelectContent>
                        {turmas.map((turma) => (
                          <SelectItem key={turma.id} value={turma.id}>
                            {turma.nome} - {turma.periodo}º período (
                            {turma.turno})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="id_sala">Sala</Label>
                    <Select
                      value={formData.id_sala}
                      onValueChange={(value) =>
                        setFormData({ ...formData, id_sala: value })
                      }
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma sala" />
                      </SelectTrigger>
                      <SelectContent>
                        {salas.map((sala) => (
                          <SelectItem key={sala.id} value={sala.id}>
                            {sala.nome} - {sala.predio.nome} (Cap:{" "}
                            {sala.capacidade})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-3">
                  <Label>
                    Horários{" "}
                    {editingAlocacao
                      ? "(selecione apenas um)"
                      : "(selecione um ou mais)"}
                  </Label>
                  <div className="max-h-64 overflow-y-auto border rounded-lg p-4 bg-muted/20">
                    {Object.entries(getHorariosAgrupados()).map(
                      ([dia, horariosGrupo]) => (
                        <div key={dia} className="mb-4 last:mb-0">
                          <div className="flex items-center gap-2 mb-3 pb-2 border-b border-border/50">
                            <Badge variant="outline" className="font-medium">
                              {getDiaSemanaAbrev(dia)}
                            </Badge>
                            <span className="text-sm text-muted-foreground font-medium">
                              {getDiaSemanaLabel(dia)}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 pl-2">
                            {horariosGrupo.map((horario) => {
                              const isSelected = formData.id_horarios.includes(
                                horario.id
                              );
                              const conflictType = conflictingHorarios.get(
                                horario.id
                              );
                              const isConflicting = !!conflictType;
                              // Desabilitar horários com conflitos de turma sempre, outros conflitos apenas se não selecionados
                              const isDisabled =
                                isConflicting &&
                                (conflictType === "turma" ||
                                  conflictType === "professor_turma" ||
                                  conflictType === "sala_turma" ||
                                  conflictType === "todos" ||
                                  !isSelected);

                              // Definir cores baseadas no tipo de conflito
                              const getConflictStyles = () => {
                                if (!isConflicting)
                                  return "cursor-pointer hover:bg-muted/50";

                                return "bg-destructive/10 text-destructive border-destructive/20 hover:bg-destructive/20";
                              };

                              const getConflictTextColor = () => {
                                if (!isConflicting) return "";

                                return "text-destructive";
                              };

                              const getConflictLabel = () => {
                                switch (conflictType) {
                                  case "professor":
                                    return "(Prof. ocupado)";
                                  case "sala":
                                    return "(Sala ocupada)";
                                  case "turma":
                                    return "(Turma ocupada)";
                                  case "professor_sala":
                                    return "(Prof. e Sala)";
                                  case "professor_turma":
                                    return "(Prof. e Turma)";
                                  case "sala_turma":
                                    return "(Sala e Turma)";
                                  case "todos":
                                    return "(Todos ocupados)";
                                  default:
                                    return "";
                                }
                              };

                              return (
                                <label
                                  key={horario.id}
                                  className={`flex items-center space-x-3 p-2 rounded-md transition-colors ${getConflictStyles()} ${
                                    isDisabled
                                      ? "cursor-not-allowed opacity-60"
                                      : ""
                                  }`}
                                >
                                  <input
                                    type={
                                      editingAlocacao ? "radio" : "checkbox"
                                    }
                                    name={
                                      editingAlocacao ? "horario" : undefined
                                    }
                                    checked={isSelected}
                                    disabled={isDisabled}
                                    onChange={(e) => {
                                      if (editingAlocacao) {
                                        setFormData((prev) => ({
                                          ...prev,
                                          id_horarios: e.target.checked
                                            ? [horario.id]
                                            : [],
                                        }));
                                      } else {
                                        handleHorarioChange(
                                          horario.id,
                                          e.target.checked
                                        );
                                      }
                                    }}
                                    className={`rounded ${
                                      isDisabled ? "cursor-not-allowed" : ""
                                    }`}
                                  />
                                  <span
                                    className={`text-sm font-medium ${
                                      isDisabled ? getConflictTextColor() : ""
                                    }`}
                                  >
                                    {horario.codigo}
                                    {isConflicting && (
                                      <span
                                        className={`ml-1 text-xs ${getConflictTextColor()}`}
                                      >
                                        {getConflictLabel()}
                                      </span>
                                    )}
                                  </span>
                                </label>
                              );
                            })}
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </div>

                {/* Legenda de conflitos */}
                <div className="px-4 py-2 border-t">
                  <div className="text-xs font-medium mb-2 text-muted-foreground">
                    Legenda de Conflitos:
                  </div>
                  <div className="grid grid-cols-1 gap-1 text-xs">
                    <div className="flex items-center gap-1.5">
                         <div className="w-2.5 h-2.5 rounded-sm bg-destructive/20 border border-destructive"></div>
                         <span className="text-muted-foreground">Conflito de horário</span>
                       </div>
                  </div>
                </div>

                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCloseDialog}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    disabled={submitting || formData.id_horarios.length === 0}
                  >
                    {submitting
                      ? "Salvando..."
                      : editingAlocacao
                      ? "Atualizar Alocação"
                      : "Criar Alocação"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Filtros */}
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="relative">
                <label className="text-sm font-medium text-foreground mb-1 block">
                  Filtrar por: Nome/Sala/Horario
                </label>
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4 mt-3" />
                <Input
                  placeholder="Buscar alocações..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Filtro por data de início */}
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">
                  Data Início
                </label>
                <DatePicker
                  date={filtroDataInicio}
                  onDateChange={setFiltroDataInicio}
                  placeholder="Selecione data de início"
                />
              </div>

              {/* Filtro por data de fim */}
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">
                  Data Fim
                </label>
                <DatePicker
                  date={filtroDataFim}
                  onDateChange={setFiltroDataFim}
                  placeholder="Selecione data de fim"
                />
              </div>

              {/* Filtro por dia da semana */}
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">
                  Dia da Semana
                </label>
                <Select
                  value={filtroDiaSemana}
                  onValueChange={setFiltroDiaSemana}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Todos os dias" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos os dias</SelectItem>
                    <SelectItem value="segunda">Segunda-feira</SelectItem>
                    <SelectItem value="terca">Terça-feira</SelectItem>
                    <SelectItem value="quarta">Quarta-feira</SelectItem>
                    <SelectItem value="quinta">Quinta-feira</SelectItem>
                    <SelectItem value="sexta">Sexta-feira</SelectItem>
                    <SelectItem value="sabado">Sábado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Filtro por período */}
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">
                  Período
                </label>
                <Select value={filtroPeriodo} onValueChange={setFiltroPeriodo}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos os períodos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos os períodos</SelectItem>
                    <SelectItem value="M">Manhã</SelectItem>
                    <SelectItem value="T">Tarde</SelectItem>
                    <SelectItem value="N">Noite</SelectItem>
                    <SelectItem value="M1">M1 - Manhã</SelectItem>
                    <SelectItem value="M2">M2 - Manhã</SelectItem>
                    <SelectItem value="M3">M3 - Manhã</SelectItem>
                    <SelectItem value="M4">M4 - Manhã</SelectItem>
                    <SelectItem value="M5">M5 - Manhã</SelectItem>
                    <SelectItem value="M6">M6 - Manhã</SelectItem>
                    <SelectItem value="T1">T1 - Tarde</SelectItem>
                    <SelectItem value="T2">T2 - Tarde</SelectItem>
                    <SelectItem value="T3">T3 - Tarde</SelectItem>
                    <SelectItem value="T4">T4 - Tarde</SelectItem>
                    <SelectItem value="T5">T5 - Tarde</SelectItem>
                    <SelectItem value="T6">T6 - Tarde</SelectItem>
                    <SelectItem value="N1">N1 - Noite</SelectItem>
                    <SelectItem value="N2">N2 - Noite</SelectItem>
                    <SelectItem value="N3">N3 - Noite</SelectItem>
                    <SelectItem value="N4">N4 - Noite</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Seção de Filtros Avançados */}
            <div className="mt-6 pt-4 border-t border-border">
              <h3 className="text-lg font-medium text-foreground mb-4">
                Filtros Avançados
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Filtro por Turma */}
                <div>
                  <label className="text-sm font-medium text-foreground mb-1 block">
                    Turma
                  </label>
                  <Select
                    value={filtroTurmaId}
                    onValueChange={setFiltroTurmaId}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma turma" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todas">Todas as turmas</SelectItem>
                      {turmas.map((turma) => (
                        <SelectItem key={turma.id} value={turma.id}>
                          {turma.nome} - {turma.periodo}º período ({turma.turno}
                          )
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
                  setFiltroDataInicio("");
                  setFiltroDataFim("");
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
                        <Edit className="h-4 w-4" />
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
