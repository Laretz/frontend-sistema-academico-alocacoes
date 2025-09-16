'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { MainLayout } from '@/components/layout/main-layout';
import { UserForm } from '@/components/forms/user-form';
import { userService, UpdateUserRequest, CreateUserRequest } from '@/services/users';
import { useAuthStore } from '@/store/auth';
import { User } from '@/types/auth';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

export default function EditarUsuarioPage() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const router = useRouter();
  const params = useParams();
  const { user: currentUser } = useAuthStore();
  const userId = params?.id as string;

  // Verificar se o ID do usuário está presente
  if (!userId) {
    router.push('/usuarios');
    return null;
  }

  useEffect(() => {
    // Verificar se o usuário tem permissão para editar usuários
    if (currentUser?.role !== 'ADMIN') {
      router.push('/usuarios');
      toast.error('Você não tem permissão para acessar esta página.');
      return;
    }

    if (!userId) {
      router.push('/usuarios');
      return;
    }
    const fetchUser = async () => {
      try {
        const userData = await userService.getById(userId);
        setUser(userData);
      } catch (error: unknown) {
        console.error('Erro ao carregar usuário:', error);
        toast.error('Erro ao carregar dados do usuário');
        router.push('/usuarios');
      } finally {
        setIsLoadingUser(false);
      }
    };

    fetchUser();
  }, [userId, router, currentUser]);

  const handleSubmit = async (data: CreateUserRequest | UpdateUserRequest) => {
    setIsLoading(true);
    try {
      await userService.update(userId, data as UpdateUserRequest);
      toast.success('Usuário atualizado com sucesso!');
      router.push('/usuarios');
    } catch (error: unknown) {
      console.error('Erro ao atualizar usuário:', error);
      const errorMessage = error instanceof Error && 'response' in error 
        ? (error as { response?: { data?: { message?: string } } }).response?.data?.message 
        : 'Erro ao atualizar usuário. Tente novamente.';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    router.push('/usuarios');
  };

  if (isLoadingUser) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Carregando dados do usuário...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!user) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Usuário não encontrado</h2>
            <p className="text-gray-600">O usuário solicitado não foi encontrado.</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Editar Usuário</h1>
          <p className="text-muted-foreground">
            Atualize as informações de {user.nome}
          </p>
        </div>

        <UserForm
          user={user}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isLoading={isLoading}
        />
      </div>
    </MainLayout>
  );
}