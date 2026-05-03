"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Plus } from "lucide-react";
import { DatePicker } from "@/components/ui/date-picker";
import type { Curso, Disciplina } from "@/types/entities";

type FormData = {
  nome: string;
  carga_horaria: 30 | 45 | 60 | 90;
  id_curso: string;
  tipo_de_sala: "Sala" | "Lab";
  periodo_letivo: string;
  codigo: string;
  semestre: number;
  obrigatoria: boolean;
  data_inicio: Date | undefined;
  data_fim_prevista: Date | undefined;
};

export function DisciplinaDialog({
  open,
  onOpenChange,
  cursos,
  editingDisciplina,
  formData,
  setFormData,
  submitting,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cursos: Curso[];
  editingDisciplina: Disciplina | null;
  formData: FormData;
  setFormData: (next: FormData) => void;
  submitting: boolean;
  onSubmit: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button onClick={() => onOpenChange(true)}>
          <Plus className="mr-2 h-4 w-4 text-primary-foreground" />
          Nova Disciplina
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {editingDisciplina ? "Editar Disciplina" : "Nova Disciplina"}
          </DialogTitle>
          <DialogDescription>
            {editingDisciplina
              ? "Edite os dados da disciplina."
              : "Preencha os dados para criar uma nova disciplina."}
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit();
          }}
        >
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="nome" className="text-right">
                Nome
              </Label>
              <Input
                id="nome"
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                className="col-span-3"
                placeholder="Nome da disciplina"
                required
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="id_curso" className="text-right">
                Curso
              </Label>
              <select
                id="id_curso"
                value={formData.id_curso}
                onChange={(e) => setFormData({ ...formData, id_curso: e.target.value })}
                className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                required
              >
                <option value="">Selecione um curso</option>
                {cursos.map((curso) => (
                  <option key={curso.id} value={curso.id}>
                    {curso.nome} - {curso.turno}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="codigo" className="text-right">
                Código
              </Label>
              <Input
                id="codigo"
                value={formData.codigo}
                onChange={(e) => setFormData({ ...formData, codigo: e.target.value })}
                className="col-span-3"
                placeholder="Código da disciplina"
                required
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="carga_horaria" className="text-right">
                Carga Horária
              </Label>
              <select
                id="carga_horaria"
                value={formData.carga_horaria}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    carga_horaria: Number(e.target.value) as 30 | 45 | 60 | 90,
                  })
                }
                className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                required
              >
                <option value={30}>30 horas (36 aulas)</option>
                <option value={45}>45 horas (54 aulas)</option>
                <option value={60}>60 horas (72 aulas)</option>
                <option value={90}>90 horas (108 aulas)</option>
              </select>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="semestre" className="text-right">
                Semestre
              </Label>
              <Input
                id="semestre"
                type="number"
                min="1"
                max="10"
                value={formData.semestre}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    semestre: parseInt(e.target.value) || 1,
                  })
                }
                className="col-span-3"
                placeholder="Semestre da disciplina"
                required
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="periodo_letivo" className="text-right">
                Período Letivo
              </Label>
              <Input
                id="periodo_letivo"
                value={formData.periodo_letivo}
                onChange={(e) =>
                  setFormData({ ...formData, periodo_letivo: e.target.value })
                }
                className="col-span-3"
                placeholder="Ex: 2024.1"
                required
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="obrigatoria" className="text-right">
                Tipo
              </Label>
              <select
                id="obrigatoria"
                value={formData.obrigatoria ? "true" : "false"}
                onChange={(e) =>
                  setFormData({ ...formData, obrigatoria: e.target.value === "true" })
                }
                className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                required
              >
                <option value="true">Obrigatória</option>
                <option value="false">Optativa</option>
              </select>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="tipo_de_sala" className="text-right">
                Tipo de Sala
              </Label>
              <select
                id="tipo_de_sala"
                value={formData.tipo_de_sala}
                onChange={(e) =>
                  setFormData({ ...formData, tipo_de_sala: e.target.value as "Lab" | "Sala" })
                }
                className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                required
              >
                <option value="Sala">Sala</option>
                <option value="Lab">Laboratório</option>
              </select>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="data_inicio" className="text-right">
                Data Início
              </Label>
              <div className="col-span-3">
                <DatePicker
                  date={formData.data_inicio}
                  onDateChange={(date) => setFormData({ ...formData, data_inicio: date })}
                  placeholder="Selecione a data de início"
                />
              </div>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="data_fim_prevista" className="text-right">
                Data Fim Prevista
              </Label>
              <div className="col-span-3">
                <DatePicker
                  date={formData.data_fim_prevista}
                  onDateChange={(date) =>
                    setFormData({ ...formData, data_fim_prevista: date })
                  }
                  placeholder="Selecione a data de fim prevista"
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editingDisciplina ? "Atualizar Disciplina" : "Criar Disciplina"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

