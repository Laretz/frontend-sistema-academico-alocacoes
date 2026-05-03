"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { Calendar, Edit, Plus, Trash2 } from "lucide-react";
import type { User as Usuario } from "@/types/auth";

export function UsuariosTable({
  usuarios,
  canEditRole,
  canManageCursos,
  canDelete,
  onRoleChange,
  onVerGrade,
  onGerenciarCursos,
  onEditar,
  onExcluir,
}: {
  usuarios: Usuario[];
  canEditRole: boolean;
  canManageCursos: boolean;
  canDelete: boolean;
  onRoleChange: (userId: string, newRole: string) => void;
  onVerGrade: (userId: string) => void;
  onGerenciarCursos: (usuario: Usuario) => void;
  onEditar: (userId: string) => void;
  onExcluir: (userId: string) => void;
}) {
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

  return (
    <div className="bg-card rounded-lg border shadow-sm">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Especialização</TableHead>
            <TableHead>Carga Máx.</TableHead>
            <TableHead>Role</TableHead>
            <TableHead className="text-center">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {usuarios.map((usuario) => (
            <TableRow key={usuario.id}>
              <TableCell className="font-medium">{usuario.nome}</TableCell>
              <TableCell>{usuario.email}</TableCell>
              <TableCell>{usuario.especializacao}</TableCell>
              <TableCell>
                {usuario.cargaHorariaMax ? `${usuario.cargaHorariaMax}h` : "-"}
              </TableCell>
              <TableCell>
                {canEditRole ? (
                  <Select
                    value={usuario.role}
                    onValueChange={(value) => onRoleChange(usuario.id, value)}
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
              <TableCell className="text-right">
                <div className="flex items-center justify-end space-x-2">
                  {(usuario.role === "PROFESSOR" ||
                    usuario.role === "ADMIN" ||
                    usuario.role === "COORDENADOR") && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onVerGrade(usuario.id)}
                      title="Ver grade de horários"
                    >
                      <Calendar className="h-4 w-4" />
                    </Button>
                  )}

                  {canManageCursos && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onGerenciarCursos(usuario)}
                      title="Vincular/Desvincular cursos"
                    >
                      <Plus className="h-4 w-4 text-green-600 mr-1" />
                      Vincular Cursos
                    </Button>
                  )}

                  {canDelete && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onEditar(usuario.id)}
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
                            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                            <AlertDialogDescription>
                              Tem certeza que deseja excluir o usuário {usuario.nome}?
                              Esta ação não pode ser desfeita.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => onExcluir(usuario.id)}
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
  );
}

