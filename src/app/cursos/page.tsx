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
import { Plus, Search, Edit, Trash2, Loader2, List } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { cursoService, disciplinaService } from "@/services/entities";
import { Curso, CreateCursoRequest, Disciplina } from "@/types/entities";
import { useAuthStore } from "@/store/auth";

export default function CursosPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const canManage = user?.role === "ADMIN" || user?.role === "COORDENADOR";

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

  // Disciplinas por curso (sem paginação, ordenadas por semestre)
  const [disciplinasPorCurso, setDisciplinasPorCurso] = useState<Record<string, Disciplina[]>>({});
  const [loadingDisciplinas, setLoadingDisciplinas] = useState<boolean>(false);
  
  // Modal de disciplinas
  const [disciplinasModalOpen, setDisciplinasModalOpen] = useState(false);
  const [cursoSelecionadoParaDisciplinas, setCursoSelecionadoParaDisciplinas] = useState<Curso | null>(null);
  const [disciplinasSemestreFilter, setDisciplinasSemestreFilter] = useState<'ALL' | number>('ALL');

  // Vincular/Desvincular
  const [vincularDialogOpen, setVincularDialogOpen] = useState(false);
  const [cursoIdForVinculo, setCursoIdForVinculo] = useState<string | null>(null);
  const [selectedDisciplinaId, setSelectedDisciplinaId] = useState<string>("");
  const [allDisciplinas, setAllDisciplinas] = useState<Disciplina[]>([]);
  const [loadingAllDisciplinas, setLoadingAllDisciplinas] = useState(false);
  const [linking, setLinking] = useState(false);
  const [linkingDisciplinaId, setLinkingDisciplinaId] = useState<string | null>(null);
  const [unlinkingId, setUnlinkingId] = useState<string | null>(null);
  const [vincularSemestreFilter, setVincularSemestreFilter] = useState<'ALL' | number>('ALL');

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

  const fetchDisciplinasDoCurso = async (id_curso: string) => {
    try {
      setLoadingDisciplinas(true);
      const response = await cursoService.getDisciplinas(id_curso);
      setDisciplinasPorCurso((prev) => ({ ...prev, [id_curso]: response.disciplinas }));
    } catch (error) {
      console.error("Erro ao buscar disciplinas do curso:", error);
      toast.error("Erro ao carregar disciplinas do curso");
    } finally {
      setLoadingDisciplinas(false);
    }
  };

  const openDisciplinasModal = (curso: Curso) => {
     setCursoSelecionadoParaDisciplinas(curso);
     setDisciplinasModalOpen(true);
     setDisciplinasSemestreFilter('ALL');
     
     // Carregar disciplinas se ainda não foram carregadas
     if (!disciplinasPorCurso[curso.id]) {
       fetchDisciplinasDoCurso(curso.id);
     }
   };

  const openVincularDialog = async (id_curso: string) => {
    setCursoIdForVinculo(id_curso);
    setVincularDialogOpen(true);
    setSelectedDisciplinaId("");
    setVincularSemestreFilter('ALL');
    try {
      setLoadingAllDisciplinas(true);
      const response = await disciplinaService.getAll();
      setAllDisciplinas(response.disciplinas);
    } catch (error) {
      console.error("Erro ao buscar disciplinas:", error);
      toast.error("Erro ao carregar lista de disciplinas");
    } finally {
      setLoadingAllDisciplinas(false);
    }
  };

  const handleVincular = async () => {
    if (!cursoIdForVinculo || !selectedDisciplinaId) {
      toast.error("Selecione uma disciplina");
      return;
    }
    try {
      setLinking(true);
      await cursoService.vincularDisciplina(cursoIdForVinculo, selectedDisciplinaId);
      toast.success("Disciplina vinculada com sucesso!");
      await fetchDisciplinasDoCurso(cursoIdForVinculo);
      setVincularDialogOpen(false);
      setSelectedDisciplinaId("");
    } catch (error) {
      console.error("Erro ao vincular disciplina:", error);
      const errorMessage = (error as any)?.response?.data?.message || (error as any)?.message || "Erro ao vincular disciplina";
      toast.error(errorMessage);
    } finally {
      setLinking(false);
    }
  };

  const handleVincularPorId = async (id_disciplina: string) => {
    if (!cursoIdForVinculo) {
      toast.error("Curso não definido para vínculo");
      return;
    }
    try {
      setLinking(true);
      setLinkingDisciplinaId(id_disciplina);
      await cursoService.vincularDisciplina(cursoIdForVinculo, id_disciplina);
      toast.success("Disciplina vinculada com sucesso!");
      await fetchDisciplinasDoCurso(cursoIdForVinculo);
    } catch (error) {
      console.error("Erro ao vincular disciplina:", error);
      const errorMessage = (error as any)?.response?.data?.message || (error as any)?.message || "Erro ao vincular disciplina";
      toast.error(errorMessage);
    } finally {
      setLinking(false);
      setLinkingDisciplinaId(null);
    }
  };

  const handleDesvincular = async (id_curso: string, id_disciplina: string) => {
    try {
      setUnlinkingId(id_disciplina);
      await cursoService.desvincularDisciplina(id_curso, id_disciplina);
      toast.success("Disciplina desvinculada!");
      // Atualizar local sem refetch completo
      setDisciplinasPorCurso((prev) => ({
        ...prev,
        [id_curso]: (prev[id_curso] || []).filter((d) => d.id !== id_disciplina),
      }));
    } catch (error) {
      console.error("Erro ao desvincular disciplina:", error);
      const errorMessage = (error as any)?.response?.data?.message || (error as any)?.message || "Erro ao desvincular disciplina";
      toast.error(errorMessage);
    } finally {
      setUnlinkingId(null);
    }
  };

  useEffect(() => {
    fetchCursos();
  }, []);

  // Disciplinas disponíveis para vincular (exclui as já vinculadas)
  const availableDisciplinas = cursoIdForVinculo
    ? allDisciplinas.filter(
        (d) => !(disciplinasPorCurso[cursoIdForVinculo] || []).some((ld) => ld.id === d.id)
      )
    : allDisciplinas;

  // Handlers (devem estar dentro do componente, antes do return)
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
    try {
      await cursoService.delete(id);
      toast.success("Curso excluído com sucesso!");
      fetchCursos();
    } catch (error: unknown) {
      console.error("Erro ao excluir curso:", (error as { response?: { data?: unknown }; message?: string })?.response?.data || (error as { message?: string })?.message);
      const errorMessage = error instanceof Error ? error.message : 
        (error as { response?: { data?: { message?: string } }; message?: string })?.response?.data?.message || 
        (error as { message?: string })?.message || 
        "Erro desconhecido";
      toast.error("Erro ao excluir curso: " + errorMessage);
    }
  };

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
              <Plus className="mr-2 h-4 w-4" />
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
                      <option value="MATUTINO">Matutino</option>
                      <option value="VESPERTINO">Vespertino</option>
                      <option value="NOTURNO">Noturno</option>
                      <option value="INTEGRAL">Integral</option>
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
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">{curso.turno}</Badge>
                      <Badge variant="outline">
                        Disciplinas: {disciplinasPorCurso[curso.id]?.length ?? "-"}
                      </Badge>
                    </div>
                  </div>

                </CardHeader>
                <CardContent>
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div className="text-sm text-muted-foreground">
                      Criado em{" "}
                      {new Date(curso.created_at).toLocaleDateString("pt-BR")}
                    </div>
                    <div className="flex flex-wrap gap-2 justify-end w-full md:w-auto">
                      <Button
                        variant="outline"
                        size="sm"
                        title="Ver disciplinas do curso"
                        onClick={() => openDisciplinasModal(curso)}
                      >
                        <List className="h-4 w-4 text-green-600 mr-1" />
                        Disciplinas
                      </Button>
                      {canManage && (
                        <Button
                          variant="outline"
                          size="sm"
                          title="Vincular disciplina ao curso"
                          onClick={() => openVincularDialog(curso.id)}
                        >
                          <Plus className="h-4 w-4 text-green-600 mr-1" />
                          Vincular
                        </Button>
                      )}
                      {canManage && (
                        <Button
                          variant="outline"
                          size="sm"
                          title="Editar curso"
                          onClick={() => handleEdit(curso)}
                        >
                          <Edit className="h-4 w-4 text-shadblue-primary" />
                        </Button>
                      )}
                      {canManage && (
                        <Button
                          variant="outline"
                          size="sm"
                          title="Excluir curso"
                          onClick={() => handleDelete(curso.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      )}
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

        {/* Dialog de Vincular Disciplina */}
        <Dialog open={vincularDialogOpen} onOpenChange={setVincularDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Vincular Disciplina ao Curso</DialogTitle>
              <DialogDescription>
                Selecione uma disciplina para vincular ao curso.
              </DialogDescription>
            </DialogHeader>

            {/* Filtro por semestre */}
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm text-muted-foreground">Filtrar por semestre</div>
              <select
                value={vincularSemestreFilter}
                onChange={(e) => {
                  const val = e.target.value;
                  setVincularSemestreFilter(val === 'ALL' ? 'ALL' : Number(val));
                }}
                className="flex h-9 rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="ALL">Todos</option>
                {(() => {
                  const maxSem = availableDisciplinas.reduce((m, d) => Math.max(m, d.semestre || 0), 0);
                  return Array.from({ length: maxSem }, (_, i) => i + 1).map((s) => (
                    <option key={s} value={s}>{s}º</option>
                  ));
                })()}
              </select>
            </div>

            <div className="max-h-[400px] overflow-y-auto space-y-3">
              {loadingAllDisciplinas ? (
                <div className="flex items-center justify-center py-8 text-muted-foreground">
                  <Loader2 className="h-6 w-6 animate-spin mr-2" /> Carregando disciplinas...
                </div>
              ) : (
                (() => {
                  const disponiveisFiltradas = availableDisciplinas.filter((d) =>
                    vincularSemestreFilter === 'ALL' || d.semestre === vincularSemestreFilter
                  );
                  if (disponiveisFiltradas.length === 0) {
                    return (
                      <div className="text-center py-8 text-muted-foreground">
                        {vincularSemestreFilter === 'ALL'
                          ? 'Nenhuma disciplina disponível para vincular.'
                          : 'Nenhuma disciplina disponível neste semestre.'}
                      </div>
                    );
                  }
                  return (
                    <div className="space-y-3">
                      {disponiveisFiltradas.map((disciplina) => (
                        <div key={disciplina.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex-1">
                            <div className="font-medium">{disciplina.nome}</div>
                            <div className="text-sm text-muted-foreground">
                              Semestre {disciplina.semestre} • Carga Horária: {disciplina.carga_horaria}h
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{disciplina.semestre}º Sem</Badge>
                            <Badge variant="secondary">{disciplina.carga_horaria}h</Badge>
                            <Button
                              variant="default"
                              size="sm"
                              title="Vincular disciplina"
                              onClick={() => handleVincularPorId(disciplina.id)}
                              disabled={linking && linkingDisciplinaId === disciplina.id}
                            >
                              {linking && linkingDisciplinaId === disciplina.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                'Vincular'
                              )}
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })()
              )}
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setVincularDialogOpen(false)}
              >
                Cancelar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Modal de Disciplinas */}
        <Dialog open={disciplinasModalOpen} onOpenChange={setDisciplinasModalOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>
                Disciplinas - {cursoSelecionadoParaDisciplinas?.nome}
              </DialogTitle>
              <DialogDescription>
                Disciplinas vinculadas ao curso {cursoSelecionadoParaDisciplinas?.nome}
              </DialogDescription>
            </DialogHeader>
            
            {/* Filtro por semestre */}
            {cursoSelecionadoParaDisciplinas && (
              <div className="flex items-center justify-between mb-3">
                <div className="text-sm text-muted-foreground">Filtrar por semestre</div>
                <select
                  value={disciplinasSemestreFilter}
                  onChange={(e) => {
                    const val = e.target.value;
                    setDisciplinasSemestreFilter(val === 'ALL' ? 'ALL' : Number(val));
                  }}
                  className="flex h-9 rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="ALL">Todos</option>
                  {Array.from({ length: cursoSelecionadoParaDisciplinas.duracao_semestres || 0 }, (_, i) => i + 1).map((s) => (
                    <option key={s} value={s}>{s}º</option>
                  ))}
                </select>
              </div>
            )}

            <div className="max-h-[400px] overflow-y-auto">
              {loadingDisciplinas && (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin mr-2" />
                  Carregando disciplinas...
                </div>
              )}

              {!loadingDisciplinas && cursoSelecionadoParaDisciplinas && (
                <div className="space-y-3">
                  {((disciplinasPorCurso[cursoSelecionadoParaDisciplinas.id] || []).filter((d) => disciplinasSemestreFilter === 'ALL' || d.semestre === disciplinasSemestreFilter)).length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      {disciplinasSemestreFilter === 'ALL' ? 'Nenhuma disciplina vinculada a este curso.' : 'Nenhuma disciplina neste semestre.'}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {((disciplinasPorCurso[cursoSelecionadoParaDisciplinas.id] || []).filter((d) => disciplinasSemestreFilter === 'ALL' || d.semestre === disciplinasSemestreFilter)).map((disciplina) => (
                        <div key={disciplina.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex-1">
                            <div className="font-medium">{disciplina.nome}</div>
                            <div className="text-sm text-muted-foreground">
                              Semestre {disciplina.semestre} • Carga Horária: {disciplina.carga_horaria}h
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">
                              {disciplina.semestre}º Sem
                            </Badge>
                            <Badge variant="secondary">
                              {disciplina.carga_horaria}h
                            </Badge>
                            {canManage && (
                              <Button
                                variant="destructive"
                                size="sm"
                                title="Desvincular disciplina"
                                onClick={() => handleDesvincular(cursoSelecionadoParaDisciplinas.id, disciplina.id)}
                                disabled={unlinkingId === disciplina.id}
                              >
                                {unlinkingId === disciplina.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Trash2 className="h-4 w-4" />
                                )}
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setDisciplinasModalOpen(false)}>
                Fechar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
}