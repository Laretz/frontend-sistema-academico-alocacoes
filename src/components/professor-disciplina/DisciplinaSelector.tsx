import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
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
import { BookOpen, CheckSquare } from "lucide-react";
import type { Disciplina } from "@/types/entities";

type DisciplinaSelectorProps =
  | {
      variant: "single";
      disciplinas: Disciplina[];
      value: string;
      onChange: (value: string) => void;
    }
  | {
      variant: "multiple";
      disciplinas: Disciplina[];
      disciplinasGroupedBySemestre: Array<{
        semestre: string;
        disciplinas: Disciplina[];
      }>;
      filteredCount: number;
      selectedIds: string[];
      onToggle: (disciplinaId: string, checked: boolean) => void;
      onToggleAll: () => void;
    };

export function DisciplinaSelector(props: DisciplinaSelectorProps) {
  if (props.variant === "single") {
    const { disciplinas, value, onChange } = props;

    return (
      <div className="space-y-2">
        <label className="text-sm font-medium">Disciplina</label>
        <Select value={value} onValueChange={onChange}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Selecione uma disciplina" />
          </SelectTrigger>
          <SelectContent className="max-h-[300px] overflow-y-auto">
            {disciplinas.map((disciplina) => (
              <SelectItem key={disciplina.id} value={disciplina.id}>
                <div className="flex flex-col items-start">
                  <span className="font-medium">{disciplina.nome}</span>
                  <span className="text-sm text-muted-foreground">
                    {disciplina.codigo ?? ""} -{" "}
                    {disciplina.curso?.nome ?? "Curso não informado"}
                  </span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    );
  }

  const {
    disciplinas,
    disciplinasGroupedBySemestre,
    filteredCount,
    selectedIds,
    onToggle,
    onToggleAll,
  } = props;

  const allSelected = filteredCount > 0 && selectedIds.length === filteredCount;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <label className="text-sm font-medium">Disciplinas</label>
          <p className="text-sm text-muted-foreground">
            {selectedIds.length} disciplina{selectedIds.length !== 1 ? "s" : ""}{" "}
            selecionada{selectedIds.length !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onToggleAll}
            disabled={filteredCount === 0}
          >
            <CheckSquare className="w-4 h-4 mr-2" />
            {allSelected ? "Desmarcar Todas" : "Selecionar Todas"}
          </Button>
        </div>
      </div>

      <div className="max-h-96 overflow-y-auto border rounded-lg bg-muted/20">
        {filteredCount === 0 ? (
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
            {disciplinasGroupedBySemestre.map(({ semestre, disciplinas }) => (
              <div key={semestre} className="space-y-3">
                <div className="flex items-center gap-3 pb-2 border-b border-border/50 sticky top-0 bg-background/95 backdrop-blur-sm">
                  <Badge variant="default" className="font-semibold">
                    {semestre}º Semestre
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {disciplinas.length} disciplina
                    {disciplinas.length !== 1 ? "s" : ""}
                  </span>
                </div>
                <div className="space-y-2">
                  {disciplinas.map((disciplina) => {
                    const checked = selectedIds.includes(disciplina.id);
                    return (
                      <div
                        key={disciplina.id}
                        className="flex items-start space-x-3 p-3 hover:bg-background/80 rounded-lg border border-transparent hover:border-border/50 transition-all duration-200"
                      >
                        <Checkbox
                          id={`disciplina-${disciplina.id}`}
                          checked={checked}
                          onCheckedChange={(value) =>
                            onToggle(disciplina.id, Boolean(value))
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
                            <Badge variant="outline" className="text-xs">
                              {disciplina.codigo}
                            </Badge>
                            <span>{disciplina.carga_horaria}h</span>
                            <span>•</span>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <span className="truncate max-w-[150px]">
                                    {disciplina.curso?.nome ?? "Curso não informado"}
                                  </span>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>
                                    {disciplina.curso?.nome ?? "Curso não informado"}
                                  </p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                          <div className="flex gap-2">
                            <Badge
                              variant={disciplina.obrigatoria ? "default" : "secondary"}
                              className="text-xs"
                            >
                              {disciplina.obrigatoria ? "Obrigatória" : "Optativa"}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {disciplina.tipo_de_sala}
                            </Badge>
                          </div>
                        </label>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
