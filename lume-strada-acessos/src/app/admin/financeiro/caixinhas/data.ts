import { notFound } from "next/navigation";
import { requireModuloOuRedirect } from "@/lib/auth/requireAdmin";
import type { CaixinhaComSaldo, CaixinhaRow, CaixinhaSaldoRow, CaixinhaTransacaoRow, ContaComSaldo, ContaRow, ContaSaldoRow } from "@/lib/types/financeiro";

/**
 * Busca todas as caixinhas (não arquivadas) já com o saldo calculado — mesmo
 * padrão de `buscarDadosFinanceiro` pra Contas/Cartões: uma view calculada
 * (`fin_caixinhas_saldo`) juntada em memória com o cadastro, nunca uma
 * coluna de saldo na própria tabela.
 */
export async function buscarCaixinhas(): Promise<{ caixinhas: CaixinhaComSaldo[]; contas: ContaComSaldo[] }> {
  const { supabase } = await requireModuloOuRedirect("financeiro");

  const [caixinhasRes, saldosRes, contasRes, contasSaldoRes] = await Promise.all([
    supabase.from("fin_caixinhas").select("*").eq("arquivada", false).order("created_at").overrideTypes<CaixinhaRow[], { merge: false }>(),
    supabase.from("fin_caixinhas_saldo").select("*").overrideTypes<CaixinhaSaldoRow[], { merge: false }>(),
    supabase.from("fin_contas").select("*").order("nome").overrideTypes<ContaRow[], { merge: false }>(),
    supabase.from("fin_contas_saldo").select("*").overrideTypes<ContaSaldoRow[], { merge: false }>(),
  ]);

  const saldoPorCaixinha = new Map(
    (saldosRes.data ?? []).map((s) => [s.caixinha_id, { saldo_atual: s.saldo_atual, qtd_movimentacoes: s.qtd_movimentacoes, ultima_movimentacao_em: s.ultima_movimentacao_em }])
  );
  const saldoPorConta = new Map((contasSaldoRes.data ?? []).map((s) => [s.conta_id, s.saldo_atual]));

  const caixinhas: CaixinhaComSaldo[] = (caixinhasRes.data ?? []).map((c) => {
    const saldo = saldoPorCaixinha.get(c.id);
    return {
      ...c,
      saldo_atual: saldo?.saldo_atual ?? 0,
      qtd_movimentacoes: saldo?.qtd_movimentacoes ?? 0,
      ultima_movimentacao_em: saldo?.ultima_movimentacao_em ?? null,
    };
  });

  const contas = (contasRes.data ?? []).map((c) => ({ ...c, saldo_atual: saldoPorConta.get(c.id) ?? c.saldo_inicial }));

  return { caixinhas, contas };
}

/** Resumo leve (saldo total + quantidade) — usado no StatTile da página principal do Financeiro. */
export async function buscarResumoCaixinhas(): Promise<{ saldoTotal: number; qtd: number }> {
  const { supabase } = await requireModuloOuRedirect("financeiro");
  const [caixinhasRes, saldosRes] = await Promise.all([
    supabase.from("fin_caixinhas").select("id").eq("arquivada", false).overrideTypes<Pick<CaixinhaRow, "id">[], { merge: false }>(),
    supabase.from("fin_caixinhas_saldo").select("*").overrideTypes<CaixinhaSaldoRow[], { merge: false }>(),
  ]);
  const idsAtivas = new Set((caixinhasRes.data ?? []).map((c) => c.id));
  // `fin_caixinhas_saldo` não filtra arquivada — soma só as que ainda estão ativas, casando por `caixinha_id` (nunca por posição/índice, as duas queries não têm ordem garantida entre si).
  const saldoTotal = (saldosRes.data ?? []).reduce((acc, s) => (idsAtivas.has(s.caixinha_id) ? acc + s.saldo_atual : acc), 0);
  return { saldoTotal, qtd: idsAtivas.size };
}

/** Detalhe de uma caixinha + histórico completo do ledger — página `/admin/financeiro/caixinhas/[id]`. */
export async function buscarCaixinhaDetalhe(id: string): Promise<{ caixinha: CaixinhaComSaldo; contas: ContaComSaldo[]; historico: CaixinhaTransacaoRow[] }> {
  const { supabase } = await requireModuloOuRedirect("financeiro");

  const [caixinhaRes, saldoRes, historicoRes, contasRes, contasSaldoRes] = await Promise.all([
    supabase.from("fin_caixinhas").select("*").eq("id", id).maybeSingle<CaixinhaRow>(),
    supabase.from("fin_caixinhas_saldo").select("*").eq("caixinha_id", id).maybeSingle<CaixinhaSaldoRow>(),
    supabase.from("fin_caixinhas_transacoes").select("*").eq("caixinha_id", id).order("data", { ascending: false }).overrideTypes<CaixinhaTransacaoRow[], { merge: false }>(),
    supabase.from("fin_contas").select("*").order("nome").overrideTypes<ContaRow[], { merge: false }>(),
    supabase.from("fin_contas_saldo").select("*").overrideTypes<ContaSaldoRow[], { merge: false }>(),
  ]);

  if (!caixinhaRes.data) notFound();

  const saldoPorConta = new Map((contasSaldoRes.data ?? []).map((s) => [s.conta_id, s.saldo_atual]));
  const contas = (contasRes.data ?? []).map((c) => ({ ...c, saldo_atual: saldoPorConta.get(c.id) ?? c.saldo_inicial }));

  const caixinha: CaixinhaComSaldo = {
    ...caixinhaRes.data,
    saldo_atual: saldoRes.data?.saldo_atual ?? 0,
    qtd_movimentacoes: saldoRes.data?.qtd_movimentacoes ?? 0,
    ultima_movimentacao_em: saldoRes.data?.ultima_movimentacao_em ?? null,
  };

  return { caixinha, contas, historico: historicoRes.data ?? [] };
}
