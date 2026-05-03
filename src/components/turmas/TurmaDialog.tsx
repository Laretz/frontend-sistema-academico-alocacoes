"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { CreateTurmaRequest, Curso, Turma } from "@/types/entities";

export function TurmaDialog({
  open,
  onOpenChange,
  editingTurma,
  cursos,
  formData,
  setFormData,
  onSubmit,
  onCancel,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingTurma: Turma | null;
  cursos: Curso[];
  formData: CreateTurmaRequest;
  setFormData: (next: CreateTurmaRequest) => void;
  onSubmit: () => void;
  onCancel: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{editingTurma ? "Editar Turma" : "Nova Turma"}</DialogTitle>
          <DialogDescription>
            {editingTurma
              ? "Edite as informações da turma abaixo."
              : "Preencha as informações para criar uma nova turma."}
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit();
          }}
          className="space-y-4"
        >
          <div className="space-y-2">
            <Label htmlFor="nome">Nome da Turma</Label>
            <Input
              id="nome"
              value={formData.nome}
              onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
              placeholder="Ex: Turma A"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="num_alunos">Número de Alunos</Label>
            <Input
              id="num_alunos"
              type="number"
              value={formData.num_alunos}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  num_alunos: parseInt(e.target.value) || 0,
                })
              }
              placeholder="Ex: 30"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="semestre">Semestre</Label>
            <Input
              id="semestre"
              type="number"
              value={formData.semestre}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  semestre: parseInt(e.target.value) || 1,
                })
              }
              placeholder="Ex: 1"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="turno">Turno</Label>
            <Select
              value={formData.turno}
              onValueChange={(value) => setFormData({ ...formData, turno: value })}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o turno" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="MATUTINO">Matutino</SelectItem>
                <SelectItem value="VESPERTINO">Vespertino</SelectItem>
                <SelectItem value="NOTURNO">Noturno</SelectItem>
                <SelectItem value="INTEGRAL">Integral</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="id_curso">Curso</Label>
            <Select
              value={formData.id_curso}
              onValueChange={(value) => setFormData({ ...formData, id_curso: value })}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione um curso" />
              </SelectTrigger>
              <SelectContent>
                {cursos.map((curso) => (
                  <SelectItem key={curso.id} value={curso.id}>
                    {curso.nome} - {curso.turno}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
            <Button type="submit">{editingTurma ? "Atualizar" : "Criar"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

