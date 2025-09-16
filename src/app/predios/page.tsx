'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Building, MapPin } from 'lucide-react';
import { predioService } from '@/services/entities';
import { Predio } from '@/types/entities';
import { toast } from 'sonner';

export default function PrediosPage() {
  const router = useRouter();
  const [predios, setPredios] = useState<Predio[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadPredios();
  }, []);

  const loadPredios = async () => {
    try {
      setIsLoading(true);
      const response = await predioService.getAll();
      setPredios(response.predios);
    } catch (error) {
      console.error('Erro ao carregar prédios:', error);
      toast.error('Erro ao carregar prédios');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este prédio?')) {
      return;
    }

    try {
      await predioService.delete(id);
      toast.success('Prédio excluído com sucesso!');
      loadPredios();
    } catch (error) {
      console.error('Erro ao excluir prédio:', error);
      toast.error('Erro ao excluir prédio');
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex justify-center items-center h-64">
          <div className="text-lg">Carregando prédios...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Prédios</h1>
          <p className="text-muted-foreground">Gerencie os prédios da instituição</p>
        </div>
        <Button onClick={() => router.push('/predios/criar')}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Prédio
        </Button>
      </div>

      {predios.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Building className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhum prédio encontrado</h3>
            <p className="text-muted-foreground mb-4">Comece criando seu primeiro prédio</p>
            <Button onClick={() => router.push('/predios/criar')}>
              <Plus className="h-4 w-4 mr-2" />
              Criar Prédio
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {predios.map((predio) => (
            <Card key={predio.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Building className="h-5 w-5 text-primary" />
                    <CardTitle className="text-lg">{predio.nome}</CardTitle>
                  </div>
                  <Badge variant="secondary">{predio.codigo}</Badge>
                </div>
                {predio.descricao && (
                  <CardDescription>{predio.descricao}</CardDescription>
                )}
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                  <MapPin className="h-4 w-4" />
                  <span>
                    {predio.salas?.length || 0} sala{predio.salas?.length !== 1 ? 's' : ''}
                  </span>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push(`/predios/${predio.id}`)}
                  >
                    Ver Detalhes
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(predio.id)}
                  >
                    Excluir
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}