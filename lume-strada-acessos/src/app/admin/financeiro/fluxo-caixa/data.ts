import { requireModuloOuRedirect } from "@/lib/auth/requireAdmin";
import type { ContaRow, ContaSaldoRow, FinContexto, FluxoCaixaPonto, TransacaoRow } from "@/lib/types/financeiro";
import { addDaysISO, todayISO } from "@/lib/utils/format";

export interface FluxoCaixaSearchParams {
  contexto?: string;
  dias?: string;
}

/** Janelas de projeção oferecidas no seletor de período da tela — ver `PeriodoFluxoCaixaToggle`. */
export const OPCOES_DIAS = [15, 30, 60, 90] as const;
export type DiasFluxoCaixa = (typeof OPCOES_DIAS)[number];
const DIAS_PADRAO: DiasFluxoCaixa = 30;

export function parseDiasParam(param: string | undefined): DiasFluxoCaixa {
  const n = Number(param);
  return (OPCOES_DIAS as readonly number[]).includes(n) ? (n as DiasFluxoCaixa) : DIAS_PADRAO;
}

/**
 * Projeção de saldo dia a dia — pedido explícito do dono da conta: "onde eu
 * posso ver o saldo futuro". Ponto de partida é o saldo ATUAL somado de
 * todas as contas (mesmo cálculo de `statSaldoContas` na página principal),
 * e cada dia seguinte soma/desconta as transações PENDENTES (não pagas)
 * vinculadas a uma conta (nunca cartão — a fatura só mexe no saldo quando
 * ELA é paga, o que já vira uma transação própria com `conta_id`) e não-
 * transferência (transferência é neutra pro total somado — sai de uma conta
 * e entra em outra, cancela na soma) que vencem naquele dia. Vencidas (não
 * pagas, vencimento no passado) caem todas no dia 0 — não têm outro dia
 * "certo".
 */
export async function buscarFluxoCaixa(
  searchParams: FluxoCaixaSearchParams
): Promise<{ contexto: "todos" | FinContexto; dias: DiasFluxoCaixa; saldoInicial: number; pontos: FluxoCaixaPonto[] }> {
  const { supabase } = await requireModuloOuRedirect("financeiro");
  const contexto: "todos" | FinContexto =
    searchParams.contexto === "pessoal" || searchParams.contexto === "profissional" ? searchParams.contexto : "todos";
  const dias = parseDiasParam(searchParams.dias);

  const [contasRes, contasSaldoRes, transacoesRes] = await Promise.all([
    supabase.from("fin_contas").select("*").overrideTypes<ContaRow[], { merge: false }>(),
    supabase.from("fin_contas_saldo").select("*").overrideTypes<ContaSaldoRow[], { merge: false }>(),
    supabase
      .from("fin_transacoes")
      .select("tipo, valor, data_vencimento, contexto, conta_id, pago")
      .eq("pago", false)
      .neq("tipo", "transferencia")
      .not("conta_id", "is", null)
      .overrideTypes<Pick<TransacaoRow, "tipo" | "valor" | "data_vencimento" | "contexto" | "conta_id" | "pago">[], { merge: false }>(),
  ]);

  const contas = contasRes.data ?? [];
  const saldoPorConta = new Map((contasSaldoRes.data ?? []).map((s) => [s.conta_id, s.saldo_atual]));
  const contasFiltradas = contexto === "todos" ? contas : contas.filter((c) => c.contexto === contexto);
  const saldoInicial = contasFiltradas.reduce((acc, c) => acc + (saldoPorConta.get(c.id) ?? c.saldo_inicial), 0);

  const pendentes = (transacoesRes.data ?? []).filter((t) => contexto === "todos" || t.contexto === contexto);

  const hoje = todayISO();
  const pontos: FluxoCaixaPonto[] = [];
  let saldoAcumulado = saldoInicial;

  for (let i = 0; i < dias; i++) {
    const data = addDaysISO(hoje, i);
    // Dia 0 absorve tudo que já venceu (vencidas) além do que vence hoje —
    // do dia 1 em diante, só o que vence EXATAMENTE naquele dia.
    const doDia = pendentes.filter((t) => (i === 0 ? t.data_vencimento <= data : t.data_vencimento === data));
    const receitas = doDia.filter((t) => t.tipo === "receita").reduce((acc, t) => acc + t.valor, 0);
    const despesas = doDia.filter((t) => t.tipo === "despesa").reduce((acc, t) => acc + t.valor, 0);
    saldoAcumulado += receitas - despesas;
    pontos.push({ data, saldoProjetado: saldoAcumulado, receitas, despesas });
  }

  return { contexto, dias, saldoInicial, pontos };
}
