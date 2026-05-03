import { ProfessorDisciplinaCard } from "@/components/forms/professor-disciplina-card";
import type {
  Disciplina,
  DisciplinaComVinculo,
  ProfessorComVinculo,
  User,
} from "@/types/entities";

type ViewMode = "professor" | "disciplina";

interface VinculosListProps {
  viewMode: ViewMode;
  selectedProfessorId: string;
  selectedDisciplinaId: string;
  professores: User[];
  disciplinas: Disciplina[];
  disciplinasProfessor: DisciplinaComVinculo[];
  professoresDisciplina: ProfessorComVinculo[];
  onRemove: (id1: string, id2: string) => void;
}

export function VinculosList({
  viewMode,
  selectedProfessorId,
  selectedDisciplinaId,
  professores,
  disciplinas,
  disciplinasProfessor,
  professoresDisciplina,
  onRemove,
}: VinculosListProps) {
  if (viewMode === "professor" && selectedProfessorId) {
    const professorNome =
      professores.find((p) => p.id === selectedProfessorId)?.nome || "";

    return (
      <ProfessorDisciplinaCard
        title="Disciplinas do Professor"
        description={professorNome}
        items={disciplinasProfessor}
        type="disciplinas"
        onRemove={onRemove}
        selectedId={selectedProfessorId}
        emptyMessage="Este professor não está vinculado a nenhuma disciplina"
      />
    );
  }

  if (viewMode === "disciplina" && selectedDisciplinaId) {
    const disciplinaNome =
      disciplinas.find((d) => d.id === selectedDisciplinaId)?.nome || "";

    return (
      <ProfessorDisciplinaCard
        title="Professores da Disciplina"
        description={disciplinaNome}
        items={professoresDisciplina}
        type="professores"
        onRemove={onRemove}
        selectedId={selectedDisciplinaId}
        emptyMessage="Esta disciplina não possui professores vinculados"
      />
    );
  }

  return null;
}
