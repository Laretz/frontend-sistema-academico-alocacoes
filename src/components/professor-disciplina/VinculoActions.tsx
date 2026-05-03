import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

type ViewMode = "professor" | "disciplina";

interface VinculoActionsProps {
  viewMode: ViewMode;
  selectedProfessorId: string;
  selectedDisciplinaId: string;
  selectedDisciplinasCount: number;
  selectedProfessoresCount: number;
  loading: boolean;
  onClearSelection: () => void;
  onVincular: () => void;
}

export function VinculoActions({
  viewMode,
  selectedProfessorId,
  selectedDisciplinaId,
  selectedDisciplinasCount,
  selectedProfessoresCount,
  loading,
  onClearSelection,
  onVincular,
}: VinculoActionsProps) {
  const statusMessage =
    viewMode === "professor"
      ? !selectedProfessorId
        ? "Selecione um professor primeiro"
        : selectedDisciplinasCount === 0
          ? "Selecione pelo menos uma disciplina"
          : `Pronto para vincular ${selectedDisciplinasCount} disciplina${selectedDisciplinasCount !== 1 ? "s" : ""}`
      : !selectedDisciplinaId
        ? "Selecione uma disciplina primeiro"
        : selectedProfessoresCount === 0
          ? "Selecione pelo menos um professor"
          : `Pronto para vincular ${selectedProfessoresCount} professor${selectedProfessoresCount !== 1 ? "es" : ""}`;

  const vincularDisabled =
    loading ||
    (viewMode === "professor"
      ? !selectedProfessorId || selectedDisciplinasCount === 0
      : !selectedDisciplinaId || selectedProfessoresCount === 0);

  return (
    <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
      <div className="flex-1">
        <p className="text-sm text-muted-foreground mb-2">{statusMessage}</p>
      </div>
      <div className="flex gap-2">
        <Button
          variant="outline"
          onClick={onClearSelection}
          disabled={loading}
        >
          Limpar Seleção
        </Button>
        <Button
          onClick={onVincular}
          disabled={vincularDisabled}
          className="min-w-[140px]"
        >
          <Plus className="w-4 h-4 mr-2" />
          {loading ? "Vinculando..." : "Vincular"}
        </Button>
      </div>
    </div>
  );
}
