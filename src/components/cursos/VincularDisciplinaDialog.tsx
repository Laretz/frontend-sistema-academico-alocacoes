"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import type { Disciplina } from "@/types/entities";

type SemestreFilter = "ALL" | number;

export function VincularDisciplinaDialog({
  open,
  onOpenChange,
  loading,
  disciplinas,
  semestreFilter,
  onSemestreFilterChange,
  onVincular,
  linking,
  linkingDisciplinaId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  loading: boolean;
  disciplinas: Disciplina[];
  semestreFilter: SemestreFilter;
  onSemestreFilterChange: (value: SemestreFilter) => void;
  onVincular: (id_disciplina: string) => void;
  linking: boolean;
  linkingDisciplinaId: string | null;
}) {
  const maxSem = disciplinas.reduce((m, d) => Math.max(m, d.semestre || 0), 0);
  const semestres = Array.from({ length: maxSem }, (_, i) => i + 1);

  const disciplinasFiltradas = disciplinas.filter(
    (d) => semestreFilter === "ALL" || d.semestre === semestreFilter,
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Vincular Disciplina ao Curso</DialogTitle>
          <DialogDescription>
            Selecione uma disciplina para vincular ao curso.
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center justify-between mb-3">
          <div className="text-sm text-muted-foreground">Filtrar por semestre</div>
          <select
            value={String(semestreFilter)}
            onChange={(e) => {
              const val = e.target.value;
              onSemestreFilterChange(val === "ALL" ? "ALL" : Number(val));
            }}
            className="flex h-9 rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="ALL">Todos</option>
            {semestres.map((s) => (
              <option key={s} value={s}>
                {s}º
              </option>
            ))}
          </select>
        </div>

        <div className="max-h-[400px] overflow-y-auto space-y-3">
          {loading ? (
            <div className="flex items-center justify-center py-8 text-muted-foreground">
              <Loader2 className="h-6 w-6 animate-spin mr-2" /> Carregando disciplinas...
            </div>
          ) : disciplinasFiltradas.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {semestreFilter === "ALL"
                ? "Nenhuma disciplina disponível para vincular."
                : "Nenhuma disciplina disponível neste semestre."}
            </div>
          ) : (
            <div className="space-y-3">
              {disciplinasFiltradas.map((disciplina) => (
                <div
                  key={disciplina.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex-1">
                    <div className="font-medium">{disciplina.nome}</div>
                    <div className="text-sm text-muted-foreground">
                      Semestre {disciplina.semestre} • Carga Horária: {disciplina.carga_horaria}h
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{disciplina.semestre}º Sem</Badge>
                    <Badge variant="secondary">{disciplina.carga_horaria}h</Badge>
                    <Button
                      variant="default"
                      size="sm"
                      title="Vincular disciplina"
                      onClick={() => onVincular(disciplina.id)}
                      disabled={linking && linkingDisciplinaId === disciplina.id}
                    >
                      {linking && linkingDisciplinaId === disciplina.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        "Vincular"
                      )}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

