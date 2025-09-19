'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { User } from '@/types/auth';
import { CreateUserRequest, UpdateUserRequest } from '@/services/users';

const createUserSchema = z.object({
  nome: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  senha: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
  role: z.enum(['ADMIN', 'PROFESSOR', 'COORDENADOR'], {
    message: 'Selecione um role',
  }),
  especializacao: z.string().optional(),
  cargaHorariaMax: z.number().min(1).max(40).optional(),
  preferencia: z.string().optional(),
});

const updateUserSchema = z.object({
  nome: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  role: z.enum(['ADMIN', 'PROFESSOR', 'COORDENADOR'], {
    message: 'Selecione um perfil',
  }),
  especializacao: z.string().optional(),
  cargaHorariaMax: z.number().min(1).max(40).optional(),
  preferencia: z.string().optional(),
});

type CreateUserFormData = z.infer<typeof createUserSchema>;
type UpdateUserFormData = z.infer<typeof updateUserSchema>;

interface UserFormProps {
  user?: User;
  onSubmit: (data: CreateUserRequest | UpdateUserRequest) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export function UserForm({ user, onSubmit, onCancel, isLoading = false }: UserFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const isEditing = !!user;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreateUserFormData | UpdateUserFormData>({
    resolver: zodResolver(isEditing ? updateUserSchema : createUserSchema),
    defaultValues: isEditing
      ? {
          nome: user.nome,
          email: user.email,
          role: user.role as 'ADMIN' | 'PROFESSOR' | 'COORDENADOR',
          especializacao: user.especializacao || '',
          cargaHorariaMax: user.cargaHorariaMax || undefined,
          preferencia: user.preferencia || '',
        }
      : {
          nome: '',
          email: '',
          senha: '',
          role: 'PROFESSOR' as const,
          especializacao: '',
          cargaHorariaMax: undefined,
          preferencia: '',
        },
  });

  const role = watch('role');

  const onFormSubmit = async (data: CreateUserFormData | UpdateUserFormData) => {
    try {
      // Converter cargaHorariaMax para number se for string
      const formattedData = {
        ...data,
        cargaHorariaMax: data.cargaHorariaMax ? Number(data.cargaHorariaMax) : undefined,
        especializacao: data.especializacao || undefined,
        preferencia: data.preferencia || undefined,
      };

      await onSubmit(formattedData);
    } catch (error) {
      console.error('Erro ao salvar usuário:', error);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>{isEditing ? 'Editar Usuário' : 'Novo Usuário'}</CardTitle>
        <CardDescription>
          {isEditing
            ? 'Atualize as informações do usuário'
            : 'Preencha os dados para criar um novo usuário'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome *</Label>
              <Input
                id="nome"
                {...register('nome')}
                placeholder="Nome completo"
                disabled={isLoading}
              />
              {errors.nome && (
                <p className="text-sm text-destructive">{errors.nome.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                {...register('email')}
                placeholder="email@exemplo.com"
                disabled={isLoading}
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              )}
            </div>
          </div>

          {!isEditing && (
            <div className="space-y-2">
              <Label htmlFor="senha">Senha *</Label>
              <div className="relative">
                <Input
                  id="senha"
                  type={showPassword ? 'text' : 'password'}
                  {...register('senha')}
                  placeholder="Senha (mínimo 6 caracteres)"
                  disabled={isLoading}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
              {!isEditing && (errors as any).senha && (
                <p className="text-sm text-destructive">{(errors as any).senha.message}</p>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="role">Perfil *</Label>
              <Select
                value={role}
                onValueChange={(value) => setValue('role', value as 'ADMIN' | 'PROFESSOR' | 'COORDENADOR')}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o perfil" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ADMIN">Administrador</SelectItem>
                  <SelectItem value="PROFESSOR">Professor</SelectItem>
                  <SelectItem value="COORDENADOR">Coordenador</SelectItem>
                </SelectContent>
              </Select>
              {errors.role && (
                <p className="text-sm text-destructive">{errors.role.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="especializacao">Especialização</Label>
              <Input
                id="especializacao"
                {...register('especializacao')}
                placeholder="Área de especialização"
                disabled={isLoading}
              />
            </div>
          </div>

          {role === 'PROFESSOR' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cargaHorariaMax">Carga Horária Máxima</Label>
                <Input
                  id="cargaHorariaMax"
                  type="number"
                  min="1"
                  max="40"
                  {...register('cargaHorariaMax', { valueAsNumber: true })}
                  placeholder="Horas por semana"
                  disabled={isLoading}
                />
                {errors.cargaHorariaMax && (
                  <p className="text-sm text-destructive">{errors.cargaHorariaMax.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="preferencia">Preferências de Horário</Label>
                <Textarea
                  id="preferencia"
                  {...register('preferencia')}
                  placeholder="Descreva suas preferências de horário"
                  className="min-h-[80px]"
                  disabled={isLoading}
                />
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditing ? 'Atualizar' : 'Criar'} Usuário
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}