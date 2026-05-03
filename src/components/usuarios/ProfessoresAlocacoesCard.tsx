"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { User as Usuario } from "@/types/auth";

export function ProfessoresAlocacoesCard({
  usuarios,
  cargaHorariaProfessores,
}: {
  usuarios: Usuario[];
  cargaHorariaProfessores: Record<string, number>;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Alocações dos Professores</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {usuarios
            .sort(
              (a, b) =>
                (cargaHorariaProfessores[b.id] || 0) -
                (cargaHorariaProfessores[a.id] || 0),
            )
            .map((professor) => (
              <div
                key={professor.id}
                className="flex justify-between items-center py-1 border-b border-gray-100"
              >
                <span className="text-sm font-medium">{professor.nome}</span>
                <Badge variant="outline">
                  {cargaHorariaProfessores[professor.id] || 0} alocações
                </Badge>
              </div>
            ))}
        </div>
      </CardContent>
    </Card>
  );
}

