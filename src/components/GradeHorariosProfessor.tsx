'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

interface GradeHorariosProfessorProps {
  professorId: string;
  isOpen: boolean;
  onClose: () => void;
}

interface AlocacaoData {
  id: string;
  disciplina: {
    nome: string;
    codigo?: string;
  };
  turma: {
    nome: string;
  };
  horario: {
    codigo: string;
    dia_semana: string;
    horario_inicio: string;
    horario_fim: string;
  };
  sala: {
    nome: string;
    numero: string;
  };
}

interface ProfessorData {
  id: string;
  nome: string;
  email: string;
  especializacao?: string;
}

const diasSemana = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta'];
const horarios = [
  { codigo: 'M1', periodo: 'Manhã', inicio: '07:00', fim: '07:50' },
  { codigo: 'M2', periodo: 'Manhã', inicio: '07:50', fim: '08:40' },
  { codigo: 'M3', periodo: 'Manhã', inicio: '08:40', fim: '09:30' },
  { codigo: 'M4', periodo: 'Manhã', inicio: '09:50', fim: '10:40' },
  { codigo: 'M5', periodo: 'Manhã', inicio: '10:40', fim: '11:30' },
  { codigo: 'M6', periodo: 'Manhã', inicio: '11:30', fim: '12:20' },
  { codigo: 'T1', periodo: 'Tarde', inicio: '13:00', fim: '13:50' },
  { codigo: 'T2', periodo: 'Tarde', inicio: '13:50', fim: '14:40' },
  { codigo: 'T3', periodo: 'Tarde', inicio: '14:40', fim: '15:30' },
  { codigo: 'T4', periodo: 'Tarde', inicio: '15:50', fim: '16:40' },
  { codigo: 'T5', periodo: 'Tarde', inicio: '16:40', fim: '17:30' },
  { codigo: 'T6', periodo: 'Tarde', inicio: '17:30', fim: '18:20' },
];

export function GradeHorariosProfessor({ professorId, isOpen, onClose }: GradeHorariosProfessorProps) {
  const [professor, setProfessor] = useState<ProfessorData | null>(null);
  const [alocacoes, setAlocacoes] = useState<AlocacaoData[]>([]);
  const [loading, setLoading] = useState(true);
  const [cargaHoraria, setCargaHoraria] = useState(0);

  useEffect(() => {
    if (isOpen && professorId) {
      loadProfessorData();
      loadAlocacoes();
    }
  }, [isOpen, professorId]);

  const loadProfessorData = async () => {
    try {
      const response = await fetch(`http://localhost:3333/users/${professorId}`);
      const data = await response.json();
      setProfessor(data.user);
    } catch (error) {
      console.error('Erro ao carregar dados do professor:', error);
      toast.error('Erro ao carregar dados do professor');
    }
  };

  const loadAlocacoes = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:3333/alocacoes/professor/${professorId}`);
      const data = await response.json();
      const alocacoesData = data.alocacoes || [];
      setAlocacoes(alocacoesData);
      setCargaHoraria(alocacoesData.length);
    } catch (error) {
      console.error('Erro ao carregar alocações:', error);
      toast.error('Erro ao carregar grade de horários');
    } finally {
      setLoading(false);
    }
  };

  const getAlocacaoParaHorario = (diaSemana: string, codigoHorario: string) => {
    return alocacoes.find(
      alocacao => 
        alocacao.horario.dia_semana.toLowerCase() === diaSemana.toLowerCase() &&
        alocacao.horario.codigo === codigoHorario
    );
  };

  const formatarDisciplina = (alocacao: AlocacaoData) => {
    const codigo = alocacao.disciplina.codigo || '';
    const nome = alocacao.disciplina.nome;
    return codigo ? `${codigo}` : nome;
  };

  const getPeriodoHorario = (codigo: string) => {
    const periodos: { [key: string]: string } = {
      'M1': 'Matutino',
      'M2': 'Matutino',
      'M3': 'Matutino',
      'M4': 'Matutino',
      'M5': 'Matutino',
      'M6': 'Matutino',
      'T1': 'Vespertino',
      'T2': 'Vespertino',
      'T3': 'Vespertino',
      'T4': 'Vespertino',
      'T5': 'Vespertino',
      'T6': 'Vespertino',
      'N1': 'Noturno',
      'N2': 'Noturno',
      'N3': 'Noturno',
      'N4': 'Noturno'
    };
    return periodos[codigo] || 'Indefinido';
  };

  const getAlocacaoColor = (alocacao: any, horario: string) => {
    if (!alocacao) return '';
    
    const periodo = getPeriodoHorario(horario);
    
    switch (periodo) {
      case 'Matutino':
        return 'border-blue-200 bg-blue-50 text-blue-900 hover:bg-blue-100';
      case 'Vespertino':
        return 'border-orange-200 bg-orange-50 text-orange-900 hover:bg-orange-100';
      case 'Noturno':
        return 'border-purple-200 bg-purple-50 text-purple-900 hover:bg-purple-100';
      default:
        return 'border-gray-200 bg-gray-50 text-gray-900 hover:bg-gray-100';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="!max-w-[80vw] w-[98vw] max-h-[95vh] overflow-y-auto" showCloseButton={true}>
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Grade de Horários - {professor?.nome}</span>
            <Badge variant="outline" className="ml-4">
              Alocações: {cargaHoraria}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">Carregando grade...</span>
          </div>
        ) : (
          <Card>
            <CardContent className="p-6">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-border text-sm">
                  <thead>
                    <tr className="bg-muted/30">
                      <th className="border border-border p-3 text-left font-semibold">
                        Horário
                      </th>
                      {diasSemana.map(dia => (
                        <th key={dia} className="border border-border p-3 text-center font-semibold">
                          {dia}-feira
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {horarios.map(horario => (
                      <tr key={horario.codigo} className="hover:bg-muted/50">
                        <td className="border border-border p-3 font-medium bg-primary/10">
                          <div className="text-center">
                            <div className="font-bold text-primary text-sm">
                              {horario.codigo}
                            </div>
                            <div className="text-primary/80 text-xs">
                              {horario.inicio} - {horario.fim}
                            </div>
                          </div>
                        </td>
                        {diasSemana.map(dia => {
                          const alocacao = getAlocacaoParaHorario(dia, horario.codigo);
                          return (
                            <td key={`${dia}-${horario.codigo}`} className="border border-border p-3 min-w-[150px]">
                              {alocacao ? (
                                <div className="bg-primary/10 p-2 rounded-md border-l-4 border-primary">
                                  <div className="font-semibold text-primary mb-1">
                                    {formatarDisciplina(alocacao)}
                                  </div>
                                  <div className="text-primary text-xs mb-1 font-medium">
                                    <span className="inline-block w-2 h-2 bg-primary rounded-full mr-1"></span>
                                    {alocacao.turma.nome}
                                  </div>
                                  <div className="text-primary/80 text-xs mb-1">
                                    <span className="inline-block w-2 h-2 bg-secondary-foreground rounded-full mr-1"></span>
                                    Professor
                                  </div>
                                  <div className="text-primary/70 text-xs">
                                    <span className="inline-block w-2 h-2 bg-orange-500 rounded-full mr-1"></span>
                                    Sala {alocacao.sala.numero}
                                  </div>
                                </div>
                              ) : (
                                <div className="text-muted-foreground text-center py-4">
                                  <span className="text-xs">Livre</span>
                                </div>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Legenda */}
              <div className="mt-4 flex flex-wrap gap-4 text-xs">
                <div className="flex items-center gap-1">
                  <span className="inline-block w-2 h-2 bg-primary rounded-full"></span>
                  <span>Disciplina</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="inline-block w-2 h-2 bg-secondary-foreground rounded-full"></span>
                  <span>Professor</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="inline-block w-2 h-2 bg-orange-500 rounded-full"></span>
                  <span>Sala</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="inline-block w-3 h-3 bg-primary/10 border border-primary/30 rounded"></span>
                  <span>Aula agendada</span>
                </div>
              </div>

              {professor?.especializacao && (
                <div className="mt-4 text-sm text-gray-600">
                  <strong>Especialização:</strong> {professor.especializacao}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </DialogContent>
    </Dialog>
  );
}