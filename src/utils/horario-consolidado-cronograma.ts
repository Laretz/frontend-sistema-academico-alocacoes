/**
 * Utilitários para calcular cronograma baseado no horário consolidado
 */

/**
 * Calcula o número de aulas por semana baseado no horário consolidado
 * @param horarioConsolidado - String como "2M123" ou "35M12T34"
 * @returns Número de aulas por semana
 */
export function calcularAulasPorSemana(horarioConsolidado: string): number {
  if (!horarioConsolidado) return 0;
  
  let totalAulas = 0;
  
  // Regex para capturar padrões como "2M123", "35M12", "T34", etc.
  const padroes = horarioConsolidado.match(/\d*[MTN]\d+/g) || [];
  
  padroes.forEach(padrao => {
    // Extrair dias da semana (números antes do turno)
    const diasMatch = padrao.match(/^(\d*)[MTN]/);
    const dias = diasMatch ? diasMatch[1] : '';
    
    // Extrair horários (números após o turno)
    const horariosMatch = padrao.match(/[MTN](\d+)$/);
    const horarios = horariosMatch ? horariosMatch[1] : '';
    
    // Contar quantos dias da semana
    const quantidadeDias = dias.length || 1; // Se não especificado, assume 1 dia
    
    // Contar quantos horários (cada dígito representa um horário)
    const quantidadeHorarios = horarios.length;
    
    // Total de aulas = dias × horários
    totalAulas += quantidadeDias * quantidadeHorarios;
  });
  
  return totalAulas;
}

/**
 * Calcula o total de aulas no semestre baseado no horário consolidado
 * @param horarioConsolidado - String como "2M123"
 * @param semanasSemestre - Número de semanas no semestre (padrão: 18)
 * @returns Total de aulas no semestre
 */
export function calcularTotalAulasSemestre(horarioConsolidado: string, semanasSemestre: number = 18): number {
  const aulasPorSemana = calcularAulasPorSemana(horarioConsolidado);
  return aulasPorSemana * semanasSemestre;
}

/**
 * Extrai os dias da semana do horário consolidado
 * @param horarioConsolidado - String como "2M123" ou "35M12T34"
 * @returns Array com os números dos dias da semana (1=domingo, 2=segunda, 3=terça, etc.)
 */
export function extrairDiasSemana(horarioConsolidado: string): number[] {
  if (!horarioConsolidado) return [];
  
  const dias: number[] = [];
  const padroes = horarioConsolidado.match(/\d*[MTN]\d+/g) || [];
  
  padroes.forEach(padrao => {
    const diasMatch = padrao.match(/^(\d*)[MTN]/);
    const diasStr = diasMatch ? diasMatch[1] : '';
    
    if (diasStr) {
      // Cada dígito representa um dia da semana
      // Mapeamento: 1=domingo, 2=segunda, 3=terça, 4=quarta, 5=quinta, 6=sexta, 7=sábado
      for (const dia of diasStr) {
        const numeroDia = parseInt(dia);
        if (numeroDia >= 1 && numeroDia <= 7 && !dias.includes(numeroDia)) {
          dias.push(numeroDia);
        }
      }
    }
  });
  
  return dias.sort();
}

/**
 * Verifica se uma disciplina tem aula em um determinado dia da semana
 * @param horarioConsolidado - String como "2M123"
 * @param diaSemana - Número do dia da semana (1=domingo, 2=segunda, 3=terça, etc.)
 * @returns true se tem aula no dia
 */
export function temAulaNoDia(horarioConsolidado: string, diaSemana: number): boolean {
  const dias = extrairDiasSemana(horarioConsolidado);
  return dias.includes(diaSemana);
}

/**
 * Calcula quantas aulas acontecem em um dia específico
 * @param horarioConsolidado - String como "2M123"
 * @param diaSemana - Número do dia da semana (1=domingo, 2=segunda, 3=terça, etc.)
 * @returns Número de aulas no dia
 */
export function calcularAulasNoDia(horarioConsolidado: string, diaSemana: number): number {
  if (!horarioConsolidado) return 0;
  
  let aulasNoDia = 0;
  const padroes = horarioConsolidado.match(/\d*[MTN]\d+/g) || [];
  
  padroes.forEach(padrao => {
    const diasMatch = padrao.match(/^(\d*)[MTN]/);
    const diasStr = diasMatch ? diasMatch[1] : '';
    
    // Verificar se este padrão inclui o dia da semana
    if (diasStr.includes(diaSemana.toString())) {
      const horariosMatch = padrao.match(/[MTN](\d+)$/);
      const horarios = horariosMatch ? horariosMatch[1] : '';
      aulasNoDia += horarios.length;
    }
  });
  
  return aulasNoDia;
}

/**
 * Exemplo de uso:
 * 
 * const horario = "2M123"; // Segunda-feira, manhã, horários 1, 2 e 3
 * console.log(calcularAulasPorSemana(horario)); // 3 aulas por semana
 * console.log(calcularTotalAulasSemestre(horario)); // 54 aulas no semestre
 * console.log(extrairDiasSemana(horario)); // [2] (segunda-feira, pois 2=segunda no mapeamento)
 * console.log(temAulaNoDia(horario, 2)); // true
 * console.log(calcularAulasNoDia(horario, 2)); // 3 aulas
 */