'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MainLayout } from '@/components/layout/main-layout';
import { UserForm } from '@/components/forms/user-form';
import { userService, CreateUserRequest, UpdateUserRequest } from '@/services/users';
import { useAuthStore } from '@/store/auth';
import { toast } from 'sonner';

export default function NovoUsuarioPage() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { user } = useAuthStore();

  // Verificar se o usuário tem permissão para criar usuários
  if (user?.role !== 'ADMIN' && user?.role !== 'COORDENADOR') {
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

  const handleSubmit = async (data: CreateUserRequest | UpdateUserRequest) => {
    setIsLoading(true);
    try {
      await userService.create(data as CreateUserRequest);
      toast.success('Usuário criado com sucesso!');
      router.push('/usuarios');
    } catch (error: unknown) {
      console.error('Erro ao criar usuário:', error);
      const errorMessage = error instanceof Error && 'response' in error 
        ? (error as { response?: { data?: { message?: string } } }).response?.data?.message 
        : 'Erro ao criar usuário. Tente novamente.';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    router.push('/usuarios');
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Novo Usuário</h1>
          <p className="text-muted-foreground">
            Crie um novo usuário no sistema
          </p>
        </div>

        <UserForm
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isLoading={isLoading}
        />
      </div>
    </MainLayout>
  );
}
