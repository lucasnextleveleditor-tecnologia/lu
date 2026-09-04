"use server";

import { revalidatePath } from "next/cache";
import { requireModulo } from "@/lib/auth/requireAdmin";
import type { CaixinhaLiquidez, CaixinhaRisco, CaixinhaTaxaPeriodo, FinContexto } from "@/lib/types/financeiro";
import type { ActionResult, ActionResultId } from "@/app/admin/financeiro/actions";

const PATH = "/admin/financeiro/caixinhas";

export interface CaixinhaInput {
  nome: string;
  objetivo: string | null;
  valorMeta: number | null;
  dataAlvo: string | null; // ISO date, ou null
  taxaRendimento: number;
  taxaRendimentoPeriodo: CaixinhaTaxaPeriodo;
  nivelRisco: CaixinhaRisco;
  liquidez: CaixinhaLiquidez;
  contexto: FinContexto;
  emoji: string | null;
  cor: string | null;
}

// ----------------------------------------------------------------------------
// Cadastro — CRUD normal (sem regra de negócio), mesmo padrão de
// `criarConta`/`atualizarConta` em `app/admin/financeiro/actions.ts`.
// ----------------------------------------------------------------------------
export async function criarCaixinha(input: CaixinhaInput): Promise<ActionResultId> {
  try {
    const { supabase } = await requireModulo("financeiro");
    if (!input.nome.trim()) return { ok: false, error: "Informe o nome da caixinha." };
    if (input.taxaRendimento < 0) return { ok: false, error: "A taxa de rendimento não pode ser negativa." };

    const { data, error } = await supabase
      .from("fin_caixinhas")
      .insert({
        nome: input.nome.trim(),
        objetivo: input.objetivo?.trim() || null,
        valor_meta: input.valorMeta && input.valorMeta > 0 ? input.valorMeta : null,
        data_alvo: input.dataAlvo || null,
        taxa_rendimento: input.taxaRendimento,
        taxa_rendimento_periodo: input.taxaRendimentoPeriodo,
        nivel_risco: input.nivelRisco,
        liquidez: input.liquidez,
        contexto: input.contexto,
        emoji: input.emoji?.trim() || null,
        cor: input.cor,
      })
      .select("id")
      .single();
    if (error) return { ok: false, error: error.message };
    revalidatePath(PATH);
    revalidatePath("/admin/financeiro");
    return { ok: true, id: data.id };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Erro desconhecido." };
  }
}

export async function atualizarCaixinha(id: string, input: CaixinhaInput): Promise<ActionResult> {
  try {
    const { supabase } = await requireModulo("financeiro");
    if (!input.nome.trim()) return { ok: false, error: "Informe o nome da caixinha." };
    if (input.taxaRendimento < 0) return { ok: false, error: "A taxa de rendimento não pode ser negativa." };

    const { error } = await supabase
      .from("fin_caixinhas")
      .update({
        nome: input.nome.trim(),
        objetivo: input.objetivo?.trim() || null,
        valor_meta: input.valorMeta && input.valorMeta > 0 ? input.valorMeta : null,
        data_alvo: input.dataAlvo || null,
        taxa_rendimento: input.taxaRendimento,
        taxa_rendimento_periodo: input.taxaRendimentoPeriodo,
        nivel_risco: input.nivelRisco,
        liquidez: input.liquidez,
        contexto: input.contexto,
        emoji: input.emoji?.trim() || null,
        cor: input.cor,
      })
      .eq("id", id);
    if (error) return { ok: false, error: error.message };
    revalidatePath(PATH);
    revalidatePath("/admin/financeiro");
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Erro desconhecido." };
  }
}

/**
 * "Excluir" uma caixinha só ARQUIVA (nunca deleta) — o ledger dela
 * (`fin_caixinhas_transacoes`) fica de pé como histórico permanente, mesmo
 * espírito de nunca apagar dinheiro do passado que já vale pro resto do
 * Financeiro (ver `fin_transacoes.conta_id` -> `on delete restrict`).
 */
export async function arquivarCaixinha(id: string): Promise<ActionResult> {
  try {
    const { supabase } = await requireModulo("financeiro");
    const { error } = await supabase.from("fin_caixinhas").update({ arquivada: true }).eq("id", id);
    if (error) return { ok: false, error: error.message };
    revalidatePath(PATH);
    revalidatePath("/admin/financeiro");
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Erro desconhecido." };
  }
}

// ----------------------------------------------------------------------------
// Movimentações — aporte / resgate / rendimento. Sempre via RPC (funções
// SECURITY DEFINER em `supabase/financeiro-caixinhas.sql`), nunca INSERT
// direto — é lá que mora a regra de negócio (lançamento espelho em
// `fin_transacoes`, validação de saldo, tudo atômico).
// ----------------------------------------------------------------------------
export async function aportarCaixinha(input: { caixinhaId: string; contaId: string; valor: number; descricao?: string }): Promise<ActionResult> {
  try {
    const { supabase } = await requireModulo("financeiro");
    if (!input.contaId) return { ok: false, error: "Selecione a conta de origem do aporte." };
    if (input.valor <= 0) return { ok: false, error: "O valor precisa ser maior que zero." };

    const { error } = await supabase.rpc("aportar_caixinha", {
      p_caixinha_id: input.caixinhaId,
      p_conta_id: input.contaId,
      p_valor: input.valor,
      p_descricao: input.descricao?.trim() || null,
    });
    if (error) return { ok: false, error: error.message };
    revalidatePath(PATH);
    revalidatePath("/admin/financeiro");
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Erro desconhecido." };
  }
}

export async function resgatarCaixinha(input: { caixinhaId: string; contaId: string; valor: number; descricao?: string }): Promise<ActionResult> {
  try {
    const { supabase } = await requireModulo("financeiro");
    if (!input.contaId) return { ok: false, error: "Selecione a conta de destino do resgate." };
    if (input.valor <= 0) return { ok: false, error: "O valor precisa ser maior que zero." };

    const { error } = await supabase.rpc("resgatar_caixinha", {
      p_caixinha_id: input.caixinhaId,
      p_conta_id: input.contaId,
      p_valor: input.valor,
      p_descricao: input.descricao?.trim() || null,
    });
    if (error) return { ok: false, error: error.message };
    revalidatePath(PATH);
    revalidatePath("/admin/financeiro");
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Erro desconhecido." };
  }
}

/** Lançar Rendimento — só credita a caixinha, nunca mexe em conta nenhuma (ver comentário na função SQL). */
export async function lancarRendimentoCaixinha(input: { caixinhaId: string; valor: number; descricao?: string }): Promise<ActionResult> {
  try {
    const { supabase } = await requireModulo("financeiro");
    if (input.valor <= 0) return { ok: false, error: "O valor precisa ser maior que zero." };

    const { error } = await supabase.rpc("lancar_rendimento_caixinha", {
      p_caixinha_id: input.caixinhaId,
      p_valor: input.valor,
      p_descricao: input.descricao?.trim() || null,
    });
    if (error) return { ok: false, error: error.message };
    revalidatePath(PATH);
    revalidatePath("/admin/financeiro");
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Erro desconhecido." };
  }
}
