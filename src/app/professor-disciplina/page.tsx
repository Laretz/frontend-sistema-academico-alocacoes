"use client";

import { useState, useEffect } from "react";
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
import { Trash2, Plus, Users, BookOpen } from "lucide-react";
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
  const [professores, setProfessores] = useState<User[]>([]);
  const [disciplinas, setDisciplinas] = useState<Disciplina[]>([]);
  const [selectedProfessor, setSelectedProfessor] = useState<string>("");
  const [selectedDisciplina, setSelectedDisciplina] = useState<string>("");
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

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Gerenciar Professor-Disciplina
          </h1>
          <p className="text-muted-foreground">
            Vincule professores às disciplinas que podem lecionar
          </p>
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

      {/* Formulário de Vinculação */}
      <Card>
        <CardHeader>
          <CardTitle>Novo Vínculo</CardTitle>
          <CardDescription>
            Selecione um professor e uma disciplina para criar um novo vínculo
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-end">
            <div className="flex-1">
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

            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">
                Disciplina
              </label>
              <Select
                value={selectedDisciplina}
                onValueChange={handleDisciplinaChange}
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

            <Button
              onClick={vincularProfessorDisciplina}
              disabled={loading || !selectedProfessor || !selectedDisciplina}
            >
              <Plus className="w-4 h-4 mr-2" />
              Vincular
            </Button>
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
                      <Trash2 className="w-4 h-4" />
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
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
