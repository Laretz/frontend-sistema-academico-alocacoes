"use client";

import { useEffect, useMemo, useState } from "react";
import { MainLayout } from "@/components/layout/main-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuthStore } from "@/store/auth";
import { periodoLetivoService } from "@/services/entities";
import type { PeriodoLetivo } from "@/types/entities";
import { useRouter } from "next/navigation";
import { Calendar, Clock, RefreshCcw, Timer, ArrowLeft } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

type PeriodoModo = "operacional" | "consulta";

function getPeriodoModo(): PeriodoModo {
  if (typeof window === "undefined") return "operacional";
  const raw = window.localStorage.getItem("periodo.modo");
  return raw === "consulta" ? "consulta" : "operacional";
}

function getPeriodoConsultaId(): string {
  if (typeof window === "undefined") return "";
  return window.localStorage.getItem("periodo.consultaId") || "";
}

function setPeriodoModo(modo: PeriodoModo) {
  window.localStorage.setItem("periodo.modo", modo);
  if (modo === "operacional") {
    window.localStorage.removeItem("periodo.consultaId");
  }
}

function setPeriodoConsultaId(periodoId: string) {
  window.localStorage.setItem("periodo.consultaId", periodoId);
}

export default function ConfiguracoesPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [periodoAtivo, setPeriodoAtivo] = useState<PeriodoLetivo | null>(null);
  const [periodos, setPeriodos] = useState<PeriodoLetivo[]>([]);
  const [loadingPeriodo, setLoadingPeriodo] = useState(true);
  const [errorPeriodo, setErrorPeriodo] = useState<string | null>(null);

  const [modo, setModo] = useState<PeriodoModo>("operacional");
  const [periodoConsultaId, setPeriodoConsultaIdState] = useState<string>("");

  const [periodoSelecionadoId, setPeriodoSelecionadoId] = useState<string>("");
  const [advanceForm, setAdvanceForm] = useState<{
    nome: string;
    data_inicio: string;
    data_fim: string;
  }>({ nome: "", data_inicio: "", data_fim: "" });

  useEffect(() => {
    setModo(getPeriodoModo());
    setPeriodoConsultaIdState(getPeriodoConsultaId());
  }, []);

  useEffect(() => {
    async function fetchPeriodoAtivo() {
      setLoadingPeriodo(true);
      setErrorPeriodo(null);
      try {
        const resp = await periodoLetivoService.getActive();
        setPeriodoAtivo(resp.periodo);
      } catch (err: unknown) {
        setPeriodoAtivo(null);
        setErrorPeriodo(
          err instanceof Error ? err.message : "Falha ao carregar período letivo ativo",
        );
      } finally {
        setLoadingPeriodo(false);
      }
    }

    fetchPeriodoAtivo();
  }, []);

  useEffect(() => {
    async function fetchPeriodos() {
      if (user?.role !== "ADMIN") return;
      try {
        const resp = await periodoLetivoService.list();
        setPeriodos(resp.periodos || []);
        if (!periodoSelecionadoId && resp.periodos?.length) {
          const ativo = resp.periodos.find((p) => p.ativo);
          setPeriodoSelecionadoId(ativo?.id || resp.periodos[0].id);
        }
      } catch {
        setPeriodos([]);
      }
    }

    fetchPeriodos();
  }, [user?.role, periodoSelecionadoId]);

  const periodosParaConsulta = useMemo(() => {
    return periodos.slice().sort((a, b) => a.nome.localeCompare(b.nome));
  }, [periodos]);

  const periodoSelecionado = useMemo(() => {
    return periodos.find((p) => p.id === periodoSelecionadoId) || null;
  }, [periodos, periodoSelecionadoId]);

  const periodoConsulta = useMemo(() => {
    return periodos.find((p) => p.id === periodoConsultaId) || null;
  }, [periodos, periodoConsultaId]);

  async function handleAtivarPeriodo() {
    if (user?.role !== "ADMIN") return;
    if (!periodoSelecionadoId) return;
    setErrorPeriodo(null);
    try {
      const resp = await periodoLetivoService.activate(periodoSelecionadoId);
      setPeriodoAtivo(resp.periodo);
      const listResp = await periodoLetivoService.list();
      setPeriodos(listResp.periodos || []);
    } catch (err: unknown) {
      setErrorPeriodo(err instanceof Error ? err.message : "Falha ao ativar período letivo");
    }
  }

  async function handleAvancarPeriodo() {
    if (user?.role !== "ADMIN") return;
    if (!advanceForm.nome || !advanceForm.data_inicio || !advanceForm.data_fim) {
      setErrorPeriodo("Preencha nome, data início e data fim");
      return;
    }
    setErrorPeriodo(null);
    try {
      const resp = await periodoLetivoService.advance(advanceForm);
      setPeriodoAtivo(resp.periodo);
      const listResp = await periodoLetivoService.list();
      setPeriodos(listResp.periodos || []);
      setAdvanceForm({ nome: "", data_inicio: "", data_fim: "" });
    } catch (err: unknown) {
      setErrorPeriodo(err instanceof Error ? err.message : "Falha ao avançar período letivo");
    }
  }

  function handleSetModo(next: PeriodoModo) {
    setModo(next);
    setPeriodoModo(next);
    if (next === "operacional") {
      setPeriodoConsultaIdState("");
    }
  }

  function handleSetPeriodoConsultaId(nextId: string) {
    setPeriodoConsultaIdState(nextId);
    setPeriodoConsultaId(nextId);
    if (modo !== "consulta") {
      handleSetModo("consulta");
    }
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.back()}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Configurações</h1>
              <p className="text-muted-foreground">Ajustes operacionais do sistema</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" /> Período Letivo
              </CardTitle>
              <CardDescription>
                Contexto do sistema (operacional) e visualização (consulta).
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {loadingPeriodo && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="h-4 w-4 animate-spin" /> Carregando...
                </div>
              )}
              {!loadingPeriodo && errorPeriodo && (
                <p className="text-sm text-destructive">{errorPeriodo}</p>
              )}
              {!loadingPeriodo && !errorPeriodo && (
                <>
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-muted-foreground">Ativo</p>
                      <p className="text-base font-semibold text-foreground truncate">
                        {periodoAtivo?.nome || "Nenhum período ativo"}
                      </p>
                      {periodoAtivo && (
                        <p className="text-xs text-muted-foreground">
                          {periodoAtivo.data_inicio} → {periodoAtivo.data_fim}
                        </p>
                      )}
                    </div>
                    {periodoAtivo && (
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">{periodoAtivo.status}</Badge>
                        <Badge variant={periodoAtivo.ativo ? "secondary" : "outline"}>
                          {periodoAtivo.ativo ? "ATIVO" : "INATIVO"}
                        </Badge>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Modo</Label>
                      <Select value={modo} onValueChange={(v) => handleSetModo(v as PeriodoModo)}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Selecione o modo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="operacional">Operacional</SelectItem>
                          <SelectItem value="consulta">Consulta</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground">
                        Consulta afeta apenas telas de Grade (Turmas/Salas/Professor).
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label>Período (consulta)</Label>
                      <Select
                        value={periodoConsultaId}
                        onValueChange={handleSetPeriodoConsultaId}
                        disabled={user?.role !== "ADMIN"}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue
                            placeholder={
                              user?.role === "ADMIN"
                                ? "Selecione um período"
                                : "Disponível apenas para ADMIN"
                            }
                          />
                        </SelectTrigger>
                        <SelectContent>
                          {periodosParaConsulta.map((p) => (
                            <SelectItem key={p.id} value={p.id}>
                              {p.nome} ({p.status})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {modo === "consulta" && periodoConsulta && (
                        <p className="text-xs text-muted-foreground">
                          Consultando: {periodoConsulta.nome}
                        </p>
                      )}
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {user?.role === "ADMIN" && (
            <Card>
              <CardHeader>
                <CardTitle>Ações de Admin</CardTitle>
                <CardDescription>Ativar ou avançar período letivo.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Ativar período</Label>
                  <Select value={periodoSelecionadoId} onValueChange={setPeriodoSelecionadoId}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecione um período" />
                    </SelectTrigger>
                    <SelectContent>
                      {periodos.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.nome} ({p.status}) {p.ativo ? "- ativo" : ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {periodoSelecionado?.status === "ENCERRADO" && (
                    <p className="text-xs text-destructive">
                      Este período está encerrado e não pode ser ativado.
                    </p>
                  )}
                  <Button
                    onClick={handleAtivarPeriodo}
                    variant="outline"
                    className="w-full"
                    disabled={periodoSelecionado?.status === "ENCERRADO"}
                  >
                    <RefreshCcw className="h-4 w-4 mr-2" />
                    Ativar
                  </Button>
                </div>

                <div className="space-y-2">
                  <Label>Avançar período</Label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <Input
                      className="sm:col-span-3"
                      value={advanceForm.nome}
                      onChange={(e) => setAdvanceForm((s) => ({ ...s, nome: e.target.value }))}
                      placeholder="Nome (ex.: 2026.2)"
                    />
                    <Input
                      type="date"
                      value={advanceForm.data_inicio}
                      onChange={(e) =>
                        setAdvanceForm((s) => ({ ...s, data_inicio: e.target.value }))
                      }
                    />
                    <Input
                      type="date"
                      value={advanceForm.data_fim}
                      onChange={(e) =>
                        setAdvanceForm((s) => ({ ...s, data_fim: e.target.value }))
                      }
                    />
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button className="w-full">
                          <Timer className="h-4 w-4 mr-2" />
                          Avançar
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Confirmar avanço de período</AlertDialogTitle>
                          <AlertDialogDescription>
                            Ao avançar, o período ativo atual será encerrado e não deverá mais ser alterado.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction onClick={handleAvancarPeriodo}>
                            Confirmar
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
