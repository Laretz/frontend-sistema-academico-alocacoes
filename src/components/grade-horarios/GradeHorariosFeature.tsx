"use client";

import { MainLayout } from "@/components/layout/main-layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GraduationCap, MapPin, User } from "lucide-react";
import { useGradeHorarios } from "@/hooks/useGradeHorarios";
import { PeriodoSelect } from "@/components/grade-horarios/PeriodoSelect";
import { TurmaTab } from "@/components/grade-horarios/TurmaTab";
import { SalaTab } from "@/components/grade-horarios/SalaTab";
import { ProfessorTab } from "@/components/grade-horarios/ProfessorTab";

export function GradeHorariosFeature() {
  const state = useGradeHorarios();

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Grade de Horários
            </h1>
            <p className="text-muted-foreground">
              Visualize a grade por Turma, Sala ou Professor
            </p>
          </div>
        </div>

        <Tabs
          value={state.tab}
          onValueChange={(value) => state.setTab(value as "turma" | "sala" | "prof")}
          className="space-y-4"
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <TabsList>
              <TabsTrigger value="turma" className="flex items-center gap-2">
                <GraduationCap className="h-4 w-4" /> Turma
              </TabsTrigger>
              <TabsTrigger value="sala" className="flex items-center gap-2">
                <MapPin className="h-4 w-4" /> Sala
              </TabsTrigger>
              <TabsTrigger value="prof" className="flex items-center gap-2">
                <User className="h-4 w-4" /> Professor
              </TabsTrigger>
            </TabsList>

            <PeriodoSelect
              periodoAtivoNome={state.periodoAtivoNome}
              periodos={state.periodos}
              value={state.periodoSelecionadoId}
              onChange={(value) => {
                const next = value === "__OPERACIONAL__" ? "" : value;
                state.setPeriodoSelecionadoId(next);
              }}
            />
          </div>

          <TabsContent value="turma">
            <TurmaTab
              turmas={state.turmas}
              turmaId={state.turmaId}
              onTurmaChange={state.setTurmaId}
              grade={state.grade}
              loading={state.loading}
              gridConfig={state.gridConfig}
              disciplinasDaGrade={state.disciplinasDaGrade}
              onGradeRefresh={state.carregarGrade}
            />
          </TabsContent>

          <TabsContent value="sala">
            <SalaTab
              salas={state.salas}
              salaId={state.salaId}
              onSalaChange={state.setSalaId}
              grade={state.grade}
              loading={state.loading}
              gridConfig={state.gridConfig}
            />
          </TabsContent>

          <TabsContent value="prof">
            <ProfessorTab
              professores={state.professores}
              profId={state.profId}
              onProfessorChange={state.setProfId}
              grade={state.grade}
              loading={state.loading}
              gridConfig={state.gridConfig}
            />
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
