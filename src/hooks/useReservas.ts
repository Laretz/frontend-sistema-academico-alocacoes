import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { alocacaoService, horarioService, salaService } from "@/services/entities";
import { reservasSalaService } from "@/services/reservas-sala";
import type {
  CreateReservaSalaRequest,
  GradeHorario,
  Horario,
  ReservaSala,
  Sala,
} from "@/types/entities";

type NovaReservaState = Partial<
  CreateReservaSalaRequest & { titulo: string; descricao?: string }
>;

function getDiaSemanaKeyFromYMD(ymd: string): string | undefined {
  const [y, m, d] = ymd.split("-").map((n) => Number(n));
  if (!y || !m || !d) return undefined;
  const utcMidnight = new Date(Date.UTC(y, m - 1, d));
  const day = utcMidnight.getUTCDay();
  const map: Record<number, string> = {
    0: "DOMINGO",
    1: "SEGUNDA",
    2: "TERCA",
    3: "QUARTA",
    4: "QUINTA",
    5: "SEXTA",
    6: "SABADO",
  };
  return map[day];
}

function formatHora(value?: string): string {
  if (!value) return "";
  const v = String(value);
  if (v.includes("T") && v.length >= 16) return v.slice(11, 16);
  if (/^\d{2}:\d{2}/.test(v)) return v.slice(0, 5);
  return v;
}

export function useReservas() {
  const [salas, setSalas] = useState<Sala[]>([]);
  const [horarios, setHorarios] = useState<Horario[]>([]);
  const [loading, setLoading] = useState(true);

  const [criarOpen, setCriarOpen] = useState(false);
  const [novaReserva, setNovaReserva] = useState<NovaReservaState>({});
  const [horarioIds, setHorarioIds] = useState<string[]>([]);
  const [verificandoConflito, setVerificandoConflito] = useState(false);
  const [conflitoMensagem, setConflitoMensagem] = useState("");
  const [previewGrade, setPreviewGrade] = useState<GradeHorario | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [reservasOcupadasHorarioIds, setReservasOcupadasHorarioIds] = useState<string[]>(
    [],
  );

  const [reservas, setReservas] = useState<ReservaSala[]>([]);
  const [filtroSalaId, setFiltroSalaId] = useState<string>("");
  const [filtroHorarioId, setFiltroHorarioId] = useState<string>("");
  const [filtroDe, setFiltroDe] = useState<string>("");
  const [filtroAte, setFiltroAte] = useState<string>("");

  const salaSelecionada = useMemo(() => {
    if (!novaReserva.salaId) return null;
    return salas.find((s) => s.id === novaReserva.salaId) || null;
  }, [novaReserva.salaId, salas]);
  const salaSelecionadaId = salaSelecionada?.id;

  const diaSelecionado = useMemo(() => {
    if (!novaReserva.date) return undefined;
    return getDiaSemanaKeyFromYMD(novaReserva.date);
  }, [novaReserva.date]);

  const horariosDisponiveisDia = useMemo(() => {
    if (!diaSelecionado) return [];
    return horarios.filter((h) => h.dia_semana === diaSelecionado);
  }, [diaSelecionado, horarios]);

  const reservasOcupadasSet = useMemo(() => {
    return new Set(reservasOcupadasHorarioIds);
  }, [reservasOcupadasHorarioIds]);

  const isCodigoOcupado = useMemo(() => {
    if (!diaSelecionado || !previewGrade) return () => false;
    return (codigo: string) => {
      const raw = previewGrade?.[diaSelecionado]?.[codigo];
      if (Array.isArray(raw)) return raw.length > 0;
      return !!raw;
    };
  }, [diaSelecionado, previewGrade]);

  const isHorarioIndisponivel = useMemo(() => {
    return (h: Horario) => {
      const ocupadoPorAlocacao = diaSelecionado && previewGrade ? isCodigoOcupado(h.codigo) : false;
      const ocupadoPorReserva = reservasOcupadasSet.has(h.id);
      return ocupadoPorAlocacao || ocupadoPorReserva;
    };
  }, [diaSelecionado, previewGrade, isCodigoOcupado, reservasOcupadasSet]);

  const periodoConsultaId = useMemo(() => {
    if (typeof window === "undefined") return undefined;
    const modo = window.localStorage.getItem("periodo.modo");
    if (modo !== "consulta") return undefined;
    return window.localStorage.getItem("periodo.consultaId") || undefined;
  }, []);

  const getSalaNome = (r: ReservaSala) => {
    return r.sala?.nome || salas.find((s) => s.id === r.salaId)?.nome || "—";
  };

  const getHorarioLabel = (r: ReservaSala) => {
    const h = r.horario || horarios.find((x) => x.id === r.horarioId);
    if (!h) return "";
    return `${h.dia_semana} ${h.codigo}`.trim();
  };

  const carregarReservas = useCallback(async () => {
    try {
      const qs: { salaId?: string; horarioId?: string; dateFrom?: string; dateTo?: string } = {};
      if (filtroSalaId) qs.salaId = filtroSalaId;
      if (filtroHorarioId) qs.horarioId = filtroHorarioId;
      if (filtroDe) qs.dateFrom = filtroDe;
      if (filtroAte) qs.dateTo = filtroAte;
      const resp = await reservasSalaService.list(qs);
      setReservas(resp.reservas || []);
    } catch {
      setReservas([]);
    }
  }, [filtroAte, filtroDe, filtroHorarioId, filtroSalaId]);

  useEffect(() => {
    const carregarDados = async () => {
      setLoading(true);
      try {
        const [salasAll, horariosAll] = await Promise.all([
          salaService.getAll(1).catch(() => ({ salas: [] as Sala[] })),
          horarioService.getAll().catch(() => [] as Horario[]),
        ]);
        setSalas(salasAll.salas || []);
        setHorarios(horariosAll || []);
      } finally {
        setLoading(false);
      }
    };
    carregarDados();
  }, []);

  useEffect(() => {
    if (!loading) {
      carregarReservas();
    }
  }, [carregarReservas, loading]);

  useEffect(() => {
    const checar = async () => {
      setConflitoMensagem("");
      if (!criarOpen) return;
      if (!novaReserva.salaId || !novaReserva.date) {
        setVerificandoConflito(false);
        return;
      }

      const diaKey = getDiaSemanaKeyFromYMD(novaReserva.date);
      setVerificandoConflito(true);
      try {
        if (!diaKey) {
          setReservasOcupadasHorarioIds([]);
          return;
        }

        const resp = await reservasSalaService.list({
          salaId: novaReserva.salaId,
          dateFrom: novaReserva.date,
          dateTo: novaReserva.date,
        });
        const ativas = (resp.reservas || []).filter((r) => r.status === "ATIVA");
        const ids = Array.from(new Set(ativas.map((r) => r.horarioId)));
        setReservasOcupadasHorarioIds(ids);
      } catch {
        setReservasOcupadasHorarioIds([]);
      } finally {
        setVerificandoConflito(false);
      }
    };

    checar();
  }, [criarOpen, novaReserva.salaId, novaReserva.date, horarios, previewGrade]);

  useEffect(() => {
    const fetchPreview = async () => {
      setPreviewError(null);
      if (!criarOpen) return;
      if (!salaSelecionadaId) {
        setPreviewGrade(null);
        return;
      }

      setPreviewLoading(true);
      try {
        const grade = await alocacaoService.getGradeHorarios({
          id_sala: salaSelecionadaId,
          periodoId: periodoConsultaId || undefined,
        });
        setPreviewGrade(grade);
      } catch {
        setPreviewGrade(null);
        setPreviewError("Não foi possível carregar a grade da sala.");
      } finally {
        setPreviewLoading(false);
      }
    };

    fetchPreview();
  }, [criarOpen, periodoConsultaId, salaSelecionadaId]);

  useEffect(() => {
    if (!criarOpen) return;
    setHorarioIds([]);
    setConflitoMensagem("");
  }, [criarOpen, salaSelecionadaId]);

  useEffect(() => {
    if (!criarOpen) return;
    setHorarioIds([]);
    setConflitoMensagem("");
  }, [criarOpen, novaReserva.date]);

  useEffect(() => {
    if (!criarOpen) return;
    if (horarioIds.length === 0) return;
    const invalid = horarioIds.filter((id) => {
      const h = horarios.find((x) => x.id === id);
      if (!h) return true;
      return isHorarioIndisponivel(h);
    });
    if (invalid.length === 0) return;
    setHorarioIds((prev) => prev.filter((id) => !invalid.includes(id)));
    setConflitoMensagem("Alguns horários selecionados ficaram ocupados e foram removidos.");
  }, [criarOpen, horarioIds, horarios, isHorarioIndisponivel]);

  const podeSalvar = useMemo(() => {
    const base =
      !!novaReserva.salaId &&
      !!novaReserva.date &&
      !!novaReserva.titulo?.trim() &&
      horarioIds.length > 0;
    const recurrenceOk =
      novaReserva.recurrenceRule !== "WEEKLY" ||
      (!!novaReserva.recurrenceEnd && novaReserva.recurrenceEnd >= novaReserva.date!);
    const previewOk = !previewLoading && !previewError && !!previewGrade;
    return base && recurrenceOk && previewOk && !conflitoMensagem && !verificandoConflito;
  }, [
    novaReserva.salaId,
    novaReserva.date,
    novaReserva.titulo,
    novaReserva.recurrenceRule,
    novaReserva.recurrenceEnd,
    horarioIds.length,
    conflitoMensagem,
    verificandoConflito,
    previewLoading,
    previewError,
    previewGrade,
  ]);

  const criarReserva = async () => {
    try {
      if (!podeSalvar) return;
      if (!novaReserva.salaId || !novaReserva.date || !novaReserva.titulo) return;
      const payloadBase = {
        salaId: novaReserva.salaId,
        date: novaReserva.date,
        titulo: novaReserva.titulo,
        descricao: novaReserva.descricao,
        recurrenceRule: novaReserva.recurrenceRule,
        recurrenceEnd: novaReserva.recurrenceEnd,
      } as CreateReservaSalaRequest;

      const results = await Promise.allSettled(
        horarioIds.map((horarioId) =>
          reservasSalaService.create({
            ...payloadBase,
            horarioId,
          }),
        ),
      );

      const okCount = results.filter((r) => r.status === "fulfilled").length;
      const failCount = results.length - okCount;

      if (okCount > 0 && failCount === 0) {
        toast.success(`Reserva criada (${okCount} horário${okCount > 1 ? "s" : ""})`);
        setNovaReserva({});
        setHorarioIds([]);
        setCriarOpen(false);
        await carregarReservas();
        return;
      }

      if (okCount > 0 && failCount > 0) {
        toast.error(`Criou ${okCount} horário${okCount > 1 ? "s" : ""}, mas falhou em ${failCount}.`);
        await carregarReservas();
        return;
      }

      toast.error("Não foi possível criar a reserva.");
    } catch {
      toast.error("Erro ao criar reserva");
    }
  };

  const cancelarReserva = async (id: string) => {
    try {
      await reservasSalaService.cancel(id);
      toast.success("Reserva cancelada");
      await carregarReservas();
    } catch {
      toast.error("Erro ao cancelar reserva");
    }
  };

  const cancelarSerie = async (seriesId: string) => {
    try {
      await reservasSalaService.cancelSeries(seriesId);
      toast.success("Série de reservas cancelada");
      await carregarReservas();
    } catch {
      toast.error("Erro ao cancelar série");
    }
  };

  const horariosDisponiveisDiaComLabel = useMemo(() => {
    return horariosDisponiveisDia.map((h) => {
      const inicio = formatHora(h.horario_inicio);
      const fim = formatHora(h.horario_fim);
      const label = inicio && fim ? `${h.codigo} (${inicio} - ${fim})` : h.codigo;
      return { ...h, __label: label };
    });
  }, [horariosDisponiveisDia]);

  return {
    salas,
    horarios,
    loading,

    criarOpen,
    setCriarOpen,
    novaReserva,
    setNovaReserva,
    horarioIds,
    setHorarioIds,
    verificandoConflito,
    conflitoMensagem,
    setConflitoMensagem,
    previewGrade,
    previewLoading,
    previewError,
    diaSelecionado,
    horariosDisponiveisDia: horariosDisponiveisDiaComLabel,
    isHorarioIndisponivel,
    podeSalvar,

    reservas,
    filtroSalaId,
    setFiltroSalaId,
    filtroHorarioId,
    setFiltroHorarioId,
    filtroDe,
    setFiltroDe,
    filtroAte,
    setFiltroAte,

    carregarReservas,
    criarReserva,
    cancelarReserva,
    cancelarSerie,
    getSalaNome,
    getHorarioLabel,
  };
}
