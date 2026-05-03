import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { GraduationCap } from "lucide-react";
import { LimparDisciplinaDialog } from "@/app/grade-horarios/components/LimparDisciplinaDialog";
import { GradeGrid } from "@/components/grade-horarios/GradeGrid";
import type { GradeHorario, Turma } from "@/types/entities";

export function TurmaTab({
  turmas,
  turmaId,
  onTurmaChange,
  grade,
  loading,
  gridConfig,
  disciplinasDaGrade,
  onGradeRefresh,
}: {
  turmas: Turma[];
  turmaId: string;
  onTurmaChange: (value: string) => void;
  grade: GradeHorario | null;
  loading: boolean;
  gridConfig: { dias: Array<{ key: string; label: string }>; codigos: string[] } | null;
  disciplinasDaGrade: Array<{ id: string; nome: string }>;
  onGradeRefresh: () => void;
}) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <CardTitle className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5" /> Selecionar Turma
          </CardTitle>
          {grade && turmaId && (
            <div className="shrink-0">
              <LimparDisciplinaDialog
                turmaId={turmaId}
                disciplinas={disciplinasDaGrade}
                onSuccess={onGradeRefresh}
              />
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="w-full max-w-lg min-w-0">
          <Select value={turmaId} onValueChange={onTurmaChange}>
            <SelectTrigger>
              <SelectValue placeholder="Escolha uma turma" />
            </SelectTrigger>
            <SelectContent>
              {turmas.map((t) => (
                <SelectItem key={t.id} value={t.id}>
                  {t.nome}
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

