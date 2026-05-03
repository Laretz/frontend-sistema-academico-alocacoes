import { DisciplinaSelector } from "@/components/professor-disciplina/DisciplinaSelector";
import { ProfessorSelector } from "@/components/professor-disciplina/ProfessorSelector";
import type { Disciplina, User } from "@/types/entities";

interface ProfessorViewProps {
  professores: User[];
  selectedProfessorId: string;
  onSelectedProfessorIdChange: (value: string) => void;
  disciplinas: Disciplina[];
  disciplinasGroupedBySemestre: Array<{
    semestre: string;
    disciplinas: Disciplina[];
  }>;
  filteredDisciplinasCount: number;
  selectedDisciplinasIds: string[];
  onToggleDisciplina: (disciplinaId: string, checked: boolean) => void;
  onToggleSelectAllDisciplinas: () => void;
}

export function ProfessorView({
  professores,
  selectedProfessorId,
  onSelectedProfessorIdChange,
  disciplinas,
  disciplinasGroupedBySemestre,
  filteredDisciplinasCount,
  selectedDisciplinasIds,
  onToggleDisciplina,
  onToggleSelectAllDisciplinas,
}: ProfessorViewProps) {
  return (
    <div className="space-y-6">
      <ProfessorSelector
        variant="single"
        professores={professores}
        value={selectedProfessorId}
        onChange={onSelectedProfessorIdChange}
      />

      <DisciplinaSelector
        variant="multiple"
        disciplinas={disciplinas}
        disciplinasGroupedBySemestre={disciplinasGroupedBySemestre}
        filteredCount={filteredDisciplinasCount}
        selectedIds={selectedDisciplinasIds}
        onToggle={onToggleDisciplina}
        onToggleAll={onToggleSelectAllDisciplinas}
      />
    </div>
  );
}
