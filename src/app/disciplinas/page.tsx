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
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Search, Edit, Trash2, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { disciplinaService, cursoService } from "@/services/entities";
import { Disciplina, CreateDisciplinaRequest, Curso } from "@/types/entities";
import { DatePicker } from "@/components/ui/date-picker";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function DisciplinasPage() {
  const [disciplinas, setDisciplinas] = useState<Disciplina[]>([]);
  const [cursos, setCursos] = useState<Curso[]>([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCurso, setSelectedCurso] = useState<string>("todos");
  const [selectedSemestre, setSelectedSemestre] = useState<string>("todos");
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingDisciplina, setEditingDisciplina] = useState<Disciplina | null>(
    null
  );
  const [formData, setFormData] = useState({
    nome: "",
    carga_horaria: 60,
    id_curso: "",
    tipo_de_sala: "Sala" as "Sala" | "Lab",
    periodo_letivo: "",
    codigo: "",
    semestre: 1,
    obrigatoria: true,
    data_inicio: undefined as Date | undefined,
    data_fim_prevista: undefined as Date | undefined,
  });
  const [submitting, setSubmitting] = useState(false);

  const filteredDisciplinas =
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
    }) || [];

  // Agrupar disciplinas por semestre
  const disciplinasPorSemestre = filteredDisciplinas.reduce(
    (acc, disciplina) => {
      const semestre = disciplina.semestre || 1;
      if (!acc[semestre]) {
        acc[semestre] = [];
      }
      acc[semestre].push(disciplina);
      return acc;
    },
    {} as Record<number, typeof disciplinas>
  );

  // Ordenar semestres
  const semestresOrdenados = Object.keys(disciplinasPorSemestre)
    .map(Number)
    .sort((a, b) => a - b);

  const fetchDisciplinas = async () => {
    try {
      setLoading(true);
      const response = await disciplinaService.getAll(1);
      setDisciplinas(response.disciplinas);
    } catch (error) {
      console.error("Erro ao buscar disciplinas:", error);
      toast.error("Erro ao carregar disciplinas");
    } finally {
      setLoading(false);
    }
  };

  const fetchCursos = async () => {
    try {
      const response = await cursoService.getAll(1);
      setCursos(response.cursos);
    } catch (error) {
      console.error("Erro ao buscar cursos:", error);
      toast.error("Erro ao carregar cursos");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
        data_fim_prevista:
          formData.data_fim_prevista?.toISOString() || undefined,
      };

      if (editingDisciplina) {
        await disciplinaService.update(editingDisciplina.id, payload);
        toast.success("Disciplina atualizada com sucesso!");
      } else {
        await disciplinaService.create(payload);
        toast.success("Disciplina criada com sucesso!");
      }

      handleCloseDialog();
      fetchDisciplinas();
    } catch (error) {
      console.error("Erro ao salvar disciplina:", error);
      toast.error(
        editingDisciplina
          ? "Erro ao atualizar disciplina"
          : "Erro ao criar disciplina"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (disciplina: Disciplina) => {
    setEditingDisciplina(disciplina);
    setFormData({
      nome: disciplina.nome,
      carga_horaria: disciplina.carga_horaria,
      id_curso: disciplina.id_curso || "",
      tipo_de_sala: disciplina.tipo_de_sala as "Sala" | "Lab",
      periodo_letivo: disciplina.periodo_letivo || "",
      codigo: disciplina.codigo || "",
      semestre: disciplina.semestre || 1,
      obrigatoria: disciplina.obrigatoria || true,
      data_inicio: disciplina.data_inicio
        ? new Date(disciplina.data_inicio)
        : undefined,
      data_fim_prevista: disciplina.data_fim_prevista
        ? new Date(disciplina.data_fim_prevista)
        : undefined,
    });
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingDisciplina(null);
    setFormData({
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
    });
  };

  const handleDelete = async (id: string) => {
    console.log("Tentando deletar disciplina com ID:", id);
    try {
      await disciplinaService.delete(id);
      console.log("Delete bem-sucedido!");
      toast.success("Disciplina excluída com sucesso!");
      fetchDisciplinas();
    } catch (error: unknown) {
      console.error(
        "Erro ao excluir disciplina:",
        (error as { response?: { data?: unknown }; message?: string })?.response
          ?.data || (error as { message?: string })?.message
      );
      toast.error(
        "Erro ao excluir disciplina: " +
          ((
            error as {
              response?: { data?: { message?: string } };
              message?: string;
            }
          )?.response?.data?.message ||
            (error as { message?: string })?.message)
      );
    }
  };

  useEffect(() => {
    fetchDisciplinas();
    fetchCursos();
  }, []);

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Disciplinas</h1>
            <p className="text-muted-foreground">
              Gerencie as disciplinas do curso
            </p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4 text-primary-foreground" />
                Nova Disciplina
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>
                  {editingDisciplina ? "Editar Disciplina" : "Nova Disciplina"}
                </DialogTitle>
                <DialogDescription>
                  {editingDisciplina
                    ? "Edite os dados da disciplina."
                    : "Preencha os dados para criar uma nova disciplina."}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit}>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="nome" className="text-right">
                      Nome
                    </Label>
                    <Input
                      id="nome"
                      value={formData.nome}
                      onChange={(e) =>
                        setFormData({ ...formData, nome: e.target.value })
                      }
                      className="col-span-3"
                      placeholder="Nome da disciplina"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="id_curso" className="text-right">
                      Curso
                    </Label>
                    <select
                      id="id_curso"
                      value={formData.id_curso}
                      onChange={(e) =>
                        setFormData({ ...formData, id_curso: e.target.value })
                      }
                      className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      required
                    >
                      <option value="">Selecione um curso</option>
                      {cursos.map((curso) => (
                        <option key={curso.id} value={curso.id}>
                          {curso.nome} - {curso.turno}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="codigo" className="text-right">
                      Código
                    </Label>
                    <Input
                      id="codigo"
                      value={formData.codigo}
                      onChange={(e) =>
                        setFormData({ ...formData, codigo: e.target.value })
                      }
                      className="col-span-3"
                      placeholder="Código da disciplina"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="carga_horaria" className="text-right">
                      Carga Horária
                    </Label>
                    <select
                      id="carga_horaria"
                      value={formData.carga_horaria}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          carga_horaria: Number(e.target.value) as
                            | 30
                            | 45
                            | 60
                            | 90,
                        })
                      }
                      className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      required
                    >
                      <option value={30}>30 horas (36 aulas)</option>
                      <option value={45}>45 horas (54 aulas)</option>
                      <option value={60}>60 horas (72 aulas)</option>
                      <option value={90}>90 horas (108 aulas)</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="semestre" className="text-right">
                      Semestre
                    </Label>
                    <Input
                      id="semestre"
                      type="number"
                      min="1"
                      max="10"
                      value={formData.semestre}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          semestre: parseInt(e.target.value) || 1,
                        })
                      }
                      className="col-span-3"
                      placeholder="Semestre da disciplina"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="periodo_letivo" className="text-right">
                      Período Letivo
                    </Label>
                    <Input
                      id="periodo_letivo"
                      value={formData.periodo_letivo}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          periodo_letivo: e.target.value,
                        })
                      }
                      className="col-span-3"
                      placeholder="Ex: 2024.1"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="obrigatoria" className="text-right">
                      Tipo
                    </Label>
                    <select
                      id="obrigatoria"
                      value={formData.obrigatoria ? "true" : "false"}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          obrigatoria: e.target.value === "true",
                        })
                      }
                      className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      required
                    >
                      <option value="true">Obrigatória</option>
                      <option value="false">Optativa</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="tipo_de_sala" className="text-right">
                      Tipo de Sala
                    </Label>
                    <select
                      id="tipo_de_sala"
                      value={formData.tipo_de_sala}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          tipo_de_sala: e.target.value as "Lab" | "Sala",
                        })
                      }
                      className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      required
                    >
                      <option value="Sala">Sala</option>
                      <option value="Lab">Laboratório</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="data_inicio" className="text-right">
                      Data Início
                    </Label>
                    <div className="col-span-3">
                      <DatePicker
                        date={formData.data_inicio}
                        onDateChange={(date) =>
                          setFormData({
                            ...formData,
                            data_inicio: date,
                          })
                        }
                        placeholder="Selecione a data de início"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="data_fim_prevista" className="text-right">
                      Data Fim Prevista
                    </Label>
                    <div className="col-span-3">
                      <DatePicker
                        date={formData.data_fim_prevista}
                        onDateChange={(date) =>
                          setFormData({
                            ...formData,
                            data_fim_prevista: date,
                          })
                        }
                        placeholder="Selecione a data de fim prevista"
                      />
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
                  <Button type="submit" disabled={submitting}>
                    {submitting && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    {editingDisciplina
                      ? "Atualizar Disciplina"
                      : "Criar Disciplina"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="flex items-center space-x-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Buscar disciplinas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
          <div className="w-64">
            <Select value={selectedCurso} onValueChange={setSelectedCurso}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por curso" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os cursos</SelectItem>
                {cursos.map((curso) => (
                  <SelectItem key={curso.id} value={curso.id}>
                    {curso.nome} - {curso.turno}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="w-48">
            <Select
              value={selectedSemestre}
              onValueChange={setSelectedSemestre}
            >
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por semestre" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os semestres</SelectItem>
                <SelectItem value="1">1º Semestre</SelectItem>
                <SelectItem value="2">2º Semestre</SelectItem>
                <SelectItem value="3">3º Semestre</SelectItem>
                <SelectItem value="4">4º Semestre</SelectItem>
                <SelectItem value="5">5º Semestre</SelectItem>
                <SelectItem value="6">6º Semestre</SelectItem>
                <SelectItem value="7">7º Semestre</SelectItem>
                <SelectItem value="8">8º Semestre</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">Carregando disciplinas...</span>
          </div>
        ) : (
          <div className="space-y-6">
            {semestresOrdenados.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">
                  Nenhuma disciplina encontrada.
                </p>
              </div>
            ) : (
              semestresOrdenados.map((semestre) => (
                <div key={semestre} className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <h2 className="text-2xl font-bold">{semestre}º Semestre</h2>
                    <Badge variant="secondary" className="text-sm">
                      {disciplinasPorSemestre[semestre].length} disciplina
                      {disciplinasPorSemestre[semestre].length !== 1 ? "s" : ""}
                    </Badge>
                  </div>
                  <Card>
                    <CardContent className="p-0">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Nome</TableHead>
                            <TableHead>Código</TableHead>
                            <TableHead>Curso</TableHead>
                            <TableHead>Carga Horária</TableHead>
                            <TableHead>Tipo de Sala</TableHead>
                            <TableHead>Obrigatória</TableHead>
                            <TableHead>Período</TableHead>
                            <TableHead className="text-right">Ações</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {disciplinasPorSemestre[semestre].map(
                            (disciplina) => (
                              <TableRow key={disciplina.id}>
                                <TableCell className="font-medium">
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <span className="truncate max-w-[200px] block">
                                          {disciplina.nome}
                                        </span>
                                      </TooltipTrigger>
                                      <TooltipContent className="max-w-xs p-2 text-sm bg-popover text-popover-foreground border rounded shadow-lg">
                                        <p className="break-words">
                                          {disciplina.nome}
                                        </p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                </TableCell>
                                <TableCell>
                                  <Badge variant="outline">
                                    {disciplina.codigo || "N/A"}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <span className="truncate max-w-[150px] block">
                                          {disciplina.curso?.nome || "N/A"}
                                        </span>
                                      </TooltipTrigger>
                                      <TooltipContent className="max-w-xs p-2 text-sm bg-popover text-popover-foreground border rounded shadow-lg">
                                        <p className="break-words">
                                          {disciplina.curso?.nome || "N/A"}
                                        </p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                </TableCell>
                                <TableCell>
                                  {disciplina.carga_horaria === 30
                                    ? "30h (36 aulas)"
                                    : disciplina.carga_horaria === 45
                                    ? "45h (54 aulas)"
                                    : disciplina.carga_horaria === 60
                                    ? "60h (72 aulas)"
                                    : "90h (108 aulas)"}
                                </TableCell>
                                <TableCell>
                                  <Badge
                                    variant={
                                      disciplina.tipo_de_sala === "Lab"
                                        ? "default"
                                        : "secondary"
                                    }
                                  >
                                    {disciplina.tipo_de_sala}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  <Badge
                                    variant={
                                      disciplina.obrigatoria
                                        ? "default"
                                        : "outline"
                                    }
                                  >
                                    {disciplina.obrigatoria ? "Sim" : "Não"}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  {disciplina.periodo_letivo || "-"}
                                </TableCell>
                                <TableCell className="text-right">
                                  <div className="flex justify-end space-x-2">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      title="Editar disciplina"
                                      onClick={() => handleEdit(disciplina)}
                                    >
                                      <Edit className="h-4 w-4 text-blue-600" />
                                    </Button>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      title="Excluir disciplina"
                                      onClick={() =>
                                        handleDelete(disciplina.id)
                                      }
                                    >
                                      <Trash2 className="h-4 w-4 text-red-600" />
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            )
                          )}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                </div>
              ))
            )}
          </div>
        )}

        {!loading && filteredDisciplinas.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              {searchTerm
                ? "Nenhuma disciplina encontrada para a busca."
                : "Nenhuma disciplina cadastrada."}
            </p>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
