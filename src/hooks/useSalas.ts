import { useEffect, useMemo, useState } from "react";
import { predioService, salaService } from "@/services/entities";
import type { Predio, Sala } from "@/types/entities";
import { toast } from "sonner";

type SalaFormData = {
  nome: string;
  predioId: string;
  capacidade: number;
  tipo: string;
  computadores?: number;
};

const emptyFormData: SalaFormData = {
  nome: "",
  predioId: "",
  capacidade: 0,
  tipo: "AULA",
  computadores: 0,
};

export function useSalas() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPredio, setSelectedPredio] = useState<string>("todos");
  const [salas, setSalas] = useState<Sala[]>([]);
  const [predios, setPredios] = useState<Predio[]>([]);
  const [loading, setLoading] = useState(true);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSala, setEditingSala] = useState<Sala | null>(null);
  const [formData, setFormData] = useState<SalaFormData>(emptyFormData);

  const fetchSalas = async () => {
    try {
      setLoading(true);
      const response = await salaService.getAll();
      setSalas(response.salas);
    } catch {
      toast.error("Erro ao carregar salas");
    } finally {
      setLoading(false);
    }
  };

  const fetchPredios = async () => {
    try {
      const response = await predioService.getAll();
      setPredios(response.predios);
    } catch {
      toast.error("Erro ao carregar prédios");
    }
  };

  useEffect(() => {
    fetchSalas();
    fetchPredios();
  }, []);

  const filteredSalas = useMemo(() => {
    return salas.filter((sala) => {
      const matchesSearch =
        sala.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sala.predio.nome.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesPredio =
        selectedPredio === "todos" ||
        selectedPredio === "" ||
        sala.predio.nome === selectedPredio;
      return matchesSearch && matchesPredio;
    });
  }, [salas, searchTerm, selectedPredio]);

  const abrirNova = () => {
    setEditingSala(null);
    setFormData(emptyFormData);
    setDialogOpen(true);
  };

  const editar = (sala: Sala) => {
    setEditingSala(sala);
    setFormData({
      nome: sala.nome,
      predioId: sala.predio.id,
      capacidade: sala.capacidade,
      tipo: sala.tipo,
      computadores: sala.computadores || 0,
    });
    setDialogOpen(true);
  };

  const fecharDialog = () => {
    setDialogOpen(false);
    setEditingSala(null);
    setFormData(emptyFormData);
  };

  const salvar = async () => {
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
      fecharDialog();
      await fetchSalas();
    } catch {
      toast.error("Erro ao salvar sala");
    }
  };

  const excluir = async (id: string) => {
    try {
      await salaService.delete(id);
      await fetchSalas();
    } catch {
      toast.error("Erro ao excluir sala. Verifique se não há alocações vinculadas.");
    }
  };

  return {
    searchTerm,
    setSearchTerm,
    selectedPredio,
    setSelectedPredio,
    salas,
    predios,
    loading,
    filteredSalas,

    dialogOpen,
    setDialogOpen,
    editingSala,
    formData,
    setFormData,
    abrirNova,
    editar,
    fecharDialog,
    salvar,
    excluir,
    recarregar: fetchSalas,
  };
}

