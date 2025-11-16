"use client";

import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/main-layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Brain, AlertTriangle, Play, Calendar, Eye, Search, Filter } from "lucide-react";
import { gerarHorarioConsolidadoPorDisciplina } from "@/utils/horario-consolidado";
import { toast } from "sonner";
import { turmaService, disciplinaService, cursoService, alocacaoService, professorDisciplinaService, salaService, horarioService } from "@/services/entities";
import { Turma, Disciplina } from "@/types/entities";
import { GradeHorariosTurma } from "@/components/GradeHorariosTurma";
import { api } from "@/lib/api";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

// Função para mapear códigos de horário para horários de início e fim
const getTimeInfo = (
  timeString: string
): { code: string; startTime: string; endTime: string } => {
  // Formato esperado: "07:00 - 07:50 M1" ou "M1"
  const parts = timeString.trim().split(" ");

  if (parts.length >= 3) {
    // Formato: "07:00 - 07:50 M1"
    const code = parts[parts.length - 1]; // Último elemento é o código
    const startTime = parts[0];
    const endTime = parts[2];
    return { code, startTime, endTime };
  } else {
    // Formato: "M1" - mapear para horários corretos
    const code = timeString;
    const timeMap: { [key: string]: { start: string; end: string } } = {
      M1: { start: "07:00", end: "07:50" },
      M2: { start: "07:50", end: "08:40" },
      M3: { start: "08:55", end: "09:45" },
      M4: { start: "09:45", end: "10:35" },
      M5: { start: "10:50", end: "11:40" },
      M6: { start: "11:40", end: "12:30" },
      T1: { start: "13:00", end: "13:50" },
      T2: { start: "13:50", end: "14:40" },
      T3: { start: "14:55", end: "15:45" },
      T4: { start: "15:45", end: "16:35" },
      T5: { start: "16:50", end: "17:40" },
      T6: { start: "17:40", end: "18:30" },
      N1: { start: "19:00", end: "19:50" },
      N2: { start: "19:50", end: "20:40" },
      N3: { start: "20:55", end: "21:45" },
      N4: { start: "21:45", end: "22:35" },
    };

    const timeInfo = timeMap[code] || { start: "00:00", end: "00:50" };
    return { code, startTime: timeInfo.start, endTime: timeInfo.end };
  }
};

export default function AlocacaoAutomaticaPage() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [disciplinas, setDisciplinas] = useState<Disciplina[]>([]);
  const [selectedTurmaId, setSelectedTurmaId] = useState<string>("");
const [selectedTurma, setSelectedTurma] = useState<Turma | null>(null);
const [allCursoDisciplinas, setAllCursoDisciplinas] = useState<Disciplina[]>([]);
const [mostrarTodasOfertas, setMostrarTodasOfertas] = useState(false);
  const [selectedDisciplinas, setSelectedDisciplinas] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [showGrade, setShowGrade] = useState(false);
  const [generatedTurma, setGeneratedTurma] = useState<Turma | null>(null);
  const [previewData, setPreviewData] = useState<any>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [isGeneratingPreview, setIsGeneratingPreview] = useState(false);
  
  // Estados para filtros
  const [selectedSemestre, setSelectedSemestre] = useState<string>("todos");
  const [searchTerm, setSearchTerm] = useState<string>("");

  // Estado para vínculos curso-disciplina do curso selecionado
  const [cursoDisciplinaVinculos, setCursoDisciplinaVinculos] = useState<Array<{ id: string; id_curso: string; id_disciplina: string }>>([]);
  const [advancedMode, setAdvancedMode] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmSummary, setConfirmSummary] = useState<{ total: number; valid: number; discarded: number; conflicts: Array<{ disciplinaId: string; professorId: string; salaId: string; horarioId: string; reason: string }>; validGroups: Array<{ disciplinaId: string; professorId: string; salaId: string; horarios: string[] }> }>({ total: 0, valid: 0, discarded: 0, conflicts: [], validGroups: [] });

// Recalcula a lista exibida de disciplinas quando alterna "Mostrar todas" ou muda vínculos
useEffect(() => {
  const vinculoIds = new Set((cursoDisciplinaVinculos || []).map(v => v.id_disciplina));
  const base = mostrarTodasOfertas
    ? allCursoDisciplinas
    : allCursoDisciplinas.filter(d => vinculoIds.has(d.id));
  setDisciplinas(base);
  // Remover seleções que não existem mais na lista
  setSelectedDisciplinas(prev => prev.filter(id => base.some(d => d.id === id)));
}, [mostrarTodasOfertas, allCursoDisciplinas, cursoDisciplinaVinculos]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const turmasData = await turmaService.getAll(1, 100);
      setTurmas(turmasData?.turmas || []);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      toast.error("Erro ao carregar dados");
      setTurmas([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchDisciplinasByCurso = async (cursoId: string) => {
    try {
      // Carregar disciplinas do curso via cursoService (fonte: cursoDisciplina)
      const disciplinasData = await cursoService.getDisciplinas(cursoId);
      // Carregar vínculos curso-disciplina para mapear id_disciplina -> id_curso_disciplina
      const { vinculos } = await cursoService.getDisciplinaVinculos(cursoId);
      const vinculoIds = new Set((vinculos || []).map((v) => v.id_disciplina));
      // Guardar todas as disciplinas do curso
      setAllCursoDisciplinas(disciplinasData?.disciplinas || []);
      setCursoDisciplinaVinculos(vinculos || []);
      // Exibir vinculadas ou todas conforme toggle
      const base = mostrarTodasOfertas
        ? (disciplinasData?.disciplinas || [])
        : (disciplinasData?.disciplinas || []).filter((d: Disciplina) => vinculoIds.has(d.id));
      setDisciplinas(base);
    } catch (error) {
      console.error("Erro ao carregar disciplinas/vínculos:", error);
      toast.error("Erro ao carregar disciplinas/vínculos");
      setDisciplinas([]);
      setCursoDisciplinaVinculos([]);
      setAllCursoDisciplinas([]);
    }
  };

  const handleDisciplinaToggle = (disciplinaId: string) => {
    setSelectedDisciplinas((prev) =>
      prev.includes(disciplinaId)
        ? prev.filter((id) => id !== disciplinaId)
        : [...prev, disciplinaId]
    );
  };

  // Função para filtrar disciplinas
  const getFilteredDisciplinas = () => {
    return disciplinas.filter((disciplina) => {
      const matchesSemestre = selectedSemestre === "todos" || disciplina.semestre?.toString() === selectedSemestre;
      const matchesSearch = !searchTerm || 
        disciplina.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        disciplina.codigo?.toLowerCase().includes(searchTerm.toLowerCase());
      
      return matchesSemestre && matchesSearch;
    });
  };

  // Função para agrupar disciplinas por semestre
  const getDisciplinasGroupedBySemestre = () => {
    const disciplinasFiltradas = getFilteredDisciplinas();
    const grouped = disciplinasFiltradas.reduce((acc, disciplina) => {
      const semestre = disciplina.semestre?.toString() || "1";
      if (!acc[semestre]) {
        acc[semestre] = [];
      }
      acc[semestre].push(disciplina);
      return acc;
    }, {} as Record<string, Disciplina[]>);

    // Ordenar semestres e retornar estrutura
    const sortedSemestres = Object.keys(grouped).sort((a, b) => parseInt(a) - parseInt(b));
    return sortedSemestres.map(semestre => ({
      semestre,
      disciplinas: grouped[semestre]
    }));
  };

  // Função para selecionar todas as disciplinas filtradas
  const handleSelectAll = () => {
    const disciplinasFiltradas = getFilteredDisciplinas();
    const allSelected = disciplinasFiltradas.every(d => selectedDisciplinas.includes(d.id));
    
    if (allSelected) {
      // Desmarcar todas as disciplinas filtradas
      setSelectedDisciplinas(prev => 
        prev.filter(id => !disciplinasFiltradas.some(d => d.id === id))
      );
    } else {
      // Selecionar todas as disciplinas filtradas
      const newSelections = disciplinasFiltradas.map(d => d.id);
      setSelectedDisciplinas(prev => {
        const combined = [...prev, ...newSelections];
        return [...new Set(combined)]; // Remove duplicatas
      });
    }
  };

  // Função para selecionar todas as disciplinas de um semestre
  const handleSelectSemestre = (disciplinasSemestre: Disciplina[]) => {
    const allSelected = disciplinasSemestre.every(d => selectedDisciplinas.includes(d.id));
    
    if (allSelected) {
      // Desmarcar todas as disciplinas do semestre
      setSelectedDisciplinas(prev => 
        prev.filter(id => !disciplinasSemestre.some(d => d.id === id))
      );
    } else {
      // Selecionar todas as disciplinas do semestre
      const newSelections = disciplinasSemestre.map(d => d.id);
      setSelectedDisciplinas(prev => {
        const combined = [...prev, ...newSelections];
        return [...new Set(combined)]; // Remove duplicatas
      });
     }
   };

  const handleGeneratePreview = async () => {
    if (!selectedTurmaId || selectedDisciplinas.length === 0) {
      toast.error("Selecione uma turma e pelo menos uma oferta do curso");
      return;
    }

    setIsGeneratingPreview(true);
    try {
      // Pré-validações básicas (curso da turma, salas e horários)
      const turmaObj = selectedTurma;
      const cursoId = turmaObj?.id_curso;
      if (!cursoId) {
        throw new Error("Turma selecionada sem curso associado");
      }

      // Salas
      const salasResp = await salaService.getAll(1);
      if (!salasResp?.salas?.length) {
        throw new Error("Nenhuma sala cadastrada. Cadastre salas para prosseguir.");
      }

      // Horários
      const horariosResp = await horarioService.getAll();
      if (!horariosResp?.length) {
        throw new Error("Nenhum horário cadastrado. Cadastre horários para prosseguir.");
      }

      // Opcional: verificar professores do curso (não bloqueante)
      try {
        const { data: usuariosCursoResp } = await api.get(`/user-curso/usuarios/${cursoId}`);
        const professoresDoCurso = (usuariosCursoResp?.usuarios || []).filter((u: any) => u.role === "PROFESSOR");
        if (!professoresDoCurso.length) {
          toast.warning("Nenhum professor vinculado ao curso da turma. O preview pode falhar. Vincule professores ao curso.");
        }
      } catch (e) {
        console.warn("Aviso: falha ao verificar professores do curso (prosseguindo):", e);
      }

      // Mapear disciplinas selecionadas para cursoDisciplinaIds
      const cursoDisciplinaIds = selectedDisciplinas
        .map((disciplinaId) =>
          cursoDisciplinaVinculos.find(
            (v) => v.id_disciplina === disciplinaId && v.id_curso === cursoId
          )?.id
        )
        .filter((id): id is string => Boolean(id));

      if (cursoDisciplinaIds.length === 0) {
        throw new Error(
          "Nenhuma oferta vinculada ao curso foi selecionada. Vincule ou confirme para criar vínculos."
        );
      }
      if (cursoDisciplinaIds.length !== selectedDisciplinas.length) {
        toast.warning(
          "Algumas ofertas selecionadas não possuem vínculo com o curso. Elas serão ignoradas no preview; o vínculo será criado automaticamente ao confirmar."
        );
      }

      const { data: result } = await api.post(
        "/alocacoes/genetica/preview",
        {
          turmaId: selectedTurmaId,
          cursoDisciplinaIds,
          params: {
            populationSize: 50,
            generations: 100,
            mutationRate: 0.1,
            crossoverRate: 0.8,
            elitismRate: 0.1,
          }
        }
      );

      console.log("Resposta do preview:", result);

      if (!result.success) {
        throw new Error(result.message || result.error || "Falha na geração do preview");
      }

      if (!result.data) {
        throw new Error("Dados do preview não encontrados na resposta");
      }

      setPreviewData(result.data);
      setShowPreview(true);
      toast.success("Preview gerado com sucesso!");
    } catch (error: any) {
      console.error("Erro ao gerar preview:", error);
      const status = error?.response?.status;
      const serverMsg = error?.response?.data?.message || error?.response?.data?.error;
      if (status === 400) {
        toast.error(
          "Sem disponibilidade de horários no turno selecionado ou restrições inviabilizaram a alocação. Ajuste professores/salas/horários e tente novamente."
        );
      } else {
        toast.error(serverMsg || (error instanceof Error ? error.message : "Erro ao gerar preview"));
      }
    } finally {
      setIsGeneratingPreview(false);
    }
  };

  // Utilitário: calcula conflitos locais e grupos válidos (usa selectedTurma atual)
  const computeValidGroupsAndConflicts = (allocations: Array<{ disciplinaId: string; professorId: string; salaId: string; horarioId: string }>, selectedTurmaId: string) => {
    type GroupKey = string;
    const groups: Record<GroupKey, { disciplinaId: string; professorId: string; salaId: string; horarios: string[] }> = {};

    const profHorarioMap = new Map<string, Array<{ disciplinaId: string; professorId: string; salaId: string; horarioId: string }>>();
    const salaHorarioMap = new Map<string, Array<{ disciplinaId: string; professorId: string; salaId: string; horarioId: string }>>();
    const turmaHorarioMap = new Map<string, Array<{ disciplinaId: string; professorId: string; salaId: string; horarioId: string }>>();

    for (const aloc of allocations) {
      const key: GroupKey = `${aloc.disciplinaId}-${aloc.professorId}-${aloc.salaId}`;
      if (!groups[key]) {
        groups[key] = { disciplinaId: aloc.disciplinaId, professorId: aloc.professorId, salaId: aloc.salaId, horarios: [] };
      }
      if (!groups[key].horarios.includes(aloc.horarioId)) {
        groups[key].horarios.push(aloc.horarioId);
      }

      const profKey = `${aloc.professorId}-${aloc.horarioId}`;
      const salaKey = `${aloc.salaId}-${aloc.horarioId}`;
      const turmaKey = `${selectedTurmaId}-${aloc.horarioId}`;
      if (!profHorarioMap.has(profKey)) profHorarioMap.set(profKey, []);
      if (!salaHorarioMap.has(salaKey)) salaHorarioMap.set(salaKey, []);
      if (!turmaHorarioMap.has(turmaKey)) turmaHorarioMap.set(turmaKey, []);
      profHorarioMap.get(profKey)!.push(aloc);
      salaHorarioMap.get(salaKey)!.push(aloc);
      turmaHorarioMap.get(turmaKey)!.push(aloc);
    }

    const conflicts: Array<{ disciplinaId: string; professorId: string; salaId: string; horarioId: string; reason: string }> = [];
    const conflictSet = new Set<string>();

    const pushConflictsFromMap = (map: Map<string, Array<{ disciplinaId: string; professorId: string; salaId: string; horarioId: string }>>, reason: string) => {
      for (const [, list] of map) {
        if (list.length > 1) {
          for (const item of list) {
            const id = `${item.disciplinaId}-${item.professorId}-${item.salaId}-${item.horarioId}-${reason}`;
            if (!conflictSet.has(id)) {
              conflictSet.add(id);
              conflicts.push({ disciplinaId: item.disciplinaId, professorId: item.professorId, salaId: item.salaId, horarioId: item.horarioId, reason });
            }
          }
        }
      }
    };

    pushConflictsFromMap(profHorarioMap, "professor-horario");
    pushConflictsFromMap(salaHorarioMap, "sala-horario");
    pushConflictsFromMap(turmaHorarioMap, "turma-horario");

    const conflictHorarioSet = new Set<string>(conflicts.map(c => `${c.professorId}-${c.salaId}-${c.horarioId}`));
    const validGroups: Array<{ disciplinaId: string; professorId: string; salaId: string; horarios: string[] }> = [];
    for (const g of Object.values(groups)) {
      const validHorarios = g.horarios.filter(h => !conflictHorarioSet.has(`${g.professorId}-${g.salaId}-${h}`));
      if (validHorarios.length > 0) {
        validGroups.push({ ...g, horarios: validHorarios });
      }
    }

    const total = allocations.length;
    const valid = validGroups.reduce((acc, g) => acc + g.horarios.length, 0);
    const discarded = total - valid;

    return { validGroups, conflicts, total, valid, discarded };
  };

  // Confirmação final (após modal) - envia apenas válidas
  const handleConfirmSubmit = async () => {
    if (!selectedTurmaId || !previewData) return;

    try {
      setIsGenerating(true);
      const turmaObj = turmas.find((t) => t.id === selectedTurmaId);
      const cursoId = turmaObj?.id_curso;
      if (!cursoId) throw new Error("Turma selecionada sem curso associado");

      const requests = confirmSummary.validGroups.map(async (g) => {
        let vinculo = cursoDisciplinaVinculos.find(
          (v) => v.id_disciplina === g.disciplinaId && v.id_curso === cursoId
        );
        // Se não houver vínculo curso-disciplina, criar automaticamente e atualizar lista
        if (!vinculo) {
          try {
            await cursoService.vincularDisciplina(cursoId, g.disciplinaId);
            const { vinculos: novosVinculos } = await cursoService.getDisciplinaVinculos(cursoId);
            setCursoDisciplinaVinculos(novosVinculos || []);
            vinculo = (novosVinculos || []).find((v) => v.id_disciplina === g.disciplinaId && v.id_curso === cursoId) || vinculo;
          } catch (err) {
            console.error("Erro ao vincular disciplina ao curso automaticamente:", err);
            throw new Error(`Falha ao vincular disciplina ao curso: ${g.disciplinaId}`);
          }
        }
        if (!vinculo) {
          throw new Error(`Disciplina sem vínculo com o curso: ${g.disciplinaId}`);
        }

        // Garantir vínculo professor-disciplina (ignora 409 caso já exista)
        try {
          await professorDisciplinaService.vincular({ id_user: g.professorId, id_disciplina: g.disciplinaId });
        } catch (err: any) {
          if (err?.response?.status !== 409) {
            console.warn("Falha ao criar vínculo professor-disciplina (prosseguindo):", err);
          }
        }

        const payload = {
          id_user: g.professorId,
          id_curso_disciplina: vinculo.id,
          id_turma: selectedTurmaId,
          id_sala: g.salaId,
          id_horarios: g.horarios,
        };

        try {
          const resp = await api.post('/alocacoes', payload);
          return { status: 201, data: resp.data };
        } catch (err: any) {
          const status = err?.response?.status;
          if (status === 409) {
            return { status, data: err.response?.data };
          }
          throw err;
        }
      });

      const results = await Promise.allSettled(requests);
      let createdCount = 0;
      let backendConflicts: any[] = [];
      for (const r of results) {
        if (r.status === "fulfilled") {
          const value: any = r.value;
          if (value.status === 201) {
            createdCount += Array.isArray(value.data?.alocacoes) ? value.data.alocacoes.length : 0;
          } else if (value.status === 409) {
            backendConflicts.push(...(value.data?.conflitos || []));
          }
        } else {
          console.error("Falha ao criar alocações:", r.reason);
        }
      }

      toast.success(`Criadas ${createdCount} alocação(ões). Conflitos locais: ${confirmSummary.discarded}. Conflitos backend: ${backendConflicts.length}.`);

      setConfirmOpen(false);
      setShowPreview(false);
      setPreviewData(null);
      // TODO: disparar refresh da grade (pendente)
    } catch (error) {
      console.error("Erro ao confirmar após resumo:", error);
      const errMsg = (error as any)?.response?.data?.message || (error as Error)?.message || "Erro ao confirmar alocações";
      toast.error(errMsg);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleConfirmAllocations = async () => {
    if (!showPreview || !previewData) {
      toast.error("Gere o preview antes de confirmar");
      return;
    }
    if (!selectedTurmaId) {
      toast.error("Selecione uma turma antes de confirmar");
      return;
    }

    try {
      setIsGenerating(true);

      const turmaObj = turmas.find((t) => t.id === selectedTurmaId);
      const cursoId = turmaObj?.id_curso;
      if (!cursoId) {
        throw new Error("Turma selecionada sem curso associado");
      }

      const allocations: Array<{ disciplinaId: string; professorId: string; salaId: string; horarioId: string }> = previewData.allocations || [];
      if (!Array.isArray(allocations) || allocations.length === 0) {
        throw new Error("Nenhuma alocação encontrada no preview");
      }

      // Se modo avançado, calcular resumo e abrir modal
      if (advancedMode) {
        const summary = computeValidGroupsAndConflicts(allocations, selectedTurmaId);
        setConfirmSummary({
          total: summary.total,
          valid: summary.valid,
          discarded: summary.discarded,
          conflicts: summary.conflicts,
          validGroups: summary.validGroups,
        });
        setConfirmOpen(true);
        return; // aguardar confirmação do usuário
      }

      // Modo simples: enviar tudo como está (sem modal)
      type GroupKey = string;
      const groups: Record<GroupKey, {
        disciplinaId: string;
        professorId: string;
        salaId: string;
        horarios: string[];
      }> = {};

      for (const aloc of allocations) {
        const key: GroupKey = `${aloc.disciplinaId}-${aloc.professorId}-${aloc.salaId}`;
        if (!groups[key]) {
          groups[key] = { disciplinaId: aloc.disciplinaId, professorId: aloc.professorId, salaId: aloc.salaId, horarios: [] };
        }
        if (!groups[key].horarios.includes(aloc.horarioId)) {
          groups[key].horarios.push(aloc.horarioId);
        }
      }

      const requests = Object.values(groups).map(async (g) => {
        let vinculo = cursoDisciplinaVinculos.find(
          (v) => v.id_disciplina === g.disciplinaId && v.id_curso === cursoId
        );
        // Se não houver vínculo curso-disciplina, criar automaticamente e atualizar lista
        if (!vinculo) {
          try {
            await cursoService.vincularDisciplina(cursoId, g.disciplinaId);
            const { vinculos: novosVinculos } = await cursoService.getDisciplinaVinculos(cursoId);
            setCursoDisciplinaVinculos(novosVinculos || []);
            vinculo = (novosVinculos || []).find((v) => v.id_disciplina === g.disciplinaId && v.id_curso === cursoId) || vinculo;
          } catch (err) {
            console.error("Erro ao vincular disciplina ao curso automaticamente:", err);
            throw new Error(`Falha ao vincular disciplina ao curso: ${g.disciplinaId}`);
          }
        }
        if (!vinculo) {
          throw new Error(`Disciplina sem vínculo com o curso: ${g.disciplinaId}`);
        }

        // Garantir vínculo professor-disciplina (ignora 409 caso já exista)
        try {
          await professorDisciplinaService.vincular({ id_user: g.professorId, id_disciplina: g.disciplinaId });
        } catch (err: any) {
          if (err?.response?.status !== 409) {
            console.warn("Falha ao criar vínculo professor-disciplina (prosseguindo):", err);
          }
        }

        const payload = {
          id_user: g.professorId,
          id_curso_disciplina: vinculo.id,
          id_turma: selectedTurmaId,
          id_sala: g.salaId,
          id_horarios: g.horarios,
        };

        // Usar axios API que injeta automaticamente Authorization: Bearer <token>
        const resp = await api.post('/alocacoes', payload);
        return resp.data;
      });

      const results = await Promise.all(requests);
      console.log("Criação de alocações concluída:", results);
      toast.success("Alocações criadas com sucesso!");

      setShowPreview(false);
      setPreviewData(null);
    } catch (error) {
      console.error("Erro ao confirmar alocações:", error);
      const errMsg = (error as any)?.response?.data?.message || (error as Error)?.message || "Erro ao confirmar alocações";
      toast.error(errMsg);
    } finally {
      setIsGenerating(false);
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
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <Brain className="h-8 w-8 text-blue-600" />
              Alocação Automática
            </h1>
            <p className="text-muted-foreground">
              Selecione uma turma e ofertas (Disciplinas do curso) para gerar alocações
              automaticamente
            </p>
          </div>
        </div>

        {/* Form */}
        <Card>
          <CardHeader>
            <CardTitle>Configurar Alocação</CardTitle>
            <CardDescription>
              Escolha a turma e as ofertas (Disciplinas do curso) que deseja alocar automaticamente
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Seleção de Turma */}
            <div className="space-y-2">
              <Label htmlFor="turma">Turma</Label>
              <Select 
                value={selectedTurmaId} 
                onValueChange={(value) => {
                  setSelectedTurmaId(value);
                  setSelectedDisciplinas([]); // Limpar disciplinas selecionadas
                  const turma = turmas.find(t => t.id === value) || null;
                  setSelectedTurma(turma);
                  if (turma && turma.id_curso) {
                    fetchDisciplinasByCurso(turma.id_curso);
                  } else {
                    setDisciplinas([]);
                    setCursoDisciplinaVinculos([]);
                    setAllCursoDisciplinas([]);
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma turma" />
                </SelectTrigger>
                <SelectContent>
                  {turmas.map((turma) => (
                    <SelectItem key={turma.id} value={turma.id}>
                      {turma.nome} - {turma.turno} ({turma.num_alunos} alunos)
                      {turma.curso && (
                        <span className="text-muted-foreground ml-2">
                          - {turma.curso.nome}
                        </span>
                      )}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Seleção de Disciplinas */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Ofertas (Disciplinas do curso) {selectedTurma && disciplinas.length > 0 && (
                  <span className="text-muted-foreground text-sm">
                    ({disciplinas.length} disponíveis para esta turma)
                  </span>
                )}</Label>
                {selectedTurma && disciplinas.length > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSelectAll}
                    className="flex items-center gap-2"
                  >
                    <Filter className="h-4 w-4" />
                    {getFilteredDisciplinas().every(d => selectedDisciplinas.includes(d.id)) ? 'Desmarcar Todas' : 'Selecionar Todas'}
                  </Button>
                )}
              </div>
              
              {!selectedTurma ? (
                <div className="text-center py-8 text-muted-foreground">
                  Selecione uma turma para ver as ofertas (Disciplinas do curso) disponíveis
                </div>
              ) : disciplinas.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Nenhuma oferta (Disciplinas do curso) encontrada para esta turma
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Filtros */}
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input
                          placeholder="Buscar ofertas..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>
                    <div className="w-full sm:w-48">
                      <Select value={selectedSemestre} onValueChange={setSelectedSemestre}>
                        <SelectTrigger>
                          <SelectValue placeholder="Filtrar por semestre" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="todos">Todos os semestres</SelectItem>
                          {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                            <SelectItem key={sem} value={sem.toString()}>
                              {sem}º Semestre
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      </div>
                      <div className="flex items-center gap-2">
                        <Checkbox id="mostrarTodasOfertas" checked={mostrarTodasOfertas} onCheckedChange={() => setMostrarTodasOfertas((v) => !v)} />
                        <Label htmlFor="mostrarTodasOfertas">Ofertas do curso</Label>
                      </div>
                    </div>
                  </div>
                  
                  {/* Disciplinas agrupadas por semestre */}
                  <div className="max-h-64 overflow-y-auto border rounded-lg p-4 space-y-6">
                    {getDisciplinasGroupedBySemestre().map(({ semestre, disciplinas: disciplinasSemestre }) => (
                      <div key={semestre} className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-base flex items-center gap-2">
                            <Badge variant="outline">{semestre}º Semestre</Badge>
                            <span className="text-sm text-muted-foreground">({disciplinasSemestre.length} disciplinas)</span>
                          </h4>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleSelectSemestre(disciplinasSemestre)}
                            className="text-xs"
                          >
                            {disciplinasSemestre.every(d => selectedDisciplinas.includes(d.id)) ? 'Desmarcar' : 'Selecionar'} Semestre
                          </Button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pl-4">
                          {disciplinasSemestre.map((disciplina) => (
                            <div
                              key={disciplina.id}
                              className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-muted/50"
                            >
                              <Checkbox
                                id={disciplina.id}
                                checked={selectedDisciplinas.includes(disciplina.id)}
                                onCheckedChange={() =>
                                  handleDisciplinaToggle(disciplina.id)
                                }
                              />
                              <div className="flex-1 min-w-0">
                                <Label
                                  htmlFor={disciplina.id}
                                  className="text-sm font-medium cursor-pointer"
                                >
                                  {disciplina.nome}
                                </Label>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  <Badge variant="secondary" className="text-xs">
                                    {disciplina.carga_horaria}
                                  </Badge>
                                  <Badge variant="outline" className="text-xs">
                                    {disciplina.tipo_de_sala}
                                  </Badge>
                                  {disciplina.horario_consolidado && (
                                    <Badge
                                      variant="default"
                                      className="text-xs bg-primary/10 text-primary"
                                    >
                                      {disciplina.horario_consolidado}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedDisciplinas.length > 0 && (
                <div className="space-y-3">
                  <div className="text-sm text-muted-foreground">
                    {selectedDisciplinas.length} oferta(s) selecionada(s)
                  </div>

                  {/* Horários Consolidados das Ofertas Selecionadas */}
                  <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 p-3 rounded-lg">
                    <h4 className="text-sm font-medium text-blue-700 dark:text-blue-300 mb-2">
                      Horários Consolidados:
                    </h4>
                    <div className="space-y-1">
                      {selectedDisciplinas.map((disciplinaId) => {
                        const disciplina = disciplinas.find(
                          (d) => d.id === disciplinaId
                        );
                        if (!disciplina) return null;
                        return (
                          <div
                            key={disciplinaId}
                            className="flex justify-between items-center text-sm"
                          >
                            <span className="text-blue-700 dark:text-blue-300 font-medium">
                              {disciplina.nome}:
                            </span>
                            <span className="text-blue-600 dark:text-blue-400">
                              {disciplina.horario_consolidado ||
                                "Será gerado automaticamente"}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Botões de Ação */}
            <div className="space-y-3 pt-4">
              <Button
                onClick={handleGeneratePreview}
                disabled={
                  !selectedTurmaId ||
                  selectedDisciplinas.length === 0 ||
                  isGeneratingPreview
                }
                className="w-full bg-blue-600 hover:bg-blue-700 text-white border-blue-600 hover:border-blue-700"
                variant="default"
              >
                {isGeneratingPreview ? (
                  <>
                    <Play className="mr-2 h-4 w-4 animate-spin" />
                    Gerando Preview...
                  </>
                ) : (
                  "Gerar Preview das Alocações"
                )}
              </Button>

              {showPreview && previewData && (
                <Button
                  onClick={handleConfirmAllocations}
                  disabled={isGenerating}
                  className="w-full bg-blue-700 hover:bg-blue-800 text-white"
                >
                  {isGenerating ? (
                    <>
                      <Play className="mr-2 h-4 w-4 animate-spin" />
                      Criando Alocações...
                    </>
                  ) : (
                    "Confirmar e Criar Alocações"
                  )}
                </Button>
              )}
              {/* Toggle modo avançado */}
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Checkbox id="advancedMode" checked={advancedMode} onCheckedChange={() => setAdvancedMode((v) => !v)} />
                <Label htmlFor="advancedMode">Modo avançado (validar conflitos e confirmar resumo)</Label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Alert */}
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Como funciona:</strong> Selecione uma turma e as disciplinas
            que deseja alocar. O sistema irá gerar automaticamente os melhores
            horários considerando a disponibilidade de salas e professores.
          </AlertDescription>
        </Alert>

        {/* Preview das Alocações */}
        {showPreview && previewData && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Preview das Alocações
              </CardTitle>
              <CardDescription>
                Revise as alocações geradas antes de confirmar a criação
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Estatísticas do Preview */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-primary/10 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-primary">
                      {previewData.allocations?.length || 0}
                    </div>
                    <div className="text-sm text-primary">
                      Alocações Geradas
                    </div>
                  </div>
                  <div className="bg-secondary/50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-secondary-foreground">
                      {previewData.fitness?.toFixed(2) || 0}
                    </div>
                    <div className="text-sm text-secondary-foreground">
                      Score de Qualidade
                    </div>
                  </div>
                  <div className="bg-orange-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">
                      {previewData.conflicts?.length || 0}
                    </div>
                    <div className="text-sm text-orange-600">
                      Conflitos Detectados
                    </div>
                  </div>
                </div>

                {/* Tabela de Disciplinas da Turma */}
                {previewData.allocations &&
                  previewData.allocations.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold mb-4">
                        Disciplinas da Turma
                      </h3>
                      <div className="overflow-x-auto">
                        <table className="w-full border border-border">
                  <thead className="bg-muted/30">
                            <tr>
                              <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground uppercase border-r border-border">
                                Código
                              </th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground uppercase border-r border-border">
                                Prefixo
                              </th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground uppercase border-r border-border">
                                Disciplina
                              </th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground uppercase border-r border-border">
                                CH
                              </th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground uppercase border-r border-border">
                                Horário
                              </th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground uppercase border-r border-border">
                                Professor
                              </th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground uppercase border-r border-border">
                                Local
                              </th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground uppercase border-r border-border">
                                Vagas
                              </th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground uppercase border-r border-border">
                                Demanda
                              </th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground uppercase">
                                Status
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-background divide-y divide-border">
                            {previewData.allocations
                              .reduce((unique: any[], allocation: any) => {
                                const exists = unique.find(
                                  (item) =>
                                    item.disciplina?.codigo ===
                                    allocation.disciplina?.codigo
                                );
                                if (!exists) unique.push(allocation);
                                return unique;
                              }, [])
                              .map((allocation: any, index: number) => {
                                const horarioConsolidado =
                                  gerarHorarioConsolidadoPorDisciplina(
                                    previewData.allocations,
                                    allocation.disciplina?.id
                                  ) || "-";
                                return (
                                  <tr
                                    key={allocation.disciplina?.codigo || index}
                                    className={index % 2 === 0 ? "bg-background" : "bg-muted/30"}
                                  >
                                    <td className="px-3 py-2 text-sm font-medium text-foreground border-r border-border">
                                      {allocation.disciplina?.codigo || "---"}
                                    </td>
                                    <td className="px-3 py-2 border-r">
                                      <Badge variant="outline" className="font-mono text-xs">---</Badge>
                                    </td>
                                    <td className="px-3 py-2 text-sm text-foreground border-r border-border max-w-xs">
                                      {allocation.disciplina?.nome || "---"}
                                    </td>
                                    <td className="px-3 py-2 text-sm text-foreground border-r border-border">
                                      {allocation.disciplina?.carga_horaria ? `${allocation.disciplina.carga_horaria}h` : "---"}
                                    </td>
                                    <td className="px-3 py-2 text-sm text-foreground font-mono border-r border-border">
                                      {horarioConsolidado}
                                    </td>
                                    <td className="px-3 py-2 text-sm text-foreground border-r">
                                      {allocation.professor?.nome || "---"}
                                    </td>
                                    <td className="px-3 py-2 text-sm text-foreground border-r">
                                      {allocation.sala ? `${allocation.sala.predio?.nome || "Sem prédio"}, ${allocation.sala.nome}` : "---"}
                                    </td>
                                    <td className="px-3 py-2 text-sm text-foreground border-r">
                                      {selectedTurma?.num_alunos || "---"}
                                    </td>
                                    <td className="px-3 py-2 text-sm text-foreground border-r">
                                      {selectedTurma?.num_alunos || "---"}
                                    </td>
                                    <td className="px-3 py-2">
                                      <Badge className="bg-secondary/50 text-secondary-foreground">Adequada</Badge>
                                    </td>
                                  </tr>
                                );
                              })}
                          </tbody>
                                </table>
                              </div>
                            </div>
                          )}

                {/* Grade de Horários do Preview */}
                {previewData.schedule && (
                  <div>
                    <h3 className="text-lg font-semibold mb-4">
                      Grade Semanal de Horários
                    </h3>
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse border border-border text-sm">
                        <thead>
                          <tr className="bg-muted/30">
                            <th className="border border-border p-3 text-left font-semibold">
                              Horário
                            </th>
                            <th className="border border-border p-3 text-center font-semibold">
                              Segunda-feira
                            </th>
                            <th className="border border-border p-3 text-center font-semibold">
                              Terça-feira
                            </th>
                            <th className="border border-border p-3 text-center font-semibold">
                              Quarta-feira
                            </th>
                            <th className="border border-border p-3 text-center font-semibold">
                              Quinta-feira
                            </th>
                            <th className="border border-border p-3 text-center font-semibold">
                              Sexta-feira
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {previewData.schedule.map(
                            (row: any, index: number) => (
                              <tr key={index} className="hover:bg-muted/50">
                                <td className="border border-border p-3 font-medium bg-primary/10">
                                  <div className="text-center">
                                    {(() => {
                                      const timeInfo = getTimeInfo(row.time);
                                      return (
                                        <>
                                          <div className="font-bold text-primary text-sm">
                                            {timeInfo.code}
                                          </div>
                                          <div className="text-primary/80 text-xs">
                                            {timeInfo.startTime} -{" "}
                                            {timeInfo.endTime}
                                          </div>
                                        </>
                                      );
                                    })()}
                                  </div>
                                </td>
                                {row.days.map((day: any, dayIndex: number) => (
                                  <td
                                    key={dayIndex}
                                    className="border border-border p-3 min-w-[150px]"
                                  >
                                    {day ? (
                                      <div className="bg-primary/10 p-2 rounded-md border-l-4 border-primary">
                                          <div className="font-semibold text-primary mb-1">
                                          {day.disciplina}
                                        </div>
                                        {day.codigo && (
                                          <div className="text-primary text-xs mb-1 font-medium">
                                            <span className="inline-block w-2 h-2 bg-primary rounded-full mr-1"></span>
                                            {day.codigo}
                                          </div>
                                        )}
                                        <div className="text-primary/80 text-xs mb-1">
                                            <span className="inline-block w-2 h-2 bg-secondary-foreground rounded-full mr-1"></span>
                                          {day.professor}
                                        </div>
                                        <div className="text-primary/70 text-xs">
                                          <span className="inline-block w-2 h-2 bg-orange-500 rounded-full mr-1"></span>
                                          {day.sala}
                                        </div>
                                      </div>
                                    ) : (
                                      <div className="text-muted-foreground text-center py-4">
                                        <span className="text-xs">Livre</span>
                                      </div>
                                    )}
                                  </td>
                                ))}
                              </tr>
                            )
                          )}
                        </tbody>
                      </table>
                    </div>

                    {/* Legenda */}
                    <div className="mt-4 flex flex-wrap gap-4 text-xs">
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
                  </div>
                )}

                {/* Conflitos */}
                {previewData.conflicts && previewData.conflicts.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-4 text-orange-600">
                      Conflitos Detectados
                    </h3>
                    <div className="space-y-2">
                      {previewData.conflicts.map(
                        (conflict: any, index: number) => (
                          <div
                            key={index}
                            className="bg-destructive/10 border border-destructive/20 p-3 rounded"
                          >
                            <div className="text-sm text-destructive">
                              {conflict.message}
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Grade de Horários */}
        {showGrade && generatedTurma && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Grade de Horários Gerada
              </CardTitle>
              <CardDescription>
                Visualize a grade de horários gerada automaticamente para a
                turma {generatedTurma.nome}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <GradeHorariosTurma
                  turma={generatedTurma}
                  trigger={
                    <Button variant="default" size="lg">
                      <Calendar className="h-4 w-4 mr-2" />
                      Ver Grade Completa
                    </Button>
                  }
                />
                <Button variant="outline" onClick={() => setShowGrade(false)}>
                  Ocultar Grade
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      {/* Modal de confirmação de envio das alocações válidas */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar alocações válidas</DialogTitle>
            <DialogDescription>Revise o resumo abaixo. Apenas grupos sem conflitos serão enviados.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 text-sm">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-primary/10 p-3 rounded">
                <div className="text-xl font-bold text-primary">{confirmSummary.total}</div>
                <div className="text-primary/80">Total geradas</div>
              </div>
              <div className="bg-green-50 p-3 rounded">
                <div className="text-xl font-bold text-green-600">{confirmSummary.valid}</div>
                <div className="text-green-700">Válidas</div>
              </div>
              <div className="bg-orange-50 p-3 rounded">
                <div className="text-xl font-bold text-orange-600">{confirmSummary.discarded}</div>
                <div className="text-orange-700">Descartadas</div>
              </div>
            </div>
            {confirmSummary.conflicts.length > 0 && (
              <div>
                <h4 className="font-medium text-orange-700 mb-2">Conflitos</h4>
                <div className="max-h-40 overflow-y-auto space-y-2">
                  {confirmSummary.conflicts.map((c, i) => (
                    <div key={i} className="bg-destructive/10 border border-destructive/20 p-2 rounded text-xs">
                      <div><span className="font-mono">{c.horarioId}</span> - {c.reason}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          <DialogFooter className="flex gap-2">
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>Cancelar</Button>
            <Button variant="default" onClick={handleConfirmSubmit} disabled={isGenerating}>
              {isGenerating ? (
                <>
                  <Play className="mr-2 h-4 w-4 animate-spin" /> Enviando...
                </>
              ) : 'Confirmar envio'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      </div>
    </MainLayout>
  );
}
