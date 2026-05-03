"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import { Clock } from "lucide-react";
import { AlocacaoPreview } from "@/app/alocacoes/components/AlocacaoPreview";
import type { GradeHorario, Horario, Sala } from "@/types/entities";

type NovaReservaState = {
  salaId?: string;
  date?: string;
  titulo?: string;
  descricao?: string;
  recurrenceRule?: "WEEKLY";
  recurrenceEnd?: string;
};

export function CriarReservaDialog({
  open,
  onOpenChange,
  salas,
  horarios,
  novaReserva,
  setNovaReserva,
  horarioIds,
  setHorarioIds,
  verificandoConflito,
  conflitoMensagem,
  previewGrade,
  previewLoading,
  previewError,
  horariosDisponiveisDia,
  isHorarioIndisponivel,
  podeSalvar,
  onClear,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  salas: Sala[];
  horarios: Horario[];
  novaReserva: NovaReservaState;
  setNovaReserva: (next: NovaReservaState) => void;
  horarioIds: string[];
  setHorarioIds: (updater: (prev: string[]) => string[]) => void;
  verificandoConflito: boolean;
  conflitoMensagem: string;
  previewGrade: GradeHorario | null;
  previewLoading: boolean;
  previewError: string | null;
  horariosDisponiveisDia: Array<Horario & { __label: string }>;
  isHorarioIndisponivel: (h: Horario) => boolean;
  podeSalvar: boolean;
  onClear: () => void;
  onSubmit: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <Clock className="h-4 w-4 mr-2" />
          Criar Reserva
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[98vw] w-[98vw] h-[95vh] overflow-hidden flex flex-col p-0 gap-0 sm:max-w-[98vw]">
        <DialogHeader className="p-6 pb-4 border-b">
          <DialogTitle>Criar Reserva</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-2">
          <div className="overflow-y-auto p-6 border-r">
            <div className="space-y-3">
              <div className="space-y-2">
                <Label>Sala</Label>
                <Select
                  value={novaReserva.salaId || ""}
                  onValueChange={(value) =>
                    setNovaReserva({
                      ...novaReserva,
                      salaId: value,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma sala" />
                  </SelectTrigger>
                  <SelectContent>
                    {salas.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Data</Label>
                <Input
                  type="date"
                  value={novaReserva.date || ""}
                  onChange={(e) =>
                    setNovaReserva({
                      ...novaReserva,
                      date: e.target.value,
                    })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Horários</Label>
                <div className="rounded border p-2 space-y-2">
                  <div className="max-h-[260px] overflow-y-auto space-y-2 pr-1">
                    {(!novaReserva.salaId || !novaReserva.date) && (
                      <div className="text-sm text-muted-foreground">Selecione horário</div>
                    )}
                    {novaReserva.salaId &&
                      novaReserva.date &&
                      (previewLoading || !!previewError || !previewGrade) && (
                        <div className="text-sm text-muted-foreground">
                          {previewLoading
                            ? "Carregando grade..."
                            : previewError
                              ? "Falha ao carregar grade"
                              : "Carregando..."}
                        </div>
                      )}

                    {novaReserva.salaId &&
                      novaReserva.date &&
                      !previewLoading &&
                      !previewError &&
                      previewGrade &&
                      horariosDisponiveisDia.map((h) => {
                        const indisponivel = isHorarioIndisponivel(h);
                        const checked = horarioIds.includes(h.id);
                        return (
                          <label
                            key={h.id}
                            className={`flex items-center gap-2 text-sm ${
                              indisponivel ? "opacity-50" : ""
                            }`}
                          >
                            <Checkbox
                              checked={checked}
                              disabled={indisponivel}
                              onCheckedChange={(v) => {
                                const nextChecked = v === true;
                                setHorarioIds((prev) => {
                                  const has = prev.includes(h.id);
                                  if (nextChecked && !has) return [...prev, h.id];
                                  if (!nextChecked && has) return prev.filter((id) => id !== h.id);
                                  return prev;
                                });
                              }}
                            />
                            <span>
                              {h.__label}
                              {indisponivel ? " (Ocupado)" : ""}
                            </span>
                          </label>
                        );
                      })}

                    {novaReserva.salaId &&
                      novaReserva.date &&
                      !previewLoading &&
                      !previewError &&
                      previewGrade &&
                      horariosDisponiveisDia.length === 0 && (
                        <div className="text-sm text-muted-foreground">
                          Nenhum horário encontrado para esta data.
                        </div>
                      )}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Recorrência semanal (opcional)</Label>
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
                <div className="space-y-2">
                  <Label>Fim da recorrência</Label>
                  <Input
                    type="date"
                    value={novaReserva.recurrenceEnd || ""}
                    onChange={(e) =>
                      setNovaReserva({
                        ...novaReserva,
                        recurrenceEnd: e.target.value,
                      })
                    }
                  />
                </div>
              )}
            </div>

            <div className="space-y-2 mt-6">
              <Label>Título</Label>
              <Input
                type="text"
                value={novaReserva.titulo || ""}
                onChange={(e) => setNovaReserva({ ...novaReserva, titulo: e.target.value })}
                placeholder="Ex.: Reunião do projeto"
              />
            </div>

            <div className="space-y-2">
              <Label>Descrição (opcional)</Label>
              <Input
                type="text"
                value={novaReserva.descricao || ""}
                onChange={(e) => setNovaReserva({ ...novaReserva, descricao: e.target.value })}
                placeholder="Detalhes da reserva"
              />
            </div>

            {conflitoMensagem && (
              <div className="rounded border border-destructive/30 bg-destructive/10 p-2 text-destructive text-sm">
                {conflitoMensagem}
              </div>
            )}

            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={onClear}>
                Limpar
              </Button>
              <Button onClick={onSubmit} disabled={!podeSalvar}>
                {verificandoConflito ? "Verificando..." : "Salvar"}
              </Button>
            </div>
          </div>

          <div className="overflow-y-auto p-6 bg-muted/10">
            {previewError && (
              <div className="mb-4 rounded border border-destructive/30 bg-destructive/10 p-2 text-destructive text-sm">
                {previewError}
              </div>
            )}
            {previewLoading && (
              <div className="mb-4 text-sm text-muted-foreground">
                Carregando grade da sala...
              </div>
            )}
            <AlocacaoPreview
              grade={previewGrade || {}}
              selectedSlots={horarioIds}
              horarios={horarios}
              title="Pré-visualização da grade da sala"
              disciplinaSelecionada={{
                id: "__RESERVA__",
                nome: "Reserva",
                codigo: "RES",
              }}
              professorSelecionado={{ nome: "—" }}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

