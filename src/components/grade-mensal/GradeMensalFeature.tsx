"use client";

import { MainLayout } from "@/components/layout/main-layout";
import { GradeMensal } from "@/components/GradeMensal";
import { CalendarioProgressoDisciplinas } from "@/components/CalendarioProgressoDisciplinas";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, BarChart3, Users } from "lucide-react";
import { useGradeMensal } from "@/hooks/useGradeMensal";

export function GradeMensalFeature() {
  const state = useGradeMensal();

  if (state.loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Carregando...</div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Grade Mensal</h1>
            <p className="text-muted-foreground">
              Visualize e gerencie a programação das disciplinas
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Turma Selecionada
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <Label htmlFor="turma-select">Selecionar Turma</Label>
                <Select
                  value={state.turmaSelecionadaId || ""}
                  onValueChange={state.setTurmaSelecionadaId}
                >
                  <SelectTrigger id="turma-select">
                    <SelectValue placeholder="Selecione uma turma" />
                  </SelectTrigger>
                  <SelectContent>
                    {state.turmas.map((turma) => (
                      <SelectItem key={turma.id} value={turma.id}>
                        {turma.nome} - {turma.turno} ({turma.num_alunos} alunos)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {state.turmaSelecionada && (
                <div className="flex gap-2">
                  <Badge variant="outline">
                    {state.turmaSelecionada.semestre}º Semestre
                  </Badge>
                  <Badge variant="outline">{state.turmaSelecionada.turno}</Badge>
                  <Badge variant="outline">
                    {state.turmaSelecionada.num_alunos} alunos
                  </Badge>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="calendario" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="calendario" className="flex items-center space-x-2">
              <BarChart3 className="h-4 w-4" />
              <span>Calendário de Progresso</span>
            </TabsTrigger>
            <TabsTrigger value="grade" className="flex items-center space-x-2">
              <Calendar className="h-4 w-4" />
              <span>Grade Mensal</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="calendario">
            <CalendarioProgressoDisciplinas
              disciplinas={state.disciplinasCalendario}
              turma={state.turmaSelecionada || undefined}
              turmaId={state.turmaSelecionada?.id}
              loadingProgresso={state.loadingProgresso}
              onAtualizarProgresso={state.atualizarProgressoManual}
            />
          </TabsContent>

          <TabsContent value="grade">
            <GradeMensal disciplinas={state.disciplinasGradeMensal} />
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}

