import { createClient } from "@/lib/supabase/server";
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
import { limitesDoMes, parseMesParam } from "@/lib/utils/financeiro";
import { fmtBRL } from "@/lib/utils/format";
import { StatTile } from "@/components/ui/StatTile";
import { IconWallet, IconCreditCard, IconTrendingUp, IconAlertTriangle } from "@/components/ui/icons";
import { MesNav } from "@/components/admin/financeiro/MesNav";
import { ContextoToggle } from "@/components/admin/financeiro/ContextoToggle";
import { ContasCard } from "@/components/admin/financeiro/ContasCard";
import { CartoesCard } from "@/components/admin/financeiro/CartoesCard";
import { CategoriasCard } from "@/components/admin/financeiro/CategoriasCard";
import { TransacoesManager } from "@/components/admin/financeiro/TransacoesManager";

export const dynamic = "force-dynamic";

interface FinanceiroPageProps {
  searchParams: Promise<{ mes?: string; contexto?: string }>;
}

export default async function FinanceiroPage({ searchParams }: FinanceiroPageProps) {
  const params = await searchParams;
  const referencia = parseMesParam(params.mes);
  const contexto: "todos" | FinContexto =
    params.contexto === "pessoal" || params.contexto === "profissional" ? params.contexto : "todos";
  const { inicio, fim } = limitesDoMes(referencia);

  const supabase = await createClient();

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
  const nomeCategoria = new Map(categorias.map((c) => [c.id, c.nome]));

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

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-semibold tracking-tight">Financeiro</h1>
          <p className="mt-0.5 text-sm text-ink-muted">Contas, cartões e lançamentos da agência.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <ContextoToggle referencia={referencia} contexto={contexto} />
          <MesNav referencia={referencia} contexto={contexto} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatTile icon={IconWallet} label="Saldo em Contas" value={fmtBRL(saldoTotal)} hint={`${contasFiltradas.length} conta(s)`} />
        <StatTile
          icon={IconCreditCard}
          label="Limite Disponível"
          value={fmtBRL(limiteDisponivelTotal)}
          hint={`${cartoesFiltrados.length} cartão(ões)`}
        />
        <StatTile icon={IconTrendingUp} label="Receitas do Mês" value={fmtBRL(receitasDoMes)} tone="good" hint="Lançadas no período" />
        <StatTile
          icon={IconAlertTriangle}
          label="Despesas do Mês"
          value={fmtBRL(despesasDoMes)}
          tone={despesasDoMes > receitasDoMes ? "warning" : "neutral"}
          hint="Lançadas no período"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <ContasCard contas={contasFiltradas} />
        <CartoesCard cartoes={cartoesFiltrados} contas={contasComSaldo} referencia={referencia} />
        <CategoriasCard categorias={categorias} />
      </div>

      <TransacoesManager
        transacoes={transacoes}
        contas={contasFiltradas}
        cartoes={cartoesFiltrados}
        categorias={categorias}
        contexto={contexto}
      />
    </div>
  );
}
