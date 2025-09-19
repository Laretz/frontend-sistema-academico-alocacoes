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
import { useState, useEffect } from "react";
import {
  alocacaoService,
  disciplinaService,
  turmaService,
  salaService,
  horarioService,
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
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [salas, setSalas] = useState<Sala[]>([]);
  const [horarios, setHorarios] = useState<Horario[]>([]);
  //estados para filtros
  const [filtroDataInicio, setFiltroDataInicio] = useState<Date | undefined>(undefined);
  const [filtroDataFim, setFiltroDataFim] = useState<Date | undefined>(undefined);
  const [filtroDiaSemana, setFiltroDiaSemana] = useState("");
  const [filtroPeriodo, setFiltroPeriodo] = useState("");
  const [filtroTurmaId, setFiltroTurmaId] = useState("");
  useEffect(() => {
    fetchAlocacoes();
    fetchSelectData();
  }, []);

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
    if (!confirm("Tem certeza que deseja excluir todas as alocações desta turma?")) {
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
      setDisciplinas(disciplinasData.disciplinas || []);
      setTurmas(turmasData.turmas || []);
      setSalas(salasData.salas || []);
      setHorarios(horariosData || []);
    } catch (error) {
      console.error("Erro ao buscar dados para os selects:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    try {
      setSubmitting(true);

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
      } catch (error) {
        console.error("Erro ao excluir alocação:", error);
      }
    }
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingAlocacao(null);
    setFormData(initialFormData);
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
      if (filtroPeriodo === 'M' || filtroPeriodo === 'T' || filtroPeriodo === 'N') {
        if (!codigoHorario?.startsWith(filtroPeriodo.toLowerCase())) return false;
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
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
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
                      onValueChange={(value) =>
                        setFormData({ ...formData, id_user: value })
                      }
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
                    <Label htmlFor="id_disciplina">Disciplina</Label>
                    <Select
                      value={formData.id_disciplina}
                      onValueChange={(value) =>
                        setFormData({ ...formData, id_disciplina: value })
                      }
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma disciplina" />
                      </SelectTrigger>
                      <SelectContent>
                        {disciplinas.map((disciplina) => (
                          <SelectItem key={disciplina.id} value={disciplina.id}>
                            {disciplina.nome}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-4">
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
                            {turma.nome} - {turma.periodo}º período ({turma.turno})
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
                            {sala.nome} - {sala.predio} (Cap: {sala.capacidade})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>
                    Horários{" "}
                    {editingAlocacao
                      ? "(selecione apenas um)"
                      : "(selecione um ou mais)"}
                  </Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 max-h-48 overflow-y-auto border rounded p-2">
                    {horarios.map((horario) => (
                      <label
                        key={horario.id}
                        className="flex items-center space-x-2 cursor-pointer"
                      >
                        <input
                          type={editingAlocacao ? "radio" : "checkbox"}
                          name={editingAlocacao ? "horario" : undefined}
                          checked={formData.id_horarios.includes(horario.id)}
                          onChange={(e) => {
                            if (editingAlocacao) {
                              setFormData((prev) => ({
                                ...prev,
                                id_horarios: e.target.checked
                                  ? [horario.id]
                                  : [],
                              }));
                            } else {
                              handleHorarioChange(horario.id, e.target.checked);
                            }
                          }}
                          className="rounded"
                        />
                        <span className="text-sm">
                          {horario.codigo} -{" "}
                          {getDiaSemanaLabel(horario.dia_semana)}
                        </span>
                      </label>
                    ))}
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
                <Select value={filtroDiaSemana} onValueChange={setFiltroDiaSemana}>
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
            <h3 className="text-lg font-medium text-foreground mb-4">Filtros Avançados</h3>
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
              <Button
                onClick={fetchAlocacoes}
                variant="default"
                size="sm"
              >
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
                              ` - ${alocacao.sala.predio}`}
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
                          Horário: {alocacao.horario.horario_inicio} -{" "}
                          {alocacao.horario.horario_fim}
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
