import type { StatusTransacao } from "@/lib/types/financeiro";
import type { Tone } from "@/lib/utils/tone";

// "Paga" e "Pendente" dividem o mesmo tone (bom/neutro) que outros módulos
// já usam — "Vencida" é sempre `critical`, é o único estado que precisa de
// ação imediata do admin.
export const STATUS_TRANSACAO_META: Record<StatusTransacao, { label: string; tone: Tone }> = {
  paga: { label: "Paga", tone: "good" },
  pendente: { label: "Pendente", tone: "neutral" },
  vencida: { label: "Vencida", tone: "critical" },
};

/** Primeiro e último dia (ISO) do mês de um `Date` — usado na navegação mensal do dashboard. */
export function limitesDoMes(referencia: Date): { inicio: string; fim: string } {
  const ano = referencia.getFullYear();
  const mes = referencia.getMonth();
  const inicio = new Date(Date.UTC(ano, mes, 1)).toISOString().slice(0, 10);
  const fim = new Date(Date.UTC(ano, mes + 1, 0)).toISOString().slice(0, 10);
  return { inicio, fim };
}

export function fmtMesAno(referencia: Date): string {
  const label = referencia.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
  return label.charAt(0).toUpperCase() + label.slice(1);
}

/** yyyy-MM (usado no parâmetro de URL da navegação mensal). */
export function mesParam(referencia: Date): string {
  return `${referencia.getFullYear()}-${String(referencia.getMonth() + 1).padStart(2, "0")}`;
}

export function parseMesParam(param: string | undefined): Date {
  if (param && /^\d{4}-\d{2}$/.test(param)) {
    const [ano, mes] = param.split("-").map(Number);
    return new Date(Date.UTC(ano!, mes! - 1, 1));
  }
  const hoje = new Date();
  return new Date(Date.UTC(hoje.getFullYear(), hoje.getMonth(), 1));
}

export function addMeses(referencia: Date, delta: number): Date {
  return new Date(Date.UTC(referencia.getUTCFullYear(), referencia.getUTCMonth() + delta, 1));
}

const LIMIAR_LIMITE_ATENCAO = 0.7; // >=70% do limite consumido -> atenção
const LIMIAR_LIMITE_CRITICO = 0.9; // >=90% do limite consumido -> crítico

/**
 * Tone do "meter" de limite de cartão — ao contrário da meta de tráfego
 * (onde MAIS é melhor), aqui MENOS consumo é melhor: a barra vira
 * warning/critical conforme o limite disponível vai acabando.
 */
export function toneLimiteCartao(limiteConsumido: number, limite: number): Tone {
  if (limite <= 0) return "neutral";
  const pct = limiteConsumido / limite;
  if (pct >= LIMIAR_LIMITE_CRITICO) return "critical";
  if (pct >= LIMIAR_LIMITE_ATENCAO) return "warning";
  return "good";
}
