import { requireQualquerModuloOuRedirect } from "@/lib/auth/requireAdmin";
import type { ItemInventarioRow } from "@/lib/types/database";
import type { TransacaoRow, FinRecorrencia } from "@/lib/types/financeiro";

export interface EquipamentoParaCalculadora {
  id: string;
  nome: string;
  valorReferencia: number;
}

/**
 * Lista enxuta de equipamentos do Inventário (só id/nome/valor de
 * referência) pra popular o seletor "+ Adicionar equipamento do
 * inventário" na Calculadora de Margem — ver `CalculadoraMargem.tsx`.
 * `requireQualquerModuloOuRedirect` libera quem tem "orcamentos" OU
 * "inventario" (mesmo espírito de `requireQualquerModulo`, já usado noutros
 * cadastros de apoio compartilhados entre módulos) — a Calculadora só é
 * alcançável por quem já tem "orcamentos", então na prática esse é sempre o
 * caminho que libera aqui.
 *
 * Exclui itens "baixado" (bem descartado, não faz sentido cobrar por ele
 * num orçamento novo). `valorReferencia` usa `valor_atual` (valor de
 * mercado hoje, mais realista pro custo de USAR aquele equipamento) e cai
 * pra `valor_pago` quando `valor_atual` ainda não foi preenchido.
 */
export async function buscarEquipamentosParaCalculadora(): Promise<EquipamentoParaCalculadora[]> {
  const { supabase } = await requireQualquerModuloOuRedirect(["orcamentos", "inventario"]);
  const { data } = await supabase
    .from("itens_inventario")
    .select("id, nome_item, valor_pago, valor_atual, status")
    .neq("status", "baixado")
    .order("nome_item")
    .overrideTypes<Pick<ItemInventarioRow, "id" | "nome_item" | "valor_pago" | "valor_atual" | "status">[], { merge: false }>();

  return (data ?? []).map((item) => ({
    id: item.id,
    nome: item.nome_item,
    valorReferencia: item.valor_atual ?? item.valor_pago ?? 0,
  }));
}

const FATOR_MENSAL: Record<FinRecorrencia, number> = {
  semanal: 52 / 12,
  mensal: 1,
  anual: 1 / 12,
};

/**
 * Estimativa de custo fixo mensal do negócio — soma das despesas marcadas
 * como recorrentes no Financeiro, convertidas pra equivalente mensal
 * (semanal ×52/12, anual ÷12). Vira a sugestão de ponto de partida no bloco
 * "Custo Fixo / Fee (%)" da Calculadora de Margem — o usuário sempre pode
 * digitar por cima se não usa o Financeiro rigorosamente (ou ainda não
 * cadastrou nada como recorrente lá).
 *
 * Cuidado que importa aqui: uma transação recorrente no Financeiro NÃO é
 * uma linha-molde só — marcar uma como recorrente já GERA todas as
 * ocorrências futuras na hora, todas compartilhando o mesmo
 * `recorrencia_grupo_id` (ver `supabase/financeiro-recorrencia.sql`). Somar
 * `valor` de toda linha recorrente contaria a MESMA despesa várias vezes
 * (uma por mês futuro já gerado) — por isso agrupamos por
 * `recorrencia_grupo_id` (ou pelo próprio `id` quando não tem grupo) e
 * usamos só UMA ocorrência representativa por grupo antes de somar.
 */
export async function buscarCustoFixoMensalEstimado(): Promise<number> {
  const { supabase } = await requireQualquerModuloOuRedirect(["orcamentos", "financeiro"]);
  const { data } = await supabase
    .from("fin_transacoes")
    .select("id, valor, recorrente, recorrencia_intervalo, recorrencia_grupo_id, tipo, data_vencimento")
    .eq("tipo", "despesa")
    .eq("recorrente", true)
    .overrideTypes<Pick<TransacaoRow, "id" | "valor" | "recorrente" | "recorrencia_intervalo" | "recorrencia_grupo_id" | "tipo" | "data_vencimento">[], { merge: false }>();

  const linhas = data ?? [];
  const representantePorGrupo = new Map<string, (typeof linhas)[number]>();
  for (const t of linhas) {
    const chave = t.recorrencia_grupo_id ?? t.id;
    const atual = representantePorGrupo.get(chave);
    if (!atual || t.data_vencimento < atual.data_vencimento) representantePorGrupo.set(chave, t);
  }

  let total = 0;
  for (const t of representantePorGrupo.values()) {
    total += t.valor * FATOR_MENSAL[t.recorrencia_intervalo ?? "mensal"];
  }
  return total;
}
