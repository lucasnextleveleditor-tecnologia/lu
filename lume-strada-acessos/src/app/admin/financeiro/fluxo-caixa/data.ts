import { requireModuloOuRedirect } from "@/lib/auth/requireAdmin";
import type { CategoriaRow, ContaRow, ContaSaldoRow, FinContexto, FluxoCaixaPonto, TransacaoRow } from "@/lib/types/financeiro";
import { addDaysISO, todayISO } from "@/lib/utils/format";
import { limitesDoMes, mesParam, parseMesParam } from "@/lib/utils/financeiro";

export interface FluxoCaixaSearchParams {
  contexto?: string;
  dias?: string;
  /** yyyy-MM — mês navegado pelo `MesNav` da DRE Mensal/Fluxo Diário (independente do `dias` da projeção acima). */
  mes?: string;
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

/** Uma linha de categoria dentro da DRE (`nome: null` = "sem categoria" — o rótulo em si fica pro componente, que já tem `dict.common.semCategoria`). */
export interface DreCategoriaLinha {
  nome: string | null;
  valor: number;
}

export interface DreMensal {
  receitaBruta: number;
  despesaTotal: number;
  resultadoLiquido: number;
  /** Maior valor primeiro — mesma ordem de exibição de `GraficoDespesasPorCategoria`. */
  receitasPorCategoria: DreCategoriaLinha[];
  despesasPorCategoria: DreCategoriaLinha[];
}

/** Um dia com movimentação real dentro do mês navegado — só dias com pelo menos um lançamento entram aqui (evita uma tabela de 30 linhas quase todas vazias). */
export interface FluxoDiarioLinha {
  data: string; // ISO date
  entradas: number;
  saidas: number;
  /** entradas - saidas SÓ deste dia — "quanto fechou esse dia" (pedido do dono da conta). */
  saldoDia: number;
  /** Soma de `saldoDia` do dia 1 do mês até este dia (inclusive) — "quanto fechou o mês [até aqui]"; a última linha da tabela é sempre o fechamento do mês inteiro. NÃO é o saldo real das contas (isso já é a "Projeção de Saldo" acima) — é só o acumulado de entradas/saídas dentro do mês. */
  acumulado: number;
}

/**
 * DRE mensal (Receita Bruta, Despesas por categoria, Resultado Líquido) e
 * fluxo de caixa diário (entradas/saídas por dia, com acumulado do mês) —
 * pedido explícito do dono da conta: "visão de DRE mensal" + "fluxo de
 * caixa diário de entradas e saídas... saiba o quanto fechou cada dia e
 * cada mês", navegável por mês (`MesNav`, independente do período de
 * projeção acima). Usa `data_vencimento` como a "data" de cada lançamento —
 * mesmo campo que o resto do módulo usa pra filtrar por mês
 * (`buscarDadosFinanceiro`), pra bater com a lista de "Transações do Mês"
 * do dashboard principal. Transferência fica de fora dos dois: é só
 * dinheiro migrando entre contas PRÓPRIAS, não é receita/despesa real nem
 * uma entrada/saída de fato (mesmo raciocínio de `GraficoDespesasPorCategoria`).
 */
export async function buscarFluxoMensal(
  searchParams: FluxoCaixaSearchParams
): Promise<{ referencia: Date; mesParamStr: string; contexto: "todos" | FinContexto; dre: DreMensal; diario: FluxoDiarioLinha[] }> {
  const { supabase } = await requireModuloOuRedirect("financeiro");
  const referencia = parseMesParam(searchParams.mes);
  const contexto: "todos" | FinContexto =
    searchParams.contexto === "pessoal" || searchParams.contexto === "profissional" ? searchParams.contexto : "todos";
  const { inicio, fim } = limitesDoMes(referencia);

  const [transacoesRes, categoriasRes] = await Promise.all([
    supabase
      .from("fin_transacoes")
      .select("tipo, valor, data_vencimento, contexto, categoria_id")
      .gte("data_vencimento", inicio)
      .lte("data_vencimento", fim)
      .neq("tipo", "transferencia")
      .overrideTypes<Pick<TransacaoRow, "tipo" | "valor" | "data_vencimento" | "contexto" | "categoria_id">[], { merge: false }>(),
    supabase.from("fin_categorias").select("*").overrideTypes<CategoriaRow[], { merge: false }>(),
  ]);

  const nomeCategoria = new Map((categoriasRes.data ?? []).map((c) => [c.id, c.emoji ? `${c.emoji} ${c.nome}` : c.nome]));
  const linhas = (transacoesRes.data ?? []).filter((t) => contexto === "todos" || t.contexto === contexto);

  function agruparPorCategoria(tipo: "receita" | "despesa"): DreCategoriaLinha[] {
    const mapa = new Map<string, number>(); // chave: categoria_id, ou "" pra sem categoria
    linhas
      .filter((t) => t.tipo === tipo)
      .forEach((t) => {
        const chave = t.categoria_id ?? "";
        mapa.set(chave, (mapa.get(chave) ?? 0) + t.valor);
      });
    return Array.from(mapa.entries())
      .map(([chave, valor]) => ({ nome: chave ? (nomeCategoria.get(chave) ?? null) : null, valor }))
      .sort((a, b) => b.valor - a.valor);
  }

  const receitasPorCategoria = agruparPorCategoria("receita");
  const despesasPorCategoria = agruparPorCategoria("despesa");
  const receitaBruta = receitasPorCategoria.reduce((acc, l) => acc + l.valor, 0);
  const despesaTotal = despesasPorCategoria.reduce((acc, l) => acc + l.valor, 0);

  const porDia = new Map<string, { entradas: number; saidas: number }>();
  linhas.forEach((t) => {
    const atual = porDia.get(t.data_vencimento) ?? { entradas: 0, saidas: 0 };
    if (t.tipo === "receita") atual.entradas += t.valor;
    else atual.saidas += t.valor;
    porDia.set(t.data_vencimento, atual);
  });

  let acumulado = 0;
  const diario: FluxoDiarioLinha[] = Array.from(porDia.entries())
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
    .map(([data, { entradas, saidas }]) => {
      const saldoDia = entradas - saidas;
      acumulado += saldoDia;
      return { data, entradas, saidas, saldoDia, acumulado };
    });

  return {
    referencia,
    mesParamStr: mesParam(referencia),
    contexto,
    dre: { receitaBruta, despesaTotal, resultadoLiquido: receitaBruta - despesaTotal, receitasPorCategoria, despesasPorCategoria },
    diario,
  };
}
