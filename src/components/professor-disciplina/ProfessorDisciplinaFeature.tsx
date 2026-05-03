"use client";

import { MainLayout } from "@/components/layout/main-layout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { BookOpen, Users } from "lucide-react";
import { FilterSection } from "@/components/forms/filter-section";
import { useProfessorDisciplina } from "@/hooks/useProfessorDisciplina";
import { ProfessorView } from "@/components/professor-disciplina/ProfessorView";
import { DisciplinaView } from "@/components/professor-disciplina/DisciplinaView";
import { VinculoActions } from "@/components/professor-disciplina/VinculoActions";
import { VinculosList } from "@/components/professor-disciplina/VinculosList";

export function ProfessorDisciplinaFeature() {
  const state = useProfessorDisciplina();

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                Gerenciar Disciplinas por Professor
              </h1>
              <p className="text-muted-foreground">
                Vincule professores às disciplinas que podem lecionar
              </p>
            </div>
          </div>
        </div>

        <FilterSection
          searchTerm={state.searchTerm}
          onSearchChange={state.setSearchTerm}
          selectedSemestre={state.selectedSemestre}
          onSemestreChange={state.setSelectedSemestre}
          selectedCurso={state.selectedCurso}
          onCursoChange={state.setSelectedCurso}
          cursos={state.cursos}
          searchPlaceholder="Buscar disciplina por nome ou código..."
        />

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between gap-2">
              <span className="flex items-center gap-2">
                {state.viewMode === "professor" ? (
                  <>
                    <Users className="w-5 h-5" />
                    Vincular Professor às Disciplinas
                  </>
                ) : (
                  <>
                    <BookOpen className="w-5 h-5" />
                    Vincular Professores à Disciplina
                  </>
                )}
              </span>
              <span className="flex rounded-md border border-input bg-background p-1">
                <Button
                  variant={state.viewMode === "professor" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => state.setViewMode("professor")}
                  className="h-8"
                >
                  Professor
                </Button>
                <Button
                  variant={state.viewMode === "disciplina" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => state.setViewMode("disciplina")}
                  className="h-8"
                >
                  Disciplina
                </Button>
              </span>
            </CardTitle>
            <CardDescription>
              {state.viewMode === "professor"
                ? "Selecione um professor e as disciplinas que deseja vincular"
                : "Selecione uma disciplina e os professores que deseja vincular"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {state.viewMode === "professor" ? (
                <ProfessorView
                  professores={state.professores}
                  selectedProfessorId={state.selectedProfessorId}
                  onSelectedProfessorIdChange={state.setSelectedProfessorId}
                  disciplinas={state.disciplinas}
                  disciplinasGroupedBySemestre={state.disciplinasGroupedBySemestre}
                  filteredDisciplinasCount={state.filteredDisciplinas.length}
                  selectedDisciplinasIds={state.selectedDisciplinasIds}
                  onToggleDisciplina={(disciplinaId, checked) => {
                    if (checked) {
                      state.setSelectedDisciplinasIds((prev) => [
                        ...prev,
                        disciplinaId,
                      ]);
                      return;
                    }
                    state.setSelectedDisciplinasIds((prev) =>
                      prev.filter((id) => id !== disciplinaId),
                    );
                  }}
                  onToggleSelectAllDisciplinas={state.toggleSelectAllDisciplinas}
                />
              ) : (
                <DisciplinaView
                  filteredDisciplinas={state.filteredDisciplinas}
                  selectedDisciplinaId={state.selectedDisciplinaId}
                  onSelectedDisciplinaIdChange={state.setSelectedDisciplinaId}
                  professores={state.professores}
                  selectedProfessoresIds={state.selectedProfessoresIds}
                  onToggleProfessor={(professorId, checked) => {
                    if (checked) {
                      state.setSelectedProfessoresIds((prev) => [
                        ...prev,
                        professorId,
                      ]);
                      return;
                    }
                    state.setSelectedProfessoresIds((prev) =>
                      prev.filter((id) => id !== professorId),
                    );
                  }}
                />
              )}

              <VinculoActions
                viewMode={state.viewMode}
                selectedProfessorId={state.selectedProfessorId}
                selectedDisciplinaId={state.selectedDisciplinaId}
                selectedDisciplinasCount={state.selectedDisciplinasIds.length}
                selectedProfessoresCount={state.selectedProfessoresIds.length}
                loading={state.loading}
                onClearSelection={state.clearSelection}
                onVincular={state.vincular}
              />
            </div>
          </CardContent>
        </Card>

        <VinculosList
          viewMode={state.viewMode}
          selectedProfessorId={state.selectedProfessorId}
          selectedDisciplinaId={state.selectedDisciplinaId}
          professores={state.professores}
          disciplinas={state.disciplinas}
          disciplinasProfessor={state.disciplinasProfessor}
          professoresDisciplina={state.professoresDisciplina}
          onRemove={state.desvincular}
        />
      </div>
    </MainLayout>
  );
}
