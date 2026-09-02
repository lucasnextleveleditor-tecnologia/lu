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
  /** Recorrência — linhas que nascem juntas (esta + ocorrências futuras) compartilham o mesmo id; `null` numa transação avulsa (ver `supabase/financeiro-recorrencia.sql`). */
  recorrencia_grupo_id: string | null;
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
