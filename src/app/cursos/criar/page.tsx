'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MainLayout } from '@/components/layout/main-layout';
import { useAuthStore } from '@/store/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Save } from 'lucide-react';
import { cursoService } from '@/services/entities';
import { toast } from 'sonner';

export default function CriarCursoPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<{
    codigo: string;
    nome: string;
    turno: "MATUTINO" | "VESPERTINO" | "NOTURNO" | "INTEGRAL" | "";
    duracao_semestres: number;
  }>({
    codigo: '',
    nome: '',
    turno: '',
    duracao_semestres: 0
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.codigo || !formData.nome || !formData.turno || !formData.duracao_semestres) {
      toast.error('Por favor, preencha todos os campos obrigatórios');
      return;
    }

    setIsLoading(true);
    
    try {
      const payload = {
        codigo: formData.codigo,
        nome: formData.nome,
        turno: formData.turno as "MATUTINO" | "VESPERTINO" | "NOTURNO" | "INTEGRAL",
        duracao_semestres: formData.duracao_semestres
      };
      await cursoService.create(payload);
      toast.success('Curso criado com sucesso!');
      router.push('/cursos');
    } catch (error) {
      console.error('Erro ao criar curso:', error);
      toast.error('Erro ao criar curso. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: field === 'duracao_semestres' ? parseInt(value) || 0 : value
    }));
  };

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

  return (
    <MainLayout>
      <div className="container mx-auto py-6">
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
        <h1 className="text-2xl font-bold">Criar Novo Curso</h1>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Informações do Curso</CardTitle>
          <CardDescription>
            Preencha as informações básicas do curso
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="codigo">Código do Curso *</Label>
              <Input
                id="codigo"
                type="text"
                placeholder="Ex: ENG001"
                value={formData.codigo}
                onChange={(e) => handleInputChange('codigo', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="nome">Nome do Curso *</Label>
              <Input
                id="nome"
                type="text"
                placeholder="Ex: Engenharia de Software"
                value={formData.nome}
                onChange={(e) => handleInputChange('nome', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="turno">Turno *</Label>
              <Select
                value={formData.turno}
                onValueChange={(value) => handleInputChange('turno', value)}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o turno" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MATUTINO">Matutino</SelectItem>
                  <SelectItem value="VESPERTINO">Vespertino</SelectItem>
                  <SelectItem value="NOTURNO">Noturno</SelectItem>
                  <SelectItem value="INTEGRAL">Integral</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="duracao_semestres">Duração (Semestres) *</Label>
              <Input
                id="duracao_semestres"
                type="number"
                min="1"
                placeholder="Ex: 8"
                value={formData.duracao_semestres || ''}
                onChange={(e) => handleInputChange('duracao_semestres', e.target.value)}
                required
              />
            </div>

            <div className="flex gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
              >
                <Save className="h-4 w-4 mr-2" />
                {isLoading ? 'Criando...' : 'Criar Curso'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
      </div>
    </MainLayout>
  );
}