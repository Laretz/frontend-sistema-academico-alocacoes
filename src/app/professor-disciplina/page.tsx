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
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Trash2, Plus, Users, BookOpen, CheckSquare, ArrowLeft } from "lucide-react";
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
  const [cursos, setCursos] = useState<{id: string, nome: string}[]>([]);

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
      const cursosUnicos = (disciplinasData.disciplinas || []).reduce((acc: {id: string, nome: string}[], disciplina) => {
        if (!acc.find(curso => curso.id === disciplina.curso.id)) {
          acc.push({ id: disciplina.curso.id, nome: disciplina.curso.nome });
        }
        return acc;
      }, []);
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
    if (!selectedProfessor || !selectedDisciplina) {
      toast.error("Selecione um professor e uma disciplina");
      return;
    }

    setLoading(true);
    try {
      await professorDisciplinaService.vincular({
        id_user: selectedProfessor,
        id_disciplina: selectedDisciplina,
      });
      toast.success("Professor vinculado à disciplina com sucesso!");

      // Atualizar as listas
      if (viewMode === "professor") {
        carregarDisciplinasProfessor(selectedProfessor);
      } else {
        carregarProfessoresDisciplina(selectedDisciplina);
      }

      setSelectedDisciplina("");
      setSelectedProfessor("");
    } catch (error) {
      toast.error("Erro ao vincular professor à disciplina");
    } finally {
      setLoading(false);
    }
  };

  const vincularMultiplasDisciplinas = async () => {
    if (!selectedProfessor || selectedDisciplinas.length === 0) {
      toast.error("Selecione um professor e pelo menos uma disciplina");
      return;
    }

    setLoading(true);
    try {
      // Vincular cada disciplina selecionada
      const promises = selectedDisciplinas.map(disciplinaId =>
        professorDisciplinaService.vincular({
          id_user: selectedProfessor,
          id_disciplina: disciplinaId,
        })
      );
      
      await Promise.all(promises);
      toast.success(`Professor vinculado a ${selectedDisciplinas.length} disciplina(s) com sucesso!`);

      // Atualizar as listas
      if (viewMode === "professor") {
        carregarDisciplinasProfessor(selectedProfessor);
      }

      setSelectedDisciplinas([]);
    } catch (error) {
      toast.error("Erro ao vincular professor às disciplinas");
    } finally {
      setLoading(false);
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

  const handleDisciplinaSelection = (disciplinaId: string, checked: boolean) => {
    if (checked) {
      setSelectedDisciplinas(prev => [...prev, disciplinaId]);
    } else {
      setSelectedDisciplinas(prev => prev.filter(id => id !== disciplinaId));
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
      const matchesSemestre = !selectedSemestre || selectedSemestre === "all" || disciplina.semestre.toString() === selectedSemestre;
      const matchesCurso = !selectedCurso || selectedCurso === "all" || disciplina.curso.id === selectedCurso;
      const matchesSearch = !searchTerm || 
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
    const sortedSemestres = Object.keys(grouped).sort((a, b) => parseInt(a) - parseInt(b));
    return sortedSemestres.map(semestre => ({
      semestre,
      disciplinas: grouped[semestre]
    }));
  };

  return (
    <MainLayout>
      <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Gerenciar Professor-Disciplina
            </h1>
            <p className="text-muted-foreground">
              Vincule professores às disciplinas que podem lecionar
            </p>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <FilterSection
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        selectedSemestre={selectedSemestre}
        onSemestreChange={setSelectedSemestre}
        selectedCurso={selectedCurso}
        onCursoChange={setSelectedCurso}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        cursos={cursos}
        searchPlaceholder="Buscar disciplina por nome ou código..."
      />

      {/* Formulário de Vinculação Múltipla */}
      <Card>
        <CardHeader>
          <CardTitle>Novos Vínculos</CardTitle>
          <CardDescription>
            Selecione um professor e múltiplas disciplinas para criar vários vínculos de uma vez
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                Professor
              </label>
              <Select
                value={selectedProfessor}
                onValueChange={handleProfessorChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um professor" />
                </SelectTrigger>
                <SelectContent>
                  {professores.map((professor) => (
                    <SelectItem key={professor.id} value={professor.id}>
                      {professor.nome} -{" "}
                      {professor.especializacao || "Sem especialização"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-medium">
                  Disciplinas ({selectedDisciplinas.length} selecionadas)
                </label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={toggleSelectAll}
                  disabled={getFilteredDisciplinas().length === 0}
                >
                  <CheckSquare className="w-4 h-4 mr-2 text-blue-600" />
                  {selectedDisciplinas.length === getFilteredDisciplinas().length && getFilteredDisciplinas().length > 0 ? "Desmarcar Todas" : "Selecionar Todas"}
                </Button>
              </div>
              
              <div className="max-h-80 overflow-y-auto border rounded-lg p-3">
                {getFilteredDisciplinas().length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">
                    {disciplinas.length === 0 ? "Nenhuma disciplina disponível" : "Nenhuma disciplina encontrada com os filtros aplicados"}
                  </p>
                ) : (
                  <div className="space-y-4">
                    {getDisciplinasGroupedBySemestre().map(({ semestre, disciplinas: disciplinasSemestre }) => (
                      <div key={semestre} className="space-y-2">
                        <div className="flex items-center gap-2 pb-2 border-b">
                          <Badge variant="outline" className="font-semibold">
                            {semestre}º Semestre
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            ({disciplinasSemestre.length} disciplina{disciplinasSemestre.length !== 1 ? 's' : ''})
                          </span>
                        </div>
                        <div className="space-y-2 pl-4">
                          {disciplinasSemestre.map((disciplina) => (
                            <div key={disciplina.id} className="flex items-center space-x-3 p-2 hover:bg-muted/50 rounded">
                              <Checkbox
                                id={`disciplina-${disciplina.id}`}
                                checked={selectedDisciplinas.includes(disciplina.id)}
                                onCheckedChange={(checked) => 
                                  handleDisciplinaSelection(disciplina.id, checked as boolean)
                                }
                              />
                              <label 
                                htmlFor={`disciplina-${disciplina.id}`}
                                className="flex-1 cursor-pointer"
                              >
                                <div className="font-medium">{disciplina.nome}</div>
                                <div className="text-sm text-muted-foreground flex items-center gap-2">
                                  <span>{disciplina.codigo}</span>
                                  <span>•</span>
                                  <span>{disciplina.carga_horaria}h</span>
                                  <span>•</span>
                                  <span>{disciplina.curso.nome}</span>
                                </div>
                                <div className="flex gap-1 mt-1">
                                  <Badge variant={disciplina.obrigatoria ? "default" : "secondary"} className="text-xs">
                                    {disciplina.obrigatoria ? "Obrigatória" : "Optativa"}
                                  </Badge>
                                  <Badge variant="outline" className="text-xs">
                                    {disciplina.tipo_de_sala}
                                  </Badge>
                                </div>
                              </label>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end">
              <Button
                onClick={vincularMultiplasDisciplinas}
                disabled={loading || !selectedProfessor || selectedDisciplinas.length === 0}
              >
                <Plus className="w-4 h-4 mr-2 text-white" />
                Vincular {selectedDisciplinas.length} Disciplina(s)
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Formulário de Vinculação Individual */}
      <VinculationForm
        title="Novo Vínculo Individual"
        description="Selecione um professor e uma disciplina para criar um novo vínculo"
        professores={professores}
        disciplinas={disciplinas}
        selectedProfessor={selectedProfessor}
        onProfessorChange={handleProfessorChange}
        selectedDisciplina={selectedDisciplina}
        onDisciplinaChange={handleDisciplinaChange}
        onSubmit={vincularProfessorDisciplina}
        loading={loading}
        submitText="Vincular"
        type="individual"
      />

      {/* Lista de Vínculos */}
      {viewMode === "professor" && selectedProfessor && (
        <ProfessorDisciplinaCard
          title="Disciplinas do Professor"
          description={professores.find((p) => p.id === selectedProfessor)?.nome || ""}
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
          description={disciplinas.find((d) => d.id === selectedDisciplina)?.nome || ""}
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
