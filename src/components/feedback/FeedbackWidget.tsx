"use client";

import { useState, useMemo } from "react";
import { usePathname } from "next/navigation";
import { toast } from "sonner";
import { feedbackService } from "@/services/feedback";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { MessageSquare } from "lucide-react";
import { Slider } from "@/components/ui/slider";

export function FeedbackWidget() {
  const pathnameRaw = usePathname();
  const pathname = pathnameRaw ?? "";
  const [open, setOpen] = useState(false);
  const [npsScore, setNpsScore] = useState<number>(7);
  const [comment, setComment] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const feature = useMemo(() => {
    const parts = (pathnameRaw ?? "").split("/").filter(Boolean);
    return parts[0] || "root";
  }, [pathnameRaw]);

  const handleSubmit = async () => {
    try {
      if (comment.trim().length < 3) {
        toast.error("Por favor, escreva um comentário (mín. 3 caracteres)");
        return;
      }
      setLoading(true);
      await feedbackService.submit({
        npsScore,
        comment: comment.trim(),
        page: pathnameRaw ?? undefined,
        feature,
      });
      toast.success("Obrigado pelo feedback!");
      setOpen(false);
      setComment("");
      setNpsScore(7);
    } catch (error) {
      toast.error("Não foi possível enviar seu feedback. Tente novamente.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default" size="sm" className="gap-2 fixed right-4 bottom-4 z-50 shadow-lg">
          <MessageSquare className="h-4 w-4" />
          Dar sugestão
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Deixe sua sugestão</DialogTitle>
          <DialogDescription>
            Avalie de 0 a 10 e conte o que podemos melhorar. Seu feedback ajuda a evoluir o sistema.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Sua nota (0 a 10)</label>
            <div className="flex items-center gap-3 mt-2">
              <Slider
                min={0}
                max={10}
                step={1}
                value={[npsScore]}
                onValueChange={(values) => setNpsScore(values[0])}
                className="w-full"
              />
              <div className="w-10 text-center text-sm font-semibold">
                {npsScore}
              </div>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Comentário</label>
            <Textarea
              placeholder="O que poderíamos melhorar?"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setOpen(false)} disabled={loading}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? "Enviando..." : "Enviar"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}