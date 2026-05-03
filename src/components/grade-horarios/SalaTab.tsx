import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MapPin } from "lucide-react";
import { GradeGrid } from "@/components/grade-horarios/GradeGrid";
import type { GradeHorario, Sala } from "@/types/entities";

export function SalaTab({
  salas,
  salaId,
  onSalaChange,
  grade,
  loading,
  gridConfig,
}: {
  salas: Sala[];
  salaId: string;
  onSalaChange: (value: string) => void;
  grade: GradeHorario | null;
  loading: boolean;
  gridConfig: { dias: Array<{ key: string; label: string }>; codigos: string[] } | null;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" /> Selecionar Sala
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="max-w-sm">
          <Select value={salaId} onValueChange={onSalaChange}>
            <SelectTrigger>
              <SelectValue placeholder="Escolha uma sala" />
            </SelectTrigger>
            <SelectContent>
              {salas.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.nome} - {s.predio?.nome}
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

