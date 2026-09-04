"use server";

import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { requireModulo } from "@/lib/auth/requireAdmin";
import type { FinContexto, FinRecorrencia, FinTipoTransacao, MoedaEstrangeira } from "@/lib/types/financeiro";
import { addDaysISO, addMonthsISO } from "@/lib/utils/format";

export type ActionResult = { ok: true } | { ok: false; error: string };
export type ActionResultId = { ok: true; id: string } | { ok: false; error: string };
export type EscopoExclusaoRecorrencia = "somente_esta" | "esta_e_futuras" | "todas";

const PATH = "/admin/financeiro";

// ----------------------------------------------------------------------------
// Recorrência — quantas ocorrências FUTURAS já nascem lançadas de uma vez,
// pra cada intervalo (a atual + essa quantidade). Não é "pra sempre" de
// propósito — um horizonte finito evita gerar milhares de linhas por engano
// numa recorrência esquecida, e o admin sempre pode editar/excluir e deixar
// nascer mais conforme o tempo passa (ainda não existe um job que "estende"
// a série automaticamente — ver nota em `MIGRACAO-MULTI-TENANT.md`).
// ----------------------------------------------------------------------------
const HORIZONTE_RECORRENCIA: Record<FinRecorrencia, number> = {
  semanal: 12, // ~3 meses
  mensal: 12, // 1 ano
  anual: 5,
};

function proximaDataRecorrencia(dataBase: string, intervalo: FinRecorrencia, ocorrencia: number): string {
  if (intervalo === "semanal") return addDaysISO(dataBase, 7 * ocorrencia);
  if (intervalo === "anual") return addMonthsISO(dataBase, 12 * ocorrencia);
  return addMonthsISO(dataBase, ocorrencia);
}

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

export async function atualizarConta(
  id: string,
  input: { nome: string; tipo: string | null; saldoInicial: number; contexto: FinContexto }
): Promise<ActionResult> {
  try {
    const { supabase } = await requireModulo("financeiro");
    if (!input.nome.trim()) return { ok: false, error: "Informe o nome da conta." };

    const { error } = await supabase
      .from("fin_contas")
      .update({
        nome: input.nome.trim(),
        tipo: input.tipo?.trim() || null,
        saldo_inicial: input.saldoInicial,
        contexto: input.contexto,
      })
      .eq("id", id);
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

export async function atualizarCartao(
  id: string,
  input: { nome: string; limite: number; diaFechamento: number; diaVencimento: number; contexto: FinContexto }
): Promise<ActionResult> {
  try {
    const { supabase } = await requireModulo("financeiro");
    if (!input.nome.trim()) return { ok: false, error: "Informe o nome do cartão." };

    const { error } = await supabase
      .from("fin_cartoes")
      .update({
        nome: input.nome.trim(),
        limite: input.limite,
        dia_fechamento: input.diaFechamento,
        dia_vencimento: input.diaVencimento,
        contexto: input.contexto,
      })
      .eq("id", id);
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
  /** Sempre em BRL — se a transação foi lançada em moeda estrangeira, já vem convertida (ver `moedaOriginal`/`taxaCambio` abaixo). */
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
  /** `null`/ausente = a transação nasceu direto em BRL, sem conversão nenhuma. */
  moedaOriginal?: MoedaEstrangeira | null;
  valorOriginal?: number | null;
  taxaCambio?: number | null;
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

    const recorrenciaAtiva = input.recorrente && input.tipo !== "transferencia" ? input.recorrenciaIntervalo : null;

    // Recorrência — gera de uma vez ESTA transação + as ocorrências futuras
    // (mesmo espírito do parcelamento, ver `criarTransacaoParcelada` abaixo),
    // todas com o mesmo `recorrencia_grupo_id`. Diferente do parcelamento, o
    // VALOR se repete igual em cada ocorrência (não divide um total) — é uma
    // assinatura de R$50, não uma compra de R$600 dividida em 12x. Só a
    // primeira ocorrência (a que está sendo lançada agora) herda `jaPaga`;
    // as futuras nascem sempre pendentes, porque ainda não venceram.
    if (recorrenciaAtiva) {
      const grupoId = randomUUID();
      const n = HORIZONTE_RECORRENCIA[recorrenciaAtiva];
      const linhas = Array.from({ length: n }, (_, i) => ({
        tipo: input.tipo,
        descricao: input.descricao.trim(),
        valor: input.valor,
        categoria_id: input.categoriaId,
        contexto: input.contexto,
        conta_id: input.cartaoId ? null : input.contaId,
        conta_destino_id: null,
        cartao_id: input.cartaoId,
        recorrente: true,
        recorrencia_intervalo: recorrenciaAtiva,
        recorrencia_grupo_id: grupoId,
        data_vencimento: proximaDataRecorrencia(input.dataVencimento, recorrenciaAtiva, i),
        pago: i === 0 ? input.jaPaga : false,
        data_pagamento: i === 0 && input.jaPaga ? new Date().toISOString() : null,
        moeda_original: input.moedaOriginal ?? null,
        valor_original: input.valorOriginal ?? null,
        taxa_cambio: input.taxaCambio ?? null,
      }));

      const { error } = await supabase.from("fin_transacoes").insert(linhas);
      if (error) return { ok: false, error: error.message };
      revalidatePath(PATH);
      return { ok: true };
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
      moeda_original: input.moedaOriginal ?? null,
      valor_original: input.valorOriginal ?? null,
      taxa_cambio: input.taxaCambio ?? null,
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
 *
 * Recorrência na edição: se a transação editada AINDA NÃO pertence a uma
 * série (`recorrencia_grupo_id` nulo) e o admin marca "recorrente" agora,
 * criamos uma série nova a partir de hoje (esta linha vira a primeira
 * ocorrência + geramos as futuras). Se ela JÁ pertence a uma série, a edição
 * mexe só nessa linha — não recria nem apaga as outras ocorrências (evita
 * duplicar ou perder lançamentos já conferidos pelo admin).
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

    // Descobre se essa linha já pertence a uma série de recorrência — decide
    // se vamos só atualizar essa linha ou também criar uma série nova.
    const { data: atual, error: erroAtual } = await supabase
      .from("fin_transacoes")
      .select("recorrencia_grupo_id")
      .eq("id", id)
      .single();
    if (erroAtual) return { ok: false, error: erroAtual.message };

    const vaiCriarSerieNova = Boolean(
      !atual?.recorrencia_grupo_id && input.recorrente && input.tipo !== "transferencia" && input.recorrenciaIntervalo
    );
    const novoGrupoId = vaiCriarSerieNova ? randomUUID() : null;

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
        recorrencia_grupo_id: novoGrupoId ?? atual?.recorrencia_grupo_id ?? null,
        data_vencimento: input.dataVencimento,
        pago: input.jaPaga,
        data_pagamento: input.jaPaga ? new Date().toISOString() : null,
        moeda_original: input.moedaOriginal ?? null,
        valor_original: input.valorOriginal ?? null,
        taxa_cambio: input.taxaCambio ?? null,
      })
      .eq("id", id);
    if (error) return { ok: false, error: error.message };

    // Série nova: já gera as ocorrências futuras a partir da data desta
    // transação, do mesmo jeito que `criarTransacao` faz ao lançar direto
    // como recorrente.
    if (vaiCriarSerieNova && novoGrupoId) {
      const intervalo = input.recorrenciaIntervalo!;
      const n = HORIZONTE_RECORRENCIA[intervalo];
      const linhasFuturas = Array.from({ length: n - 1 }, (_, idx) => {
        const i = idx + 1;
        return {
          tipo: input.tipo,
          descricao: input.descricao.trim(),
          valor: input.valor,
          categoria_id: input.categoriaId,
          contexto: input.contexto,
          conta_id: input.cartaoId ? null : input.contaId,
          conta_destino_id: null,
          cartao_id: input.cartaoId,
          recorrente: true,
          recorrencia_intervalo: intervalo,
          recorrencia_grupo_id: novoGrupoId,
          data_vencimento: proximaDataRecorrencia(input.dataVencimento, intervalo, i),
          pago: false,
          data_pagamento: null,
          moeda_original: input.moedaOriginal ?? null,
          valor_original: input.valorOriginal ?? null,
          taxa_cambio: input.taxaCambio ?? null,
        };
      });
      if (linhasFuturas.length > 0) {
        const { error: erroFuturas } = await supabase.from("fin_transacoes").insert(linhasFuturas);
        if (erroFuturas) return { ok: false, error: erroFuturas.message };
      }
    }

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

/**
 * Exclui uma transação recorrente respeitando o escopo escolhido pelo admin
 * (ver `TransacoesManager` — o prompt de 3 opções só aparece quando a
 * transação tem `recorrencia_grupo_id`; pra uma transação avulsa, o
 * `TransacoesManager` já chama `removerTransacao` direto):
 *
 * - "somente_esta": apaga só esta linha, deixa o resto da série intacto.
 * - "esta_e_futuras": apaga esta + todas as ocorrências da MESMA série com
 *   vencimento igual ou posterior a esta (as passadas ficam).
 * - "todas": apaga a série inteira (passadas, esta e futuras).
 */
export async function removerTransacaoComEscopo(id: string, escopo: EscopoExclusaoRecorrencia): Promise<ActionResult> {
  try {
    const { supabase } = await requireModulo("financeiro");

    const { data: transacao, error: erroBusca } = await supabase
      .from("fin_transacoes")
      .select("recorrencia_grupo_id, data_vencimento")
      .eq("id", id)
      .single();
    if (erroBusca) return { ok: false, error: erroBusca.message };

    // Sem grupo de recorrência — não há série pra considerar, comporta-se
    // como o `removerTransacao` simples independente do escopo pedido.
    if (!transacao?.recorrencia_grupo_id || escopo === "somente_esta") {
      const { error } = await supabase.from("fin_transacoes").delete().eq("id", id);
      if (error) return { ok: false, error: error.message };
      revalidatePath(PATH);
      return { ok: true };
    }

    if (escopo === "todas") {
      const { error } = await supabase.from("fin_transacoes").delete().eq("recorrencia_grupo_id", transacao.recorrencia_grupo_id);
      if (error) return { ok: false, error: error.message };
      revalidatePath(PATH);
      return { ok: true };
    }

    // "esta_e_futuras"
    const { error } = await supabase
      .from("fin_transacoes")
      .delete()
      .eq("recorrencia_grupo_id", transacao.recorrencia_grupo_id)
      .gte("data_vencimento", transacao.data_vencimento);
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

// ----------------------------------------------------------------------------
// Multi-moeda — cotação em tempo real
// ----------------------------------------------------------------------------
export type CotacaoResult = { ok: true; taxa: number; dataCotacao: string } | { ok: false; error: string };

/**
 * Busca a cotação do dia (moeda estrangeira -> BRL) na Frankfurter API
 * (referência do Banco Central Europeu — https://frankfurter.dev),
 * gratuita e sem chave/cadastro. Chamada toda vez que o admin muda a moeda
 * no formulário de transação ou clica em "Atualizar cotação" — NUNCA
 * cacheada no banco; `fin_transacoes.taxa_cambio` guarda só a taxa usada
 * naquele lançamento específico, como registro histórico.
 */
export async function buscarCotacao(moeda: MoedaEstrangeira): Promise<CotacaoResult> {
  try {
    await requireModulo("financeiro");
    const resposta = await fetch(`https://api.frankfurter.dev/v1/latest?from=${moeda}&to=BRL`, { cache: "no-store" });
    if (!resposta.ok) return { ok: false, error: "Não foi possível buscar a cotação agora. Tente de novo em instantes." };
    const dados = (await resposta.json()) as { rates?: Record<string, number>; date?: string };
    const taxa = dados.rates?.BRL;
    if (typeof taxa !== "number") return { ok: false, error: "Cotação indisponível no momento." };
    return { ok: true, taxa, dataCotacao: dados.date ?? new Date().toISOString().slice(0, 10) };
  } catch {
    return { ok: false, error: "Não foi possível buscar a cotação — verifique sua conexão e tente de novo." };
  }
}

// ----------------------------------------------------------------------------
// Parcelamento
// ----------------------------------------------------------------------------
export interface CriarTransacaoParceladaInput {
  descricao: string;
  /** Valor TOTAL da compra, sempre em BRL (já convertido, se a moeda original não era BRL). */
  valorTotal: number;
  numParcelas: number;
  categoriaId: string | null;
  contexto: FinContexto;
  contaId: string | null;
  cartaoId: string | null;
  dataPrimeiraParcela: string; // ISO date
  moedaOriginal: MoedaEstrangeira | null;
  valorOriginalTotal: number | null;
  taxaCambio: number | null;
}

/**
 * Lança uma compra parcelada — insere as N parcelas de uma vez, todas
 * PENDENTES (nenhuma nasce paga; o admin dá baixa em cada uma no seu
 * vencimento, igual qualquer outra transação — decisão deliberada, não
 * fatura fictícia sendo "pré-paga" no lançamento).
 *
 * Trabalha em CENTAVOS (inteiros) pra nunca perder/sobrar um centavo por
 * arredondamento de ponto flutuante ao dividir o total por N — a ÚLTIMA
 * parcela absorve o resto da divisão, igual a prática comum de qualquer
 * fatura de cartão parcelada de verdade.
 */
export async function criarTransacaoParcelada(input: CriarTransacaoParceladaInput): Promise<ActionResult> {
  try {
    const { supabase } = await requireModulo("financeiro");

    if (!input.descricao.trim()) return { ok: false, error: "Informe uma descrição." };
    if (input.valorTotal <= 0) return { ok: false, error: "O valor total precisa ser maior que zero." };
    if (!Number.isInteger(input.numParcelas) || input.numParcelas < 2 || input.numParcelas > 60) {
      return { ok: false, error: "Número de parcelas inválido — use um valor entre 2 e 60." };
    }
    if (!input.contaId && !input.cartaoId) return { ok: false, error: "Selecione a conta ou o cartão dessa compra." };

    const grupoId = randomUUID();
    const n = input.numParcelas;

    const totalCentavos = Math.round(input.valorTotal * 100);
    const baseCentavos = Math.floor(totalCentavos / n);
    const restoCentavos = totalCentavos - baseCentavos * n;

    const totalOriginalCentavos = input.valorOriginalTotal !== null ? Math.round(input.valorOriginalTotal * 100) : null;
    const baseOriginalCentavos = totalOriginalCentavos !== null ? Math.floor(totalOriginalCentavos / n) : null;
    const restoOriginalCentavos = totalOriginalCentavos !== null ? totalOriginalCentavos - baseOriginalCentavos! * n : null;

    const linhas = Array.from({ length: n }, (_, i) => {
      const centavosParcela = baseCentavos + (i === n - 1 ? restoCentavos : 0);
      const centavosOriginalParcela =
        baseOriginalCentavos !== null ? baseOriginalCentavos + (i === n - 1 ? restoOriginalCentavos! : 0) : null;
      return {
        tipo: "despesa" as const,
        descricao: input.descricao.trim(),
        valor: centavosParcela / 100,
        categoria_id: input.categoriaId,
        contexto: input.contexto,
        conta_id: input.cartaoId ? null : input.contaId,
        conta_destino_id: null,
        cartao_id: input.cartaoId,
        recorrente: false,
        recorrencia_intervalo: null,
        data_vencimento: addMonthsISO(input.dataPrimeiraParcela, i),
        pago: false,
        data_pagamento: null,
        parcela_grupo_id: grupoId,
        parcela_numero: i + 1,
        parcela_total: n,
        moeda_original: input.moedaOriginal,
        valor_original: centavosOriginalParcela !== null ? centavosOriginalParcela / 100 : null,
        taxa_cambio: input.taxaCambio,
      };
    });

    const { error } = await supabase.from("fin_transacoes").insert(linhas);
    if (error) return { ok: false, error: error.message };
    revalidatePath(PATH);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Erro desconhecido." };
  }
}
