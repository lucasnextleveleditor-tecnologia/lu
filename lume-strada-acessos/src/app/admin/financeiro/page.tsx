import Link from "next/link";
import { calcularStatusTransacao } from "@/lib/types/financeiro";
import { STATUS_TRANSACAO_META } from "@/lib/utils/financeiro";
import { fmtBRL } from "@/lib/utils/format";
import { StatTile } from "@/components/ui/StatTile";
import { Card } from "@/components/ui/Card";
import { ValorPrivado } from "@/components/ui/ValorPrivado";
import { OlhoValoresToggle } from "@/components/ui/OlhoValoresToggle";
import { ExportMenuButton } from "@/components/ui/ExportMenuButton";
import {
  IconWallet,
  IconCreditCard,
  IconTrendingUp,
  IconAlertTriangle,
  IconPiggyBank,
  IconBarChart2,
  IconTag,
} from "@/components/ui/icons";
import { MesNav } from "@/components/admin/financeiro/MesNav";
import { ContextoToggle } from "@/components/admin/financeiro/ContextoToggle";
import { ContasCard } from "@/components/admin/financeiro/ContasCard";
import { CartoesCard } from "@/components/admin/financeiro/CartoesCard";
import { CategoriasCard } from "@/components/admin/financeiro/CategoriasCard";
import { TransacoesManager } from "@/components/admin/financeiro/TransacoesManager";
import { GraficoReceitaDespesa } from "@/components/admin/financeiro/GraficoReceitaDespesa";
import { GraficoDespesasPorCategoria } from "@/components/admin/financeiro/GraficoDespesasPorCategoria";
import { getDictionary } from "@/lib/i18n/getDictionary";
import { buscarDadosFinanceiro, buscarHistoricoMensal, type FinanceiroSearchParams } from "@/app/admin/financeiro/data";
import { buscarResumoCaixinhas } from "@/app/admin/financeiro/caixinhas/data";

export const dynamic = "force-dynamic";

interface FinanceiroPageProps {
  searchParams: Promise<FinanceiroSearchParams>;
}

export default async function FinanceiroPage({ searchParams }: FinanceiroPageProps) {
  const { dict } = await getDictionary();
  const params = await searchParams;
  // As três buscas são independentes entre si — `Promise.all` evita uma
  // fila de 3 idas ao banco em série só porque estão no mesmo componente.
  const [dadosFinanceiro, { saldoTotal: saldoCaixinhas, qtd: qtdCaixinhas }, historicoMensal] = await Promise.all([
    buscarDadosFinanceiro(params),
    buscarResumoCaixinhas(),
    buscarHistoricoMensal(params),
  ]);
  const {
    referencia,
    contexto,
    mesParamStr,
    contasComSaldo,
    categorias,
    transacoes,
    contasFiltradas,
    cartoesFiltrados,
    receitasDoMes,
    despesasDoMes,
    saldoTotal,
    limiteDisponivelTotal,
  } = dadosFinanceiro;

  // "Estou fechando o mês no positivo ou no negativo?" — pedido explícito do
  // dono da conta: cor do StatTile e do texto seguem o mesmo tone bom/
  // crítico/neutro usado no resto do app, nunca uma cor nova.
  const saldoDoMes = receitasDoMes - despesasDoMes;
  const toneSaldoDoMes = saldoDoMes > 0 ? "good" : saldoDoMes < 0 ? "critical" : "neutral";
  const hintSaldoDoMes =
    saldoDoMes > 0
      ? dict.financeiro.resultadoPositivoHint
      : saldoDoMes < 0
        ? dict.financeiro.resultadoNegativoHint
        : dict.financeiro.resultadoNeutroHint;

  const qs = new URLSearchParams({ mes: mesParamStr, ...(contexto !== "todos" ? { contexto } : {}) }).toString();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-semibold tracking-tight">{dict.financeiro.tituloPagina}</h1>
          <p className="mt-0.5 text-sm text-ink-muted">{dict.financeiro.subtituloPagina}</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <OlhoValoresToggle />
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

      {/* 3 por linha (não 6) de propósito — em 6 colunas, dentro do container
          travado em `max-w-6xl` do AdminShell, cada tile fica estreito demais
          pro valor em reais (com centavos) e o texto acaba cortado pelo
          `overflow-hidden` do StatTile, mesmo em tela ultra-wide (o container
          não estica além de max-w-6xl, só a coluna do meio; a tela ser larga
          não dá mais espaço pro card). 3 colunas garante largura de sobra
          pra qualquer valor, ao custo de uma segunda linha de tiles. */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        <Link href={`/admin/financeiro/contas?${qs}`} className="block transition hover:opacity-90">
          <StatTile
            icon={IconWallet}
            label={dict.financeiro.statSaldoContas}
            value={<ValorPrivado valor={fmtBRL(saldoTotal)} />}
            hint={dict.financeiro.hintContasQtd.replace("{n}", String(contasFiltradas.length))}
          />
        </Link>
        <Link href={`/admin/financeiro/cartoes?${qs}`} className="block transition hover:opacity-90">
          <StatTile
            icon={IconCreditCard}
            label={dict.financeiro.statLimiteDisponivel}
            value={<ValorPrivado valor={fmtBRL(limiteDisponivelTotal)} />}
            hint={dict.financeiro.hintCartoesQtd.replace("{n}", String(cartoesFiltrados.length))}
          />
        </Link>
        <Link href={`/admin/financeiro/receitas?${qs}`} className="block transition hover:opacity-90">
          <StatTile
            icon={IconTrendingUp}
            label={dict.financeiro.statReceitasMes}
            value={<ValorPrivado valor={fmtBRL(receitasDoMes)} />}
            tone="good"
            hint={dict.financeiro.hintLancadasNoPeriodo}
          />
        </Link>
        <Link href={`/admin/financeiro/despesas?${qs}`} className="block transition hover:opacity-90">
          <StatTile
            icon={IconAlertTriangle}
            label={dict.financeiro.statDespesasMes}
            value={<ValorPrivado valor={fmtBRL(despesasDoMes)} />}
            tone={despesasDoMes > receitasDoMes ? "warning" : "neutral"}
            hint={dict.financeiro.hintLancadasNoPeriodo}
          />
        </Link>
        <Link href="/admin/financeiro/caixinhas" className="block transition hover:opacity-90">
          <StatTile
            icon={IconPiggyBank}
            label={dict.financeiro.caixinhas.statSaldoTotal}
            value={<ValorPrivado valor={fmtBRL(saldoCaixinhas)} />}
            hint={dict.financeiro.caixinhas.hintCaixinhasQtd.replace("{n}", String(qtdCaixinhas))}
          />
        </Link>
        <StatTile
          icon={IconBarChart2}
          label={dict.financeiro.statResultadoMes}
          value={<ValorPrivado valor={fmtBRL(saldoDoMes)} />}
          tone={toneSaldoDoMes}
          hint={hintSaldoDoMes}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <div className="mb-4 flex items-center gap-2">
            <IconBarChart2 className="h-4 w-4 text-ink-muted" />
            <div>
              <h2 className="text-sm font-semibold text-ink-primary">{dict.financeiro.graficoReceitaDespesaTitulo}</h2>
              <p className="text-xs text-ink-muted">{dict.financeiro.graficoReceitaDespesaSubtitulo}</p>
            </div>
          </div>
          <GraficoReceitaDespesa dados={historicoMensal} />
        </Card>
        <Card className="lg:col-span-2">
          <div className="mb-4 flex items-center gap-2">
            <IconTag className="h-4 w-4 text-ink-muted" />
            <h2 className="text-sm font-semibold text-ink-primary">{dict.financeiro.despesasPorCategoriaTitulo}</h2>
          </div>
          <GraficoDespesasPorCategoria transacoes={transacoes} categorias={categorias} />
        </Card>
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
