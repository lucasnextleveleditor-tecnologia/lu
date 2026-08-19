// Helpers genéricos (data/grade de calendário) duplicados de propósito —
// mesma decisão de sempre: cada módulo é entregue separado e não depende de
// arquivo interno de outro. A ÚNICA exceção deliberada do Dashboard são os
// TIPOS de Produção/Comercial (`TarefaComRelacoes`/`LeadComRelacoes`),
// importados direto nos componentes — o propósito do Dashboard É juntar os
// dois módulos numa tela só, então esse acoplamento ali é o objetivo, não
// um acidente. Matemática de data genérica, que não tem nada a ver com o
// domínio de nenhum módulo, continua duplicada como sempre.

export function hojeISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export function addMeses(referencia: Date, delta: number): Date {
  return new Date(Date.UTC(referencia.getUTCFullYear(), referencia.getUTCMonth() + delta, 1));
}

export function fmtMesAno(referencia: Date): string {
  const label = referencia.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
  return label.charAt(0).toUpperCase() + label.slice(1);
}

/** "Terça-feira, 13 de agosto" — cabeçalho da Agenda do Dia. */
export function fmtDiaSemanaEData(iso: string): string {
  const label = new Date(`${iso}T00:00:00`).toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long" });
  return label.charAt(0).toUpperCase() + label.slice(1);
}

/** Matriz de semanas (cada dia como ISO yyyy-mm-dd, ou null fora do mês) — base da grade do Calendário Geral. */
export function gradeDoMes(referencia: Date): (string | null)[][] {
  const ano = referencia.getUTCFullYear();
  const mes = referencia.getUTCMonth();
  const primeiroDiaSemana = new Date(Date.UTC(ano, mes, 1)).getUTCDay();
  const totalDias = new Date(Date.UTC(ano, mes + 1, 0)).getUTCDate();

  const celulas: (string | null)[] = [
    ...Array(primeiroDiaSemana).fill(null),
    ...Array.from({ length: totalDias }, (_, i) => {
      const dia = i + 1;
      return `${ano}-${String(mes + 1).padStart(2, "0")}-${String(dia).padStart(2, "0")}`;
    }),
  ];
  while (celulas.length % 7 !== 0) celulas.push(null);

  const semanas: (string | null)[][] = [];
  for (let i = 0; i < celulas.length; i += 7) semanas.push(celulas.slice(i, i + 7));
  return semanas;
}
