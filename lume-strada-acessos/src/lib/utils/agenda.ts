// Helpers genéricos (data/grade de calendário) duplicados de propósito de
// `lib/utils/dashboard.ts` — mesma decisão de sempre: cada módulo é entregue
// separado e não depende de arquivo interno de outro (ver comentário no topo
// de `dashboard.ts`). Matemática de data genérica, que não tem nada a ver
// com o domínio de nenhum módulo, continua duplicada como sempre.

import type { ComponentType, SVGProps } from "react";
import type { TipoCompromisso } from "@/lib/types/agenda";
import { IconCamera, IconUsers, IconExternalLink, IconDollarSign } from "@/components/ui/icons";

export function hojeISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export function addMeses(referencia: Date, delta: number): Date {
  return new Date(Date.UTC(referencia.getUTCFullYear(), referencia.getUTCMonth() + delta, 1));
}

export function fmtMesAno(referencia: Date): string {
  // `timeZone: "UTC"` é obrigatório aqui — ver comentário equivalente em
  // `lib/utils/producao.ts`/`lib/utils/dashboard.ts`. Sem isso, num fuso
  // atrás de UTC (Brasil, UTC-3) o cabeçalho de mês fica sempre um mês pra
  // trás do real.
  const label = referencia.toLocaleDateString("pt-BR", { month: "long", year: "numeric", timeZone: "UTC" });
  return label.charAt(0).toUpperCase() + label.slice(1);
}

/** Matriz de semanas (cada dia como ISO yyyy-mm-dd, ou null fora do mês) — base da grade do calendário da Agenda. */
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

/** "HH:MM" a partir do `time` do Postgres ("HH:MM:SS") — pra exibir na pill/modal sem os segundos. */
export function fmtHora(hora: string): string {
  return hora.slice(0, 5);
}

export const TIPO_COMPROMISSO_ORDEM: TipoCompromisso[] = ["captacao", "reuniao", "entrega", "pagamento"];

/**
 * Cor de identidade (hex) + ícone de cada tipo de compromisso — já validada
 * pra daltonismo (ver skill de dataviz do projeto), aplicada sempre via
 * `style` inline (nunca classe Tailwind arbitrária, o JIT não escaneia
 * interpolação em runtime — ver comentário acima de `MODULO_COR` em
 * `AdminShell.tsx`). Dois conjuntos de hex (claro/escuro) porque cor
 * arbitrária tem que continuar legível nos dois temas — quem lê essa tabela
 * escolhe `corDark`/`corLight` de acordo com `useTheme()` (ver
 * `AgendaCalendario.tsx`). O RÓTULO de cada tipo mora no dicionário
 * (`dict.agenda.tipo*`), não aqui — texto de interface é sempre traduzido,
 * nunca fixo num util.
 */
export const TIPO_COMPROMISSO_META: Record<TipoCompromisso, { corDark: string; corLight: string; icon: ComponentType<SVGProps<SVGSVGElement>> }> = {
  captacao: { corDark: "#d95926", corLight: "#eb6834", icon: IconCamera },
  reuniao: { corDark: "#199e70", corLight: "#1baf7a", icon: IconUsers },
  entrega: { corDark: "#3987e5", corLight: "#2a78d6", icon: IconExternalLink },
  pagamento: { corDark: "#d55181", corLight: "#e87ba4", icon: IconDollarSign },
};
