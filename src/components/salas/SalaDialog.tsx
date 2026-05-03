"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
import type { Predio, Sala } from "@/types/entities";

type SalaFormData = {
  nome: string;
  predioId: string;
  capacidade: number;
  tipo: string;
  computadores?: number;
};

export function SalaDialog({
  open,
  onOpenChange,
  editingSala,
  predios,
  formData,
  setFormData,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingSala: Sala | null;
  predios: Predio[];
  formData: SalaFormData;
  setFormData: (next: SalaFormData) => void;
  onSubmit: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{editingSala ? "Editar Sala" : "Nova Sala"}</DialogTitle>
          <DialogDescription>
            {editingSala
              ? "Edite as informações da sala."
              : "Preencha as informações para criar uma nova sala."}
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
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="predioId" className="text-right">
                Prédio
              </Label>
              <Select
                value={formData.predioId}
                onValueChange={(value) => setFormData({ ...formData, predioId: value })}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Selecione um prédio" />
                </SelectTrigger>
                <SelectContent>
                  {predios.map((predio) => (
                    <SelectItem key={predio.id} value={predio.id}>
                      {predio.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="capacidade" className="text-right">
                Capacidade
              </Label>
              <Input
                id="capacidade"
                type="number"
                value={formData.capacidade}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    capacidade: parseInt(e.target.value) || 0,
                  })
                }
                className="col-span-3"
                required
                min="1"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="tipo" className="text-right">
                Tipo
              </Label>
              <Select
                value={formData.tipo}
                onValueChange={(value) => setFormData({ ...formData, tipo: value })}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="AULA">Sala de Aula</SelectItem>
                  <SelectItem value="LAB">Laboratório</SelectItem>
                  <SelectItem value="AUDITORIO">Auditório</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="computadores" className="text-right">
                Computadores
              </Label>
              <Input
                id="computadores"
                type="number"
                value={formData.computadores}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    computadores: parseInt(e.target.value) || 0,
                  })
                }
                className="col-span-3"
                min="0"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">{editingSala ? "Salvar" : "Criar"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

