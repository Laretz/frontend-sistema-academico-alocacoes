'use client';

import { MainLayout } from '@/components/layout/main-layout';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Search, Edit, Trash2, Mail, Phone } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/auth';
import { userService } from '@/services/users';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';



export default function UsuariosPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [usuarios, setUsuarios] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
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
        console.error('Erro ao carregar usuários:', error);
        toast.error('Erro ao carregar usuários');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsuarios();
  }, []);

  const filteredUsuarios = usuarios.filter(usuario =>
    usuario.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    usuario.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (usuario.especializacao?.toLowerCase().includes(searchTerm.toLowerCase()) || false)
  );

  const handleEditUser = (userId: string) => {
    router.push(`/usuarios/${userId}/editar`);
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      await userService.updateRole(userId, newRole);
      
      setUsuarios(prev => prev.map(user => 
        user.id === userId ? { ...user, role: newRole as 'PROFESSOR' | 'ADMIN' } : user
      ));
      toast.success('Role atualizado com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar role:', error);
      toast.error('Erro ao atualizar role');
    }
  };

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (window.confirm(`Tem certeza que deseja excluir o usuário ${userName}?`)) {
      try {
        await userService.delete(userId);
        
        setUsuarios(prev => prev.filter(u => u.id !== userId));
        toast.success('Usuário excluído com sucesso!');
      } catch (error: unknown) {
        console.error('Erro ao excluir usuário:', error);
        toast.error('Erro ao excluir usuário');
      }
    }
  };

  const handleNewUser = () => {
    router.push('/usuarios/novo');
  };

  const getPerfilColor = (role: string) => {
    switch (role) {
      case 'ADMIN': return 'destructive';
      case 'PROFESSOR': return 'default';
      case 'ALUNO': return 'secondary';
      default: return 'outline';
    }
  };

  const getPerfilLabel = (role: string) => {
    switch (role) {
      case 'ADMIN': return 'Administrador';
      case 'PROFESSOR': return 'Professor';
      case 'ALUNO': return 'Aluno';
      default: return role;
    }
  };

  const getInitials = (nome: string) => {
    return nome.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  // Verificar se o usuário tem permissão para ver esta página
  if (user?.role !== 'ADMIN') {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-foreground mb-2">Acesso Negado</h2>
            <p className="text-muted-foreground">Você não tem permissão para acessar esta página.</p>
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
          {user?.role === 'ADMIN' && (
            <Button onClick={handleNewUser}>
              <Plus className="mr-2 h-4 w-4" />
              Novo Usuário
            </Button>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar usuários..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
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
                  <TableCell>{usuario.telefone}</TableCell>
                  <TableCell>{usuario.especializacao}</TableCell>
                  <TableCell>
                    {user?.role === 'ADMIN' ? (
                      <Select
                        value={usuario.role}
                        onValueChange={(value) => handleRoleChange(usuario.id, value)}
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
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      usuario.status === 'ativo' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {usuario.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    {user?.role === 'ADMIN' && (
                      <div className="flex gap-2 justify-end">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleEditUser(usuario.id)}
                          title="Editar usuário"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleDeleteUser(usuario.id, usuario.nome)}
                          title="Excluir usuário"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
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
      </div>
    </MainLayout>
  );
}