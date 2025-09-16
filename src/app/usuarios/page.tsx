'use client';

import { MainLayout } from '@/components/layout/main-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Plus, Search, Edit, Trash2, Mail, Phone } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/auth';
import { userService } from '@/services/users';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

// Mock data - será substituído pela integração com a API
const mockUsuarios = [
  {
    id: '1',
    nome: 'João Silva',
    email: 'joao.silva@ufrn.br',
    telefone: '(84) 99999-1111',
    role: 'PROFESSOR' as const,
    especializacao: 'Agricultura',
    status: 'ativo',
    createdAt: '2024-01-15',
    updatedAt: '2024-01-15'
  },
  {
    id: '2',
    nome: 'Maria Santos',
    email: 'maria.santos@ufrn.br',
    telefone: '(84) 99999-2222',
    role: 'PROFESSOR' as const,
    especializacao: 'Solos',
    status: 'ativo',
    createdAt: '2024-01-10',
    updatedAt: '2024-01-10'
  },
  {
    id: '3',
    nome: 'Carlos Lima',
    email: 'carlos.lima@ufrn.br',
    telefone: '(84) 99999-3333',
    role: 'PROFESSOR' as const,
    especializacao: 'Irrigação',
    status: 'ativo',
    createdAt: '2024-01-05',
    updatedAt: '2024-01-05'
  },
  {
    id: '4',
    nome: 'Ana Costa',
    email: 'ana.costa@ufrn.br',
    telefone: '(84) 99999-4444',
    role: 'ADMIN' as const,
    especializacao: 'TI',
    status: 'ativo',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01'
  }
];

export default function UsuariosPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [usuarios, setUsuarios] = useState(mockUsuarios);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuthStore();
  const router = useRouter();

  // Carregar usuários do backend
  useEffect(() => {
    const fetchUsuarios = async () => {
      try {
        setIsLoading(true);
        // TODO: Implementar quando o backend estiver conectado
        // const response = await userService.getAll();
        // setUsuarios(response.data);
        
        // Por enquanto, usar dados mock
        setUsuarios(mockUsuarios);
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

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (window.confirm(`Tem certeza que deseja excluir o usuário ${userName}?`)) {
      try {
        // TODO: Implementar quando o backend estiver conectado
        // await userService.delete(userId);
        
        // Por enquanto, remover dos dados mock
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
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Acesso Negado</h2>
            <p className="text-gray-600">Você não tem permissão para acessar esta página.</p>
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

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredUsuarios.map((usuario) => (
            <Card key={usuario.id}>
              <CardHeader>
                <div className="flex items-start space-x-4">
                  <Avatar>
                    <AvatarFallback>{getInitials(usuario.nome)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <CardTitle className="text-lg">{usuario.nome}</CardTitle>
                    <CardDescription className="mt-1">
                      {usuario.especializacao}
                    </CardDescription>
                    <Badge 
                      variant={getPerfilColor(usuario.role)} 
                      className="mt-2"
                    >
                      {getPerfilLabel(usuario.role)}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Mail className="mr-2 h-4 w-4" />
                    <span className="truncate">{usuario.email}</span>
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Phone className="mr-2 h-4 w-4" />
                    <span>{usuario.telefone}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Status:</span>
                    <Badge variant={usuario.status === 'ativo' ? 'default' : 'secondary'}>
                      {usuario.status}
                    </Badge>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Criado em:</span>
                    <span>{new Date(usuario.createdAt).toLocaleDateString('pt-BR')}</span>
                  </div>
                </div>
                {user?.role === 'ADMIN' && (
                  <div className="flex justify-end space-x-2 mt-4">
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
              </CardContent>
            </Card>
          ))}
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