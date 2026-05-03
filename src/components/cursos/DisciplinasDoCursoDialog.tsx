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
import { Loader2, Trash2 } from "lucide-react";
import type { Curso, Disciplina } from "@/types/entities";

type SemestreFilter = "ALL" | number;

export function DisciplinasDoCursoDialog({
  open,
  onOpenChange,
  curso,
  disciplinas,
  loading,
  semestreFilter,
  onSemestreFilterChange,
  canManage,
  unlinkingId,
  onUnlink,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  curso: Curso | null;
  disciplinas: Disciplina[];
  loading: boolean;
  semestreFilter: SemestreFilter;
  onSemestreFilterChange: (value: SemestreFilter) => void;
  canManage: boolean;
  unlinkingId: string | null;
  onUnlink: (id_disciplina: string) => void;
}) {
  const disciplinasFiltradas = disciplinas.filter(
    (d) => semestreFilter === "ALL" || d.semestre === semestreFilter,
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Disciplinas - {curso?.nome}</DialogTitle>
          <DialogDescription>
            Disciplinas vinculadas ao curso {curso?.nome}
          </DialogDescription>
        </DialogHeader>

        {curso && (
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
              {Array.from(
                { length: curso.duracao_semestres || 0 },
                (_, i) => i + 1,
              ).map((s) => (
                <option key={s} value={s}>
                  {s}º
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="max-h-[400px] overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin mr-2" />
              Carregando disciplinas...
            </div>
          ) : disciplinasFiltradas.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {semestreFilter === "ALL"
                ? "Nenhuma disciplina vinculada a este curso."
                : "Nenhuma disciplina neste semestre."}
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
                    {canManage && (
                      <Button
                        variant="destructive"
                        size="sm"
                        title="Desvincular disciplina"
                        onClick={() => onUnlink(disciplina.id)}
                        disabled={unlinkingId === disciplina.id}
                      >
                        {unlinkingId === disciplina.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

