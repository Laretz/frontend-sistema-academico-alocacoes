/*
  Utilitário de horário consolidado (ex.: "2M123, 4T12").
  o que defino o cálculo fica no backend, mas no front este arquivo
  é usado para exibir horários no preview da alocação automática, onde ainda não existe esse valor (por nao ter sido criado)
*/

interface Alocacao {
  horario: {
    dia_semana: string;
    horario_inicio: string;
    horario_fim: string;
  };
}

interface HorarioAgrupado {
  dia: string;
  horarios: string[];
}

export function converterHorarioParaCodigo(horarioISO: string): string {
  const partes = horarioISO.includes("T")
    ? horarioISO.split("T")[1]!.split(":")
    : horarioISO.split(":");
  const hora = parseInt(partes[0] || "0");
  const minuto = parseInt(partes[1] || "0");
  const totalMin = hora * 60 + minuto;

  const targets: Array<{ code: string; min: number }> = [
    { code: "M1", min: 7 * 60 + 0 },
    { code: "M2", min: 7 * 60 + 50 },
    { code: "M3", min: 8 * 60 + 55 },
    { code: "M4", min: 9 * 60 + 45 },
    { code: "M5", min: 10 * 60 + 50 },
    { code: "M6", min: 11 * 60 + 40 },
    { code: "T1", min: 13 * 60 + 0 },
    { code: "T2", min: 13 * 60 + 50 },
    { code: "T3", min: 14 * 60 + 55 },
    { code: "T4", min: 15 * 60 + 45 },
    { code: "T5", min: 16 * 60 + 50 },
    { code: "T6", min: 17 * 60 + 40 },
    { code: "N1", min: 18 * 60 + 45 },
    { code: "N2", min: 19 * 60 + 35 },
    { code: "N3", min: 20 * 60 + 35 },
    { code: "N4", min: 21 * 60 + 25 },
  ];

  let best: { code: string; diff: number } | null = null;
  for (const t of targets) {
    const diff = Math.abs(totalMin - t.min);
    if (!best || diff < best.diff) best = { code: t.code, diff };
  }
  if (best && best.diff <= 35) return best.code;

  const hh = hora.toString().padStart(2, "0");
  const mm = minuto.toString().padStart(2, "0");
  return `${hh}:${mm}`;
}

export function gerarHorarioConsolidado(alocacoes: Alocacao[]): string {
  if (!alocacoes || alocacoes.length === 0) {
    return "";
  }

  const diasSemana: Record<string, string> = {
    SEGUNDA: "2",
    TERCA: "3",
    QUARTA: "4",
    QUINTA: "5",
    SEXTA: "6",
    SABADO: "7",
    DOMINGO: "1",
  };

  const alocacoesPorDia: Record<string, string[]> = {};

  alocacoes.forEach((alocacao) => {
    const dia = alocacao.horario.dia_semana;
    const horarioInicio = alocacao.horario.horario_inicio;

    const horarioCodigo = /^[MTN]\d+$/.test(horarioInicio)
      ? horarioInicio
      : converterHorarioParaCodigo(horarioInicio);

    if (!alocacoesPorDia[dia]) {
      alocacoesPorDia[dia] = [];
    }
    alocacoesPorDia[dia].push(horarioCodigo);
  });

  Object.keys(alocacoesPorDia).forEach((dia) => {
    alocacoesPorDia[dia].sort();
  });

  const horariosAgrupados: HorarioAgrupado[] = Object.entries(
    alocacoesPorDia,
  ).map(([dia, horarios]) => ({
    dia,
    horarios: horarios.sort(),
  }));

  const ordemDias = [
    "SEGUNDA",
    "TERCA",
    "QUARTA",
    "QUINTA",
    "SEXTA",
    "SABADO",
    "DOMINGO",
  ];
  horariosAgrupados.sort(
    (a, b) => ordemDias.indexOf(a.dia) - ordemDias.indexOf(b.dia),
  );

  const verificarHorariosIguais = (): boolean => {
    if (horariosAgrupados.length <= 1) return true;

    const primeiroGrupo = horariosAgrupados[0].horarios;
    return horariosAgrupados.every(
      (grupo) =>
        grupo.horarios.length === primeiroGrupo.length &&
        grupo.horarios.every(
          (horario, index) => horario === primeiroGrupo[index],
        ),
    );
  };

  const horariosIguais = verificarHorariosIguais();
  let horarioConsolidado = "";

  if (horariosIguais && horariosAgrupados.length > 1) {
    const diasNums = horariosAgrupados
      .map((grupo) => diasSemana[grupo.dia])
      .join("");
    const horarios = horariosAgrupados[0].horarios;

    if (horarios.length === 1) {
      horarioConsolidado = `${diasNums}${horarios[0]}`;
    } else {
      const numerosHorarios = horarios
        .map((h) => h.replace(/[A-Z]/g, ""))
        .join("");
      const turno = horarios[0].charAt(0); // M, T ou N
      horarioConsolidado = `${diasNums}${turno}${numerosHorarios}`;
    }
  } else {
    const partes = horariosAgrupados.map((grupo) => {
      const diaNum = diasSemana[grupo.dia];
      if (grupo.horarios.length === 1) {
        return `${diaNum}${grupo.horarios[0]}`;
      } else {
        const numerosHorarios = grupo.horarios
          .map((h) => h.replace(/[A-Z]/g, ""))
          .join("");
        const turno = grupo.horarios[0].charAt(0); // M, T ou N
        return `${diaNum}${turno}${numerosHorarios}`;
      }
    });

    horarioConsolidado = partes.join(", ");
  }

  return horarioConsolidado;
}

export function gerarHorarioConsolidadoPorDisciplina(
  allocations: unknown[],
  disciplinaId: string,
): string {
  type PreviewAllocation = {
    disciplina?: { id: string };
    horario?: {
      codigo?: string;
      dia_semana?: string;
      horario_inicio?: string;
      horario_fim?: string;
    };
    horarioStr?: string;
  };

  const alocacoesDisciplina = (allocations as PreviewAllocation[]).filter(
    (allocation) => allocation.disciplina?.id === disciplinaId,
  );

  const alocacoesFormatadas = alocacoesDisciplina.map((allocation) => {
    if (allocation.horarioStr) {
      const [dia_semana, codigo] = allocation.horarioStr.split("_");
      return {
        horario: {
          dia_semana: dia_semana || "",
          horario_inicio: codigo || "", // Usar o código diretamente
          horario_fim: "",
        },
      };
    }

    if (allocation.horario?.codigo) {
      return {
        horario: {
          dia_semana: allocation.horario.dia_semana || "",
          horario_inicio: allocation.horario.codigo,
          horario_fim: "",
        },
      };
    }

    return {
      horario: {
        dia_semana: allocation.horario?.dia_semana || "",
        horario_inicio: allocation.horario?.horario_inicio || "",
        horario_fim: allocation.horario?.horario_fim || "",
      },
    };
  });

  const resultado = gerarHorarioConsolidado(alocacoesFormatadas);

  return resultado;
}
