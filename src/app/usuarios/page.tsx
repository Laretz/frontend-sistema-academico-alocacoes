"use client";

import { MainLayout } from "@/components/layout/main-layout";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Mail,
  Phone,
  Calendar,
  Eye,
  UserPlus,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useAuthStore } from "@/store/auth";
import { userService } from "@/services/users";
import { api } from "@/lib/api";
import { User, Curso } from "@/types/entities";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { GradeHorariosProfessor } from "@/components/GradeHorariosProfessor";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { userCursoService } from "@/services/user-curso";
import { cursoService } from "@/services/entities";

export default function UsuariosPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [usuarios, setUsuarios] = useState<User[]>([]);
  // const [cursos, setCursos] = useState<Curso[]>([]); // removido: não utilizado
  const [isLoading, setIsLoading] = useState(true);
  // const [selectedCurso, setSelectedCurso] = useState<string>("all"); // removido: filtro por curso desativado
  const [cargaHorariaProfessores, setCargaHorariaProfessores] = useState<
    Record<string, number>
  >({});
  const [selectedProfessor, setSelectedProfessor] = useState<string | null>(
    null
  );
  const [showGrade, setShowGrade] = useState(false);
  // Estados para gerenciamento de cursos do professor
  const [manageOpen, setManageOpen] = useState(false);
  const [manageUser, setManageUser] = useState<User | null>(null);
  const [cursosVinculados, setCursosVinculados] = useState<Curso[]>([]);
  const [cursosDisponiveis, setCursosDisponiveis] = useState<Curso[]>([]);
  const [cursoSearch, setCursoSearch] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const { user } = useAuthStore();
  const router = useRouter();

  // Carregar usuários do backend
  useEffect(() => {
    const fetchUsuarios = async () => {
      try {
        setIsLoading(true);
        const response = await userService.getAll();
        setUsuarios(response.usuarios || []);
      } catch (error: unknown) {
        console.error("Erro ao carregar usuários:", error);
        toast.error("Erro ao carregar usuários");
      } finally {
        setIsLoading(false);
      }
    };

    // const loadCursos = async () => {
    //   try {
    //     const response = await fetch("http://localhost:3333/cursos");
    //     const data = await response.json();
    //     setCursos(data.cursos || []);
    //   } catch (error) {
    //     console.error("Erro ao carregar cursos:", error);
    //   }
    // };

    const loadCargaHorariaProfessores = async () => {
      try {
        const response = await api.get("/alocacoes/aulas-professor");
        setCargaHorariaProfessores(response.data.cargaHoraria || {});
      } catch (error) {
        console.error("Erro ao carregar carga horária dos professores:", error);
      }
    };

    fetchUsuarios();
    // Removido: loadCursos();
    loadCargaHorariaProfessores();
  }, []);

  const filteredUsuarios = usuarios.filter((usuario) => {
    const matchesSearch =
      usuario.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      usuario.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      usuario.especializacao
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      false;

    // Removido: filtro por curso (selectedCurso)
    return matchesSearch;
  });

  const handleEditUser = (userId: string) => {
    router.push(`/usuarios/${userId}/editar`);
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      await userService.updateRole(userId, newRole);

      setUsuarios((prev) =>
        prev.map((user) =>
          user.id === userId
            ? { ...user, role: newRole as "PROFESSOR" | "ADMIN" | "COORDENADOR" }
            : user
        )
      );
      toast.success("Role atualizado com sucesso!");
    } catch (error) {
      console.error("Erro ao atualizar role:", error);
      toast.error("Erro ao atualizar role");
    }
  };

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (
      window.confirm(`Tem certeza que deseja excluir o usuário ${userName}?`)
    ) {
      try {
        await userService.delete(userId);

        setUsuarios((prev) => prev.filter((u) => u.id !== userId));
        toast.success("Usuário excluído com sucesso!");
      } catch (error: unknown) {
        console.error("Erro ao excluir usuário:", error);
        toast.error("Erro ao excluir usuário");
      }
    }
  };

  const handleNewUser = () => {
    router.push("/usuarios/novo");
  };

  const getPerfilColor = (role: string) => {
    switch (role) {
      case "ADMIN":
        return "destructive";
      case "PROFESSOR":
        return "default";
      case "ALUNO":
        return "secondary";
      default:
        return "outline";
    }
  };

  const getPerfilLabel = (role: string) => {
    switch (role) {
      case "ADMIN":
        return "Administrador";
      case "PROFESSOR":
        return "Professor";
      case "COORDENADOR":
        return "Coordenador";
      case "ALUNO":
        return "Aluno";
      default:
        return role;
    }
  };

  const getInitials = (nome: string) => {
    return nome
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Verificar se o usuário tem permissão para ver esta página
  if (user?.role !== "ADMIN" && user?.role !== "COORDENADOR") {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-foreground mb-2">
              Acesso Negado
            </h2>
            <p className="text-muted-foreground">
              Você não tem permissão para acessar esta página.
            </p>
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
            <h1 className="text-3xl font-bold tracking-tight">Usuários</h1>
            <p className="text-muted-foreground">
              Gerencie os usuários do sistema
            </p>
          </div>
          {(user?.role === "ADMIN" || user?.role === "COORDENADOR") && (
            <Button onClick={handleNewUser}>
              <Plus className="mr-2 h-4 w-4" />
              Novo Usuário
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Mini Tabela de Aulas */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                Alocações dos Professores
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {filteredUsuarios

                  .sort(
                    (a, b) =>
                      (cargaHorariaProfessores[b.id] || 0) -
                      (cargaHorariaProfessores[a.id] || 0)
                  )
                  .map((professor) => (
                    <div
                      key={professor.id}
                      className="flex justify-between items-center py-1 border-b border-gray-100"
                    >
                      <span className="text-sm font-medium">
                        {professor.nome}
                      </span>
                      <Badge variant="outline">
                        {cargaHorariaProfessores[professor.id] || 0} alocações
                      </Badge>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>

          {/* Filtros */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Filtros</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex items-center space-x-2 flex-1">
                  <Search className="h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Buscar usuários..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="flex-1"
                  />
                </div>
                {/* Removido: Select de filtro por curso */}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="bg-card rounded-lg border shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Email</TableHead>

                <TableHead>Especialização</TableHead>
                <TableHead>Carga Máx.</TableHead>
                <TableHead>Role</TableHead>
                {/* Removido: coluna Status */}
                <TableHead className="text-center">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsuarios.map((usuario) => (
                <TableRow key={usuario.id}>
                  <TableCell className="font-medium">{usuario.nome}</TableCell>
                  <TableCell>{usuario.email}</TableCell>

                  <TableCell>{usuario.especializacao}</TableCell>
                  <TableCell> {usuario.carga_horaria_max ? `${usuario.carga_horaria_max}h` : "-"}</TableCell>
                  <TableCell>
                    {user?.role === "ADMIN" || user?.role === "COORDENADOR" ? (
                      <Select
                        value={usuario.role}
                        onValueChange={(value) =>
                          handleRoleChange(usuario.id, value)
                        }
                      >
                        <SelectTrigger className="w-[140px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="PROFESSOR">Professor</SelectItem>
                          <SelectItem value="ADMIN">Admin</SelectItem>
                          <SelectItem value="COORDENADOR">Coordenador</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <span>{getPerfilLabel(usuario.role)}</span>
                    )}
                  </TableCell>
                  {/* Removido: célula de Status */}
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end space-x-2">
                      {(usuario.role === "PROFESSOR" ||
                        usuario.role === "ADMIN" ||
                        usuario.role === "COORDENADOR") && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedProfessor(usuario.id);
                            setShowGrade(true);
                          }}
                          title="Ver grade de horários"
                        >
                          <Calendar className="h-4 w-4" />
                        </Button>
                      )}
                      {/* Novo: Gerenciar Cursos */}
                      {user?.role === "ADMIN" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={async () => {
                            setManageUser(usuario);
                            setManageOpen(true);
                            try {
                              const [vinculadosRes, cursosRes] =
                                await Promise.all([
                                  userCursoService.getCursosByUser(usuario.id),
                                  cursoService.getAll(1),
                                ]);
                              setCursosVinculados(vinculadosRes.cursos || []);
                              setCursosDisponiveis(cursosRes.cursos || []);
                            } catch (error) {
                              console.error("Erro ao carregar cursos:", error);
                              toast.error("Não foi possível carregar cursos");
                            }
                          }}
                          title="Vincular/Desvincular cursos"
                        >
                          <Plus className="h-4 w-4 text-green-600 mr-1" />
                          Vincular Cursos
                        </Button>
                      )}
                      {user?.role === "ADMIN" && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditUser(usuario.id)}
                          >
                            <Edit className="h-4 w-4 text-shadblue-primary" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="outline" size="sm">
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  Confirmar exclusão
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  Tem certeza que deseja excluir o usuário{" "}
                                  {usuario.nome}? Esta ação não pode ser
                                  desfeita.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() =>
                                    handleDeleteUser(usuario.id, usuario.nome)
                                  }
                                  className="bg-destructive hover:bg-destructive/90"
                                >
                                  Excluir
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {filteredUsuarios.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Nenhum usuário encontrado.</p>
          </div>
        )}

        {/* Modal da Grade de Horários */}
        {showGrade && selectedProfessor && (
          <GradeHorariosProfessor
            professorId={selectedProfessor}
            isOpen={showGrade}
            onClose={() => {
              setShowGrade(false);
              setSelectedProfessor(null);
            }}
          />
        )}

        {/* Dialog: Gerenciar Cursos do Professor */}
        {manageOpen && manageUser && (
          <Dialog open={manageOpen} onOpenChange={setManageOpen}>
            <DialogContent className="sm:max-w-[700px]">
              <DialogHeader>
                <DialogTitle>Gerenciar Cursos — {manageUser.nome}</DialogTitle>
                <DialogDescription>
                  Vincule ou remova cursos deste professor. Filtro por nome
                  disponível.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-6">
                <div className="flex items-center space-x-2">
                  <Search className="h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Buscar curso por nome..."
                    value={cursoSearch}
                    onChange={(e) => setCursoSearch(e.target.value)}
                    className="flex-1"
                  />
                </div>

                {/* Cursos vinculados */}
                <div>
                  <h3 className="text-sm font-semibold mb-2">
                    Cursos vinculados ({cursosVinculados.length})
                  </h3>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {cursosVinculados.length === 0 && (
                      <p className="text-muted-foreground text-sm">
                        Nenhum curso vinculado.
                      </p>
                    )}
                    {cursosVinculados.map((curso) => (
                      <div
                        key={curso.id}
                        className="flex items-center justify-between p-2 border rounded-md"
                      >
                        <div>
                          <p className="font-medium">{curso.nome}</p>
                          <p className="text-xs text-muted-foreground">
                            {curso.codigo} • {curso.turno}
                          </p>
                        </div>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={async () => {
                            setIsSaving(true);
                            try {
                              await userCursoService.desvincular({
                                id_user: manageUser.id,
                                id_curso: curso.id,
                              });
                              toast.success("Desvinculado com sucesso");
                              setCursosVinculados((prev) =>
                                prev.filter((c) => c.id !== curso.id)
                              );
                            } catch (error) {
                              console.error(error);
                              toast.error("Erro ao desvincular curso");
                            } finally {
                              setIsSaving(false);
                            }
                          }}
                        >
                          Desvincular
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Cursos disponíveis */}
                <div>
                  <h3 className="text-sm font-semibold mb-2">
                    Cursos disponíveis
                  </h3>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {cursosDisponiveis
                      .filter(
                        (c) => !cursosVinculados.some((v) => v.id === c.id)
                      )
                      .filter((c) =>
                        c.nome.toLowerCase().includes(cursoSearch.toLowerCase())
                      )
                      .map((curso) => (
                        <div
                          key={curso.id}
                          className="flex items-center justify-between p-2 border rounded-md"
                        >
                          <div>
                            <p className="font-medium">{curso.nome}</p>
                            <p className="text-xs text-muted-foreground">
                              {curso.codigo} • {curso.turno}
                            </p>
                          </div>
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={async () => {
                              setIsSaving(true);
                              try {
                                await userCursoService.vincular({
                                  id_user: manageUser.id,
                                  id_curso: curso.id,
                                });
                                toast.success("Curso vinculado");
                                // Atualiza listas
                                const vinculadosRes =
                                  await userCursoService.getCursosByUser(
                                    manageUser.id
                                  );
                                setCursosVinculados(vinculadosRes.cursos || []);
                              } catch (error: any) {
                                const message =
                                  error?.response?.data?.message ||
                                  "Erro ao vincular curso";
                                toast.error(message);
                              } finally {
                                setIsSaving(false);
                              }
                            }}
                          >
                            Vincular
                          </Button>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setManageOpen(false)}
                  disabled={isSaving}
                >
                  Fechar
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </MainLayout>
  );
}
