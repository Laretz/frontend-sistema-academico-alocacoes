'use client';

import { MainLayout } from '@/components/layout/main-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Edit, Trash2 } from 'lucide-react';
import { useState } from 'react';

// Mock data - será substituído pela integração com a API
const mockDisciplinas = [
  {
    id: '1',
    codigo: 'AGR001',
    nome: 'Introdução à Agricultura',
    cargaHoraria: 60,
    periodo: 1,
    status: 'ativa'
  },
  {
    id: '2',
    codigo: 'AGR002',
    nome: 'Solos e Fertilidade',
    cargaHoraria: 80,
    periodo: 2,
    status: 'ativa'
  },
  {
    id: '3',
    codigo: 'AGR003',
    nome: 'Irrigação e Drenagem',
    cargaHoraria: 60,
    periodo: 3,
    status: 'inativa'
  }
];

export default function DisciplinasPage() {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredDisciplinas = mockDisciplinas.filter(disciplina =>
    disciplina.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    disciplina.codigo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Disciplinas</h1>
            <p className="text-muted-foreground">
              Gerencie as disciplinas do curso
            </p>
          </div>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nova Disciplina
          </Button>
        </div>

        <div className="flex items-center space-x-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar disciplinas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredDisciplinas.map((disciplina) => (
            <Card key={disciplina.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{disciplina.codigo}</CardTitle>
                    <CardDescription className="mt-1">
                      {disciplina.nome}
                    </CardDescription>
                  </div>
                  <Badge variant={disciplina.status === 'ativa' ? 'default' : 'secondary'}>
                    {disciplina.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Carga Horária:</span>
                    <span>{disciplina.cargaHoraria}h</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Período:</span>
                    <span>{disciplina.periodo}º</span>
                  </div>
                </div>
                <div className="flex justify-end space-x-2 mt-4">
                  <Button variant="outline" size="sm">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredDisciplinas.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Nenhuma disciplina encontrada.</p>
          </div>
        )}
      </div>
    </MainLayout>
  );
}