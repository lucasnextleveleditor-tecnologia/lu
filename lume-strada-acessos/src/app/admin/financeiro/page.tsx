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
import { calcularStatusTransacao } from "@/lib/types/financeiro";
import { limitesDoMes, mesParam, parseMesParam, STATUS_TRANSACAO_META } from "@/lib/utils/financeiro";
import { fmtBRL } from "@/lib/utils/format";
import { StatTile } from "@/components/ui/StatTile";
import { ExportMenuButton } from "@/components/ui/ExportMenuButton";
import { IconWallet, IconCreditCard, IconTrendingUp, IconAlertTriangle } from "@/components/ui/icons";
import { MesNav } from "@/components/admin/financeiro/MesNav";
import { ContextoToggle } from "@/components/admin/financeiro/ContextoToggle";
import { ContasCard } from "@/components/admin/financeiro/ContasCard";
import { CartoesCard } from "@/components/admin/financeiro/CartoesCard";
import { CategoriasCard } from "@/components/admin/financeiro/CategoriasCard";
import { TransacoesManager } from "@/components/admin/financeiro/TransacoesManager";
import { getDictionary } from "@/lib/i18n/getDictionary";

export const dynamic = "force-dynamic";

interface FinanceiroPageProps {
  searchParams: Promise<{ mes?: string; contexto?: string }>;
}

export default async function FinanceiroPage({ searchParams }: FinanceiroPageProps) {
  const { supabase } = await requireModuloOuRedirect("financeiro");
  const { dict } = await getDictionary();
  const params = await searchParams;
  const referencia = parseMesParam(params.mes);
  const contexto: "todos" | FinContexto =
    params.contexto === "pessoal" || params.contexto === "profissional" ? params.contexto : "todos";
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

  const mesParamStr = mesParam(referencia);

  const receitasDoMes = transacoes.filter((t) => t.tipo === "receita").reduce((acc, t) => acc + t.valor, 0);
  const despesasDoMes = transacoes.filter((t) => t.tipo === "despesa").reduce((acc, t) => acc + t.valor, 0);
  const saldoTotal = contasFiltradas.reduce((acc, c) => acc + c.saldo_atual, 0);
  const limiteDisponivelTotal = cartoesFiltrados.reduce((acc, c) => acc + c.limite_disponivel, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-semibold tracking-tight">{dict.financeiro.tituloPagina}</h1>
          <p className="mt-0.5 text-sm text-ink-muted">{dict.financeiro.subtituloPagina}</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <ContextoToggle referencia={referencia} contexto={contexto} />
          <MesNav referencia={referencia} contexto={contexto} />
          <ExportMenuButton
            targetId="financeiro-transacoes-export"
            nomeArquivo={`financeiro-transacoes-${mesParamStr}`}
            dadosCSV={transacoes.map((t) => ({
              data: t.data_vencimento,
              descricao: t.descricao,
              tipo: t.tipo,
              valor: t.valor.toFixed(2),
              status: STATUS_TRANSACAO_META[calcularStatusTransacao(t)].label,
              categoria: t.categoria_nome ?? "",
              conta: t.conta_nome ?? t.cartao_nome ?? "",
              parcela: t.parcela_total ? `${t.parcela_numero}/${t.parcela_total}` : "",
              moedaOriginal: t.moeda_original ? `${t.moeda_original} ${(t.valor_original ?? 0).toFixed(2)}` : "",
            }))}
            colunasCSV={[
              { chave: "data", rotulo: dict.financeiro.vencimentoLabel },
              { chave: "descricao", rotulo: dict.common.descricao },
              { chave: "tipo", rotulo: dict.financeiro.tipoLabel },
              { chave: "valor", rotulo: dict.financeiro.valorReaisLabel },
              { chave: "status", rotulo: dict.common.status },
              { chave: "categoria", rotulo: dict.common.categoria },
              { chave: "conta", rotulo: dict.financeiro.contaCartaoLabel },
              { chave: "parcela", rotulo: dict.financeiro.parcelaLabel },
              { chave: "moedaOriginal", rotulo: dict.financeiro.moedaOriginalLabel },
            ]}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatTile
          icon={IconWallet}
          label={dict.financeiro.statSaldoContas}
          value={fmtBRL(saldoTotal)}
          hint={dict.financeiro.hintContasQtd.replace("{n}", String(contasFiltradas.length))}
        />
        <StatTile
          icon={IconCreditCard}
          label={dict.financeiro.statLimiteDisponivel}
          value={fmtBRL(limiteDisponivelTotal)}
          hint={dict.financeiro.hintCartoesQtd.replace("{n}", String(cartoesFiltrados.length))}
        />
        <StatTile
          icon={IconTrendingUp}
          label={dict.financeiro.statReceitasMes}
          value={fmtBRL(receitasDoMes)}
          tone="good"
          hint={dict.financeiro.hintLancadasNoPeriodo}
        />
        <StatTile
          icon={IconAlertTriangle}
          label={dict.financeiro.statDespesasMes}
          value={fmtBRL(despesasDoMes)}
          tone={despesasDoMes > receitasDoMes ? "warning" : "neutral"}
          hint={dict.financeiro.hintLancadasNoPeriodo}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <ContasCard contas={contasFiltradas} />
        <CartoesCard cartoes={cartoesFiltrados} contas={contasComSaldo} referencia={referencia} />
        <CategoriasCard categorias={categorias} />
      </div>

      <div id="financeiro-transacoes-export">
        <TransacoesManager
          transacoes={transacoes}
          contas={contasFiltradas}
          cartoes={cartoesFiltrados}
          categorias={categorias}
          contexto={contexto}
        />
      </div>
    </div>
  );
}
