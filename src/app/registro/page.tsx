'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
// Removido seletor de perfil (role)
import { Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { authService } from '@/services/auth';
import Link from 'next/link';

export default function RegistroPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    senha: '',
    confirmSenha: '',
    especializacao: '',
    cargaHorariaMax: '',
    preferencia: ''
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.senha !== formData.confirmSenha) {
      toast.error('As senhas não coincidem');
      return;
    }

    if (formData.senha.length < 6) {
      toast.error('A senha deve ter pelo menos 6 caracteres');
      return;
    }

    setIsLoading(true);

    try {
      const registerData = {
        nome: formData.nome,
        email: formData.email,
        senha: formData.senha,
        // Força criação de professor: não solicitar perfil
        role: 'PROFESSOR' as const,
        especializacao: formData.especializacao || undefined,
        cargaHorariaMax: formData.cargaHorariaMax ? parseInt(formData.cargaHorariaMax) : undefined,
        preferencia: formData.preferencia || undefined
      };

      await authService.register(registerData);
      
      toast.success('Usuário registrado com sucesso!');
      router.push('/login');
    } catch (error: unknown) {
      console.error('Erro no registro:', error);
      const errorMessage = error instanceof Error && 'response' in error 
        ? (error as { response?: { data?: { message?: string } } }).response?.data?.message 
        : 'Erro ao registrar usuário';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center gap-2">
            <Link href="/login">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <CardTitle className="text-2xl font-bold">Criar Conta</CardTitle>
              <CardDescription>
                Preencha os dados para criar sua conta
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome Completo</Label>
              <Input
                id="nome"
                type="text"
                placeholder="Digite seu nome completo"
                value={formData.nome}
                onChange={(e) => handleInputChange('nome', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Digite seu email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                required
              />
            </div>

            {/* Perfil removido: criação restrita a Professor */}

            <div className="space-y-2">
              <Label htmlFor="especializacao">Especialização</Label>
              <Input
                id="especializacao"
                type="text"
                placeholder="Digite sua especialização"
                value={formData.especializacao}
                onChange={(e) => handleInputChange('especializacao', e.target.value)}
              />
            </div>

            {/* Campos específicos de professor (sempre visíveis) */}
            <div className="space-y-2">
              <Label htmlFor="cargaHorariaMax">Carga Horária Máxima</Label>
              <Input
                id="cargaHorariaMax"
                type="number"
                placeholder="Digite a carga horária máxima"
                value={formData.cargaHorariaMax}
                onChange={(e) => handleInputChange('cargaHorariaMax', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="preferencia">Preferência</Label>
              <Input
                id="preferencia"
                type="text"
                placeholder="Digite suas preferências"
                value={formData.preferencia}
                onChange={(e) => handleInputChange('preferencia', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="senha">Senha</Label>
              <div className="relative">
                <Input
                  id="senha"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Digite sua senha"
                  value={formData.senha}
                  onChange={(e) => handleInputChange('senha', e.target.value)}
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmSenha">Confirmar Senha</Label>
              <Input
                id="confirmSenha"
                type="password"
                placeholder="Confirme sua senha"
                value={formData.confirmSenha}
                onChange={(e) => handleInputChange('confirmSenha', e.target.value)}
                required
              />
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Criando conta...' : 'Criar Conta'}
            </Button>
          </form>

          <div className="mt-4 text-center text-sm">
            Já tem uma conta?{' '}
            <Link href="/login" className="text-blue-600 hover:underline">
              Fazer login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}