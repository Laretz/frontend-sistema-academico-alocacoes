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

/**
 * Converte horário ISO para código de horário (M1, M2, T1, etc.)
 */
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
    { code: "M3", min: 8 * 60 + 40 },
    { code: "M4", min: 9 * 60 + 30 },
    { code: "M5", min: 10 * 60 + 20 },
    { code: "M6", min: 11 * 60 + 10 },
    { code: "T1", min: 13 * 60 + 0 },
    { code: "T2", min: 13 * 60 + 50 },
    { code: "T3", min: 14 * 60 + 40 },
    { code: "T4", min: 15 * 60 + 30 },
    { code: "T5", min: 16 * 60 + 20 },
    { code: "T6", min: 17 * 60 + 10 },
    { code: "N1", min: 19 * 60 + 0 },
    { code: "N2", min: 19 * 60 + 50 },
    { code: "N3", min: 20 * 60 + 40 },
    { code: "N4", min: 21 * 60 + 30 },
  ];

  let best: { code: string; diff: number } | null = null;
  for (const t of targets) {
    const diff = Math.abs(totalMin - t.min);
    if (!best || diff < best.diff) best = { code: t.code, diff };
  }
  if (best && best.diff <= 25) return best.code;

  const hh = hora.toString().padStart(2, "0");
  const mm = minuto.toString().padStart(2, "0");
  return `${hh}:${mm}`;
}

/**
 * Gera o horário consolidado baseado nas alocações de uma disciplina
 * Replica a lógica do backend GerarHorarioConsolidadoUseCase
 */
export function gerarHorarioConsolidado(alocacoes: Alocacao[]): string {
  if (!alocacoes || alocacoes.length === 0) {
    return "";
  }

  // Mapear dias da semana para números
  const diasSemana: Record<string, string> = {
    SEGUNDA: "2",
    TERCA: "3",
    QUARTA: "4",
    QUINTA: "5",
    SEXTA: "6",
    SABADO: "7",
    DOMINGO: "1",
  };

  // Agrupar alocações por dia
  const alocacoesPorDia: Record<string, string[]> = {};

  alocacoes.forEach((alocacao) => {
    const dia = alocacao.horario.dia_semana;
    const horarioInicio = alocacao.horario.horario_inicio;
    
    // Se já é um código (M1, T2, etc.), usar diretamente
    // Caso contrário, converter de ISO para código
    const horarioCodigo = /^[MTN]\d+$/.test(horarioInicio) 
      ? horarioInicio 
      : converterHorarioParaCodigo(horarioInicio);

    if (!alocacoesPorDia[dia]) {
      alocacoesPorDia[dia] = [];
    }
    alocacoesPorDia[dia].push(horarioCodigo);
  });

  // Ordenar horários dentro de cada dia
  Object.keys(alocacoesPorDia).forEach((dia) => {
    alocacoesPorDia[dia].sort();
  });

  // Verificar se horários são sequenciais
  const verificarSequenciais = (horarios: string[]): boolean => {
    if (horarios.length <= 1) return true;

    const horariosOrdenados = [...horarios].sort((a, b) => {
      const numA = parseInt(a.replace(/[A-Z]/g, ""));
      const numB = parseInt(b.replace(/[A-Z]/g, ""));
      return numA - numB;
    });

    for (let i = 1; i < horariosOrdenados.length; i++) {
      const atual = horariosOrdenados[i];
      const anterior = horariosOrdenados[i - 1];

      if (!verificarSequencialidade(anterior, atual)) {
        return false;
      }
    }

    return true;
  };

  // Verificar se dois horários são sequenciais
  const verificarSequencialidade = (
    horario1: string,
    horario2: string
  ): boolean => {
    const num1 = parseInt(horario1.replace(/[A-Z]/g, ""));
    const num2 = parseInt(horario2.replace(/[A-Z]/g, ""));

    // Horários sequenciais têm diferença de 1
    return num2 - num1 === 1;
  };

  // Verificar se dias são consecutivos
  const verificarDiasConsecutivos = (dias: string[]): boolean => {
    if (dias.length <= 1) return true;

    const ordemDias = [
      "SEGUNDA",
      "TERCA",
      "QUARTA",
      "QUINTA",
      "SEXTA",
      "SABADO",
      "DOMINGO",
    ];
    const indicesDias = dias
      .map((dia) => ordemDias.indexOf(dia))
      .sort((a, b) => a - b);

    for (let i = 1; i < indicesDias.length; i++) {
      if (indicesDias[i] - indicesDias[i - 1] !== 1) {
        return false;
      }
    }

    return true;
  };

  // Gerar horários agrupados
  const horariosAgrupados: HorarioAgrupado[] = Object.entries(
    alocacoesPorDia
  ).map(([dia, horarios]) => ({
    dia,
    horarios: horarios.sort(),
  }));

  // Ordenar por dia da semana
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
    (a, b) => ordemDias.indexOf(a.dia) - ordemDias.indexOf(b.dia)
  );

  // Verificar se todos os horários de cada dia são sequenciais
  const todosSequenciais = horariosAgrupados.every((grupo) =>
    verificarSequenciais(grupo.horarios)
  );

  // Verificar se os dias são consecutivos
  const diasConsecutivos = verificarDiasConsecutivos(
    horariosAgrupados.map((g) => g.dia)
  );

  // Verificar se todos os dias têm os mesmos horários
  const verificarHorariosIguais = (): boolean => {
    if (horariosAgrupados.length <= 1) return true;

    const primeiroGrupo = horariosAgrupados[0].horarios;
    return horariosAgrupados.every(
      (grupo) =>
        grupo.horarios.length === primeiroGrupo.length &&
        grupo.horarios.every(
          (horario, index) => horario === primeiroGrupo[index]
        )
    );
  };

  const horariosIguais = verificarHorariosIguais();
  let horarioConsolidado = "";

  if (horariosIguais && horariosAgrupados.length > 1) {
    // Horários iguais em dias diferentes: agrupar dias
    const diasNums = horariosAgrupados
      .map((grupo) => diasSemana[grupo.dia])
      .join("");
    const horarios = horariosAgrupados[0].horarios;

    if (horarios.length === 1) {
      horarioConsolidado = `${diasNums}${horarios[0]}`;
    } else {
      // Extrair apenas os números dos códigos de horário
      const numerosHorarios = horarios
        .map((h) => h.replace(/[A-Z]/g, ""))
        .join("");
      const periodo = horarios[0].charAt(0); // M, T ou N
      horarioConsolidado = `${diasNums}${periodo}${numerosHorarios}`;
    }
  } else {
    // Horários diferentes ou dia único: listar separadamente
    const partes = horariosAgrupados.map((grupo) => {
      const diaNum = diasSemana[grupo.dia];
      if (grupo.horarios.length === 1) {
        return `${diaNum}${grupo.horarios[0]}`;
      } else {
        // Extrair apenas os números dos códigos de horário
        const numerosHorarios = grupo.horarios
          .map((h) => h.replace(/[A-Z]/g, ""))
          .join("");
        const periodo = grupo.horarios[0].charAt(0); // M, T ou N
        return `${diaNum}${periodo}${numerosHorarios}`;
      }
    });

    horarioConsolidado = partes.join(", ");
  }

  return horarioConsolidado;
}

/**
 * Gera horário consolidado para uma disciplina específica a partir das alocações do preview
 */
export function gerarHorarioConsolidadoPorDisciplina(
  allocations: any[],
  disciplinaId: string
): string {
  const alocacoesDisciplina = allocations.filter(
    (allocation) => allocation.disciplina?.id === disciplinaId
  );

  // Debug: Log dos dados brutos
  console.log("DEBUG - Alocações da disciplina:", alocacoesDisciplina);

  const alocacoesFormatadas = alocacoesDisciplina.map((allocation) => {
    console.log("DEBUG - Allocation horario:", allocation.horario);
    console.log("DEBUG - Allocation horarioStr:", allocation.horarioStr);

    // Se temos horarioStr (formato SEGUNDA_M1), usar isso diretamente
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

    // Fallback para o formato antigo
    // Se temos o código do horário, usar diretamente
    if (allocation.horario?.codigo) {
      return {
        horario: {
          dia_semana: allocation.horario.dia_semana || "",
          horario_inicio: allocation.horario.codigo,
          horario_fim: "",
        },
      };
    }

    // Último fallback: converter horário ISO para código
    return {
      horario: {
        dia_semana: allocation.horario?.dia_semana || "",
        horario_inicio: allocation.horario?.horario_inicio || "",
        horario_fim: allocation.horario?.horario_fim || "",
      },
    };
  });

  console.log("DEBUG - Alocações formatadas:", alocacoesFormatadas);
  const resultado = gerarHorarioConsolidado(alocacoesFormatadas);
  console.log("DEBUG - Resultado final:", resultado);

  return resultado;
}
