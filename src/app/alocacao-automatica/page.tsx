"use client";

import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/main-layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Zap, AlertTriangle, Play, Calendar, Eye } from "lucide-react";
import { formatCargaHoraria } from "@/utils/carga-horaria";
import { gerarHorarioConsolidadoPorDisciplina } from "@/utils/horario-consolidado";
import { toast } from "sonner";
import { turmaService, disciplinaService } from "@/services/entities";
import { Turma, Disciplina } from "@/types/entities";
import { GradeHorariosTurma } from "@/components/GradeHorariosTurma";

// Função para mapear códigos de horário para horários de início e fim
const getTimeInfo = (
  timeString: string
): { code: string; startTime: string; endTime: string } => {
  // Formato esperado: "07:00 - 07:50 M1" ou "M1"
  const parts = timeString.trim().split(" ");

  if (parts.length >= 3) {
    // Formato: "07:00 - 07:50 M1"
    const code = parts[parts.length - 1]; // Último elemento é o código
    const startTime = parts[0];
    const endTime = parts[2];
    return { code, startTime, endTime };
  } else {
    // Formato: "M1" - mapear para horários corretos
    const code = timeString;
    const timeMap: { [key: string]: { start: string; end: string } } = {
      M1: { start: "07:00", end: "07:50" },
      M2: { start: "07:50", end: "08:40" },
      M3: { start: "08:55", end: "09:45" },
      M4: { start: "09:45", end: "10:35" },
      M5: { start: "10:50", end: "11:40" },
      M6: { start: "11:40", end: "12:30" },
      T1: { start: "13:00", end: "13:50" },
      T2: { start: "13:50", end: "14:40" },
      T3: { start: "14:55", end: "15:45" },
      T4: { start: "15:45", end: "16:35" },
      T5: { start: "16:50", end: "17:40" },
      T6: { start: "17:40", end: "18:30" },
      N1: { start: "19:00", end: "19:50" },
      N2: { start: "19:50", end: "20:40" },
      N3: { start: "20:55", end: "21:45" },
      N4: { start: "21:45", end: "22:35" },
    };

    const timeInfo = timeMap[code] || { start: "00:00", end: "00:50" };
    return { code, startTime: timeInfo.start, endTime: timeInfo.end };
  }
};

export default function AlocacaoAutomaticaPage() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [disciplinas, setDisciplinas] = useState<Disciplina[]>([]);
  const [selectedTurma, setSelectedTurma] = useState<string>("");
  const [selectedDisciplinas, setSelectedDisciplinas] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [showGrade, setShowGrade] = useState(false);
  const [generatedTurma, setGeneratedTurma] = useState<Turma | null>(null);
  const [previewData, setPreviewData] = useState<any>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [isGeneratingPreview, setIsGeneratingPreview] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [turmasData, disciplinasData] = await Promise.all([
        turmaService.getAll(1, 100),
        disciplinaService.getAll(1),
      ]);
      setTurmas(turmasData?.turmas || []);
      setDisciplinas(disciplinasData?.disciplinas || []);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      toast.error("Erro ao carregar dados");
      setTurmas([]);
      setDisciplinas([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDisciplinaToggle = (disciplinaId: string) => {
    setSelectedDisciplinas((prev) =>
      prev.includes(disciplinaId)
        ? prev.filter((id) => id !== disciplinaId)
        : [...prev, disciplinaId]
    );
  };

  const handleGeneratePreview = async () => {
    if (!selectedTurma || selectedDisciplinas.length === 0) {
      toast.error("Selecione uma turma e pelo menos uma disciplina");
      return;
    }

    setIsGeneratingPreview(true);
    try {
      const response = await fetch(
        "http://localhost:3333/alocacoes/genetica/preview",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            turmaId: selectedTurma,
            disciplinaIds: selectedDisciplinas,
            params: {
              populationSize: 50,
              generations: 100,
              mutationRate: 0.1,
              crossoverRate: 0.8,
              elitismRate: 0.1,
            },
          }),
        }
      );

      const result = await response.json();

      console.log("Full response:", result);
      console.log("Response status:", response.status);
      console.log("Response ok:", response.ok);

      if (!response.ok) {
        console.error("Error response:", result);
        throw new Error(
          result.message || result.error || "Erro ao gerar preview"
        );
      }

      console.log("Preview data received:", result.data);
      console.log("Allocations:", result.data?.allocations);
      console.log("Schedule:", result.data?.schedule);
      console.log("Success flag:", result.success);

      if (!result.success) {
        throw new Error(result.error || "Falha na geração do preview");
      }

      if (!result.data) {
        throw new Error("Dados do preview não encontrados na resposta");
      }

      setPreviewData(result.data);
      setShowPreview(true);
      toast.success("Preview gerado com sucesso!");
    } catch (error) {
      console.error("Erro ao gerar preview:", error);
      toast.error(
        error instanceof Error ? error.message : "Erro ao gerar preview"
      );
    } finally {
      setIsGeneratingPreview(false);
    }
  };

  const handleConfirmAllocations = async () => {
    if (!previewData) {
      toast.error("Nenhum preview disponível para confirmar");
      return;
    }

    setIsGenerating(true);
    try {
      // Executar o algoritmo genético real e salvar no banco
      const response = await fetch("http://localhost:3333/alocacoes/genetica", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          turmaId: selectedTurma,
          params: {
            populationSize: 50,
            generations: 100,
            mutationRate: 0.1,
            crossoverRate: 0.8,
            elitismRate: 0.1,
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Erro ao criar alocações");
      }

      const result = await response.json();
      toast.success("Alocações criadas com sucesso!");

      // Recarregar disciplinas para obter horários consolidados atualizados
      const disciplinasData = await disciplinaService.getAll(1);
      setDisciplinas(disciplinasData?.disciplinas || []);

      // Mostrar grade de horários
      const turmaObj = turmas.find((t) => t.id === selectedTurma);
      if (turmaObj) {
        setGeneratedTurma(turmaObj);
        setShowGrade(true);
      }

      // Reset form e preview
      setSelectedTurma("");
      setSelectedDisciplinas([]);
      setShowPreview(false);
      setPreviewData(null);
    } catch (error) {
      console.error("Erro ao confirmar alocações:", error);
      toast.error(
        error instanceof Error ? error.message : "Erro ao criar alocações"
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateAllocations = async () => {
    if (!selectedTurma) {
      toast.error("Selecione uma turma");
      return;
    }

    if (selectedDisciplinas.length === 0) {
      toast.error("Selecione pelo menos uma disciplina");
      return;
    }

    setIsGenerating(true);

    try {
      toast.info("Iniciando processo de alocação automática...");

      // Primeiro, buscar dados necessários para criar alocações
      const [professoresResponse, salasResponse, horariosResponse] =
        await Promise.all([
          fetch("http://localhost:3333/users?role=PROFESSOR"),
          fetch("http://localhost:3333/salas"),
          fetch("http://localhost:3333/horarios"),
        ]);

      if (
        !professoresResponse.ok ||
        !salasResponse.ok ||
        !horariosResponse.ok
      ) {
        throw new Error("Erro ao buscar dados necessários para alocação");
      }

      const professores = await professoresResponse.json();
      const salas = await salasResponse.json();
      const horarios = await horariosResponse.json();

      if (!professores.length || !salas.length || !horarios.length) {
        throw new Error(
          "Dados insuficientes: é necessário ter professores, salas e horários cadastrados"
        );
      }

      // Criar alocações para as disciplinas selecionadas
      const alocacoesPromises = selectedDisciplinas.map(
        async (disciplinaId) => {
          const response = await fetch("http://localhost:3333/alocacoes", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              id_turma: selectedTurma,
              id_disciplina: disciplinaId,
              id_user: professores[0].id, // Usar primeiro professor temporariamente
              id_sala: salas[0].id, // Usar primeira sala temporariamente
              id_horario: horarios[0].id, // Usar primeiro horário temporariamente
            }),
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(
              `Erro ao criar alocação: ${
                errorData.message || "Erro desconhecido"
              }`
            );
          }

          return response.json();
        }
      );

      await Promise.all(alocacoesPromises);
      toast.info("Alocações criadas. Executando algoritmo genético...");

      // Executar algoritmo genético
      const geneticResponse = await fetch(
        "http://localhost:3333/alocacoes/genetica",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            turmaId: selectedTurma,
            params: {
              populationSize: 50,
              generations: 100,
              mutationRate: 0.1,
              crossoverRate: 0.8,
              elitismRate: 0.1,
            },
          }),
        }
      );

      if (!geneticResponse.ok) {
        const errorData = await geneticResponse.json();
        throw new Error(
          errorData.message || "Erro na execução do algoritmo genético"
        );
      }

      const result = await geneticResponse.json();

      if (result.success) {
        toast.success(
          `Alocações geradas com sucesso! ${
            result.data.alocacoes?.length || 0
          } alocação(ões) criada(s).`
        );

        // Recarregar disciplinas para obter horários consolidados atualizados
        const disciplinasData = await disciplinaService.getAll(1);
        setDisciplinas(disciplinasData?.disciplinas || []);

        // Encontrar a turma selecionada para exibir a grade
        const turmaObj = turmas.find((t) => t.id === selectedTurma);
        if (turmaObj) {
          setGeneratedTurma(turmaObj);
          setShowGrade(true);
          toast.info("Exibindo grade de horários atualizada...");
        }
      } else {
        throw new Error(result.message || "Falha na geração das alocações");
      }

      // Reset form
      setSelectedTurma("");
      setSelectedDisciplinas([]);
    } catch (error) {
      console.error("Erro ao gerar alocações:", error);
      toast.error(
        error instanceof Error ? error.message : "Erro ao gerar alocações"
      );
    } finally {
      setIsGenerating(false);
    }
  };

  if (loading) {
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
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <Zap className="h-8 w-8 text-yellow-500" />
              Alocação Automática
            </h1>
            <p className="text-muted-foreground">
              Selecione uma turma e disciplinas para gerar alocações
              automaticamente
            </p>
          </div>
        </div>

        {/* Form */}
        <Card>
          <CardHeader>
            <CardTitle>Configurar Alocação</CardTitle>
            <CardDescription>
              Escolha a turma e as disciplinas que deseja alocar automaticamente
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Seleção de Turma */}
            <div className="space-y-2">
              <Label htmlFor="turma">Turma</Label>
              <Select value={selectedTurma} onValueChange={setSelectedTurma}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma turma" />
                </SelectTrigger>
                <SelectContent>
                  {turmas.map((turma) => (
                    <SelectItem key={turma.id} value={turma.id}>
                      {turma.nome} - {turma.turno} ({turma.num_alunos} alunos)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Seleção de Disciplinas */}
            <div className="space-y-4">
              <Label>Disciplinas</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-64 overflow-y-auto border rounded-lg p-4">
                {disciplinas.map((disciplina) => (
                  <div
                    key={disciplina.id}
                    className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-gray-50"
                  >
                    <Checkbox
                      id={disciplina.id}
                      checked={selectedDisciplinas.includes(disciplina.id)}
                      onCheckedChange={() =>
                        handleDisciplinaToggle(disciplina.id)
                      }
                    />
                    <div className="flex-1 min-w-0">
                      <Label
                        htmlFor={disciplina.id}
                        className="text-sm font-medium cursor-pointer"
                      >
                        {disciplina.nome}
                      </Label>
                      <div className="flex flex-wrap gap-1 mt-1">
                        <Badge variant="secondary" className="text-xs">
                          {disciplina.carga_horaria}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {disciplina.tipo_de_sala}
                        </Badge>
                        {disciplina.horario_consolidado && (
                          <Badge
                            variant="default"
                            className="text-xs bg-blue-100 text-blue-800"
                          >
                            {disciplina.horario_consolidado}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {selectedDisciplinas.length > 0 && (
                <div className="space-y-3">
                  <div className="text-sm text-muted-foreground">
                    {selectedDisciplinas.length} disciplina(s) selecionada(s)
                  </div>

                  {/* Horários Consolidados das Disciplinas Selecionadas */}
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <h4 className="text-sm font-medium text-blue-900 mb-2">
                      Horários Consolidados:
                    </h4>
                    <div className="space-y-1">
                      {selectedDisciplinas.map((disciplinaId) => {
                        const disciplina = disciplinas.find(
                          (d) => d.id === disciplinaId
                        );
                        if (!disciplina) return null;
                        return (
                          <div
                            key={disciplinaId}
                            className="flex justify-between items-center text-sm"
                          >
                            <span className="text-blue-800 font-medium">
                              {disciplina.nome}:
                            </span>
                            <span className="text-blue-700">
                              {disciplina.horario_consolidado ||
                                "Será gerado automaticamente"}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Botões de Ação */}
            <div className="space-y-3 pt-4">
              <Button
                onClick={handleGeneratePreview}
                disabled={
                  !selectedTurma ||
                  selectedDisciplinas.length === 0 ||
                  isGeneratingPreview
                }
                className="w-full"
                variant="outline"
              >
                {isGeneratingPreview ? (
                  <>
                    <Play className="mr-2 h-4 w-4 animate-spin" />
                    Gerando Preview...
                  </>
                ) : (
                  "Gerar Preview das Alocações"
                )}
              </Button>

              {showPreview && previewData && (
                <Button
                  onClick={handleConfirmAllocations}
                  disabled={isGenerating}
                  className="w-full"
                >
                  {isGenerating ? (
                    <>
                      <Play className="mr-2 h-4 w-4 animate-spin" />
                      Criando Alocações...
                    </>
                  ) : (
                    "Confirmar e Criar Alocações"
                  )}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Alert */}
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Como funciona:</strong> Selecione uma turma e as disciplinas
            que deseja alocar. O sistema irá gerar automaticamente os melhores
            horários considerando a disponibilidade de salas e professores.
          </AlertDescription>
        </Alert>

        {/* Preview das Alocações */}
        {showPreview && previewData && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Preview das Alocações
              </CardTitle>
              <CardDescription>
                Revise as alocações geradas antes de confirmar a criação
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Estatísticas do Preview */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {previewData.allocations?.length || 0}
                    </div>
                    <div className="text-sm text-blue-600">
                      Alocações Geradas
                    </div>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {previewData.fitness?.toFixed(2) || 0}
                    </div>
                    <div className="text-sm text-green-600">
                      Score de Qualidade
                    </div>
                  </div>
                  <div className="bg-orange-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">
                      {previewData.conflicts?.length || 0}
                    </div>
                    <div className="text-sm text-orange-600">
                      Conflitos Detectados
                    </div>
                  </div>
                </div>

                {/* Tabela de Disciplinas da Turma */}
                {previewData.allocations &&
                  previewData.allocations.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold mb-4">
                        Disciplinas da Turma
                      </h3>
                      <div className="overflow-x-auto">
                        <table className="w-full border border-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase border-r">
                                Código
                              </th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase border-r">
                                Prefixo
                              </th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase border-r">
                                Disciplina
                              </th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase border-r">
                                CH
                              </th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase border-r">
                                Horário
                              </th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase border-r">
                                Professor
                              </th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase border-r">
                                Local
                              </th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase border-r">
                                Vagas
                              </th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase border-r">
                                Demanda
                              </th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                Status
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {previewData.allocations
                              .reduce((unique: any[], allocation: any) => {
                                const exists = unique.find(
                                  (item) =>
                                    item.disciplina?.codigo ===
                                    allocation.disciplina?.codigo
                                );
                                if (!exists) {
                                  unique.push(allocation);
                                }
                                return unique;
                              }, [])
                              .map((allocation: any, index: number) => {
                                // Gerar horário consolidado dinamicamente para o preview
                                const horarioConsolidado =
                                  gerarHorarioConsolidadoPorDisciplina(
                                    previewData.allocations,
                                    allocation.disciplina?.id
                                  ) || "-";

                                return (
                                  <tr
                                    key={allocation.disciplina?.codigo || index}
                                    className={
                                      index % 2 === 0
                                        ? "bg-white"
                                        : "bg-gray-50"
                                    }
                                  >
                                    <td className="px-3 py-2 text-sm font-medium text-gray-900 border-r">
                                      {allocation.disciplina?.codigo || "---"}
                                    </td>
                                    <td className="px-3 py-2 border-r">
                                      <Badge
                                        variant="outline"
                                        className="font-mono text-xs"
                                      >
                                        ---
                                      </Badge>
                                    </td>
                                    <td className="px-3 py-2 text-sm text-gray-900 border-r max-w-xs">
                                      {allocation.disciplina?.nome || "---"}
                                    </td>
                                    <td className="px-3 py-2 text-sm text-gray-900 border-r">
                                      {allocation.disciplina?.carga_horaria
                                        ? `${allocation.disciplina.carga_horaria}h`
                                        : "---"}
                                    </td>
                                    <td className="px-3 py-2 text-sm text-gray-900 font-mono border-r">
                                      {horarioConsolidado}
                                    </td>
                                    <td className="px-3 py-2 text-sm text-gray-900 border-r">
                                      {allocation.professor?.nome || "---"}
                                    </td>
                                    <td className="px-3 py-2 text-sm text-gray-900 border-r">
                                      {allocation.sala
                                        ? `${
                                            allocation.sala.predio?.nome ||
                                            "Sem prédio"
                                          }, ${allocation.sala.nome}`
                                        : "---"}
                                    </td>
                                    <td className="px-3 py-2 text-sm text-gray-900 border-r">
                                      {selectedTurma?.num_alunos || "---"}
                                    </td>
                                    <td className="px-3 py-2 text-sm text-gray-900 border-r">
                                      {selectedTurma?.num_alunos || "---"}
                                    </td>
                                    <td className="px-3 py-2">
                                      <Badge className="bg-green-100 text-green-800">
                                        Adequada
                                      </Badge>
                                    </td>
                                  </tr>
                                );
                              })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                {/* Grade de Horários do Preview */}
                {previewData.schedule && (
                  <div>
                    <h3 className="text-lg font-semibold mb-4">
                      Grade Semanal de Horários
                    </h3>
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse border border-gray-300 text-sm">
                        <thead>
                          <tr className="bg-gray-50">
                            <th className="border border-gray-300 p-3 text-left font-semibold">
                              Horário
                            </th>
                            <th className="border border-gray-300 p-3 text-center font-semibold">
                              Segunda-feira
                            </th>
                            <th className="border border-gray-300 p-3 text-center font-semibold">
                              Terça-feira
                            </th>
                            <th className="border border-gray-300 p-3 text-center font-semibold">
                              Quarta-feira
                            </th>
                            <th className="border border-gray-300 p-3 text-center font-semibold">
                              Quinta-feira
                            </th>
                            <th className="border border-gray-300 p-3 text-center font-semibold">
                              Sexta-feira
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {previewData.schedule.map(
                            (row: any, index: number) => (
                              <tr key={index} className="hover:bg-gray-50">
                                <td className="border border-gray-300 p-3 font-medium bg-blue-50">
                                  <div className="text-center">
                                    {(() => {
                                      const timeInfo = getTimeInfo(row.time);
                                      return (
                                        <>
                                          <div className="font-bold text-blue-900 text-sm">
                                            {timeInfo.code}
                                          </div>
                                          <div className="text-blue-700 text-xs">
                                            {timeInfo.startTime} -{" "}
                                            {timeInfo.endTime}
                                          </div>
                                        </>
                                      );
                                    })()}
                                  </div>
                                </td>
                                {row.days.map((day: any, dayIndex: number) => (
                                  <td
                                    key={dayIndex}
                                    className="border border-gray-300 p-3 min-w-[150px]"
                                  >
                                    {day ? (
                                      <div className="bg-blue-100 p-2 rounded-md border-l-4 border-blue-500">
                                        <div className="font-semibold text-blue-900 mb-1">
                                          {day.disciplina}
                                        </div>
                                        {day.codigo && (
                                          <div className="text-blue-800 text-xs mb-1 font-medium">
                                            <span className="inline-block w-2 h-2 bg-blue-500 rounded-full mr-1"></span>
                                            {day.codigo}
                                          </div>
                                        )}
                                        <div className="text-blue-700 text-xs mb-1">
                                          <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-1"></span>
                                          {day.professor}
                                        </div>
                                        <div className="text-blue-600 text-xs">
                                          <span className="inline-block w-2 h-2 bg-orange-500 rounded-full mr-1"></span>
                                          {day.sala}
                                        </div>
                                      </div>
                                    ) : (
                                      <div className="text-gray-400 text-center py-4">
                                        <span className="text-xs">Livre</span>
                                      </div>
                                    )}
                                  </td>
                                ))}
                              </tr>
                            )
                          )}
                        </tbody>
                      </table>
                    </div>

                    {/* Legenda */}
                    <div className="mt-4 flex flex-wrap gap-4 text-xs">
                      <div className="flex items-center gap-1">
                        <span className="inline-block w-2 h-2 bg-green-500 rounded-full"></span>
                        <span>Professor</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="inline-block w-2 h-2 bg-orange-500 rounded-full"></span>
                        <span>Sala</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="inline-block w-3 h-3 bg-blue-100 border border-blue-300 rounded"></span>
                        <span>Aula agendada</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Conflitos */}
                {previewData.conflicts && previewData.conflicts.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-4 text-orange-600">
                      Conflitos Detectados
                    </h3>
                    <div className="space-y-2">
                      {previewData.conflicts.map(
                        (conflict: any, index: number) => (
                          <div
                            key={index}
                            className="bg-orange-50 border border-orange-200 p-3 rounded"
                          >
                            <div className="text-sm text-orange-800">
                              {conflict.message}
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Grade de Horários */}
        {showGrade && generatedTurma && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Grade de Horários Gerada
              </CardTitle>
              <CardDescription>
                Visualize a grade de horários gerada automaticamente para a
                turma {generatedTurma.nome}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <GradeHorariosTurma
                  turma={generatedTurma}
                  trigger={
                    <Button variant="default" size="lg">
                      <Calendar className="h-4 w-4 mr-2" />
                      Ver Grade Completa
                    </Button>
                  }
                />
                <Button variant="outline" onClick={() => setShowGrade(false)}>
                  Ocultar Grade
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </MainLayout>
  );
}
