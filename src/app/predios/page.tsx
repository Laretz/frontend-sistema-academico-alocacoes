'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MainLayout } from '@/components/layout/main-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus, Building, MapPin, ArrowLeft, Eye, Trash2 } from 'lucide-react';
import { predioService, salaService } from '@/services/entities';
import { Predio, Sala } from '@/types/entities';
import { toast } from 'sonner';

export default function PrediosPage() {
  const router = useRouter();
  const [predios, setPredios] = useState<Predio[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPredio, setSelectedPredio] = useState<Predio | null>(null);
  const [salas, setSalas] = useState<Sala[]>([]);
  const [isLoadingSalas, setIsLoadingSalas] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  const handleViewDetails = async (predio: Predio) => {
    setSelectedPredio(predio);
    setIsModalOpen(true);
    setIsLoadingSalas(true);
    
    try {
      const response = await salaService.getByPredioId(predio.id);
      setSalas(response.salas || []);
    } catch (error) {
      console.error('Erro ao carregar salas:', error);
      toast.error('Erro ao carregar salas do prédio');
      setSalas([]);
    } finally {
      setIsLoadingSalas(false);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedPredio(null);
    setSalas([]);
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center h-64">
          <div className="text-lg">Carregando prédios...</div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => router.back()}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Prédios</h1>
            <p className="text-muted-foreground">Gerencie os prédios da instituição</p>
          </div>
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
                    onClick={() => handleViewDetails(predio)}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    Ver Detalhes
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(predio.id)}
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Excluir
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      
      <Dialog open={isModalOpen} onOpenChange={closeModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              {selectedPredio?.nome}
            </DialogTitle>
            <DialogDescription>
              {selectedPredio?.descricao || 'Detalhes do prédio e suas salas'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Código</label>
                <p className="text-sm">{selectedPredio?.codigo}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Total de Salas</label>
                <p className="text-sm">{salas.length}</p>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium mb-3 flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Salas do Prédio
              </h4>
              
              {isLoadingSalas ? (
                <div className="flex justify-center py-8">
                  <div className="text-sm text-muted-foreground">Carregando salas...</div>
                </div>
              ) : salas.length === 0 ? (
                <div className="text-center py-8">
                  <MapPin className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Nenhuma sala encontrada neste prédio</p>
                </div>
              ) : (
                <div className="grid gap-2 max-h-60 overflow-y-auto">
                  {salas.map((sala) => (
                    <div key={sala.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{sala.nome}</p>
                        <p className="text-sm text-muted-foreground">
                          Código: {sala.codigo} • Capacidade: {sala.capacidade || 'N/A'}
                        </p>
                      </div>
                      <Badge variant="outline">{sala.tipo || 'Sala'}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
      </div>
    </MainLayout>
  );
}