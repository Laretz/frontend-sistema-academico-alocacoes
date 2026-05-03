"use client";

import { MainLayout } from "@/components/layout/main-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Trash2 } from "lucide-react";
import { useReservas } from "@/hooks/useReservas";
import { CriarReservaDialog } from "@/components/reservas/CriarReservaDialog";

export function ReservasFeature() {
  const state = useReservas();

  if (state.loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Carregando...</div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Reservas</h1>
            <p className="text-muted-foreground">Crie e gerencie reservas de sala</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-3">
              <CardTitle>Gerenciar Reservas</CardTitle>
              <div className="flex items-center gap-2">
                <CriarReservaDialog
                  open={state.criarOpen}
                  onOpenChange={(open) => {
                    state.setCriarOpen(open);
                    if (!open) {
                      state.setNovaReserva({});
                      state.setConflitoMensagem("");
                    }
                  }}
                  salas={state.salas}
                  horarios={state.horarios}
                  novaReserva={state.novaReserva}
                  setNovaReserva={(next) => state.setNovaReserva(next)}
                  horarioIds={state.horarioIds}
                  setHorarioIds={(updater) => state.setHorarioIds(updater)}
                  verificandoConflito={state.verificandoConflito}
                  conflitoMensagem={state.conflitoMensagem}
                  previewGrade={state.previewGrade}
                  previewLoading={state.previewLoading}
                  previewError={state.previewError}
                  horariosDisponiveisDia={state.horariosDisponiveisDia}
                  isHorarioIndisponivel={state.isHorarioIndisponivel}
                  podeSalvar={state.podeSalvar}
                  onClear={() => {
                    state.setNovaReserva({});
                    state.setConflitoMensagem("");
                  }}
                  onSubmit={state.criarReserva}
                />
                <Button variant="outline" onClick={state.carregarReservas}>
                  Atualizar
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label>Sala</Label>
                <Select value={state.filtroSalaId} onValueChange={state.setFiltroSalaId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todas as salas" />
                  </SelectTrigger>
                  <SelectContent>
                    {state.salas.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Horário</Label>
                <Select value={state.filtroHorarioId} onValueChange={state.setFiltroHorarioId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos os horários" />
                  </SelectTrigger>
                  <SelectContent>
                    {state.horarios.map((h) => (
                      <SelectItem key={h.id} value={h.id}>
                        {h.dia_semana} - {h.codigo}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Data inicial</Label>
                <Input type="date" value={state.filtroDe} onChange={(e) => state.setFiltroDe(e.target.value)} />
              </div>
              <div>
                <Label>Data final</Label>
                <Input type="date" value={state.filtroAte} onChange={(e) => state.setFiltroAte(e.target.value)} />
              </div>
            </div>

            <div className="flex justify-end">
              <Button onClick={state.carregarReservas}>Buscar</Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {state.reservas.map((r) => {
                const salaNome = state.getSalaNome(r);
                const horarioLabel = state.getHorarioLabel(r);
                return (
                  <div
                    key={r.id}
                    className="border rounded p-3 flex items-start justify-between"
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="font-medium truncate" title={r.titulo}>
                        {r.titulo}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {salaNome}
                        {horarioLabel ? ` • ${horarioLabel}` : ""}
                      </div>
                      <div className="text-sm text-muted-foreground">{r.date}</div>
                      {r.recurrenceRule === "WEEKLY" && (
                        <div className="text-xs font-semibold text-primary">
                          Recorrente até {r.recurrenceEnd}
                        </div>
                      )}
                      <Badge variant={r.status === "ATIVA" ? "secondary" : "outline"}>
                        {r.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      {r.seriesId ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => state.cancelarSerie(r.seriesId!)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => state.cancelarReserva(r.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
              {state.reservas.length === 0 && (
                <div className="text-sm text-muted-foreground">
                  Nenhuma reserva encontrada para os filtros.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}

