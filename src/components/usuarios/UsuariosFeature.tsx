"use client";

import { MainLayout } from "@/components/layout/main-layout";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useAuthStore } from "@/store/auth";
import { useRouter } from "next/navigation";
import { useUsuarios } from "@/hooks/useUsuarios";
import { ProfessoresAlocacoesCard } from "@/components/usuarios/ProfessoresAlocacoesCard";
import { UsuariosFiltersCard } from "@/components/usuarios/UsuariosFiltersCard";
import { UsuariosTable } from "@/components/usuarios/UsuariosTable";
import { GradeHorariosProfessor } from "@/components/usuarios/GradeHorariosProfessor";
import { GerenciarCursosDialog } from "@/components/usuarios/GerenciarCursosDialog";

export function UsuariosFeature() {
  const { user } = useAuthStore();
  const router = useRouter();
  const state = useUsuarios();

  if (user?.role !== "ADMIN" && user?.role !== "COORDENADOR") {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-foreground mb-2">Acesso Negado</h2>
            <p className="text-muted-foreground">
              Você não tem permissão para acessar esta página.
            </p>
          </div>
        </div>
      </MainLayout>
    );
  }

  const canEditRole = user?.role === "ADMIN" || user?.role === "COORDENADOR";
  const canManageCursos = user?.role === "ADMIN";
  const canDelete = user?.role === "ADMIN";

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Usuários</h1>
            <p className="text-muted-foreground">Gerencie os usuários do sistema</p>
          </div>
          {canEditRole && (
            <Button onClick={() => router.push("/usuarios/novo")}>
              <Plus className="mr-2 h-4 w-4" />
              Novo Usuário
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <ProfessoresAlocacoesCard
            usuarios={state.filteredUsuarios}
            cargaHorariaProfessores={state.cargaHorariaProfessores}
          />
          <UsuariosFiltersCard
            searchTerm={state.searchTerm}
            onSearchTermChange={state.setSearchTerm}
          />
        </div>

        <UsuariosTable
          usuarios={state.filteredUsuarios}
          canEditRole={canEditRole}
          canManageCursos={canManageCursos}
          canDelete={canDelete}
          onRoleChange={state.atualizarRole}
          onVerGrade={state.abrirGradeProfessor}
          onGerenciarCursos={state.abrirGerenciarCursos}
          onEditar={(id) => router.push(`/usuarios/${id}/editar`)}
          onExcluir={state.excluirUsuario}
        />

        {state.filteredUsuarios.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Nenhum usuário encontrado.</p>
          </div>
        )}

        {state.showGrade && state.selectedProfessor && (
          <GradeHorariosProfessor
            professorId={state.selectedProfessor}
            isOpen={state.showGrade}
            onClose={state.fecharGradeProfessor}
          />
        )}

        <GerenciarCursosDialog
          open={state.manageOpen}
          onOpenChange={(open) => {
            if (!open) state.fecharGerenciarCursos();
          }}
          user={state.manageUser}
          cursosVinculados={state.cursosVinculados}
          cursosDisponiveis={state.cursosDisponiveisFiltrados}
          cursoSearch={state.cursoSearch}
          onCursoSearchChange={state.setCursoSearch}
          onVincular={state.vincularCurso}
          onDesvincular={state.desvincularCurso}
          isSaving={state.isSaving}
        />
      </div>
    </MainLayout>
  );
}

