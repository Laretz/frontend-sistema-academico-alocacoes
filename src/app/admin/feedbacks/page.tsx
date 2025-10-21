"use client";

import { useEffect, useState } from "react";
import { feedbackService } from "@/services/feedback";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { MainLayout } from "@/components/layout/main-layout";

export default function AdminFeedbacksPage() {
  const [items, setItems] = useState<Awaited<ReturnType<typeof feedbackService.list>>["feedbacks"]>([]);
  const [loading, setLoading] = useState(false);
  const [pageFilter, setPageFilter] = useState("");
  const [featureFilter, setFeatureFilter] = useState("");

  async function load() {
    try {
      setLoading(true);
      const data = await feedbackService.list({
        page: pageFilter || undefined,
        feature: featureFilter || undefined,
        limit: 200,
      });
      setItems(data.feedbacks);
    } catch (e) {
      toast.error("Falha ao carregar feedbacks");
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <MainLayout>
      <div className="p-6 space-y-4">
        <div className="flex items-end gap-2">
          <div className="flex-1">
            <label className="text-sm font-medium">Filtro por página</label>
            <Input value={pageFilter} onChange={(e) => setPageFilter(e.target.value)} placeholder="/salas, /usuarios, etc" />
          </div>
          <div className="flex-1">
            <label className="text-sm font-medium">Filtro por feature</label>
            <Input value={featureFilter} onChange={(e) => setFeatureFilter(e.target.value)} placeholder="root, salas, usuarios..." />
          </div>
          <Button onClick={load} disabled={loading}>
            {loading ? "Carregando..." : "Filtrar"}
          </Button>
        </div>

        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Usuário</TableHead>
                <TableHead>Nota</TableHead>
                <TableHead>Comentário</TableHead>
                <TableHead>Página</TableHead>
                <TableHead>Feature</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((f) => (
                <TableRow key={f.id}>
                  <TableCell>{new Date(f.created_at).toLocaleString()}</TableCell>
                  <TableCell>
                    {f.user ? (
                      <div className="flex flex-col">
                        <span className="font-medium">{f.user.nome}</span>
                        <span className="text-muted-foreground text-xs">{f.user.email}</span>
                      </div>
                    ) : (
                      "—"
                    )}
                  </TableCell>
                  <TableCell>{f.npsScore}</TableCell>
                  <TableCell className="max-w-[400px] truncate" title={f.comment}>{f.comment}</TableCell>
                  <TableCell className="max-w-[200px] truncate" title={f.page ?? undefined}>{f.page ?? "—"}</TableCell>
                  <TableCell className="max-w-[120px] truncate" title={f.feature ?? undefined}>{f.feature ?? "—"}</TableCell>
                </TableRow>
              ))}
              {items.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground">
                    Nenhum feedback encontrado.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </MainLayout>
  );
}