"use client";

import { MainLayout } from "@/components/layout/main-layout";
import { Loader2 } from "lucide-react";
import { useDisciplinas } from "@/hooks/useDisciplinas";
import { DisciplinaDialog } from "@/components/disciplinas/DisciplinaDialog";
import { DisciplinasFilters } from "@/components/disciplinas/DisciplinasFilters";
import { DisciplinasTableBySemestre } from "@/components/disciplinas/DisciplinasTableBySemestre";

export function DisciplinasFeature() {
  const state = useDisciplinas();

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

          <DisciplinaDialog
            open={state.dialogOpen}
            onOpenChange={(open) => {
              if (!open) state.fecharDialog();
              else state.setDialogOpen(true);
            }}
            cursos={state.cursos}
            editingDisciplina={state.editingDisciplina}
            formData={state.formData}
            setFormData={state.setFormData}
            submitting={state.submitting}
            onSubmit={state.salvar}
          />
        </div>

        <DisciplinasFilters
          cursos={state.cursos}
          semestresDisponiveis={state.semestresDisponiveis}
          searchTerm={state.searchTerm}
          onSearchTermChange={state.setSearchTerm}
          selectedCurso={state.selectedCurso}
          onSelectedCursoChange={state.setSelectedCurso}
          selectedSemestre={state.selectedSemestre}
          onSelectedSemestreChange={state.setSelectedSemestre}
          cursoLabel={
            state.selectedCurso !== "todos"
              ? state.cursoLabelById.get(state.selectedCurso) || null
              : null
          }
          onClear={state.limparFiltros}
        />

        {state.loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">Carregando disciplinas...</span>
          </div>
        ) : (
          <>
            <DisciplinasTableBySemestre
              semestresOrdenados={state.semestresOrdenados}
              disciplinasPorSemestre={state.disciplinasPorSemestre}
              onEdit={state.editar}
              onDelete={state.excluir}
            />

            {!state.filteredDisciplinas.length && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">
                  {state.searchTerm
                    ? "Nenhuma disciplina encontrada para a busca."
                    : "Nenhuma disciplina cadastrada."}
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </MainLayout>
  );
}

