import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Users } from "lucide-react";
import type { User } from "@/types/entities";

type ProfessorSelectorProps =
  | {
      variant: "single";
      professores: User[];
      value: string;
      onChange: (value: string) => void;
    }
  | {
      variant: "multiple";
      professores: User[];
      selectedIds: string[];
      onToggle: (professorId: string, checked: boolean) => void;
    };

export function ProfessorSelector(props: ProfessorSelectorProps) {
  if (props.variant === "single") {
    const { professores, value, onChange } = props;

    return (
      <div className="space-y-2">
        <label className="text-sm font-medium">Professor</label>
        <Select value={value} onValueChange={onChange}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Selecione um professor" />
          </SelectTrigger>
          <SelectContent className="max-h-[300px] overflow-y-auto">
            {professores.map((professor) => (
              <SelectItem key={professor.id} value={professor.id}>
                <div className="flex flex-col items-start">
                  <span className="font-medium">{professor.nome}</span>
                  <span className="text-sm text-muted-foreground">
                    {professor.especializacao || "Sem especialização"}
                  </span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    );
  }

  const { professores, selectedIds, onToggle } = props;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <label className="text-sm font-medium">Professores</label>
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
            {professores.map((professor) => {
              const checked = selectedIds.includes(professor.id);
              return (
                <div
                  key={professor.id}
                  className="flex items-start space-x-3 p-3 hover:bg-background/80 rounded-lg border border-transparent hover:border-border/50 transition-all duration-200"
                >
                  <Checkbox
                    id={`professor-${professor.id}`}
                    checked={checked}
                    onCheckedChange={(value) =>
                      onToggle(professor.id, Boolean(value))
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
                      <Badge variant="outline" className="text-xs">
                        {professor.especializacao}
                      </Badge>
                    )}
                  </label>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
