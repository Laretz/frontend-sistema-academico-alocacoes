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
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Plus, Search, Edit, Trash2, Users, Calendar } from "lucide-react";
import { useState, useEffect } from "react";
import { turmaService, cursoService } from "@/services/entities";
import { Turma, CreateTurmaRequest, Curso } from "@/types/entities";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { GradeHorariosTurma } from "@/components/GradeHorariosTurma";

export default function TurmasPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTurma, setEditingTurma] = useState<Turma | null>(null);
  const [formData, setFormData] = useState<CreateTurmaRequest>({
    nome: "",
    num_alunos: 0,
    periodo: 1,
    turno: "",
    id_curso: "",
  });

  useEffect(() => {
    fetchTurmas();
    fetchCursos();
  }, []);

  const fetchTurmas = async () => {
    try {
      setLoading(true);
      const response = await turmaService.getAll();
      setTurmas(response.turmas);
    } catch (error) {
      console.error("Erro ao buscar turmas:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCursos = async () => {
    try {
      const response = await cursoService.getAll();
      setCursos(response.cursos);
    } catch (error) {
      console.error("Erro ao buscar cursos:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingTurma) {
        await turmaService.update(editingTurma.id, formData);
      } else {
        await turmaService.create(formData);
      }
      await fetchTurmas();
      handleCloseDialog();
    } catch (error) {
      console.error("Erro ao salvar turma:", error);
    }
  };

  const handleEdit = (turma: Turma) => {
    setEditingTurma(turma);
    setFormData({
      nome: turma.nome,
      num_alunos: turma.num_alunos,
      periodo: turma.periodo,
      turno: turma.turno,
      id_curso: turma.id_curso || "",
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Tem certeza que deseja excluir esta turma?")) {
      try {
        await turmaService.delete(id);
        await fetchTurmas();
      } catch (error) {
        console.error("Erro ao excluir turma:", error);
      }
    }
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingTurma(null);
    setFormData({
      nome: "",
      num_alunos: 0,
      periodo: 1,
      turno: "",
      id_curso: "",
    });
  };

  const filteredTurmas = turmas.filter((turma) =>
    turma.nome.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Turmas</h1>
            <p className="text-muted-foreground">
              Gerencie as turmas e suas alocações
            </p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Nova Turma
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>
                  {editingTurma ? "Editar Turma" : "Nova Turma"}
                </DialogTitle>
                <DialogDescription>
                  {editingTurma
                    ? "Edite as informações da turma abaixo."
                    : "Preencha as informações para criar uma nova turma."}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="nome">Nome da Turma</Label>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Input
                          id="nome"
                          value={formData.nome}
                          onChange={(e) =>
                            setFormData({ ...formData, nome: e.target.value })
                          }
                          placeholder="Ex: Turma A"
                          className="max-w-full truncate"
                          required
                        />
                      </TooltipTrigger>
                      {formData.nome && formData.nome.length > 20 && (
                        <TooltipContent className="max-w-xs p-2 text-sm bg-popover text-popover-foreground border rounded shadow-lg">
                          <p className="break-words">{formData.nome}</p>
                        </TooltipContent>
                      )}
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="num_alunos">Número de Alunos</Label>
                  <Input
                    id="num_alunos"
                    type="number"
                    value={formData.num_alunos}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        num_alunos: parseInt(e.target.value) || 0,
                      })
                    }
                    placeholder="Ex: 30"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="periodo">Período</Label>
                  <Input
                    id="periodo"
                    type="number"
                    value={formData.periodo}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        periodo: parseInt(e.target.value) || 1,
                      })
                    }
                    placeholder="Ex: 1"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="turno">Turno</Label>
                  <Select
                    value={formData.turno}
                    onValueChange={(value) =>
                      setFormData({ ...formData, turno: value })
                    }
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o turno" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MATUTINO">Matutino</SelectItem>
                      <SelectItem value="VESPERTINO">Vespertino</SelectItem>
                      <SelectItem value="NOTURNO">Noturno</SelectItem>
                      <SelectItem value="INTEGRAL">Integral</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="id_curso">Curso</Label>
                  <Select
                    value={formData.id_curso}
                    onValueChange={(value) =>
                      setFormData({ ...formData, id_curso: value })
                    }
                    required
                  >
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <SelectTrigger className="max-w-full">
                            <div className="truncate">
                              {formData.id_curso ? (
                                <span className="truncate block">
                                  {(() => {
                                    const curso = cursos.find(c => c.id === formData.id_curso);
                                    if (!curso) return "Curso não encontrado";
                                    const nomeCompleto = `${curso.nome} - ${curso.turno}`;
                                    return nomeCompleto.length > 30 
                                      ? nomeCompleto.substring(0, 30) + "..."
                                      : nomeCompleto;
                                  })()} 
                                </span>
                              ) : (
                                <span className="text-muted-foreground">
                                  Selecione um curso
                                </span>
                              )}
                            </div>
                          </SelectTrigger>
                        </TooltipTrigger>
                        {formData.id_curso && (() => {
                          const curso = cursos.find(c => c.id === formData.id_curso);
                          const nomeCompleto = curso ? `${curso.nome} - ${curso.turno}` : "";
                          return nomeCompleto.length > 30;
                        })() && (
                          <TooltipContent className="max-w-xs p-2 text-sm bg-popover text-popover-foreground border rounded shadow-lg">
                            <p className="break-words">
                              {(() => {
                                const curso = cursos.find(c => c.id === formData.id_curso);
                                return curso ? `${curso.nome} - ${curso.turno}` : "";
                              })()}
                            </p>
                          </TooltipContent>
                        )}
                      </Tooltip>
                    </TooltipProvider>
                    <SelectContent>
                      {cursos.map((curso) => (
                        <SelectItem key={curso.id} value={curso.id}>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span className="truncate max-w-[250px] block">
                                  {curso.nome} - {curso.turno}
                                </span>
                              </TooltipTrigger>
                              <TooltipContent className="max-w-xs p-2 text-sm bg-popover text-popover-foreground border rounded shadow-lg">
                                <p className="break-words">
                                  {curso.nome} - {curso.turno}
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCloseDialog}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit">
                    {editingTurma ? "Atualizar" : "Criar"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="flex items-center space-x-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar turmas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Carregando turmas...</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredTurmas.map((turma, index) => (
              <Card 
                key={turma.id}
                className={index % 2 === 0 ? "bg-background" : "bg-muted/30"}
              >
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{turma.nome}</CardTitle>
                      <CardDescription className="mt-1">
                        Turma {turma.periodo}º período
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Turno:</span>
                      <span className="font-medium">{turma.turno}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Período:</span>
                      <span>{turma.periodo}º</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground flex items-center">
                        <Users className="mr-1 h-3 w-3" />
                        Alunos:
                      </span>
                      <span className="font-medium text-primary">
                        {turma.num_alunos}
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-2 mt-4">
                    <GradeHorariosTurma
                      turma={turma}
                      trigger={
                        <Button variant="outline" size="sm">
                          <Calendar className="h-4 w-4" />
                        </Button>
                      }
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(turma)}
                    >
                      <Edit className="h-4 w-4 text-shadblue-primary" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(turma.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {!loading && filteredTurmas.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              {searchTerm
                ? "Nenhuma turma corresponde à sua busca."
                : "Nenhuma turma encontrada."}
            </p>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
