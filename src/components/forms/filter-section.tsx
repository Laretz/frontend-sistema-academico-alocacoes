import { Input } from "@/components/ui/input";
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
import { Search } from "lucide-react";

interface FilterSectionProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedSemestre: string;
  onSemestreChange: (value: string) => void;
  selectedCurso: string;
  onCursoChange: (value: string) => void;
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
  cursos,
  searchPlaceholder = "Buscar por nome ou código...",
}: FilterSectionProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="relative">
        <Search className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
        <Input
          id="search"
          placeholder={searchPlaceholder}
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-8 h-8 w-[220px]"
        />
      </div>

      <div>
        <Select value={selectedSemestre} onValueChange={onSemestreChange}>
          <SelectTrigger className="h-8 w-[240px]">
            <SelectValue placeholder="Filtrar por semestre" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os semestres</SelectItem>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((semestre) => (
              <SelectItem key={semestre} value={semestre.toString()}>
                {semestre}º semestre
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Select value={selectedCurso} onValueChange={onCursoChange}>
          <SelectTrigger className="h-8 w-[240px]">
            <SelectValue placeholder="Filtrar por curso" />
          </SelectTrigger>
          <SelectContent className="max-h-[300px] overflow-y-auto">
            <SelectItem value="all">Todos os cursos</SelectItem>
            {cursos.map((curso) => (
              <SelectItem key={curso.id} value={curso.id}>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="truncate max-w-[220px] block">
                        {curso.nome}
                      </span>
                    </TooltipTrigger>
                    <TooltipContent side="right" className="max-w-[480px] whitespace-normal break-words bg-popover text-popover-foreground border rounded shadow-lg p-2">
                      <p className="break-words">{curso.nome}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}