import { DisciplinaSelector } from "@/components/professor-disciplina/DisciplinaSelector";
import { ProfessorSelector } from "@/components/professor-disciplina/ProfessorSelector";
import type { Disciplina, User } from "@/types/entities";

interface DisciplinaViewProps {
  filteredDisciplinas: Disciplina[];
  selectedDisciplinaId: string;
  onSelectedDisciplinaIdChange: (value: string) => void;
  professores: User[];
  selectedProfessoresIds: string[];
  onToggleProfessor: (professorId: string, checked: boolean) => void;
}

export function DisciplinaView({
  filteredDisciplinas,
  selectedDisciplinaId,
  onSelectedDisciplinaIdChange,
  professores,
  selectedProfessoresIds,
  onToggleProfessor,
}: DisciplinaViewProps) {
  return (
    <div className="space-y-6">
      <DisciplinaSelector
        variant="single"
        disciplinas={filteredDisciplinas}
        value={selectedDisciplinaId}
        onChange={onSelectedDisciplinaIdChange}
      />

      {selectedDisciplinaId && (
        <ProfessorSelector
          variant="multiple"
          professores={professores}
          selectedIds={selectedProfessoresIds}
          onToggle={onToggleProfessor}
        />
      )}
    </div>
  );
}
