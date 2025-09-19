import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Filter } from "lucide-react";

interface FilterSectionProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedSemestre: string;
  onSemestreChange: (value: string) => void;
  selectedCurso: string;
  onCursoChange: (value: string) => void;
  viewMode: "professor" | "disciplina";
  onViewModeChange: (value: "professor" | "disciplina") => void;
  cursos: { id: string; nome: string }[];
  searchPlaceholder?: string;
}

export function FilterSection({
  searchTerm,
  onSearchChange,
  selectedSemestre,
  onSemestreChange,
  selectedCurso,
  onCursoChange,
  viewMode,
  onViewModeChange,
  cursos,
  searchPlaceholder = "Buscar por nome ou código...",
}: FilterSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter className="w-5 h-5" />
          Filtros
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-2">
            <Label htmlFor="search">Buscar</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                id="search"
                placeholder={searchPlaceholder}
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Semestre</Label>
            <Select value={selectedSemestre} onValueChange={onSemestreChange}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o semestre" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os semestres</SelectItem>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((semestre) => (
                  <SelectItem key={semestre} value={semestre.toString()}>
                    {semestre}º Semestre
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Curso</Label>
            <Select value={selectedCurso} onValueChange={onCursoChange}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o curso" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os cursos</SelectItem>
                {cursos.map((curso) => (
                  <SelectItem key={curso.id} value={curso.id}>
                    {curso.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Modo de Visualização</Label>
            <Select
              value={viewMode}
              onValueChange={(value) =>
                onViewModeChange(value as "professor" | "disciplina")
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="professor">Por Professor</SelectItem>
                <SelectItem value="disciplina">Por Disciplina</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}