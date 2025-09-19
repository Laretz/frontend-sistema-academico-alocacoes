import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2 } from "lucide-react";
import { DisciplinaComVinculo, ProfessorComVinculo } from "@/types/entities";

interface ProfessorDisciplinaCardProps {
  title: string;
  description: string;
  items: DisciplinaComVinculo[] | ProfessorComVinculo[];
  type: "disciplinas" | "professores";
  onRemove: (id1: string, id2: string) => void;
  selectedId: string;
  emptyMessage: string;
}

export function ProfessorDisciplinaCard({
  title,
  description,
  items,
  type,
  onRemove,
  selectedId,
  emptyMessage,
}: ProfessorDisciplinaCardProps) {
  const isDisciplinas = type === "disciplinas";

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">
            {emptyMessage}
          </p>
        ) : (
          <div className="space-y-3">
            {items.map((item) => {
              if (isDisciplinas) {
                const disciplina = item as DisciplinaComVinculo;
                return (
                  <div
                    key={disciplina.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex-1">
                      <h4 className="font-medium">{disciplina.nome}</h4>
                      <p className="text-sm text-muted-foreground">
                        {disciplina.curso.nome} - {disciplina.codigo} -{" "}
                        {disciplina.carga_horaria.toString()}
                      </p>
                      <div className="flex gap-2 mt-2">
                        <Badge
                          variant={
                            disciplina.obrigatoria ? "default" : "secondary"
                          }
                        >
                          {disciplina.obrigatoria ? "Obrigatória" : "Optativa"}
                        </Badge>
                        <Badge variant="outline">
                          {disciplina.tipo_de_sala}
                        </Badge>
                      </div>
                    </div>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => onRemove(selectedId, disciplina.id)}
                    >
                      <Trash2 className="w-4 h-4 text-white" />
                    </Button>
                  </div>
                );
              } else {
                const professor = item as ProfessorComVinculo;
                return (
                  <div
                    key={professor.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex-1">
                      <h4 className="font-medium">{professor.nome}</h4>
                      <p className="text-sm text-muted-foreground">
                        {professor.email}
                      </p>
                      {professor.especializacao && (
                        <Badge variant="outline" className="mt-2">
                          {professor.especializacao}
                        </Badge>
                      )}
                    </div>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => onRemove(professor.id, selectedId)}
                    >
                      <Trash2 className="w-4 h-4 text-white" />
                    </Button>
                  </div>
                );
              }
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}