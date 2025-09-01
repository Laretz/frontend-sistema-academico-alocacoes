'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MainLayout } from '@/components/layout/main-layout';
import { UserForm } from '@/components/forms/user-form';
import { userService, CreateUserRequest } from '@/services/users';
import { useAuthStore } from '@/store/auth';
import { toast } from 'sonner';

export default function NovoUsuarioPage() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { user } = useAuthStore();

  // Verificar se o usuário tem permissão para criar usuários
  if (user?.perfil !== 'ADMIN') {
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

  const handleSubmit = async (data: CreateUserRequest) => {
    setIsLoading(true);
    try {
      await userService.create(data);
      toast.success('Usuário criado com sucesso!');
      router.push('/usuarios');
    } catch (error: any) {
      console.error('Erro ao criar usuário:', error);
      toast.error(
        error.response?.data?.message || 'Erro ao criar usuário. Tente novamente.'
      );
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