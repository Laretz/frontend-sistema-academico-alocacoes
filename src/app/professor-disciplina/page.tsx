"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { MainLayout } from "@/components/layout/main-layout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Trash2, Plus, Users, BookOpen, CheckSquare } from "lucide-react";
import { toast } from "sonner";
import { professorDisciplinaService } from "@/services/professor-disciplina";
import { disciplinaService } from "@/services/entities";
import { userService } from "@/services/users";
import {
  User,
  Disciplina,
  DisciplinaComVinculo,
  ProfessorComVinculo,
} from "@/types/entities";
import { FilterSection } from "@/components/forms/filter-section";
import { VinculationForm } from "@/components/forms/vinculation-form";
import { ProfessorDisciplinaCard } from "@/components/forms/professor-disciplina-card";

export default function ProfessorDisciplinaPage() {
  const router = useRouter();
  const [professores, setProfessores] = useState<User[]>([]);
  const [disciplinas, setDisciplinas] = useState<Disciplina[]>([]);
  const [selectedProfessor, setSelectedProfessor] = useState<string>("");
  const [selectedDisciplina, setSelectedDisciplina] = useState<string>("");
  const [selectedDisciplinas, setSelectedDisciplinas] = useState<string[]>([]);
  const [disciplinasProfessor, setDisciplinasProfessor] = useState<
    DisciplinaComVinculo[]
  >([]);
  const [professoresDisciplina, setProfessoresDisciplina] = useState<
    ProfessorComVinculo[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState<"professor" | "disciplina">(
    "professor"
  );

  // Novos estados para filtros
  const [selectedSemestre, setSelectedSemestre] = useState<string>("all");
  const [selectedCurso, setSelectedCurso] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [cursos, setCursos] = useState<{ id: string; nome: string }[]>([]);

  useEffect(() => {
    carregarDados();
  }, []);

  // useEffect para carregar dados quando viewMode ou seleções mudarem
  useEffect(() => {
    if (viewMode === "professor" && selectedProfessor) {
      carregarDisciplinasProfessor(selectedProfessor);
    } else if (viewMode === "disciplina" && selectedDisciplina) {
      carregarProfessoresDisciplina(selectedDisciplina);
    }
  }, [viewMode, selectedProfessor, selectedDisciplina]);

  const carregarDados = async () => {
    try {
      const [professoresData, disciplinasData] = await Promise.all([
        userService.getAll(),
        disciplinaService.getAll(),
      ]);
      setProfessores(professoresData.usuarios || []);
      setDisciplinas(disciplinasData.disciplinas || []);

      // Extrair cursos únicos das disciplinas
      const cursosUnicos = (disciplinasData.disciplinas || []).reduce(
        (acc: { id: string; nome: string }[], disciplina) => {
          if (!acc.find((curso) => curso.id === disciplina.curso.id)) {
            acc.push({ id: disciplina.curso.id, nome: disciplina.curso.nome });
          }
          return acc;
        },
        []
      );
      setCursos(cursosUnicos);
    } catch (error) {
      toast.error("Erro ao carregar dados");
    }
  };

  const carregarDisciplinasProfessor = async (id_user: string) => {
    try {
      const response =
        await professorDisciplinaService.buscarDisciplinasProfessor(id_user);
      setDisciplinasProfessor(response.disciplinas);
    } catch (error) {
      toast.error("Erro ao carregar disciplinas do professor");
    }
  };

  const carregarProfessoresDisciplina = async (id_disciplina: string) => {
    try {
      const response =
        await professorDisciplinaService.buscarProfessoresDisciplina(
          id_disciplina
        );
      setProfessoresDisciplina(response.professores);
    } catch (error) {
      toast.error("Erro ao carregar professores da disciplina");
    }
  };

  const vincularProfessorDisciplina = async () => {
    if (viewMode === "professor") {
      if (!selectedProfessor || selectedDisciplinas.length !== 1) {
        toast.error("Selecione um professor e uma disciplina");
        return;
      }

      setLoading(true);
      try {
        await professorDisciplinaService.vincular({
          id_user: selectedProfessor,
          id_disciplina: selectedDisciplinas[0],
        });
        toast.success("Professor vinculado à disciplina com sucesso!");

        // Atualizar as listas
        carregarDisciplinasProfessor(selectedProfessor);

        setSelectedDisciplinas([]);
      } catch (error) {
        toast.error("Erro ao vincular professor à disciplina");
      } finally {
        setLoading(false);
      }
    } else {
      // Modo disciplina - vincular um professor à disciplina selecionada
      if (!selectedDisciplina || selectedDisciplinas.length !== 1) {
        toast.error("Selecione uma disciplina e um professor");
        return;
      }

      setLoading(true);
      try {
        await professorDisciplinaService.vincular({
          id_user: selectedDisciplinas[0], // No modo disciplina, selectedDisciplinas contém IDs de professores
          id_disciplina: selectedDisciplina,
        });
        toast.success("Professor vinculado à disciplina com sucesso!");

        // Atualizar as listas
        carregarProfessoresDisciplina(selectedDisciplina);

        setSelectedDisciplinas([]);
      } catch (error) {
        toast.error("Erro ao vincular professor à disciplina");
      } finally {
        setLoading(false);
      }
    }
  };

  const vincularMultiplasDisciplinas = async () => {
    if (viewMode === "professor") {
      if (!selectedProfessor || selectedDisciplinas.length === 0) {
        toast.error("Selecione um professor e pelo menos uma disciplina");
        return;
      }

      setLoading(true);
      try {
        // Vincular cada disciplina selecionada
        const promises = selectedDisciplinas.map((disciplinaId) =>
          professorDisciplinaService.vincular({
            id_user: selectedProfessor,
            id_disciplina: disciplinaId,
          })
        );

        await Promise.all(promises);
        toast.success(
          `Professor vinculado a ${selectedDisciplinas.length} disciplina(s) com sucesso!`
        );

        // Atualizar as listas
        carregarDisciplinasProfessor(selectedProfessor);

        setSelectedDisciplinas([]);
      } catch (error) {
        toast.error("Erro ao vincular professor às disciplinas");
      } finally {
        setLoading(false);
      }
    } else {
      // Modo disciplina - vincular múltiplos professores à disciplina selecionada
      if (!selectedDisciplina || selectedDisciplinas.length === 0) {
        toast.error("Selecione uma disciplina e pelo menos um professor");
        return;
      }

      setLoading(true);
      try {
        // Vincular cada professor selecionado
        const promises = selectedDisciplinas.map((professorId) =>
          professorDisciplinaService.vincular({
            id_user: professorId, // No modo disciplina, selectedDisciplinas contém IDs de professores
            id_disciplina: selectedDisciplina,
          })
        );

        await Promise.all(promises);
        toast.success(
          `${selectedDisciplinas.length} professor(es) vinculado(s) à disciplina com sucesso!`
        );

        // Atualizar as listas
        carregarProfessoresDisciplina(selectedDisciplina);

        setSelectedDisciplinas([]);
      } catch (error) {
        toast.error("Erro ao vincular professores à disciplina");
      } finally {
        setLoading(false);
      }
    }
  };

  const desvincularProfessorDisciplina = async (
    id_user: string,
    id_disciplina: string
  ) => {
    try {
      await professorDisciplinaService.desvincular({ id_user, id_disciplina });
      toast.success("Professor desvinculado da disciplina com sucesso!");

      // Atualizar as listas
      if (viewMode === "professor") {
        carregarDisciplinasProfessor(selectedProfessor);
      } else {
        carregarProfessoresDisciplina(selectedDisciplina);
      }
    } catch (error) {
      toast.error("Erro ao desvincular professor da disciplina");
    }
  };

  const handleProfessorChange = (value: string) => {
    setSelectedProfessor(value);
    if (value && viewMode === "professor") {
      carregarDisciplinasProfessor(value);
    }
  };

  const handleDisciplinaChange = (value: string) => {
    setSelectedDisciplina(value);
    if (value && viewMode === "disciplina") {
      carregarProfessoresDisciplina(value);
    }
  };

  const handleDisciplinaSelection = (itemId: string, checked: boolean) => {
    if (checked) {
      setSelectedDisciplinas((prev) => [...prev, itemId]);
    } else {
      setSelectedDisciplinas((prev) => prev.filter((id) => id !== itemId));
    }
  };

  const handleProfessorSelection = (professorId: string, checked: boolean) => {
    if (checked) {
      setSelectedDisciplinas((prev) => [...prev, professorId]); // Reutilizando o mesmo estado
    } else {
      setSelectedDisciplinas((prev) => prev.filter((id) => id !== professorId));
    }
  };

  const toggleSelectAll = () => {
    const disciplinasFiltradas = getFilteredDisciplinas();
    if (selectedDisciplinas.length === disciplinasFiltradas.length) {
      setSelectedDisciplinas([]);
    } else {
      setSelectedDisciplinas(disciplinasFiltradas.map((d) => d.id));
    }
  };

  // Função para filtrar disciplinas
  const getFilteredDisciplinas = () => {
    return disciplinas.filter((disciplina) => {
      const matchesSemestre =
        !selectedSemestre ||
        selectedSemestre === "all" ||
        disciplina.semestre.toString() === selectedSemestre;
      const matchesCurso =
        !selectedCurso ||
        selectedCurso === "all" ||
        disciplina.curso.id === selectedCurso;
      const matchesSearch =
        !searchTerm ||
        disciplina.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        disciplina.codigo.toLowerCase().includes(searchTerm.toLowerCase());

      return matchesSemestre && matchesCurso && matchesSearch;
    });
  };

  // Função para agrupar disciplinas por semestre
  const getDisciplinasGroupedBySemestre = () => {
    const disciplinasFiltradas = getFilteredDisciplinas();
    const grouped = disciplinasFiltradas.reduce((acc, disciplina) => {
      const semestre = disciplina.semestre.toString();
      if (!acc[semestre]) {
        acc[semestre] = [];
      }
      acc[semestre].push(disciplina);
      return acc;
    }, {} as Record<string, Disciplina[]>);

    // Ordenar semestres
    const sortedSemestres = Object.keys(grouped).sort(
      (a, b) => parseInt(a) - parseInt(b)
    );
    return sortedSemestres.map((semestre) => ({
      semestre,
      disciplinas: grouped[semestre],
    }));
  };

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
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          selectedSemestre={selectedSemestre}
          onSemestreChange={setSelectedSemestre}
          selectedCurso={selectedCurso}
          onCursoChange={setSelectedCurso}
          cursos={cursos}
          searchPlaceholder="Buscar disciplina por nome ou código..."
        />

        {/* Formulário de Vinculação Consolidado */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between gap-2">
              <span className="flex items-center gap-2">
                {viewMode === "professor" ? (
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
                  variant={viewMode === "professor" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("professor")}
                  className="h-8"
                >
                  Professor
                </Button>
                <Button
                  variant={viewMode === "disciplina" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("disciplina")}
                  className="h-8"
                >
                  Disciplina
                </Button>
              </span>
            </CardTitle>
            <CardDescription>
              {viewMode === "professor"
                ? "Selecione um professor e as disciplinas que deseja vincular"
                : "Selecione uma disciplina e os professores que deseja vincular"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {viewMode === "professor" ? (
                <>
                  {/* Seleção de Professor */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Professor</label>
                    <Select
                      value={selectedProfessor}
                      onValueChange={handleProfessorChange}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Selecione um professor" />
                      </SelectTrigger>
                      <SelectContent className="max-h-[300px] overflow-y-auto">
                        {professores.map((professor) => (
                          <SelectItem key={professor.id} value={professor.id}>
                            <div className="flex flex-col items-start">
                              <span className="font-medium">
                                {professor.nome}
                              </span>
                              <span className="text-sm text-muted-foreground">
                                {professor.especializacao ||
                                  "Sem especialização"}
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Seleção de Disciplinas */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-sm font-medium">
                          Disciplinas
                        </label>
                        <p className="text-sm text-muted-foreground">
                          {selectedDisciplinas.length} disciplina
                          {selectedDisciplinas.length !== 1 ? "s" : ""}{" "}
                          selecionada
                          {selectedDisciplinas.length !== 1 ? "s" : ""}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={toggleSelectAll}
                          disabled={getFilteredDisciplinas().length === 0}
                        >
                          <CheckSquare className="w-4 h-4 mr-2" />
                          {selectedDisciplinas.length ===
                            getFilteredDisciplinas().length &&
                          getFilteredDisciplinas().length > 0
                            ? "Desmarcar Todas"
                            : "Selecionar Todas"}
                        </Button>
                      </div>
                    </div>

                    <div className="max-h-96 overflow-y-auto border rounded-lg bg-muted/20">
                      {getFilteredDisciplinas().length === 0 ? (
                        <div className="p-8 text-center">
                          <BookOpen className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                          <p className="text-muted-foreground font-medium">
                            {disciplinas.length === 0
                              ? "Nenhuma disciplina disponível"
                              : "Nenhuma disciplina encontrada"}
                          </p>
                          <p className="text-sm text-muted-foreground mt-1">
                            {disciplinas.length === 0
                              ? "Cadastre disciplinas primeiro"
                              : "Tente ajustar os filtros"}
                          </p>
                        </div>
                      ) : (
                        <div className="p-3 space-y-4">
                          {getDisciplinasGroupedBySemestre().map(
                            ({
                              semestre,
                              disciplinas: disciplinasSemestre,
                            }) => (
                              <div key={semestre} className="space-y-3">
                                <div className="flex items-center gap-3 pb-2 border-b border-border/50 sticky top-0 bg-background/95 backdrop-blur-sm">
                                  <Badge
                                    variant="default"
                                    className="font-semibold"
                                  >
                                    {semestre}º Semestre
                                  </Badge>
                                  <span className="text-sm text-muted-foreground">
                                    {disciplinasSemestre.length} disciplina
                                    {disciplinasSemestre.length !== 1
                                      ? "s"
                                      : ""}
                                  </span>
                                </div>
                                <div className="space-y-2">
                                  {disciplinasSemestre.map((disciplina) => (
                                    <div
                                      key={disciplina.id}
                                      className="flex items-start space-x-3 p-3 hover:bg-background/80 rounded-lg border border-transparent hover:border-border/50 transition-all duration-200"
                                    >
                                      <Checkbox
                                        id={`disciplina-${disciplina.id}`}
                                        checked={selectedDisciplinas.includes(
                                          disciplina.id
                                        )}
                                        onCheckedChange={(checked) =>
                                          handleDisciplinaSelection(
                                            disciplina.id,
                                            checked as boolean
                                          )
                                        }
                                        className="mt-1"
                                      />
                                      <label
                                        htmlFor={`disciplina-${disciplina.id}`}
                                        className="flex-1 cursor-pointer space-y-2"
                                      >
                                        <div className="font-medium text-foreground leading-tight">
                                          {disciplina.nome}
                                        </div>
                                        <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                                          <Badge
                                            variant="outline"
                                            className="text-xs"
                                          >
                                            {disciplina.codigo}
                                          </Badge>
                                          <span>
                                            {disciplina.carga_horaria}h
                                          </span>
                                          <span>•</span>
                                          <TooltipProvider>
                                            <Tooltip>
                                              <TooltipTrigger asChild>
                                                <span className="truncate max-w-[150px]">
                                                  {disciplina.curso.nome}
                                                </span>
                                              </TooltipTrigger>
                                              <TooltipContent>
                                                <p>{disciplina.curso.nome}</p>
                                              </TooltipContent>
                                            </Tooltip>
                                          </TooltipProvider>
                                        </div>
                                        <div className="flex gap-2">
                                          <Badge
                                            variant={
                                              disciplina.obrigatoria
                                                ? "default"
                                                : "secondary"
                                            }
                                            className="text-xs"
                                          >
                                            {disciplina.obrigatoria
                                              ? "Obrigatória"
                                              : "Optativa"}
                                          </Badge>
                                          <Badge
                                            variant="outline"
                                            className="text-xs"
                                          >
                                            {disciplina.tipo_de_sala}
                                          </Badge>
                                        </div>
                                      </label>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </>
              ) : (
                <>
                  {/* Seleção de Disciplina (modo disciplina) */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Disciplina</label>
                    <Select
                      value={selectedDisciplina}
                      onValueChange={handleDisciplinaChange}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Selecione uma disciplina" />
                      </SelectTrigger>
                      <SelectContent className="max-h-[300px] overflow-y-auto">
                        {getFilteredDisciplinas().map((disciplina) => (
                          <SelectItem key={disciplina.id} value={disciplina.id}>
                            <div className="flex flex-col items-start">
                              <span className="font-medium">
                                {disciplina.nome}
                              </span>
                              <span className="text-sm text-muted-foreground">
                                {disciplina.codigo} - {disciplina.curso.nome}
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Seleção de Professores (modo disciplina) */}
                  {selectedDisciplina && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <label className="text-sm font-medium">
                            Professores
                          </label>
                          <p className="text-sm text-muted-foreground">
                            Selecione os professores para vincular à disciplina
                          </p>
                        </div>
                      </div>

                      <div className="max-h-96 overflow-y-auto border rounded-lg bg-muted/20">
                        {professores.length === 0 ? (
                          <div className="p-8 text-center">
                            <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                            <p className="text-muted-foreground font-medium">
                              Nenhum professor disponível
                            </p>
                            <p className="text-sm text-muted-foreground mt-1">
                              Cadastre professores primeiro
                            </p>
                          </div>
                        ) : (
                          <div className="p-3 space-y-2">
                            {professores.map((professor) => (
                              <div
                                key={professor.id}
                                className="flex items-start space-x-3 p-3 hover:bg-background/80 rounded-lg border border-transparent hover:border-border/50 transition-all duration-200"
                              >
                                <Checkbox
                                  id={`professor-${professor.id}`}
                                  checked={selectedDisciplinas.includes(
                                    professor.id
                                  )}
                                  onCheckedChange={(checked) =>
                                    handleProfessorSelection(
                                      professor.id,
                                      checked as boolean
                                    )
                                  }
                                  className="mt-1"
                                />
                                <label
                                  htmlFor={`professor-${professor.id}`}
                                  className="flex-1 cursor-pointer space-y-1"
                                >
                                  <div className="font-medium text-foreground leading-tight">
                                    {professor.nome}
                                  </div>
                                  <div className="text-sm text-muted-foreground">
                                    {professor.email}
                                  </div>
                                  {professor.especializacao && (
                                    <Badge
                                      variant="outline"
                                      className="text-xs"
                                    >
                                      {professor.especializacao}
                                    </Badge>
                                  )}
                                </label>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Ações */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground mb-2">
                    {viewMode === "professor"
                      ? !selectedProfessor
                        ? "Selecione um professor primeiro"
                        : selectedDisciplinas.length === 0
                        ? "Selecione pelo menos uma disciplina"
                        : `Pronto para vincular ${
                            selectedDisciplinas.length
                          } disciplina${
                            selectedDisciplinas.length !== 1 ? "s" : ""
                          }`
                      : !selectedDisciplina
                      ? "Selecione uma disciplina primeiro"
                      : selectedDisciplinas.length === 0
                      ? "Selecione pelo menos um professor"
                      : `Pronto para vincular ${
                          selectedDisciplinas.length
                        } professor${
                          selectedDisciplinas.length !== 1 ? "es" : ""
                        }`}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSelectedDisciplinas([]);
                      setSelectedProfessor("");
                      setSelectedDisciplina("");
                    }}
                    disabled={
                      loading ||
                      (viewMode === "professor"
                        ? !selectedProfessor && selectedDisciplinas.length === 0
                        : !selectedDisciplina &&
                          selectedDisciplinas.length === 0)
                    }
                  >
                    Limpar Seleção
                  </Button>
                  <Button
                    onClick={
                      selectedDisciplinas.length > 1
                        ? vincularMultiplasDisciplinas
                        : vincularProfessorDisciplina
                    }
                    disabled={
                      loading ||
                      (viewMode === "professor"
                        ? !selectedProfessor || selectedDisciplinas.length === 0
                        : !selectedDisciplina ||
                          selectedDisciplinas.length === 0)
                    }
                    className="min-w-[140px]"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    {loading
                      ? "Vinculando..."
                      : viewMode === "professor"
                      ? selectedDisciplinas.length > 1
                        ? `Vincular ${selectedDisciplinas.length} Disciplinas`
                        : selectedDisciplinas.length === 1
                        ? "Vincular Disciplina"
                        : "Vincular"
                      : selectedDisciplinas.length > 1
                      ? `Vincular ${selectedDisciplinas.length} Professores`
                      : selectedDisciplinas.length === 1
                      ? "Vincular Professor"
                      : "Vincular"}
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lista de Vínculos */}
        {viewMode === "professor" && selectedProfessor && (
          <ProfessorDisciplinaCard
            title="Disciplinas do Professor"
            description={
              professores.find((p) => p.id === selectedProfessor)?.nome || ""
            }
            items={disciplinasProfessor}
            type="disciplinas"
            onRemove={desvincularProfessorDisciplina}
            selectedId={selectedProfessor}
            emptyMessage="Este professor não está vinculado a nenhuma disciplina"
          />
        )}

        {viewMode === "disciplina" && selectedDisciplina && (
          <ProfessorDisciplinaCard
            title="Professores da Disciplina"
            description={
              disciplinas.find((d) => d.id === selectedDisciplina)?.nome || ""
            }
            items={professoresDisciplina}
            type="professores"
            onRemove={desvincularProfessorDisciplina}
            selectedId={selectedDisciplina}
            emptyMessage="Esta disciplina não possui professores vinculados"
          />
        )}
      </div>
    </MainLayout>
  );
}
