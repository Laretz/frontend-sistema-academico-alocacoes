import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
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
        <div className="flex flex-col space-y-4">
          {/* Primeira linha - Busca */}
          <div className="w-full">
            <Label htmlFor="search">Buscar</Label>
            <div className="relative mt-2">
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

          {/* Segunda linha - Filtros com rolagem horizontal */}
          <div className="overflow-x-auto">
            <div className="flex gap-4 min-w-max pb-2">
              <div className="space-y-2 min-w-[200px]">
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

              <div className="space-y-2 min-w-[250px]">
                <Label>Curso</Label>
                <Select value={selectedCurso} onValueChange={onCursoChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o curso" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px] overflow-y-auto">
                    <SelectItem value="all">Todos os cursos</SelectItem>
                    {cursos.map((curso) => (
                      <SelectItem key={curso.id} value={curso.id}>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="truncate max-w-[200px] block">
                                {curso.nome}
                              </span>
                            </TooltipTrigger>
                            <TooltipContent className="max-w-xs p-2 text-sm bg-popover text-popover-foreground border rounded shadow-lg">
                              <p className="break-words">
                                {curso.nome}
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 min-w-[200px]">
                <Label className="text-sm font-medium text-foreground/80">
                  Modo de Visualização
                </Label>
                <div className="flex rounded-md border border-input bg-background p-1">
                  <Button
                    variant={viewMode === 'professor' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => onViewModeChange('professor')}
                    className="flex-1 h-8"
                  >
                    Professor
                  </Button>
                  <Button
                    variant={viewMode === 'disciplina' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => onViewModeChange('disciplina')}
                    className="flex-1 h-8"
                  >
                    Disciplina
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}