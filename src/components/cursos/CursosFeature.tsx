"use client";

import { MainLayout } from "@/components/layout/main-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EditarCursoDialog } from "@/components/cursos/EditarCursoDialog";
import { VincularDisciplinaDialog } from "@/components/cursos/VincularDisciplinaDialog";
import { DisciplinasDoCursoDialog } from "@/components/cursos/DisciplinasDoCursoDialog";
import { useCursos } from "@/hooks/useCursos";
import { useAuthStore } from "@/store/auth";
import { Edit, List, Loader2, Plus, Search, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";

export function CursosFeature() {
  const router = useRouter();
  const { user } = useAuthStore();
  const canManage = user?.role === "ADMIN" || user?.role === "COORDENADOR";

  const state = useCursos();

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Cursos</h1>
            <p className="text-muted-foreground">Gerencie os cursos da instituição</p>
          </div>

          <Button onClick={() => router.push("/cursos/criar")}>
            <Plus className="mr-2 h-4 w-4" />
            Novo Curso
          </Button>
        </div>

        <div className="flex items-center space-x-2">
          <Search className="h-4 w-4 text-gray-500" />
          <Input
            placeholder="Buscar cursos..."
            value={state.searchTerm}
            onChange={(e) => state.setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
        </div>

        {state.loading ? (
          <div className="flex items-center justify-center h-32">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {state.filteredCursos.map((curso) => (
              <Card key={curso.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{curso.nome}</CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">{curso.turno}</Badge>
                      <Badge variant="outline">
                        Disciplinas: {state.disciplinasPorCurso[curso.id]?.length ?? "-"}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div className="text-sm text-muted-foreground">
                      Criado em {new Date(curso.created_at).toLocaleDateString("pt-BR")}
                    </div>
                    <div className="flex flex-wrap gap-2 justify-end w-full md:w-auto">
                      <Button
                        variant="outline"
                        size="sm"
                        title="Ver disciplinas do curso"
                        onClick={() => state.abrirModalDisciplinas(curso)}
                      >
                        <List className="h-4 w-4 text-green-600 mr-1" />
                        Disciplinas
                      </Button>

                      {canManage && (
                        <Button
                          variant="outline"
                          size="sm"
                          title="Vincular disciplina ao curso"
                          onClick={() => state.abrirVincularDialog(curso.id)}
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
                          onClick={() => state.editarCurso(curso)}
                        >
                          <Edit className="h-4 w-4 text-shadblue-primary" />
                        </Button>
                      )}

                      {canManage && (
                        <Button
                          variant="outline"
                          size="sm"
                          title="Excluir curso"
                          onClick={() => state.excluirCurso(curso.id)}
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

        {!state.loading && state.filteredCursos.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              {state.searchTerm
                ? "Nenhum curso encontrado para a busca."
                : "Nenhum curso cadastrado."}
            </p>
          </div>
        )}

        <EditarCursoDialog
          open={state.dialogOpen}
          onOpenChange={(open) => {
            if (!open) state.fecharDialogEdicao();
            else state.setDialogOpen(true);
          }}
          editingCurso={state.editingCurso}
          formData={state.formData}
          setFormData={state.setFormData}
          submitting={state.submitting}
          onSubmit={state.salvarCurso}
        />

        <VincularDisciplinaDialog
          open={state.vincularDialogOpen}
          onOpenChange={state.setVincularDialogOpen}
          loading={state.loadingAllDisciplinas}
          disciplinas={state.availableDisciplinas}
          semestreFilter={state.vincularSemestreFilter}
          onSemestreFilterChange={state.setVincularSemestreFilter}
          onVincular={state.vincularPorId}
          linking={state.linking}
          linkingDisciplinaId={state.linkingDisciplinaId}
        />

        <DisciplinasDoCursoDialog
          open={state.disciplinasModalOpen}
          onOpenChange={state.setDisciplinasModalOpen}
          curso={state.cursoSelecionadoParaDisciplinas}
          disciplinas={
            state.cursoSelecionadoParaDisciplinas
              ? state.disciplinasPorCurso[state.cursoSelecionadoParaDisciplinas.id] || []
              : []
          }
          loading={state.loadingDisciplinas}
          semestreFilter={state.disciplinasSemestreFilter}
          onSemestreFilterChange={state.setDisciplinasSemestreFilter}
          canManage={canManage}
          unlinkingId={state.unlinkingId}
          onUnlink={(id_disciplina) => {
            if (!state.cursoSelecionadoParaDisciplinas) return;
            state.desvincular(state.cursoSelecionadoParaDisciplinas.id, id_disciplina);
          }}
        />
      </div>
    </MainLayout>
  );
}

