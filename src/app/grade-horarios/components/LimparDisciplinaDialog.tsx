import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Trash2, BookOpen } from "lucide-react";
import { toast } from "sonner";
import { alocacaoService } from "@/services/entities";

interface LimparDisciplinaDialogProps {
  turmaId: string;
  disciplinas: { id: string; nome: string }[];
  onSuccess: () => void;
}

export function LimparDisciplinaDialog({
  turmaId,
  disciplinas,
  onSuccess,
}: LimparDisciplinaDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState<string | null>(null);

  const handleDelete = async (disciplinaId: string) => {
    try {
      setLoading(disciplinaId);
      await alocacaoService.deleteAllByTurmaAndDisciplina(
        turmaId,
        disciplinaId,
      );
      toast.success("Alocações da disciplina excluídas com sucesso!");
      onSuccess();
      // Se não houver mais disciplinas, fecha o modal
      if (disciplinas.length <= 1) {
        setOpen(false);
      }
    } catch (error) {
      console.error(error);
      toast.error("Erro ao excluir alocações da disciplina.");
    } finally {
      setLoading(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="border-destructive text-destructive hover:bg-destructive/10"
        >
          <BookOpen className="mr-2 h-4 w-4" />
          Limpar Disciplina
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Limpar por Disciplina</DialogTitle>
          <DialogDescription>
            Selecione a disciplina para remover todas as suas alocações desta
            turma.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-2 max-h-[60vh] overflow-y-auto pr-2">
          {disciplinas.length === 0 ? (
            <p className="text-center text-muted-foreground text-sm">
              Nenhuma disciplina alocada nesta grade.
            </p>
          ) : (
            disciplinas.map((disciplina) => (
              <div
                key={disciplina.id}
                className="flex items-center justify-between p-3 border rounded-md bg-card hover:bg-accent/50 transition-colors"
              >
                <span className="text-sm font-medium">{disciplina.nome}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={() => handleDelete(disciplina.id)}
                  disabled={loading === disciplina.id}
                >
                  {loading === disciplina.id ? (
                    <span className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </Button>
              </div>
            ))
          )}
        </div>
        <DialogFooter>
          <Button variant="secondary" onClick={() => setOpen(false)}>
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
