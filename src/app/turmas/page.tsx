'use client';

import { MainLayout } from '@/components/layout/main-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Edit, Trash2, Users } from 'lucide-react';
import { useState } from 'react';

// Mock data - será substituído pela integração com a API
const mockTurmas = [
  {
    id: '1',
    codigo: 'AGR001-T1',
    disciplina: 'Introdução à Agricultura',
    professor: 'Prof. João Silva',
    periodo: '2024.1',
    horario: 'SEG 08:00-10:00',
    sala: 'Lab 01',
    vagas: 30,
    ocupadas: 25,
    status: 'ativa'
  },
  {
    id: '2',
    codigo: 'AGR002-T1',
    disciplina: 'Solos e Fertilidade',
    professor: 'Prof. Maria Santos',
    periodo: '2024.1',
    horario: 'TER 14:00-16:00',
    sala: 'Sala 102',
    vagas: 25,
    ocupadas: 20,
    status: 'ativa'
  },
  {
    id: '3',
    codigo: 'AGR003-T1',
    disciplina: 'Irrigação e Drenagem',
    professor: 'Prof. Carlos Lima',
    periodo: '2024.1',
    horario: 'QUA 10:00-12:00',
    sala: 'Lab 02',
    vagas: 20,
    ocupadas: 15,
    status: 'planejada'
  }
];

export default function TurmasPage() {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredTurmas = mockTurmas.filter(turma =>
    turma.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    turma.disciplina.toLowerCase().includes(searchTerm.toLowerCase()) ||
    turma.professor.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ativa': return 'default';
      case 'planejada': return 'secondary';
      case 'cancelada': return 'destructive';
      default: return 'secondary';
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Turmas</h1>
            <p className="text-muted-foreground">
              Gerencie as turmas e suas alocações
            </p>
          </div>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nova Turma
          </Button>
        </div>

        <div className="flex items-center space-x-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar turmas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredTurmas.map((turma) => (
            <Card key={turma.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{turma.codigo}</CardTitle>
                    <CardDescription className="mt-1">
                      {turma.disciplina}
                    </CardDescription>
                  </div>
                  <Badge variant={getStatusColor(turma.status)}>
                    {turma.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Professor:</span>
                    <span className="font-medium">{turma.professor}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Horário:</span>
                    <span>{turma.horario}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Sala:</span>
                    <span>{turma.sala}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Período:</span>
                    <span>{turma.periodo}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground flex items-center">
                      <Users className="mr-1 h-3 w-3" />
                      Vagas:
                    </span>
                    <span className={`font-medium ${
                      turma.ocupadas >= turma.vagas ? 'text-red-600' : 'text-green-600'
                    }`}>
                      {turma.ocupadas}/{turma.vagas}
                    </span>
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

        {filteredTurmas.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Nenhuma turma encontrada.</p>
          </div>
        )}
      </div>
    </MainLayout>
  );
}