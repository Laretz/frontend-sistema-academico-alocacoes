"use client";

import React, { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/main-layout";
import { GradeMensal } from "@/components/GradeMensal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Calendar, Clock, Trash2, Edit } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Disciplina {
  id: string;
  nome: string;
  carga_horaria: number;
  total_aulas: number;

  carga_horaria_atual?: number;
  data_inicio?: string;
  data_fim_prevista?: string;
  data_fim_real?: string;
  tipo_de_sala: string;
  alocacoes: Array<{
    id: string;
    horario: {
      codigo: string;
      dia_semana: string;
      horario_inicio: string;
      horario_fim: string;
    };
    sala: {
      nome: string;
      predio: string;
    };
  }>;
  modulos: Array<{
    id: string;
    data_inicio: string;
    data_fim: string;
    ativo: boolean;
    horario: {
      codigo: string;
      dia_semana: string;
      horario_inicio: string;
      horario_fim: string;
    };
    sala: {
      nome: string;
      predio: string;
    };
  }>;
}

interface Sala {
  id: string;
  nome: string;
  predio: string;
  capacidade: number;
  tipo: string;
}

interface Horario {
  id: string;
  codigo: string;
  dia_semana: string;
  horario_inicio: string;
  horario_fim: string;
}

interface NovoModulo {
  id_disciplina: string;
  id_alocacao_principal: string;
  id_sala: string;
  id_horario: string;
  data_inicio: string;
  data_fim: string;
}

export default function GradeMensalPage() {
  const [disciplinas, setDisciplinas] = useState<Disciplina[]>([]);
  const [salas, setSalas] = useState<Sala[]>([]);
  const [horarios, setHorarios] = useState<Horario[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogAberto, setDialogAberto] = useState(false);
  const [novoModulo, setNovoModulo] = useState<Partial<NovoModulo>>({});
  const [disciplinaSelecionada, setDisciplinaSelecionada] =
    useState<string>("");

  // Mock data - em produção, isso viria da API
  useEffect(() => {
    const carregarDados = async () => {
      try {
        // Simulando dados das disciplinas com módulos
        const disciplinasMock: Disciplina[] = [
          {
            id: "1",
            nome: "Matemática Aplicada",
            carga_horaria: 60,
            total_aulas: 72,
            carga_horaria_atual: 24,
            data_inicio: "2025-01-20",
            data_fim_prevista: "2025-05-20",
            data_fim_real: "2025-04-15",
            tipo_de_sala: "Sala",
            alocacoes: [
              {
                id: "1",
                horario: {
                  codigo: "M12",
                  dia_semana: "segunda",
                  horario_inicio: "07:30",
                  horario_fim: "09:10",
                },
                sala: {
                  nome: "Sala 101",
                  predio: "Bloco A",
                },
              },
              {
                id: "2",
                horario: {
                  codigo: "M12",
                  dia_semana: "quarta",
                  horario_inicio: "07:30",
                  horario_fim: "09:10",
                },
                sala: {
                  nome: "Sala 101",
                  predio: "Bloco A",
                },
              },
            ],
            modulos: [
              {
                id: "1",
                data_inicio: "2025-01-20",
                data_fim: "2025-04-15",
                ativo: true,
                horario: {
                  codigo: "M12",
                  dia_semana: "sexta",
                  horario_inicio: "07:30",
                  horario_fim: "09:10",
                },
                sala: {
                  nome: "Sala 102",
                  predio: "Bloco A",
                },
              },
            ],
          },
          {
            id: "2",
            nome: "Programação Web",
            carga_horaria: 90,
            total_aulas: 108,
            carga_horaria_atual: 32,
            data_inicio: "2025-01-22",
            data_fim_prevista: "2025-06-22",
            data_fim_real: "2025-05-10",
            tipo_de_sala: "Lab",
            alocacoes: [
              {
                id: "3",
                horario: {
                  codigo: "T34",
                  dia_semana: "terca",
                  horario_inicio: "13:30",
                  horario_fim: "15:10",
                },
                sala: {
                  nome: "Lab 201",
                  predio: "Bloco B",
                },
              },
              {
                id: "4",
                horario: {
                  codigo: "T34",
                  dia_semana: "quinta",
                  horario_inicio: "13:30",
                  horario_fim: "15:10",
                },
                sala: {
                  nome: "Lab 201",
                  predio: "Bloco B",
                },
              },
            ],
            modulos: [
              {
                id: "2",
                data_inicio: "2025-02-01",
                data_fim: "2025-05-10",
                ativo: true,
                horario: {
                  codigo: "T56",
                  dia_semana: "sexta",
                  horario_inicio: "15:30",
                  horario_fim: "17:10",
                },
                sala: {
                  nome: "Lab 202",
                  predio: "Bloco B",
                },
              },
            ],
          },
        ];

        const salasMock: Sala[] = [
          {
            id: "1",
            nome: "Sala 101",
            predio: "Bloco A",
            capacidade: 40,
            tipo: "Sala",
          },
          {
            id: "2",
            nome: "Sala 102",
            predio: "Bloco A",
            capacidade: 35,
            tipo: "Sala",
          },
          {
            id: "3",
            nome: "Lab 201",
            predio: "Bloco B",
            capacidade: 30,
            tipo: "Lab",
          },
          {
            id: "4",
            nome: "Lab 202",
            predio: "Bloco B",
            capacidade: 25,
            tipo: "Lab",
          },
        ];

        const horariosMock: Horario[] = [
          {
            id: "1",
            codigo: "M12",
            dia_semana: "segunda",
            horario_inicio: "07:30",
            horario_fim: "09:10",
          },
          {
            id: "2",
            codigo: "M12",
            dia_semana: "terca",
            horario_inicio: "07:30",
            horario_fim: "09:10",
          },
          {
            id: "3",
            codigo: "M12",
            dia_semana: "quarta",
            horario_inicio: "07:30",
            horario_fim: "09:10",
          },
          {
            id: "4",
            codigo: "M12",
            dia_semana: "quinta",
            horario_inicio: "07:30",
            horario_fim: "09:10",
          },
          {
            id: "5",
            codigo: "M12",
            dia_semana: "sexta",
            horario_inicio: "07:30",
            horario_fim: "09:10",
          },
          {
            id: "6",
            codigo: "T34",
            dia_semana: "segunda",
            horario_inicio: "13:30",
            horario_fim: "15:10",
          },
          {
            id: "7",
            codigo: "T34",
            dia_semana: "terca",
            horario_inicio: "13:30",
            horario_fim: "15:10",
          },
          {
            id: "8",
            codigo: "T34",
            dia_semana: "quarta",
            horario_inicio: "13:30",
            horario_fim: "15:10",
          },
          {
            id: "9",
            codigo: "T34",
            dia_semana: "quinta",
            horario_inicio: "13:30",
            horario_fim: "15:10",
          },
          {
            id: "10",
            codigo: "T34",
            dia_semana: "sexta",
            horario_inicio: "13:30",
            horario_fim: "15:10",
          },
          {
            id: "11",
            codigo: "T56",
            dia_semana: "segunda",
            horario_inicio: "15:30",
            horario_fim: "17:10",
          },
          {
            id: "12",
            codigo: "T56",
            dia_semana: "terca",
            horario_inicio: "15:30",
            horario_fim: "17:10",
          },
          {
            id: "13",
            codigo: "T56",
            dia_semana: "quarta",
            horario_inicio: "15:30",
            horario_fim: "17:10",
          },
          {
            id: "14",
            codigo: "T56",
            dia_semana: "quinta",
            horario_inicio: "15:30",
            horario_fim: "17:10",
          },
          {
            id: "15",
            codigo: "T56",
            dia_semana: "sexta",
            horario_inicio: "15:30",
            horario_fim: "17:10",
          },
        ];

        setDisciplinas(disciplinasMock);
        setSalas(salasMock);
        setHorarios(horariosMock);
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
      } finally {
        setLoading(false);
      }
    };

    carregarDados();
  }, []);

  const handleAdicionarModulo = async () => {
    try {
      // Em produção, isso seria uma chamada para a API
      console.log("Adicionando módulo:", novoModulo);

      // Simular adição do módulo
      const disciplinaAtualizada = disciplinas.find(
        (d) => d.id === novoModulo.id_disciplina
      );
      if (disciplinaAtualizada) {
        const novoModuloCompleto = {
          id: Date.now().toString(),
          data_inicio: novoModulo.data_inicio!,
          data_fim: novoModulo.data_fim!,
          ativo: true,
          horario: horarios.find((h) => h.id === novoModulo.id_horario)!,
          sala: salas.find((s) => s.id === novoModulo.id_sala)!,
        };

        disciplinaAtualizada.modulos.push(novoModuloCompleto);
        setDisciplinas([...disciplinas]);
      }

      setDialogAberto(false);
      setNovoModulo({});
    } catch (error) {
      console.error("Erro ao adicionar módulo:", error);
    }
  };

  const handleRemoverModulo = async (
    disciplinaId: string,
    moduloId: string
  ) => {
    try {
      // Em produção, isso seria uma chamada para a API
      console.log("Removendo módulo:", moduloId);

      const disciplina = disciplinas.find((d) => d.id === disciplinaId);
      if (disciplina) {
        disciplina.modulos = disciplina.modulos.filter(
          (m) => m.id !== moduloId
        );
        setDisciplinas([...disciplinas]);
      }
    } catch (error) {
      console.error("Erro ao remover módulo:", error);
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Carregando...</div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Cabeçalho */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Grade Mensal</h1>
            <p className="text-gray-600">
              Visualize e gerencie a programação das disciplinas
            </p>
          </div>

          <Dialog open={dialogAberto} onOpenChange={setDialogAberto}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Módulo
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Adicionar Módulo Extra</DialogTitle>
              </DialogHeader>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="disciplina">Disciplina</Label>
                  <Select
                    value={novoModulo.id_disciplina || ""}
                    onValueChange={(value) =>
                      setNovoModulo({ ...novoModulo, id_disciplina: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma disciplina" />
                    </SelectTrigger>
                    <SelectContent>
                      {disciplinas.map((disciplina) => (
                        <SelectItem key={disciplina.id} value={disciplina.id}>
                          {disciplina.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="sala">Sala</Label>
                  <Select
                    value={novoModulo.id_sala || ""}
                    onValueChange={(value) =>
                      setNovoModulo({ ...novoModulo, id_sala: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma sala" />
                    </SelectTrigger>
                    <SelectContent>
                      {salas.map((sala) => (
                        <SelectItem key={sala.id} value={sala.id}>
                          {sala.nome} - {sala.predio}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="horario">Horário</Label>
                  <Select
                    value={novoModulo.id_horario || ""}
                    onValueChange={(value) =>
                      setNovoModulo({ ...novoModulo, id_horario: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um horário" />
                    </SelectTrigger>
                    <SelectContent>
                      {horarios.map((horario) => (
                        <SelectItem key={horario.id} value={horario.id}>
                          {horario.dia_semana} - {horario.codigo} (
                          {horario.horario_inicio} - {horario.horario_fim})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="data_inicio">Data de Início</Label>
                  <Input
                    id="data_inicio"
                    type="date"
                    value={novoModulo.data_inicio || ""}
                    onChange={(e) =>
                      setNovoModulo({
                        ...novoModulo,
                        data_inicio: e.target.value,
                      })
                    }
                  />
                </div>

                <div>
                  <Label htmlFor="data_fim">Data de Fim</Label>
                  <Input
                    id="data_fim"
                    type="date"
                    value={novoModulo.data_fim || ""}
                    onChange={(e) =>
                      setNovoModulo({ ...novoModulo, data_fim: e.target.value })
                    }
                  />
                </div>

                <div className="flex gap-2 pt-4">
                  <Button
                    onClick={handleAdicionarModulo}
                    disabled={
                      !novoModulo.id_disciplina ||
                      !novoModulo.id_sala ||
                      !novoModulo.id_horario ||
                      !novoModulo.data_inicio ||
                      !novoModulo.data_fim
                    }
                    className="flex-1"
                  >
                    Adicionar
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setDialogAberto(false)}
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Grade Mensal */}
        <GradeMensal disciplinas={disciplinas} />

        {/* Gerenciamento de Módulos */}
        <Card>
          <CardHeader>
            <CardTitle>Gerenciar Módulos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {disciplinas.map((disciplina) => (
                <div key={disciplina.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-medium text-lg">{disciplina.nome}</h3>
                      <p className="text-sm text-gray-600">
                        Carga horária: {disciplina.carga_horaria}/
                        {disciplina.total_aulas}h
                      </p>
                    </div>
                    <Badge variant="outline">
                      {disciplina.modulos.filter((m) => m.ativo).length}{" "}
                      módulo(s)
                    </Badge>
                  </div>

                  {/* Alocações principais */}
                  <div className="mb-4">
                    <h4 className="font-medium text-sm mb-2">
                      Alocações Principais:
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {disciplina.alocacoes.map((alocacao) => (
                        <div
                          key={alocacao.id}
                          className="bg-blue-50 border border-blue-200 rounded p-2"
                        >
                          <div className="text-sm font-medium">
                            {alocacao.horario.dia_semana} -{" "}
                            {alocacao.horario.codigo}
                          </div>
                          <div className="text-xs text-gray-600">
                            {alocacao.sala.nome} ({alocacao.sala.predio})
                          </div>
                          <div className="text-xs text-gray-600">
                            {alocacao.horario.horario_inicio} -{" "}
                            {alocacao.horario.horario_fim}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Módulos extras */}
                  {disciplina.modulos.length > 0 && (
                    <div>
                      <h4 className="font-medium text-sm mb-2">
                        Módulos Extras:
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {disciplina.modulos
                          .filter((m) => m.ativo)
                          .map((modulo) => (
                            <div
                              key={modulo.id}
                              className="bg-orange-50 border border-orange-200 rounded p-2"
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex-1">
                                  <div className="text-sm font-medium">
                                    {modulo.horario.dia_semana} -{" "}
                                    {modulo.horario.codigo}
                                  </div>
                                  <div className="text-xs text-gray-600">
                                    {modulo.sala.nome} ({modulo.sala.predio})
                                  </div>
                                  <div className="text-xs text-gray-600">
                                    {modulo.horario.horario_inicio} -{" "}
                                    {modulo.horario.horario_fim}
                                  </div>
                                  <div className="text-xs text-gray-600">
                                    {format(
                                      new Date(modulo.data_inicio),
                                      "dd/MM/yyyy",
                                      { locale: ptBR }
                                    )}{" "}
                                    -{" "}
                                    {format(
                                      new Date(modulo.data_fim),
                                      "dd/MM/yyyy",
                                      { locale: ptBR }
                                    )}
                                  </div>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    handleRemoverModulo(
                                      disciplina.id,
                                      modulo.id
                                    )
                                  }
                                  className="text-red-600 hover:text-red-800"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
