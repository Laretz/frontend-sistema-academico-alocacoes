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

export default function UsuariosPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [usuarios, setUsuarios] = useState<User[]>([]);
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCurso, setSelectedCurso] = useState<string>("all");
  const [cargaHorariaProfessores, setCargaHorariaProfessores] = useState<
    Record<string, number>
  >({});
  const [selectedProfessor, setSelectedProfessor] = useState<string | null>(
    null
  );
  const [showGrade, setShowGrade] = useState(false);
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

    const loadCursos = async () => {
      try {
        const response = await fetch("http://localhost:3333/cursos");
        const data = await response.json();
        setCursos(data.cursos || []);
      } catch (error) {
        console.error("Erro ao carregar cursos:", error);
      }
    };

    const loadCargaHorariaProfessores = async () => {
      try {
        const response = await fetch(
          "http://localhost:3333/alocacoes/aulas-professor"
        );
        const data = await response.json();
        setCargaHorariaProfessores(data.cargaHoraria || {});
      } catch (error) {
        console.error("Erro ao carregar carga horária dos professores:", error);
      }
    };

    fetchUsuarios();
    loadCursos();
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

    const matchesCurso =
      selectedCurso === "all" ||
      (usuario.curso &&
        usuario.curso.some((curso: any) => curso.id === selectedCurso));

    return matchesSearch && matchesCurso;
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
            ? { ...user, role: newRole as "PROFESSOR" | "ADMIN" }
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
  if (user?.role !== "ADMIN") {
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
          {user?.role === "ADMIN" && (
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
                  .filter((usuario) => usuario.role === "PROFESSOR")
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
                <Select value={selectedCurso} onValueChange={setSelectedCurso}>
                  <SelectTrigger className="w-full sm:w-[200px]">
                    <SelectValue placeholder="Filtrar por curso" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os cursos</SelectItem>
                    {cursos.map((curso) => (
                      <SelectItem key={curso.id} value={curso.id}>
                        {curso.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
                <TableHead>Telefone</TableHead>
                <TableHead>Especialização</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsuarios.map((usuario) => (
                <TableRow key={usuario.id}>
                  <TableCell className="font-medium">{usuario.nome}</TableCell>
                  <TableCell>{usuario.email}</TableCell>
                  <TableCell>{usuario.telefone || "-"}</TableCell>
                  <TableCell>{usuario.especializacao}</TableCell>
                  <TableCell>
                    {user?.role === "ADMIN" ? (
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
                        </SelectContent>
                      </Select>
                    ) : (
                      <span>{getPerfilLabel(usuario.role)}</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        usuario.status === "ativo"
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {usuario.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end space-x-2">
                      {(usuario.role === "PROFESSOR" || usuario.role === "ADMIN" || usuario.role === "COORDENADOR") && (
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
                      {user?.role === "ADMIN" && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditUser(usuario.id)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="outline" size="sm">
                                <Trash2 className="h-4 w-4" />
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
                                  className="bg-red-600 hover:bg-red-700"
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
      </div>
    </MainLayout>
  );
}
