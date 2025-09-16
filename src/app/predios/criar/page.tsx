'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Save } from 'lucide-react';
import { predioService } from '@/services/entities';
import { toast } from 'sonner';

export default function CriarPredioPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    codigo: '',
    nome: '',
    descricao: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.codigo || !formData.nome) {
      toast.error('Por favor, preencha todos os campos obrigatórios');
      return;
    }

    setIsLoading(true);
    
    try {
      await predioService.create({
        codigo: formData.codigo,
        nome: formData.nome,
        descricao: formData.descricao || undefined
      });
      toast.success('Prédio criado com sucesso!');
      router.push('/predios');
    } catch (error) {
      console.error('Erro ao criar prédio:', error);
      toast.error('Erro ao criar prédio. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
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
        <h1 className="text-2xl font-bold">Criar Novo Prédio</h1>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Informações do Prédio</CardTitle>
          <CardDescription>
            Preencha as informações básicas do prédio
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="codigo">Código do Prédio *</Label>
              <Input
                id="codigo"
                type="text"
                placeholder="Ex: A, B, C1, LAB"
                value={formData.codigo}
                onChange={(e) => handleInputChange('codigo', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="nome">Nome do Prédio *</Label>
              <Input
                id="nome"
                type="text"
                placeholder="Ex: Prédio Principal, Laboratórios"
                value={formData.nome}
                onChange={(e) => handleInputChange('nome', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="descricao">Descrição</Label>
              <Textarea
                id="descricao"
                placeholder="Descrição opcional do prédio"
                value={formData.descricao}
                onChange={(e) => handleInputChange('descricao', e.target.value)}
                rows={3}
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
                {isLoading ? 'Criando...' : 'Criar Prédio'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}