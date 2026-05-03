"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search } from "lucide-react";
import type { Curso } from "@/types/entities";

export function DisciplinasFilters({
  cursos,
  semestresDisponiveis,
  searchTerm,
  onSearchTermChange,
  selectedCurso,
  onSelectedCursoChange,
  selectedSemestre,
  onSelectedSemestreChange,
  cursoLabel,
  onClear,
}: {
  cursos: Curso[];
  semestresDisponiveis: number[];
  searchTerm: string;
  onSearchTermChange: (value: string) => void;
  selectedCurso: string;
  onSelectedCursoChange: (value: string) => void;
  selectedSemestre: string;
  onSelectedSemestreChange: (value: string) => void;
  cursoLabel: string | null;
  onClear: () => void;
}) {
  const temFiltroAtivo =
    Boolean(searchTerm) ||
    selectedCurso !== "todos" ||
    selectedSemestre !== "todos";

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Buscar disciplinas..."
            value={searchTerm}
            onChange={(e) => onSearchTermChange(e.target.value)}
            className="pl-8"
          />
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <Select value={selectedCurso} onValueChange={onSelectedCursoChange}>
            <SelectTrigger className="w-full sm:w-[280px]">
              <SelectValue placeholder="Curso" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os cursos</SelectItem>
              {cursos.map((curso) => (
                <SelectItem key={curso.id} value={curso.id}>
                  {curso.nome} - {curso.turno}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedSemestre} onValueChange={onSelectedSemestreChange}>
            <SelectTrigger className="w-full sm:w-[220px]">
              <SelectValue placeholder="Semestre" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os semestres</SelectItem>
              {semestresDisponiveis.map((s) => (
                <SelectItem key={s} value={String(s)}>
                  {s}º Semestre
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {temFiltroAtivo && (
            <Button variant="outline" onClick={onClear}>
              Limpar filtros
            </Button>
          )}
        </div>
      </div>

      {temFiltroAtivo && (selectedCurso !== "todos" || selectedSemestre !== "todos") && (
        <div className="flex flex-wrap gap-2">
          {selectedCurso !== "todos" && (
            <Badge variant="secondary">
              Curso: {cursoLabel || "Selecionado"}
            </Badge>
          )}
          {selectedSemestre !== "todos" && (
            <Badge variant="secondary">Semestre: {selectedSemestre}º</Badge>
          )}
        </div>
      )}
    </div>
  );
}

