import { requireModuloOuRedirect } from "@/lib/auth/requireAdmin";
import type {
  CartaoLimiteRow,
  CartaoRow,
  CategoriaRow,
  ContaRow,
  ContaSaldoRow,
  FinContexto,
  TransacaoComRelacoes,
  TransacaoRow,
} from "@/lib/types/financeiro";
import { limitesDoMes, mesParam, parseMesParam } from "@/lib/utils/financeiro";

export interface FinanceiroSearchParams {
  mes?: string;
  contexto?: string;
}

/**
 * Busca + monta TODOS os dados do módulo Financeiro pro mês/contexto
 * escolhido — extraído de `page.tsx` pra ser reaproveitado pelas telas de
 * detalhe (`/receitas`, `/despesas`, `/contas`, `/cartoes`), que precisam
 * exatamente do mesmo conjunto de dados, só filtrando/destacando uma fatia
 * diferente dele. Único lugar que sabe montar esse objeto — qualquer ajuste
 * na forma de calcular saldo/limite/totais afeta as 5 telas de uma vez.
 */
export async function buscarDadosFinanceiro(searchParams: FinanceiroSearchParams) {
  const { supabase } = await requireModuloOuRedirect("financeiro");
  const referencia = parseMesParam(searchParams.mes);
  const contexto: "todos" | FinContexto =
    searchParams.contexto === "pessoal" || searchParams.contexto === "profissional" ? searchParams.contexto : "todos";
  const { inicio, fim } = limitesDoMes(referencia);

  const [contasRes, contasSaldoRes, cartoesRes, cartoesLimiteRes, categoriasRes, transacoesRes] = await Promise.all([
    supabase.from("fin_contas").select("*").order("nome").overrideTypes<ContaRow[], { merge: false }>(),
    supabase.from("fin_contas_saldo").select("*").overrideTypes<ContaSaldoRow[], { merge: false }>(),
    supabase.from("fin_cartoes").select("*").order("nome").overrideTypes<CartaoRow[], { merge: false }>(),
    supabase.from("fin_cartoes_limite").select("*").overrideTypes<CartaoLimiteRow[], { merge: false }>(),
    supabase.from("fin_categorias").select("*").order("nome").overrideTypes<CategoriaRow[], { merge: false }>(),
    supabase
      .from("fin_transacoes")
      .select("*")
      .gte("data_vencimento", inicio)
      .lte("data_vencimento", fim)
      .order("data_vencimento", { ascending: false })
      .overrideTypes<TransacaoRow[], { merge: false }>(),
  ]);

  const contas = contasRes.data ?? [];
  const saldos = contasSaldoRes.data ?? [];
  const cartoes = cartoesRes.data ?? [];
  const limites = cartoesLimiteRes.data ?? [];
  const categorias = categoriasRes.data ?? [];
  const transacoesBrutas = transacoesRes.data ?? [];

  // Junta as views calculadas (saldo/limite) nas tabelas base em memória —
  // evitado join no Supabase pq `conta_id`/`conta_destino_id` apontam pra
  // mesma tabela (fin_contas) e um embed automático ficaria ambíguo.
  const saldoPorConta = new Map(saldos.map((s) => [s.conta_id, s.saldo_atual]));
  const limitePorCartao = new Map(limites.map((l) => [l.cartao_id, l]));
  const nomeConta = new Map(contas.map((c) => [c.id, c.nome]));
  const nomeCartao = new Map(cartoes.map((c) => [c.id, c.nome]));
  const nomeCategoria = new Map(categorias.map((c) => [c.id, c.emoji ? `${c.emoji} ${c.nome}` : c.nome]));

  const contasComSaldo = contas.map((c) => ({ ...c, saldo_atual: saldoPorConta.get(c.id) ?? c.saldo_inicial }));
  const cartoesComLimite = cartoes.map((c) => {
    const limite = limitePorCartao.get(c.id);
    return { ...c, limite_consumido: limite?.limite_consumido ?? 0, limite_disponivel: limite?.limite_disponivel ?? c.limite };
  });

  const transacoes: TransacaoComRelacoes[] = transacoesBrutas
    .filter((t) => contexto === "todos" || t.contexto === contexto)
    .map((t) => ({
      ...t,
      categoria_nome: t.categoria_id ? (nomeCategoria.get(t.categoria_id) ?? null) : null,
      conta_nome: t.conta_id ? (nomeConta.get(t.conta_id) ?? null) : null,
      conta_destino_nome: t.conta_destino_id ? (nomeConta.get(t.conta_destino_id) ?? null) : null,
      cartao_nome: t.cartao_id ? (nomeCartao.get(t.cartao_id) ?? null) : null,
    }));

  const contasFiltradas = contexto === "todos" ? contasComSaldo : contasComSaldo.filter((c) => c.contexto === contexto);
  const cartoesFiltrados = contexto === "todos" ? cartoesComLimite : cartoesComLimite.filter((c) => c.contexto === contexto);

  const receitasDoMes = transacoes.filter((t) => t.tipo === "receita").reduce((acc, t) => acc + t.valor, 0);
  const despesasDoMes = transacoes.filter((t) => t.tipo === "despesa").reduce((acc, t) => acc + t.valor, 0);
  const saldoTotal = contasFiltradas.reduce((acc, c) => acc + c.saldo_atual, 0);
  const limiteDisponivelTotal = cartoesFiltrados.reduce((acc, c) => acc + c.limite_disponivel, 0);

  return {
    referencia,
    contexto,
    mesParamStr: mesParam(referencia),
    contasComSaldo,
    cartoesComLimite,
    categorias,
    transacoes,
    contasFiltradas,
    cartoesFiltrados,
    receitasDoMes,
    despesasDoMes,
    saldoTotal,
    limiteDisponivelTotal,
  };
}
