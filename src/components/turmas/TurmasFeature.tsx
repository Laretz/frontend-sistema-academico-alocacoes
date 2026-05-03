"use client";

import { MainLayout } from "@/components/layout/main-layout";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useTurmas } from "@/hooks/useTurmas";
import { TurmaDialog } from "@/components/turmas/TurmaDialog";
import { TurmasFilters } from "@/components/turmas/TurmasFilters";
import { TurmasGrid } from "@/components/turmas/TurmasGrid";

export function TurmasFeature() {
  const state = useTurmas();

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Turmas</h1>
            <p className="text-muted-foreground">Gerencie as turmas e suas alocações</p>
          </div>

          <Button onClick={state.abrirNova}>
            <Plus className="mr-2 h-4 w-4" />
            Nova Turma
          </Button>
        </div>

        <TurmasFilters
          searchTerm={state.searchTerm}
          onSearchTermChange={state.setSearchTerm}
          semestresDisponiveis={state.semestresDisponiveis}
          semestreFiltro={state.semestreFiltro}
          onSemestreFiltroChange={state.setSemestreFiltro}
          cursos={state.cursos}
          cursoFiltro={state.cursoFiltro}
          onCursoFiltroChange={state.setCursoFiltro}
          cursoFiltroLabel={
            state.cursoFiltro !== "todos"
              ? state.cursoLabelById.get(state.cursoFiltro) || null
              : null
          }
          onClear={state.limparFiltros}
        />

        {state.loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Carregando turmas...</p>
          </div>
        ) : state.filteredTurmas.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              {state.searchTerm ? "Nenhuma turma corresponde à sua busca." : "Nenhuma turma encontrada."}
            </p>
          </div>
        ) : (
          <TurmasGrid
            turmas={state.filteredTurmas}
            cursoLabelById={state.cursoLabelById}
            onEdit={state.editar}
            onDelete={(id) => {
              if (confirm("Tem certeza que deseja excluir esta turma?")) {
                state.excluir(id);
              }
            }}
          />
        )}

        <TurmaDialog
          open={state.dialogOpen}
          onOpenChange={(open) => {
            if (!open) state.fecharDialog();
            else state.setDialogOpen(true);
          }}
          editingTurma={state.editingTurma}
          cursos={state.cursos}
          formData={state.formData}
          setFormData={state.setFormData}
          onSubmit={state.salvar}
          onCancel={state.fecharDialog}
        />
      </div>
    </MainLayout>
  );
}

