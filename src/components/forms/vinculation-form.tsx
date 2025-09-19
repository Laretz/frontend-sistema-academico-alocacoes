import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus } from "lucide-react";
import { User, Disciplina } from "@/types/entities";

interface VinculationFormProps {
  title: string;
  description: string;
  professores: User[];
  disciplinas?: Disciplina[];
  selectedProfessor: string;
  onProfessorChange: (value: string) => void;
  selectedDisciplina?: string;
  onDisciplinaChange?: (value: string) => void;
  onSubmit: () => void;
  loading: boolean;
  submitText: string;
  type: "individual" | "multiple";
}

export function VinculationForm({
  title,
  description,
  professores,
  disciplinas,
  selectedProfessor,
  onProfessorChange,
  selectedDisciplina,
  onDisciplinaChange,
  onSubmit,
  loading,
  submitText,
  type,
}: VinculationFormProps) {
  const isIndividual = type === "individual";
  const isFormValid = isIndividual
    ? selectedProfessor && selectedDisciplina
    : selectedProfessor;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className={`grid grid-cols-1 ${isIndividual ? 'md:grid-cols-3' : 'md:grid-cols-2'} gap-4 items-end`}>
            <div>
              <label className="text-sm font-medium mb-2 block">
                Professor
              </label>
              <Select
                value={selectedProfessor}
                onValueChange={onProfessorChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um professor" />
                </SelectTrigger>
                <SelectContent>
                  {professores.map((professor) => (
                    <SelectItem key={professor.id} value={professor.id}>
                      {professor.nome} -{" "}
                      {professor.especializacao || "Sem especialização"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {isIndividual && disciplinas && onDisciplinaChange && (
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Disciplina
                </label>
                <Select
                  value={selectedDisciplina}
                  onValueChange={onDisciplinaChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma disciplina" />
                  </SelectTrigger>
                  <SelectContent>
                    {disciplinas.map((disciplina) => (
                      <SelectItem key={disciplina.id} value={disciplina.id}>
                        {disciplina.nome} ({disciplina.codigo})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div>
              <Button
                onClick={onSubmit}
                disabled={loading || !isFormValid}
                className="w-full"
              >
                <Plus className="w-4 h-4 mr-2" />
                {submitText}
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}