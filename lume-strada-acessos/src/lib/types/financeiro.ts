export type FinContexto = "pessoal" | "profissional";
export type FinTipoTransacao = "receita" | "despesa" | "transferencia";
export type FinRecorrencia = "semanal" | "mensal" | "anual";
/** Moeda estrangeira suportada na conversão automática pra BRL (ver `buscarCotacao`). BRL não entra aqui de propósito — `moeda_original = null` já significa "nasceu em BRL". */
export type MoedaEstrangeira = "USD" | "EUR";

export interface ContaRow {
  id: string;
  nome: string;
  tipo: string | null;
  saldo_inicial: number;
  contexto: FinContexto;
  created_at: string;
}

export interface ContaSaldoRow {
  conta_id: string;
  nome: string;
  contexto: FinContexto;
  saldo_inicial: number;
  saldo_atual: number;
}

export interface CartaoRow {
  id: string;
  nome: string;
  limite: number;
  dia_fechamento: number;
  dia_vencimento: number;
  contexto: FinContexto;
  created_at: string;
}

export interface CartaoLimiteRow {
  cartao_id: string;
  nome: string;
  contexto: FinContexto;
  limite: number;
  limite_consumido: number;
  limite_disponivel: number;
}

export interface CategoriaRow {
  id: string;
  nome: string;
  tipo: "receita" | "despesa";
  cor: string | null;
  emoji: string | null;
  created_at: string;
}

export interface TransacaoRow {
  id: string;
  tipo: FinTipoTransacao;
  descricao: string;
  valor: number;
  categoria_id: string | null;
  contexto: FinContexto;
  conta_id: string | null;
  conta_destino_id: string | null;
  cartao_id: string | null;
  recorrente: boolean;
  recorrencia_intervalo: FinRecorrencia | null;
  data_vencimento: string; // ISO date
  pago: boolean;
  data_pagamento: string | null;
  fatura_paga: boolean;
  created_at: string;
  /** Parcelamento — as três colunas ficam `null` numa transação avulsa (ver `supabase/financeiro-parcelamento-moeda.sql`). */
  parcela_grupo_id: string | null;
  parcela_numero: number | null;
  parcela_total: number | null;
  /** Multi-moeda — `valor` acima é sempre BRL; estes três campos são só o registro informativo de origem (ver comentário no SQL). */
  moeda_original: MoedaEstrangeira | null;
  valor_original: number | null;
  taxa_cambio: number | null;
}

export type TransacaoComRelacoes = TransacaoRow & {
  categoria_nome: string | null;
  conta_nome: string | null;
  conta_destino_nome: string | null;
  cartao_nome: string | null;
};

/** Conta enriquecida com o saldo calculado (view `fin_contas_saldo`). */
export type ContaComSaldo = ContaRow & { saldo_atual: number };

/** Cartão enriquecido com o limite calculado (view `fin_cartoes_limite`). */
export type CartaoComLimite = CartaoRow & { limite_consumido: number; limite_disponivel: number };

export type StatusTransacao = "pendente" | "paga" | "vencida";

export function calcularStatusTransacao(t: Pick<TransacaoRow, "pago" | "data_vencimento">): StatusTransacao {
  if (t.pago) return "paga";
  const hoje = new Date().toISOString().slice(0, 10);
  if (t.data_vencimento < hoje) return "vencida";
  return "pendente";
}

// ----------------------------------------------------------------------------
// Caixinhas & Investimentos (Vaults) — sub-módulo dentro do Financeiro.
// Ver `supabase/financeiro-caixinhas.sql` pro schema completo/comentado.
// ----------------------------------------------------------------------------
export type CaixinhaTaxaPeriodo = "mensal" | "anual";
export type CaixinhaRisco = "baixo" | "medio" | "alto";
export type CaixinhaLiquidez = "imediata" | "curto_prazo" | "longo_prazo";
export type CaixinhaTipoMovimentacao = "aporte" | "resgate" | "rendimento";

export interface CaixinhaRow {
  id: string;
  nome: string;
  objetivo: string | null;
  valor_meta: number | null;
  data_alvo: string | null; // ISO date
  taxa_rendimento: number; // percentual, ex: 0.85 = 0,85%
  taxa_rendimento_periodo: CaixinhaTaxaPeriodo;
  nivel_risco: CaixinhaRisco;
  liquidez: CaixinhaLiquidez;
  contexto: FinContexto;
  emoji: string | null;
  cor: string | null;
  arquivada: boolean;
  created_at: string;
  updated_at: string;
}

export interface CaixinhaSaldoRow {
  caixinha_id: string;
  saldo_atual: number;
  qtd_movimentacoes: number;
  ultima_movimentacao_em: string | null;
}

/** Caixinha enriquecida com o saldo calculado (view `fin_caixinhas_saldo`). */
export type CaixinhaComSaldo = CaixinhaRow & { saldo_atual: number; qtd_movimentacoes: number; ultima_movimentacao_em: string | null };

export interface CaixinhaTransacaoRow {
  id: string;
  caixinha_id: string;
  tipo: CaixinhaTipoMovimentacao;
  valor: number;
  descricao: string | null;
  transacao_fin_id: string | null;
  data: string; // ISO timestamptz
  created_at: string;
}

/**
 * Taxa mensal equivalente, sempre convertida a partir de `taxa_rendimento`/
 * `taxa_rendimento_periodo` — usada tanto pela projeção de 12 meses quanto
 * por qualquer outro cálculo de juros compostos da caixinha. Taxa anual ->
 * mensal usa a conversão geométrica correta (não divide por 12 — isso
 * subestimaria o efeito composto).
 */
export function taxaMensalEquivalente(taxaRendimento: number, periodo: CaixinhaTaxaPeriodo): number {
  const taxa = taxaRendimento / 100;
  if (periodo === "mensal") return taxa;
  return Math.pow(1 + taxa, 1 / 12) - 1;
}

export interface PontoProjecao {
  mes: number; // 0 = hoje, 1..12 = meses à frente
  data: string; // ISO date do início do mês projetado
  valor: number;
}

/**
 * Projeção de juros compostos dos próximos `meses` a partir do saldo atual
 * — NÃO assume nenhum aporte futuro, só o efeito da taxa de rendimento
 * cadastrada sobre o saldo de hoje (mesmo espírito de "se eu não mexer mais
 * nessa caixinha, quanto ela vale daqui a X meses"). Aportes/resgates reais
 * lançados depois só entram no saldo ATUAL na próxima vez que a página
 * recarregar — a curva projetada é sempre recalculada a partir dele.
 */
export function projetarJurosCompostos(saldoAtual: number, taxaRendimento: number, periodo: CaixinhaTaxaPeriodo, meses = 12): PontoProjecao[] {
  const taxaMensal = taxaMensalEquivalente(taxaRendimento, periodo);
  const hoje = new Date();
  const pontos: PontoProjecao[] = [];
  for (let i = 0; i <= meses; i++) {
    const data = new Date(Date.UTC(hoje.getUTCFullYear(), hoje.getUTCMonth() + i, 1));
    pontos.push({ mes: i, data: data.toISOString().slice(0, 10), valor: saldoAtual * Math.pow(1 + taxaMensal, i) });
  }
  return pontos;
}
