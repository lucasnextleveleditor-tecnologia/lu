"use server";

import { revalidatePath } from "next/cache";
import { requireModulo } from "@/lib/auth/requireAdmin";
import type { FinContexto, FinRecorrencia, FinTipoTransacao } from "@/lib/types/financeiro";

export type ActionResult = { ok: true } | { ok: false; error: string };
export type ActionResultId = { ok: true; id: string } | { ok: false; error: string };

const PATH = "/admin/financeiro";

// ----------------------------------------------------------------------------
// Contas
// ----------------------------------------------------------------------------
export async function criarConta(input: { nome: string; tipo: string | null; saldoInicial: number; contexto: FinContexto }): Promise<ActionResult> {
  try {
    const { supabase } = await requireModulo("financeiro");
    if (!input.nome.trim()) return { ok: false, error: "Informe o nome da conta." };

    const { error } = await supabase.from("fin_contas").insert({
      nome: input.nome.trim(),
      tipo: input.tipo?.trim() || null,
      saldo_inicial: input.saldoInicial,
      contexto: input.contexto,
    });
    if (error) return { ok: false, error: error.message };
    revalidatePath(PATH);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Erro desconhecido." };
  }
}

export async function removerConta(id: string): Promise<ActionResult> {
  try {
    const { supabase } = await requireModulo("financeiro");
    const { error } = await supabase.from("fin_contas").delete().eq("id", id);
    // Código 23503 = violação de chave estrangeira (ver `correcoes-auditoria.sql`:
    // `fin_transacoes.conta_id`/`conta_destino_id` passaram de `on delete cascade`
    // para `on delete restrict` de propósito, pra impedir que apagar uma conta
    // apague silenciosamente todo o histórico financeiro ligado a ela).
    if (error) return { ok: false, error: error.code === "23503" ? "Essa conta tem transações lançadas — remova ou mude a conta delas antes de excluir." : error.message };
    revalidatePath(PATH);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Erro desconhecido." };
  }
}

// ----------------------------------------------------------------------------
// Cartões
// ----------------------------------------------------------------------------
export async function criarCartao(input: {
  nome: string;
  limite: number;
  diaFechamento: number;
  diaVencimento: number;
  contexto: FinContexto;
}): Promise<ActionResult> {
  try {
    const { supabase } = await requireModulo("financeiro");
    if (!input.nome.trim()) return { ok: false, error: "Informe o nome do cartão." };

    const { error } = await supabase.from("fin_cartoes").insert({
      nome: input.nome.trim(),
      limite: input.limite,
      dia_fechamento: input.diaFechamento,
      dia_vencimento: input.diaVencimento,
      contexto: input.contexto,
    });
    if (error) return { ok: false, error: error.message };
    revalidatePath(PATH);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Erro desconhecido." };
  }
}

export async function removerCartao(id: string): Promise<ActionResult> {
  try {
    const { supabase } = await requireModulo("financeiro");
    const { error } = await supabase.from("fin_cartoes").delete().eq("id", id);
    if (error) return { ok: false, error: error.code === "23503" ? "Esse cartão tem transações lançadas — remova ou mude o cartão delas antes de excluir." : error.message };
    revalidatePath(PATH);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Erro desconhecido." };
  }
}

// ----------------------------------------------------------------------------
// Categorias
// ----------------------------------------------------------------------------
export async function criarCategoria(input: { nome: string; tipo: "receita" | "despesa"; cor: string | null; emoji: string | null }): Promise<ActionResult> {
  try {
    const { supabase } = await requireModulo("financeiro");
    if (!input.nome.trim()) return { ok: false, error: "Informe o nome da categoria." };

    const { error } = await supabase.from("fin_categorias").insert({
      nome: input.nome.trim(),
      tipo: input.tipo,
      cor: input.cor,
      emoji: input.emoji?.trim() || null,
    });
    // 23505 = já existe uma categoria com esse nome+tipo (constraint única,
    // ver `supabase/financeiro-categorias.sql`) — evita duplicar sem querer
    // uma categoria que já veio no pacote padrão.
    if (error) return { ok: false, error: error.code === "23505" ? "Já existe uma categoria com esse nome e tipo." : error.message };
    revalidatePath(PATH);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Erro desconhecido." };
  }
}

export async function removerCategoria(id: string): Promise<ActionResult> {
  try {
    const { supabase } = await requireModulo("financeiro");
    const { error } = await supabase.from("fin_categorias").delete().eq("id", id);
    if (error) return { ok: false, error: error.message };
    revalidatePath(PATH);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Erro desconhecido." };
  }
}

// ----------------------------------------------------------------------------
// Transações
// ----------------------------------------------------------------------------
export interface CriarTransacaoInput {
  tipo: FinTipoTransacao;
  descricao: string;
  valor: number;
  categoriaId: string | null;
  contexto: FinContexto;
  contaId: string | null;
  contaDestinoId: string | null;
  cartaoId: string | null;
  recorrente: boolean;
  recorrenciaIntervalo: FinRecorrencia | null;
  dataVencimento: string; // ISO date
  jaPaga: boolean;
}

export async function criarTransacao(input: CriarTransacaoInput): Promise<ActionResult> {
  try {
    const { supabase } = await requireModulo("financeiro");

    if (!input.descricao.trim()) return { ok: false, error: "Informe uma descrição." };
    if (input.valor <= 0) return { ok: false, error: "O valor precisa ser maior que zero." };

    if (input.tipo === "transferencia") {
      if (!input.contaId || !input.contaDestinoId) return { ok: false, error: "Selecione a conta de origem e a de destino." };
      if (input.contaId === input.contaDestinoId) return { ok: false, error: "A conta de origem e destino não podem ser a mesma." };
    } else if (!input.contaId && !input.cartaoId) {
      return { ok: false, error: "Selecione a conta ou o cartão dessa transação." };
    }

    const { error } = await supabase.from("fin_transacoes").insert({
      tipo: input.tipo,
      descricao: input.descricao.trim(),
      valor: input.valor,
      categoria_id: input.tipo === "transferencia" ? null : input.categoriaId,
      contexto: input.contexto,
      conta_id: input.tipo === "transferencia" ? input.contaId : input.cartaoId ? null : input.contaId,
      conta_destino_id: input.tipo === "transferencia" ? input.contaDestinoId : null,
      cartao_id: input.tipo === "transferencia" ? null : input.cartaoId,
      recorrente: input.recorrente,
      recorrencia_intervalo: input.recorrente ? input.recorrenciaIntervalo : null,
      data_vencimento: input.dataVencimento,
      pago: input.jaPaga,
      data_pagamento: input.jaPaga ? new Date().toISOString() : null,
    });
    if (error) return { ok: false, error: error.message };
    revalidatePath(PATH);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Erro desconhecido." };
  }
}

/**
 * Edita uma transação já lançada. Mesmas validações de `criarTransacao` —
 * antes dessa função a única forma de corrigir um erro de digitação (valor,
 * descrição, data, categoria...) era excluir o lançamento inteiro e recriar
 * do zero, perdendo o histórico de quando foi criado.
 */
export async function atualizarTransacao(id: string, input: CriarTransacaoInput): Promise<ActionResult> {
  try {
    const { supabase } = await requireModulo("financeiro");

    if (!input.descricao.trim()) return { ok: false, error: "Informe uma descrição." };
    if (input.valor <= 0) return { ok: false, error: "O valor precisa ser maior que zero." };

    if (input.tipo === "transferencia") {
      if (!input.contaId || !input.contaDestinoId) return { ok: false, error: "Selecione a conta de origem e a de destino." };
      if (input.contaId === input.contaDestinoId) return { ok: false, error: "A conta de origem e destino não podem ser a mesma." };
    } else if (!input.contaId && !input.cartaoId) {
      return { ok: false, error: "Selecione a conta ou o cartão dessa transação." };
    }

    const { error } = await supabase
      .from("fin_transacoes")
      .update({
        tipo: input.tipo,
        descricao: input.descricao.trim(),
        valor: input.valor,
        categoria_id: input.tipo === "transferencia" ? null : input.categoriaId,
        contexto: input.contexto,
        conta_id: input.tipo === "transferencia" ? input.contaId : input.cartaoId ? null : input.contaId,
        conta_destino_id: input.tipo === "transferencia" ? input.contaDestinoId : null,
        cartao_id: input.tipo === "transferencia" ? null : input.cartaoId,
        recorrente: input.recorrente,
        recorrencia_intervalo: input.recorrente ? input.recorrenciaIntervalo : null,
        data_vencimento: input.dataVencimento,
        pago: input.jaPaga,
        data_pagamento: input.jaPaga ? new Date().toISOString() : null,
      })
      .eq("id", id);
    if (error) return { ok: false, error: error.message };
    revalidatePath(PATH);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Erro desconhecido." };
  }
}

/**
 * Baixa Inteligente — alterna `pago`. Não mexe em nenhum saldo diretamente:
 * as views `fin_contas_saldo`/`fin_cartoes_limite` recalculam sozinhas a
 * partir dessa mudança (ver comentário no schema).
 */
export async function marcarPago(id: string, pago: boolean): Promise<ActionResult> {
  try {
    const { supabase } = await requireModulo("financeiro");
    const { error } = await supabase
      .from("fin_transacoes")
      .update({ pago, data_pagamento: pago ? new Date().toISOString() : null })
      .eq("id", id);
    if (error) return { ok: false, error: error.message };
    revalidatePath(PATH);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Erro desconhecido." };
  }
}

export async function removerTransacao(id: string): Promise<ActionResult> {
  try {
    const { supabase } = await requireModulo("financeiro");
    const { error } = await supabase.from("fin_transacoes").delete().eq("id", id);
    if (error) return { ok: false, error: error.message };
    revalidatePath(PATH);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Erro desconhecido." };
  }
}

/** Pagar Fatura — chama a função de banco `pagar_fatura` (ver 002_financeiro.sql), que faz tudo atomicamente. */
export async function pagarFatura(input: { cartaoId: string; contaPagamentoId: string; periodoReferencia: string }): Promise<ActionResult> {
  try {
    const { supabase } = await requireModulo("financeiro");
    const { error } = await supabase.rpc("pagar_fatura", {
      p_cartao_id: input.cartaoId,
      p_conta_pagamento_id: input.contaPagamentoId,
      p_periodo_referencia: input.periodoReferencia,
    });
    if (error) return { ok: false, error: error.message };
    revalidatePath(PATH);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Erro desconhecido." };
  }
}
