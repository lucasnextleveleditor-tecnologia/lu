import { requireModuloOuRedirect } from "@/lib/auth/requireAdmin";
import type {
  CartaoLimiteRow,
  CartaoRow,
  CategoriaRow,
  ContaRow,
  ContaSaldoRow,
  FinContexto,
  FornecedorRow,
  TransacaoComRelacoes,
  TransacaoRow,
} from "@/lib/types/financeiro";
import { limitesDoMes, mesParam, parseMesParam, ultimosMeses } from "@/lib/utils/financeiro";
import { todayISO } from "@/lib/utils/format";

export interface FinanceiroSearchParams {
  mes?: string;
  contexto?: string;
  /** Vem do cartão "Precisa de atenção" do Dashboard: abre o Financeiro já com o lembrete das contas vencidas ou vencendo hoje. */
  destaque?: string;
  /** Id da transação a destacar na lista — cada linha do lembrete aponta para a sua. */
  foco?: string;
}

export type DestaqueVencimento = "vencidas" | "vencendo-hoje";

export function destaqueDe(valor: string | undefined): DestaqueVencimento | null {
  return valor === "vencidas" || valor === "vencendo-hoje" ? valor : null;
}

export interface ContaEmAtencao {
  id: string;
  descricao: string;
  valor: number;
  data_vencimento: string;
  /** `?mes=` a que essa conta pertence — uma conta vencida pode ser de um mês que não é o que está aberto na tela. */
  mesParam: string;
  origem: string | null;
}

/**
 * As contas por trás do número do Dashboard.
 *
 * O Dashboard conta SEM recorte de mês (`data_vencimento < hoje`), e o
 * Financeiro mostra um mês por vez — então uma conta vencida em julho não
 * apareceria na lista de setembro. Por isso esta busca é própria e ignora o
 * mês: o lembrete precisa mostrar as MESMAS contas que o número prometeu.
 *
 * Mesmo filtro do Dashboard (`contexto = profissional`, `pago = false`) pelo
 * mesmo motivo: dois lugares mostrando contagens diferentes da mesma coisa é
 * pior do que não mostrar.
 */
export async function buscarContasEmAtencao(destaque: DestaqueVencimento): Promise<ContaEmAtencao[]> {
  const { supabase } = await requireModuloOuRedirect("financeiro");
  const hoje = todayISO();

  const base = supabase
    .from("fin_transacoes")
    .select("id, descricao, valor, data_vencimento, fornecedor_id, categoria_id")
    .eq("contexto", "profissional")
    .eq("pago", false);

  const { data } = await (destaque === "vencidas"
    ? base.lt("data_vencimento", hoje).order("data_vencimento", { ascending: true })
    : base.eq("data_vencimento", hoje).order("valor", { ascending: false })
  )
    .limit(50)
    .overrideTypes<
      { id: string; descricao: string; valor: number; data_vencimento: string; fornecedor_id: string | null; categoria_id: string | null }[],
      { merge: false }
    >();

  const linhas = data ?? [];
  if (linhas.length === 0) return [];

  // Nomes só das relações que aparecem no lembrete — nada de trazer os
  // cadastros inteiros para escrever cinco linhas.
  const fornecedorIds = [...new Set(linhas.map((l) => l.fornecedor_id).filter(Boolean))] as string[];
  const categoriaIds = [...new Set(linhas.map((l) => l.categoria_id).filter(Boolean))] as string[];
  const [fornRes, catRes] = await Promise.all([
    fornecedorIds.length
      ? supabase.from("fin_fornecedores").select("id, nome").in("id", fornecedorIds).overrideTypes<{ id: string; nome: string }[], { merge: false }>()
      : Promise.resolve({ data: [] as { id: string; nome: string }[] }),
    categoriaIds.length
      ? supabase
          .from("fin_categorias")
          .select("id, nome, emoji")
          .in("id", categoriaIds)
          .overrideTypes<{ id: string; nome: string; emoji: string | null }[], { merge: false }>()
      : Promise.resolve({ data: [] as { id: string; nome: string; emoji: string | null }[] }),
  ]);

  const nomeFornecedor = new Map((fornRes.data ?? []).map((f) => [f.id, f.nome]));
  const nomeCategoria = new Map((catRes.data ?? []).map((c) => [c.id, c.emoji ? `${c.emoji} ${c.nome}` : c.nome]));

  return linhas.map((l) => ({
    id: l.id,
    descricao: l.descricao,
    valor: l.valor,
    data_vencimento: l.data_vencimento,
    mesParam: l.data_vencimento.slice(0, 7),
    origem:
      (l.fornecedor_id ? nomeFornecedor.get(l.fornecedor_id) : null) ??
      (l.categoria_id ? nomeCategoria.get(l.categoria_id) : null) ??
      null,
  }));
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

  const [contasRes, contasSaldoRes, cartoesRes, cartoesLimiteRes, categoriasRes, fornecedoresRes, transacoesRes] = await Promise.all([
    supabase.from("fin_contas").select("*").order("nome").overrideTypes<ContaRow[], { merge: false }>(),
    supabase.from("fin_contas_saldo").select("*").overrideTypes<ContaSaldoRow[], { merge: false }>(),
    supabase.from("fin_cartoes").select("*").order("nome").overrideTypes<CartaoRow[], { merge: false }>(),
    supabase.from("fin_cartoes_limite").select("*").overrideTypes<CartaoLimiteRow[], { merge: false }>(),
    supabase.from("fin_categorias").select("*").order("nome").overrideTypes<CategoriaRow[], { merge: false }>(),
    supabase.from("fin_fornecedores").select("*").order("nome").overrideTypes<FornecedorRow[], { merge: false }>(),
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
  const fornecedores = fornecedoresRes.data ?? [];
  const transacoesBrutas = transacoesRes.data ?? [];

  // Junta as views calculadas (saldo/limite) nas tabelas base em memória —
  // evitado join no Supabase pq `conta_id`/`conta_destino_id` apontam pra
  // mesma tabela (fin_contas) e um embed automático ficaria ambíguo.
  const saldoPorConta = new Map(saldos.map((s) => [s.conta_id, s.saldo_atual]));
  const limitePorCartao = new Map(limites.map((l) => [l.cartao_id, l]));
  const nomeConta = new Map(contas.map((c) => [c.id, c.nome]));
  const nomeCartao = new Map(cartoes.map((c) => [c.id, c.nome]));
  const nomeCategoria = new Map(categorias.map((c) => [c.id, c.emoji ? `${c.emoji} ${c.nome}` : c.nome]));
  const nomeFornecedor = new Map(fornecedores.map((f) => [f.id, f.nome]));

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
      fornecedor_nome: t.fornecedor_id ? (nomeFornecedor.get(t.fornecedor_id) ?? null) : null,
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
    fornecedores,
    transacoes,
    contasFiltradas,
    cartoesFiltrados,
    receitasDoMes,
    despesasDoMes,
    saldoTotal,
    limiteDisponivelTotal,
  };
}

/**
 * Só o cadastro de fornecedores, sem o resto dos dados do mês — usada pela
 * tela própria `/admin/financeiro/fornecedores` (ver pedido do dono da
 * conta de tirar o card de Fornecedores do dashboard principal). Reaproveita
 * o mesmo `fin_fornecedores` que `buscarDadosFinanceiro` já busca, mas sem
 * trazer contas/cartões/transações do mês à toa.
 */
export async function buscarFornecedores(): Promise<FornecedorRow[]> {
  const { supabase } = await requireModuloOuRedirect("financeiro");
  const { data } = await supabase.from("fin_fornecedores").select("*").order("nome").overrideTypes<FornecedorRow[], { merge: false }>();
  return data ?? [];
}

const MESES_HISTORICO = 6;

export interface HistoricoMensalPonto {
  mes: Date;
  mesParam: string;
  receitas: number;
  despesas: number;
  /** receitas - despesas do mês — "fechou no positivo ou no negativo" (ver `GraficoReceitaDespesa`/StatTile "Resultado do Mês" em `page.tsx`). */
  saldo: number;
}

/**
 * Totais de receita/despesa dos últimos `MESES_HISTORICO` meses (o mês em
 * referência incluso, sempre por último no array) — alimenta o gráfico de
 * tendência da página principal do Financeiro. Propositalmente NÃO
 * reaproveita `buscarDadosFinanceiro` (chamá-la 6x traria de novo
 * contas/cartões/categorias inteiros a cada mês, à toa): uma única query
 * leve em `fin_transacoes` (só as 4 colunas usadas aqui), agregada em
 * memória por mês.
 */
export async function buscarHistoricoMensal(searchParams: FinanceiroSearchParams): Promise<HistoricoMensalPonto[]> {
  const { supabase } = await requireModuloOuRedirect("financeiro");
  const referencia = parseMesParam(searchParams.mes);
  const contexto: "todos" | FinContexto =
    searchParams.contexto === "pessoal" || searchParams.contexto === "profissional" ? searchParams.contexto : "todos";

  const meses = ultimosMeses(referencia, MESES_HISTORICO);
  const { inicio } = limitesDoMes(meses[0]!);
  const { fim } = limitesDoMes(referencia);

  const { data } = await supabase
    .from("fin_transacoes")
    .select("tipo, valor, data_vencimento, contexto")
    .gte("data_vencimento", inicio)
    .lte("data_vencimento", fim)
    .overrideTypes<Pick<TransacaoRow, "tipo" | "valor" | "data_vencimento" | "contexto">[], { merge: false }>();

  const linhas = (data ?? []).filter((t) => contexto === "todos" || t.contexto === contexto);

  return meses.map((mes) => {
    const limites = limitesDoMes(mes);
    const doMes = linhas.filter((t) => t.data_vencimento >= limites.inicio && t.data_vencimento <= limites.fim);
    const receitas = doMes.filter((t) => t.tipo === "receita").reduce((acc, t) => acc + t.valor, 0);
    const despesas = doMes.filter((t) => t.tipo === "despesa").reduce((acc, t) => acc + t.valor, 0);
    return { mes, mesParam: mesParam(mes), receitas, despesas, saldo: receitas - despesas };
  });
}
