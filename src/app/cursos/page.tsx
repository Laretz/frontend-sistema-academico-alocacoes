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
import { Label } from "@/components/ui/label";
import { Plus, Search, Edit, Trash2, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { cursoService } from "@/services/entities";
import { Curso, CreateCursoRequest } from "@/types/entities";

export default function CursosPage() {
  const router = useRouter();
  const [cursos, setCursos] = useState<Curso[]>([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCurso, setEditingCurso] = useState<Curso | null>(null);
  const [formData, setFormData] = useState<CreateCursoRequest>({
    nome: "",
    turno: "MATUTINO",
    duracao_semestres: 1,
    codigo: "123456",
  });
  const [submitting, setSubmitting] = useState(false);

  const filteredCursos =
    cursos?.filter((curso) =>
      curso.nome.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

  const fetchCursos = async () => {
    try {
      setLoading(true);
      const response = await cursoService.getAll(1);
      setCursos(response.cursos);
    } catch (error) {
      console.error("Erro ao buscar cursos:", error);
      toast.error("Erro ao carregar cursos");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nome || !formData.turno) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        ...formData,
      };

      if (editingCurso) {
        await cursoService.update(editingCurso.id, payload);
        toast.success("Curso atualizado com sucesso!");
      } else {
        await cursoService.create(payload);
        toast.success("Curso criado com sucesso!");
      }

      handleCloseDialog();
      fetchCursos();
    } catch (error) {
      console.error("Erro ao salvar curso:", error);
      toast.error(
        editingCurso ? "Erro ao atualizar curso" : "Erro ao criar curso"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (curso: Curso) => {
    setEditingCurso(curso);
    setFormData({
      nome: curso.nome,
      turno: curso.turno,
      duracao_semestres: curso.duracao_semestres,
      codigo: curso.codigo,
    });
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingCurso(null);
    setFormData({
      nome: "",
      turno: "MATUTINO",
      duracao_semestres: 1,
      codigo: "123456",
    });
  };

  const handleDelete = async (id: string) => {
    console.log("Tentando deletar curso com ID:", id);
    try {
      await cursoService.delete(id);
      console.log("Delete bem-sucedido!");
      toast.success("Curso excluído com sucesso!");
      fetchCursos();
    } catch (error: unknown) {
      console.error(
        "Erro ao excluir curso:",
        (error as { response?: { data?: unknown }; message?: string })?.response?.data || (error as { message?: string })?.message
      );
      const errorMessage = error instanceof Error ? error.message : 
        (error as { response?: { data?: { message?: string } }; message?: string })?.response?.data?.message || 
        (error as { message?: string })?.message || 
        "Erro desconhecido";
      toast.error("Erro ao excluir curso: " + errorMessage);
    }
  };

  useEffect(() => {
    fetchCursos();
  }, []);

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Cursos</h1>
            <p className="text-muted-foreground">
              Gerencie os cursos da instituição
            </p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <Button onClick={() => router.push('/cursos/criar')}>
              <Plus className="mr-2 h-4 w-4 text-white" />
              Novo Curso
            </Button>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>
                  {editingCurso ? "Editar Curso" : "Novo Curso"}
                </DialogTitle>
                <DialogDescription>
                  {editingCurso
                    ? "Edite os dados do curso."
                    : "Preencha os dados para criar um novo curso."}
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
                      placeholder="Nome do curso"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="turno" className="text-right">
                      Turno
                    </Label>
                    <select
                      id="turno"
                      value={formData.turno}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          turno: e.target.value as "MATUTINO" | "VESPERTINO" | "NOTURNO" | "INTEGRAL",
                        })
                      }
                      className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      required
                    >
                      <option value="MANHA">Manhã</option>
                      <option value="TARDE">Tarde</option>
                      <option value="NOITE">Noite</option>
                    </select>
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
                    {editingCurso ? "Atualizar Curso" : "Criar Curso"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="flex items-center space-x-2">
          <Search className="h-4 w-4 text-gray-500" />
          <Input
            placeholder="Buscar cursos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-32">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredCursos.map((curso) => (
              <Card key={curso.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{curso.nome}</CardTitle>
                    <Badge variant="secondary">{curso.turno}</Badge>
                  </div>

                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                      Criado em{" "}
                      {new Date(curso.created_at).toLocaleDateString("pt-BR")}
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        title="Editar curso"
                        onClick={() => handleEdit(curso)}
                      >
                        <Edit className="h-4 w-4 text-blue-600" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        title="Excluir curso"
                        onClick={() => handleDelete(curso.id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {!loading && filteredCursos.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              {searchTerm
                ? "Nenhum curso encontrado para a busca."
                : "Nenhum curso cadastrado."}
            </p>
          </div>
        )}
      </div>
    </MainLayout>
  );
}