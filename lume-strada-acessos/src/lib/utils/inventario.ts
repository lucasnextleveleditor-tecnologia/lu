import type { ItemInventarioRow, StatusItemInventario } from "@/lib/types/database";
import type { Tone } from "@/lib/utils/tone";

/**
 * Tone de cada status de patrimônio — mesma paleta fixa de 4 tons usada em
 * todo o app (acesso e tráfego). "Baixado/Descartado" usa `critical` de
 * propósito: numa auditoria visual, um bem baixado que ainda aparece em uso
 * é exatamente o tipo de discrepância que o admin precisa notar de cara.
 */
export const STATUS_ITEM_META: Record<StatusItemInventario, { label: string; tone: Tone }> = {
  ativo: { label: "Ativo", tone: "good" },
  emprestado: { label: "Emprestado", tone: "neutral" },
  manutencao: { label: "Em Manutenção", tone: "warning" },
  baixado: { label: "Baixado", tone: "critical" },
};

export const STATUS_ITEM_OPCOES: StatusItemInventario[] = ["ativo", "manutencao", "emprestado", "baixado"];

/** Resultado do cálculo de depreciação de um item — `null` quando falta `valor_pago` ou `valor_atual` pra comparar. */
export interface Depreciacao {
  delta: number; // valor_pago - valor_atual — positivo é depreciação, negativo é valorização
  percentual: number; // delta / valor_pago, ex: 0.32 = -32% (perdeu 32% do valor)
  apreciou: boolean; // true quando valor_atual > valor_pago (o bem se valorizou em vez de depreciar)
}

/**
 * Depreciação individual de um item — `valor_pago - valor_atual`, mostrada como
 * tag na listagem (ver `ItensManager`) e somada no Dashboard Financeiro. Retorna
 * `null` quando o item ainda não tem os dois valores preenchidos (itens antigos
 * migrados de `valor_estimado`, por exemplo, nascem sem `valor_atual`).
 */
export function calcularDepreciacao(item: Pick<ItemInventarioRow, "valor_pago" | "valor_atual">): Depreciacao | null {
  if (item.valor_pago == null || item.valor_atual == null) return null;
  const delta = item.valor_pago - item.valor_atual;
  // valor_pago = 0 é um caso de borda raro (bem doado/recebido) — evita divisão por zero.
  const percentual = item.valor_pago !== 0 ? delta / item.valor_pago : 0;
  return { delta, percentual, apreciou: delta < 0 };
}
