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

export function TurmasFilters({
  searchTerm,
  onSearchTermChange,
  semestresDisponiveis,
  semestreFiltro,
  onSemestreFiltroChange,
  cursos,
  cursoFiltro,
  onCursoFiltroChange,
  cursoFiltroLabel,
  onClear,
}: {
  searchTerm: string;
  onSearchTermChange: (value: string) => void;
  semestresDisponiveis: number[];
  semestreFiltro: string;
  onSemestreFiltroChange: (value: string) => void;
  cursos: Curso[];
  cursoFiltro: string;
  onCursoFiltroChange: (value: string) => void;
  cursoFiltroLabel: string | null;
  onClear: () => void;
}) {
  const temFiltroAtivo =
    Boolean(searchTerm) || semestreFiltro !== "todos" || cursoFiltro !== "todos";

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar turmas..."
            value={searchTerm}
            onChange={(e) => onSearchTermChange(e.target.value)}
            className="pl-8"
          />
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <Select value={semestreFiltro} onValueChange={onSemestreFiltroChange}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="Semestre" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os semestres</SelectItem>
              {semestresDisponiveis.map((s) => (
                <SelectItem key={s} value={String(s)}>
                  {s}º semestre
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={cursoFiltro} onValueChange={onCursoFiltroChange}>
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

          {temFiltroAtivo && (
            <Button variant="outline" onClick={onClear}>
              Limpar filtros
            </Button>
          )}
        </div>
      </div>

      {(semestreFiltro !== "todos" || cursoFiltro !== "todos") && (
        <div className="flex flex-wrap gap-2">
          {semestreFiltro !== "todos" && (
            <Badge variant="secondary">Semestre: {semestreFiltro}º</Badge>
          )}
          {cursoFiltro !== "todos" && (
            <Badge variant="secondary">Curso: {cursoFiltroLabel || "Selecionado"}</Badge>
          )}
        </div>
      )}
    </div>
  );
}

