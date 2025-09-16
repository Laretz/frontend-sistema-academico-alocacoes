"use client";

import { MainLayout } from "@/components/layout/main-layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  MapPin,
  Users,
  Calendar,
} from "lucide-react";
import { useState, useEffect } from "react";
import { salaService, predioService } from "@/services/entities";
import { Sala, Predio } from "@/types/entities";
import { toast } from "sonner";
import { GradeHorariosSala } from "@/components/GradeHorariosSala";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const tipoSalaLabels = {
  AULA: "Sala de Aula",
  LAB: "Laboratório",
  AUDITORIO: "Auditório",
};

interface SalaFormData {
  nome: string;
  predioId: string;
  capacidade: number;
  tipo: string;
  computadores?: number;
}

export default function SalasPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPredio, setSelectedPredio] = useState<string>("todos");
  const [salas, setSalas] = useState<Sala[]>([]);
  const [predios, setPredios] = useState<Predio[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSala, setEditingSala] = useState<Sala | null>(null);
  const [formData, setFormData] = useState<SalaFormData>({
    nome: "",
    predioId: "",
    capacidade: 0,
    tipo: "AULA",
    computadores: 0,
  });

  const fetchSalas = async () => {
    try {
      setLoading(true);
      const response = await salaService.getAll();
      setSalas(response.salas);
    } catch (error) {
      console.error("Erro ao buscar salas:", error);
      toast.error("Erro ao carregar salas");
    } finally {
      setLoading(false);
    }
  };

  const fetchPredios = async () => {
    try {
      const response = await predioService.getAll(1);
      setPredios(response.predios);
    } catch (error) {
      console.error("Erro ao buscar prédios:", error);
      toast.error("Erro ao carregar prédios");
    }
  };

  const handleCreate = () => {
    setEditingSala(null);
    setFormData({
      nome: "",
      predioId: "",
      capacidade: 0,
      tipo: "AULA",
      computadores: 0,
    });
    setDialogOpen(true);
  };

  const handleEdit = (sala: Sala) => {
    setEditingSala(sala);
    setFormData({
      nome: sala.nome,
      predioId: sala.predioId || "",
      capacidade: sala.capacidade,
      tipo: sala.tipo,
      computadores: sala.computadores || 0,
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string, nome: string) => {
    if (confirm(`Tem certeza que deseja excluir a sala "${nome}"?`)) {
      try {
        await salaService.delete(id);
        await fetchSalas();
      } catch (error) {
        console.error("Erro ao excluir sala:", error);
        alert(
          "Erro ao excluir sala. Verifique se não há alocações vinculadas."
        );
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.nome || !formData.predioId || formData.capacidade <= 0) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    try {
      if (editingSala) {
        await salaService.update(editingSala.id, formData);
        toast.success("Sala atualizada com sucesso!");
      } else {
        await salaService.create(formData);
        toast.success("Sala criada com sucesso!");
      }
      setDialogOpen(false);
      await fetchSalas();
    } catch (error) {
      console.error("Erro ao salvar sala:", error);
      toast.error("Erro ao salvar sala");
    }
  };

  useEffect(() => {
    fetchSalas();
    fetchPredios();
  }, []);

  const filteredSalas = salas.filter((sala) => {
    const matchesSearch =
      sala.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sala.predio.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPredio =
      selectedPredio === "todos" ||
      selectedPredio === "" ||
      sala.predio === selectedPredio;
    return matchesSearch && matchesPredio;
  });

  if (loading) {
    return (
      <MainLayout>
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Salas</h1>
              <p className="text-muted-foreground">
                Gerencie as salas e laboratórios da instituição
              </p>
            </div>
          </div>
          <div className="text-center py-8">
            <p>Carregando salas...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Salas</h1>
            <p className="text-muted-foreground">
              Gerencie as salas e laboratórios da instituição
            </p>
          </div>
          <Button onClick={handleCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Nova Sala
          </Button>
        </div>

        <div className="flex items-center space-x-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar salas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
          <div className="w-48">
            <Select value={selectedPredio} onValueChange={setSelectedPredio}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por prédio" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os prédios</SelectItem>
                {predios.map((predio) => (
                  <SelectItem key={predio.id} value={predio.nome}>
                    {predio.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {filteredSalas.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">
              {salas.length === 0
                ? "Nenhuma sala encontrada."
                : "Nenhuma sala corresponde à sua busca."}
            </p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredSalas.map((sala) => (
              <Card key={sala.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{sala.nome}</CardTitle>
                      <CardDescription className="mt-1">
                        {tipoSalaLabels[
                          sala.tipo as keyof typeof tipoSalaLabels
                        ] || sala.tipo}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Prédio:</span>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        <span>{sala.predio}</span>
                      </div>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Capacidade:</span>
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        <span>{sala.capacidade} pessoas</span>
                      </div>
                    </div>
                    {sala.computadores && sala.computadores > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                          Computadores:
                        </span>
                        <span>{sala.computadores}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex justify-end space-x-2 mt-4">
                    <GradeHorariosSala
                      sala={sala}
                      trigger={
                        <Button variant="outline" size="sm">
                          <Calendar className="h-4 w-4" />
                        </Button>
                      }
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(sala)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(sala.id, sala.nome)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Dialog para criar/editar sala */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {editingSala ? "Editar Sala" : "Nova Sala"}
            </DialogTitle>
            <DialogDescription>
              {editingSala
                ? "Edite as informações da sala."
                : "Preencha as informações para criar uma nova sala."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="nome" className="text-right">
                  Nome
                </Label>
                <Input
                  id="nome"
                  value={formData.nome}
                  onChange={(e) =>
                    setFormData({ ...formData, nome: e.target.value })
                  }
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
                  onValueChange={(value) =>
                    setFormData({ ...formData, predioId: value })
                  }
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
                  onValueChange={(value) =>
                    setFormData({ ...formData, tipo: value })
                  }
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
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
              >
                Cancelar
              </Button>
              <Button type="submit">{editingSala ? "Salvar" : "Criar"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
}
