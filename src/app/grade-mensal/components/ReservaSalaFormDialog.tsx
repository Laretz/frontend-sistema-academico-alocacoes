"use client";

import { GradeHorariosSala } from "@/components/salas/GradeHorariosSala";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { CreateReservaSalaRequest, Horario, Sala } from "@/types/entities";
import { Plus } from "lucide-react";
import React from "react";

type NovaReservaState = Partial<
  CreateReservaSalaRequest & { titulo: string; descricao?: string }
>;

export function ReservaSalaFormDialog({
  open,
  onOpenChange,
  salas,
  horarios,
  novaReserva,
  setNovaReserva,
  conflitoReservaMensagem,
  verificandoConflitoReserva,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  salas: Sala[];
  horarios: Horario[];
  novaReserva: NovaReservaState;
  setNovaReserva: (next: NovaReservaState) => void;
  conflitoReservaMensagem: string;
  verificandoConflitoReserva: boolean;
  onSubmit: () => void;
}) {
  const salaSelecionada = salas.find((s) => s.id === novaReserva.salaId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Adicionar Reserva
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Adicionar Reserva de Sala</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="sala">Sala</Label>
            <Select
              value={novaReserva.salaId || ""}
              onValueChange={(value) =>
                setNovaReserva({ ...novaReserva, salaId: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma sala" />
              </SelectTrigger>
              <SelectContent>
                {salas.map((sala) => (
                  <SelectItem key={sala.id} value={sala.id}>
                    {sala.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="horario">Horário</Label>
            <Select
              value={novaReserva.horarioId || ""}
              onValueChange={(value) =>
                setNovaReserva({ ...novaReserva, horarioId: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione um horário" />
              </SelectTrigger>
              <SelectContent>
                {horarios.map((horario) => (
                  <SelectItem key={horario.id} value={horario.id}>
                    {horario.dia_semana} - {horario.codigo}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="date">Data</Label>
            <Input
              id="date"
              type="date"
              value={novaReserva.date || ""}
              onChange={(e) =>
                setNovaReserva({ ...novaReserva, date: e.target.value })
              }
            />
          </div>

          <div>
            <Label htmlFor="titulo">Título</Label>
            <Input
              id="titulo"
              type="text"
              value={novaReserva.titulo || ""}
              onChange={(e) =>
                setNovaReserva({ ...novaReserva, titulo: e.target.value })
              }
            />
          </div>

          <div>
            <Label htmlFor="descricao">Descrição</Label>
            <Input
              id="descricao"
              type="text"
              value={novaReserva.descricao || ""}
              onChange={(e) =>
                setNovaReserva({ ...novaReserva, descricao: e.target.value })
              }
            />
          </div>

          <div>
            <Label htmlFor="recorrencia">Recorrência semanal (opcional)</Label>
            <Select
              value={novaReserva.recurrenceRule ?? "NONE"}
              onValueChange={(value) =>
                setNovaReserva({
                  ...novaReserva,
                  recurrenceRule: value === "WEEKLY" ? "WEEKLY" : undefined,
                  ...(value === "WEEKLY" ? {} : { recurrenceEnd: undefined }),
                })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Sem recorrência" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="NONE">Sem recorrência</SelectItem>
                <SelectItem value="WEEKLY">Semanal</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {novaReserva.recurrenceRule === "WEEKLY" && (
            <div>
              <Label htmlFor="recurrenceEnd">Fim da recorrência</Label>
              <Input
                id="recurrenceEnd"
                type="date"
                value={novaReserva.recurrenceEnd || ""}
                onChange={(e) =>
                  setNovaReserva({ ...novaReserva, recurrenceEnd: e.target.value })
                }
              />
            </div>
          )}

          {conflitoReservaMensagem && (
            <div className="rounded border border-destructive/30 bg-destructive/10 p-2 text-destructive text-sm">
              {conflitoReservaMensagem}
            </div>
          )}

          <div className="flex justify-between items-center gap-2 pt-2">
            {salaSelecionada && (
              <GradeHorariosSala
                sala={salaSelecionada}
                trigger={
                  <Button variant="outline" size="sm">
                    Ver grade da sala
                  </Button>
                }
              />
            )}
            <div className="flex gap-2">
              <Button
                onClick={onSubmit}
                disabled={
                  !novaReserva.salaId ||
                  !novaReserva.horarioId ||
                  !novaReserva.date ||
                  !novaReserva.titulo ||
                  !!conflitoReservaMensagem ||
                  verificandoConflitoReserva
                }
              >
                {verificandoConflitoReserva ? "Verificando..." : "Salvar"}
              </Button>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
