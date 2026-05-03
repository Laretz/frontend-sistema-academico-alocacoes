"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import type { Curso } from "@/types/entities";
import type { User as Usuario } from "@/types/auth";

export function GerenciarCursosDialog({
  open,
  onOpenChange,
  user,
  cursosVinculados,
  cursosDisponiveis,
  cursoSearch,
  onCursoSearchChange,
  onVincular,
  onDesvincular,
  isSaving,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: Usuario | null;
  cursosVinculados: Curso[];
  cursosDisponiveis: Curso[];
  cursoSearch: string;
  onCursoSearchChange: (value: string) => void;
  onVincular: (id_curso: string) => void;
  onDesvincular: (id_curso: string) => void;
  isSaving: boolean;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>Gerenciar Cursos — {user?.nome}</DialogTitle>
          <DialogDescription>
            Vincule ou remova cursos deste professor. Filtro por nome disponível.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar curso por nome..."
              value={cursoSearch}
              onChange={(e) => onCursoSearchChange(e.target.value)}
              className="flex-1"
            />
          </div>

          <div>
            <h3 className="text-sm font-semibold mb-2">
              Cursos vinculados ({cursosVinculados.length})
            </h3>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {cursosVinculados.length === 0 && (
                <p className="text-muted-foreground text-sm">Nenhum curso vinculado.</p>
              )}
              {cursosVinculados.map((curso) => (
                <div
                  key={curso.id}
                  className="flex items-center justify-between p-2 border rounded-md"
                >
                  <div>
                    <p className="font-medium">{curso.nome}</p>
                    <p className="text-xs text-muted-foreground">
                      {curso.codigo} • {curso.turno}
                    </p>
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => onDesvincular(curso.id)}
                    disabled={isSaving}
                  >
                    Desvincular
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold mb-2">Cursos disponíveis</h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {cursosDisponiveis.map((curso) => (
                <div
                  key={curso.id}
                  className="flex items-center justify-between p-2 border rounded-md"
                >
                  <div>
                    <p className="font-medium">{curso.nome}</p>
                    <p className="text-xs text-muted-foreground">
                      {curso.codigo} • {curso.turno}
                    </p>
                  </div>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => onVincular(curso.id)}
                    disabled={isSaving}
                  >
                    Vincular
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSaving}>
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

