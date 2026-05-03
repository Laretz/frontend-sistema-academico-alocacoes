"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Edit, MapPin, Trash2, Users } from "lucide-react";
import type { Sala } from "@/types/entities";
import { GradeHorariosSala } from "@/components/salas/GradeHorariosSala";
import { ReservaSalaDialog } from "@/components/reservas/ReservaSalaDialog";

const tipoSalaLabels: Record<string, string> = {
  AULA: "Sala de Aula",
  LAB: "Laboratório",
  AUDITORIO: "Auditório",
};

export function SalasGrid({
  salas,
  canReserve,
  onReserveSuccess,
  onEdit,
  onDelete,
}: {
  salas: Sala[];
  canReserve: boolean;
  onReserveSuccess: () => void;
  onEdit: (sala: Sala) => void;
  onDelete: (sala: Sala) => void;
}) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {salas.map((sala) => (
        <Card key={sala.id}>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-lg">{sala.nome}</CardTitle>
                <CardDescription className="mt-1">
                  {tipoSalaLabels[sala.tipo] || sala.tipo}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Prédio:</span>
                <div className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  <span>{sala.predio.nome}</span>
                </div>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Capacidade:</span>
                <div className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  <span>{sala.capacidade} pessoas</span>
                </div>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Computadores:</span>
                <span>{sala.computadores ?? 0}</span>
              </div>
            </div>

            <div className="flex justify-end space-x-2 mt-4">
              <GradeHorariosSala
                sala={sala}
                trigger={
                  <Button variant="outline" size="sm">
                    <Calendar className="h-4 w-4" />
                  </Button>
                }
              />
              {canReserve && <ReservaSalaDialog sala={sala} onSuccess={onReserveSuccess} />}
              <Button variant="outline" size="sm" onClick={() => onEdit(sala)}>
                <Edit className="h-4 w-4 text-shadblue-primary" />
              </Button>
              <Button variant="outline" size="sm" onClick={() => onDelete(sala)}>
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
