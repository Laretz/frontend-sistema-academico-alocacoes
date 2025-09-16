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

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      const [professoresData, disciplinasData] = await Promise.all([
        userService.getAll(),
        disciplinaService.getAll(),
      ]);
      setProfessores(professoresData.usuarios || []);
      setDisciplinas(disciplinasData.disciplinas || []);
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
    if (selectedDisciplinas.length === disciplinas.length) {
      setSelectedDisciplinas([]);
    } else {
      setSelectedDisciplinas(disciplinas.map(d => d.id));
    }
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
                  disabled={disciplinas.length === 0}
                >
                  <CheckSquare className="w-4 h-4 mr-2 text-blue-600" />
                  {selectedDisciplinas.length === disciplinas.length ? "Desmarcar Todas" : "Selecionar Todas"}
                </Button>
              </div>
              
              <div className="max-h-60 overflow-y-auto border rounded-lg p-3 space-y-2">
                {disciplinas.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">
                    Nenhuma disciplina disponível
                  </p>
                ) : (
                  disciplinas.map((disciplina) => (
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
                        <div className="text-sm text-muted-foreground">
                          {disciplina.codigo} - {disciplina.carga_horaria}h
                        </div>
                      </label>
                    </div>
                  ))
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

      {/* Formulário de Vinculação */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Novo Vínculo</CardTitle>
              <CardDescription>
                Selecione um professor e uma disciplina para criar um novo vínculo
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                variant={viewMode === "professor" ? "default" : "outline"}
                onClick={() => setViewMode("professor")}
              >
                <Users className="w-4 h-4 mr-2" />
                Por Professor
              </Button>
              <Button
                variant={viewMode === "disciplina" ? "default" : "outline"}
                onClick={() => setViewMode("disciplina")}
              >
                <BookOpen className="w-4 h-4 mr-2" />
                Por Disciplina
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Professor
                </label>
                <Select
                  value={selectedProfessor}
                  onValueChange={setSelectedProfessor}
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
                <label className="text-sm font-medium mb-2 block">
                  Disciplina
                </label>
                <Select
                  value={selectedDisciplina}
                  onValueChange={setSelectedDisciplina}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma disciplina" />
                  </SelectTrigger>
                  <SelectContent>
                    {disciplinas.map((disciplina) => (
                      <SelectItem key={disciplina.id} value={disciplina.id}>
                        {disciplina.nome} ({disciplina.codigo})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Button
                  onClick={vincularProfessorDisciplina}
                  disabled={loading || !selectedProfessor || !selectedDisciplina}
                  className="w-full"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Vincular
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Vínculos */}
      {viewMode === "professor" && selectedProfessor && (
        <Card>
          <CardHeader>
            <CardTitle>Disciplinas do Professor</CardTitle>
            <CardDescription>
              {professores.find((p) => p.id === selectedProfessor)?.nome}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {disciplinasProfessor.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                Este professor não está vinculado a nenhuma disciplina
              </p>
            ) : (
              <div className="space-y-3">
                {disciplinasProfessor.map((disciplina) => (
                  <div
                    key={disciplina.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex-1">
                      <h4 className="font-medium">{disciplina.nome}</h4>
                      <p className="text-sm text-muted-foreground">
                        {disciplina.curso.nome} - {disciplina.codigo} -{" "}
                        {disciplina.carga_horaria.toString()}
                      </p>
                      <div className="flex gap-2 mt-2">
                        <Badge
                          variant={
                            disciplina.obrigatoria ? "default" : "secondary"
                          }
                        >
                          {disciplina.obrigatoria ? "Obrigatória" : "Optativa"}
                        </Badge>
                        <Badge variant="outline">
                          {disciplina.tipo_de_sala}
                        </Badge>
                      </div>
                    </div>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() =>
                        desvincularProfessorDisciplina(
                          selectedProfessor,
                          disciplina.id
                        )
                      }
                    >
                      <Trash2 className="w-4 h-4 text-white" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {viewMode === "disciplina" && selectedDisciplina && (
        <Card>
          <CardHeader>
            <CardTitle>Professores da Disciplina</CardTitle>
            <CardDescription>
              {disciplinas.find((d) => d.id === selectedDisciplina)?.nome}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {professoresDisciplina.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                Esta disciplina não possui professores vinculados
              </p>
            ) : (
              <div className="space-y-3">
                {professoresDisciplina.map((professor) => (
                  <div
                    key={professor.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex-1">
                      <h4 className="font-medium">{professor.nome}</h4>
                      <p className="text-sm text-muted-foreground">
                        {professor.email}
                      </p>
                      {professor.especializacao && (
                        <Badge variant="outline" className="mt-2">
                          {professor.especializacao}
                        </Badge>
                      )}
                    </div>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() =>
                        desvincularProfessorDisciplina(
                          professor.id,
                          selectedDisciplina
                        )
                      }
                    >
                      <Trash2 className="w-4 h-4 text-white" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
      </div>
    </MainLayout>
  );
}
