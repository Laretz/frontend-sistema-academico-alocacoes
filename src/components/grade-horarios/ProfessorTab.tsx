import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { User } from "lucide-react";
import { GradeGrid } from "@/components/grade-horarios/GradeGrid";
import type { GradeHorario, User as Usuario } from "@/types/entities";

export function ProfessorTab({
  professores,
  profId,
  onProfessorChange,
  grade,
  loading,
  gridConfig,
}: {
  professores: Usuario[];
  profId: string;
  onProfessorChange: (value: string) => void;
  grade: GradeHorario | null;
  loading: boolean;
  gridConfig: { dias: Array<{ key: string; label: string }>; codigos: string[] } | null;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" /> Selecionar Professor
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="max-w-sm">
          <Select value={profId} onValueChange={onProfessorChange}>
            <SelectTrigger>
              <SelectValue placeholder="Escolha um professor" />
            </SelectTrigger>
            <SelectContent>
              {professores.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <GradeGrid grade={grade} loading={loading} gridConfig={gridConfig} />
      </CardContent>
    </Card>
  );
}

