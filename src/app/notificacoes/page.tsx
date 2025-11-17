"use client";

import { useEffect, useMemo, useState } from "react";
import { notificacoesService } from "@/services/notificacoes";
import {
  Notificacao,
  NotificacaoStatus,
  NotificacaoType,
} from "@/types/notificacao";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Loader2, Bell, Plus } from "lucide-react";
import { MainLayout } from "@/components/layout/main-layout";
import { userService } from "@/services/users";
import type { User } from "@/types/auth";

export default function NotificacoesPage() {
  const [loading, setLoading] = useState(false);
  const [statusFiltro, setStatusFiltro] = useState<
    NotificacaoStatus | undefined
  >(undefined);
  const [lista, setLista] = useState<Notificacao[]>([]);
  const [respondendo, setRespondendo] = useState<Notificacao | null>(null);
  const [resposta, setResposta] = useState("");
  const [respondendoLoading, setRespondendoLoading] = useState(false);
  // Criar nova mensagem
  const [criandoOpen, setCriandoOpen] = useState(false);
  const [criandoLoading, setCriandoLoading] = useState(false);
  const [usuarios, setUsuarios] = useState<User[]>([]);
  const [novoTipo, setNovoTipo] = useState<NotificacaoType>("GENERICA");
  const [novoUserId, setNovoUserId] = useState<string>("");
  const [novoTitulo, setNovoTitulo] = useState<string>("");
  const [novaMensagem, setNovaMensagem] = useState<string>("");

  const load = async () => {
    setLoading(true);
    try {
      const { notificacoes } = await notificacoesService.listar(statusFiltro);
      setLista(notificacoes);
    } catch (e: any) {
      const msg =
        e?.response?.data?.message || "Falha ao carregar notificações";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFiltro]);

  const abrirCriar = async () => {
    setCriandoOpen(true);
    if (usuarios.length === 0) {
      try {
        const { usuarios: listaUsuarios } = await userService.getAll(1);
        setUsuarios(listaUsuarios);
      } catch (e: any) {
        toast.error(e?.response?.data?.message || "Falha ao carregar usuários");
      }
    }
  };

  const onCriarMensagem = async () => {
    if (!novoUserId || !novoTitulo.trim() || !novaMensagem.trim()) {
      toast.error("Preencha destinatário, título e mensagem");
      return;
    }
    setCriandoLoading(true);
    try {
      const { notificacao } = await notificacoesService.criar({
        userId: novoUserId,
        type: novoTipo,
        title: novoTitulo.trim(),
        message: novaMensagem.trim(),
      });
      toast.success("Mensagem enviada");
      // Atualiza a lista colocando a nova notificação no topo
      setLista((prev) => [notificacao, ...prev]);
      // Reset campos
      setNovoUserId("");
      setNovoTitulo("");
      setNovaMensagem("");
      setNovoTipo("GENERICA");
      setCriandoOpen(false);
    } catch (e: any) {
      const msg = e?.response?.data?.message || "Falha ao enviar mensagem";
      toast.error(msg);
    } finally {
      setCriandoLoading(false);
    }
  };

  const statusBadge = (s: NotificacaoStatus) => {
    switch (s) {
      case "PENDENTE":
        return (
          <Badge
            variant="outline"
            className="border-yellow-500 text-yellow-700"
          >
            Pendente
          </Badge>
        );
      case "LIDA":
        return <Badge variant="secondary">Lida</Badge>;
      case "RESPONDIDA":
        return <Badge variant="default">Respondida</Badge>;
      default:
        return <Badge>{s}</Badge>;
    }
  };

  const podeResponder = (n: Notificacao) => n.status !== "RESPONDIDA";
  const podeMarcarLida = (n: Notificacao) => n.status === "PENDENTE";

  const onMarcarLida = async (n: Notificacao) => {
    try {
      const { notificacao } = await notificacoesService.marcarLida(n.id);
      toast.success("Notificação marcada como lida");
      setLista((prev) =>
        prev.map((item) =>
          item.id === n.id ? { ...(notificacao ?? item) } : item
        )
      );
    } catch (e: any) {
      const msg = e?.response?.data?.message || "Falha ao marcar como lida";
      toast.error(msg);
    }
  };

  const onResponder = async () => {
    if (!respondendo) return;
    setRespondendoLoading(true);
    try {
      const { notificacao } = await notificacoesService.responder(
        respondendo.id,
        { replyMessage: resposta }
      );
      toast.success("Resposta enviada com sucesso");
      setLista((prev) =>
        prev.map((item) => (item.id === respondendo.id ? notificacao : item))
      );
      setRespondendo(null);
      setResposta("");
    } catch (e: any) {
      const msg =
        e?.response?.data?.message || "Falha ao responder notificação";
      toast.error(msg);
    } finally {
      setRespondendoLoading(false);
    }
  };

  const emptyState = useMemo(
    () => (
      <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground">
        <Bell className="h-10 w-10 mb-2" />
        <p>Nenhuma notificação encontrada.</p>
      </div>
    ),
    []
  );

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Notificações</h1>
            <p className="text-muted-foreground">
              Acompanhe, marque como lidas e responda suas notificações
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Select
              onValueChange={(v) => setStatusFiltro(v as NotificacaoStatus)}
              value={statusFiltro}
            >
              <SelectTrigger className="w-[220px]">
                <SelectValue placeholder="Filtrar por status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PENDENTE">Pendente</SelectItem>
                <SelectItem value="LIDA">Lida</SelectItem>
                <SelectItem value="RESPONDIDA">Respondida</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              onClick={() => setStatusFiltro(undefined)}
            >
              Limpar filtro
            </Button>
            <Button variant="outline" onClick={load} disabled={loading}>
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Atualizar
            </Button>
            <Button onClick={abrirCriar}>
              <Plus className="mr-2 h-4 w-4" /> Nova mensagem
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Carregando...
          </div>
        ) : lista.length === 0 ? (
          emptyState
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {lista.map((n) => (
              <Card key={n.id}>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-base">{n.title}</CardTitle>
                  <div className="flex items-center gap-2">
                    {statusBadge(n.status)}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {n.message}
                  </p>
                  {n.replyMessage ? (
                    <div className="rounded border p-3">
                      <p className="text-xs font-semibold">Resposta</p>
                      <p className="text-sm whitespace-pre-wrap">
                        {n.replyMessage}
                      </p>
                    </div>
                  ) : null}
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => onMarcarLida(n)}
                      disabled={!podeMarcarLida(n)}
                    >
                      Marcar como lida
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => setRespondendo(n)}
                      disabled={!podeResponder(n)}
                    >
                      Responder
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <Dialog
          open={!!respondendo}
          onOpenChange={(o) => !o && setRespondendo(null)}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Responder notificação</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                {respondendo?.title}
              </p>
              <Textarea
                value={resposta}
                onChange={(e) => setResposta(e.target.value)}
                placeholder="Escreva sua resposta"
                rows={4}
              />
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setRespondendo(null)}
                disabled={respondendoLoading}
              >
                Cancelar
              </Button>
              <Button
                onClick={onResponder}
                disabled={respondendoLoading || !resposta.trim()}
              >
                {respondendoLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                Enviar resposta
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Dialog: Nova mensagem */}
        <Dialog open={criandoOpen} onOpenChange={setCriandoOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nova mensagem</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <Select
                value={novoTipo}
                onValueChange={(v) => setNovoTipo(v as NotificacaoType)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Tipo da notificação" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="GENERICA">Genérica</SelectItem>
                  <SelectItem value="SOLICITACAO_TROCA_SALA">
                    Solicitação de troca de sala
                  </SelectItem>
                </SelectContent>
              </Select>
              <Select value={novoUserId} onValueChange={setNovoUserId}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecionar destinatário" />
                </SelectTrigger>
                <SelectContent>
                  {usuarios.map((u) => (
                    <SelectItem key={u.id} value={u.id}>
                      {u.nome} ({u.role})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                value={novoTitulo}
                onChange={(e) => setNovoTitulo(e.target.value)}
                placeholder="Título"
              />
              <Textarea
                value={novaMensagem}
                onChange={(e) => setNovaMensagem(e.target.value)}
                placeholder="Mensagem"
                rows={4}
              />
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setCriandoOpen(false)}
                disabled={criandoLoading}
              >
                Cancelar
              </Button>
              <Button
                onClick={onCriarMensagem}
                disabled={
                  criandoLoading ||
                  !novoUserId ||
                  !novoTitulo.trim() ||
                  !novaMensagem.trim()
                }
              >
                {criandoLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                Enviar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
}
