import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { userService } from "@/services/users";
import { userCursoService } from "@/services/user-curso";
import { cursoService } from "@/services/entities";
import type { User as Usuario } from "@/types/auth";
import type { Curso } from "@/types/entities";

export function useUsuarios() {
  const [searchTerm, setSearchTerm] = useState("");
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [cargaHorariaProfessores, setCargaHorariaProfessores] = useState<
    Record<string, number>
  >({});

  const [selectedProfessor, setSelectedProfessor] = useState<string | null>(null);
  const [showGrade, setShowGrade] = useState(false);

  const [manageOpen, setManageOpen] = useState(false);
  const [manageUser, setManageUser] = useState<Usuario | null>(null);
  const [cursosVinculados, setCursosVinculados] = useState<Curso[]>([]);
  const [cursosDisponiveis, setCursosDisponiveis] = useState<Curso[]>([]);
  const [cursoSearch, setCursoSearch] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const carregarUsuarios = async () => {
    try {
      const all: Usuario[] = [];
      const pageSize = 10;
      const maxPages = 50;
      for (let page = 1; page <= maxPages; page++) {
        const resp = await userService.getAll(page);
        const chunk = resp.usuarios || [];
        all.push(...chunk);
        if (chunk.length < pageSize) break;
      }
      setUsuarios(all);
    } catch (error: unknown) {
      console.error("Erro ao carregar usuários:", error);
      toast.error("Erro ao carregar usuários");
    }
  };

  const carregarCargaHorariaProfessores = async () => {
    try {
      const response = await api.get("/alocacoes/aulas-professor");
      setCargaHorariaProfessores(response.data.cargaHoraria || {});
    } catch (error) {
      console.error("Erro ao carregar carga horária dos professores:", error);
    }
  };

  useEffect(() => {
    carregarUsuarios();
    carregarCargaHorariaProfessores();
  }, []);

  const filteredUsuarios = useMemo(() => {
    return usuarios.filter((usuario) => {
      const s = searchTerm.toLowerCase();
      return (
        usuario.nome.toLowerCase().includes(s) ||
        usuario.email.toLowerCase().includes(s) ||
        usuario.especializacao?.toLowerCase().includes(s) ||
        false
      );
    });
  }, [usuarios, searchTerm]);

  const abrirGradeProfessor = (id: string) => {
    setSelectedProfessor(id);
    setShowGrade(true);
  };

  const fecharGradeProfessor = () => {
    setShowGrade(false);
    setSelectedProfessor(null);
  };

  const atualizarRole = async (userId: string, newRole: string) => {
    try {
      await userService.updateRole(userId, newRole);
      setUsuarios((prev) =>
        prev.map((u) =>
          u.id === userId
            ? { ...u, role: newRole as "PROFESSOR" | "ADMIN" | "COORDENADOR" }
            : u,
        ),
      );
      toast.success("Role atualizado com sucesso!");
    } catch (error) {
      console.error("Erro ao atualizar role:", error);
      toast.error("Erro ao atualizar role");
    }
  };

  const excluirUsuario = async (userId: string) => {
    try {
      await userService.delete(userId);
      setUsuarios((prev) => prev.filter((u) => u.id !== userId));
      toast.success("Usuário excluído com sucesso!");
    } catch (error: unknown) {
      console.error("Erro ao excluir usuário:", error);
      toast.error("Erro ao excluir usuário");
    }
  };

  const abrirGerenciarCursos = async (usuario: Usuario) => {
    setManageUser(usuario);
    setManageOpen(true);
    setCursoSearch("");
    try {
      const [vinculadosRes, cursosRes] = await Promise.all([
        userCursoService.getCursosByUser(usuario.id),
        cursoService.getAll(),
      ]);
      setCursosVinculados(vinculadosRes.cursos || []);
      setCursosDisponiveis(cursosRes.cursos || []);
    } catch (error) {
      console.error("Erro ao carregar cursos:", error);
      toast.error("Não foi possível carregar cursos");
    }
  };

  const fecharGerenciarCursos = () => {
    setManageOpen(false);
    setManageUser(null);
    setCursosVinculados([]);
    setCursosDisponiveis([]);
    setCursoSearch("");
    setIsSaving(false);
  };

  const desvincularCurso = async (id_curso: string) => {
    if (!manageUser) return;
    setIsSaving(true);
    try {
      await userCursoService.desvincular({ id_user: manageUser.id, id_curso });
      toast.success("Desvinculado com sucesso");
      setCursosVinculados((prev) => prev.filter((c) => c.id !== id_curso));
    } catch (error) {
      console.error(error);
      toast.error("Erro ao desvincular curso");
    } finally {
      setIsSaving(false);
    }
  };

  const vincularCurso = async (id_curso: string) => {
    if (!manageUser) return;
    setIsSaving(true);
    try {
      await userCursoService.vincular({ id_user: manageUser.id, id_curso });
      toast.success("Curso vinculado");
      const vinculadosRes = await userCursoService.getCursosByUser(manageUser.id);
      setCursosVinculados(vinculadosRes.cursos || []);
    } catch (error: unknown) {
      const msg =
        typeof error === "object" &&
        error !== null &&
        "response" in error
          ? (error as { response?: { data?: { message?: unknown } } }).response
              ?.data?.message
          : undefined;
      toast.error(typeof msg === "string" ? msg : "Erro ao vincular curso");
    } finally {
      setIsSaving(false);
    }
  };

  const cursosDisponiveisFiltrados = useMemo(() => {
    const search = cursoSearch.toLowerCase();
    return cursosDisponiveis
      .filter((c) => !cursosVinculados.some((v) => v.id === c.id))
      .filter((c) => c.nome.toLowerCase().includes(search));
  }, [cursosDisponiveis, cursosVinculados, cursoSearch]);

  return {
    searchTerm,
    setSearchTerm,
    usuarios,
    filteredUsuarios,
    cargaHorariaProfessores,

    selectedProfessor,
    showGrade,
    abrirGradeProfessor,
    fecharGradeProfessor,

    manageOpen,
    manageUser,
    cursosVinculados,
    cursosDisponiveisFiltrados,
    cursoSearch,
    setCursoSearch,
    isSaving,
    abrirGerenciarCursos,
    fecharGerenciarCursos,
    vincularCurso,
    desvincularCurso,

    atualizarRole,
    excluirUsuario,
    recarregarUsuarios: carregarUsuarios,
  };
}

