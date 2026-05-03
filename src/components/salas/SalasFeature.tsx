"use client";

import { MainLayout } from "@/components/layout/main-layout";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useSalas } from "@/hooks/useSalas";
import { SalasFilters } from "@/components/salas/SalasFilters";
import { SalasGrid } from "@/components/salas/SalasGrid";
import { SalaDialog } from "@/components/salas/SalaDialog";
import { useAuthStore } from "@/store/auth";

export function SalasFeature() {
  const state = useSalas();
  const { user } = useAuthStore();
  const canReserve = user?.role === "ADMIN" || user?.role === "COORDENADOR";

  if (state.loading) {
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
          <Button onClick={state.abrirNova}>
            <Plus className="mr-2 h-4 w-4" />
            Nova Sala
          </Button>
        </div>

        <SalasFilters
          searchTerm={state.searchTerm}
          onSearchTermChange={state.setSearchTerm}
          selectedPredio={state.selectedPredio}
          onSelectedPredioChange={state.setSelectedPredio}
          predios={state.predios}
        />

        {state.filteredSalas.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">
              {state.salas.length === 0
                ? "Nenhuma sala encontrada."
                : "Nenhuma sala corresponde à sua busca."}
            </p>
          </div>
        ) : (
          <SalasGrid
            salas={state.filteredSalas}
            canReserve={canReserve}
            onReserveSuccess={state.recarregar}
            onEdit={state.editar}
            onDelete={(sala) => {
              if (confirm(`Tem certeza que deseja excluir a sala \"${sala.nome}\"?`)) {
                state.excluir(sala.id);
              }
            }}
          />
        )}

        <SalaDialog
          open={state.dialogOpen}
          onOpenChange={(open) => {
            if (!open) state.fecharDialog();
            else state.setDialogOpen(true);
          }}
          editingSala={state.editingSala}
          predios={state.predios}
          formData={state.formData}
          setFormData={state.setFormData}
          onSubmit={state.salvar}
        />
      </div>
    </MainLayout>
  );
}

