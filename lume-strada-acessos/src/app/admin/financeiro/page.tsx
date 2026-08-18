import Link from "next/link";
import { calcularStatusTransacao } from "@/lib/types/financeiro";
import { STATUS_TRANSACAO_META } from "@/lib/utils/financeiro";
import { fmtBRL } from "@/lib/utils/format";
import { StatTile } from "@/components/ui/StatTile";
import { ValorPrivado } from "@/components/ui/ValorPrivado";
import { OlhoValoresToggle } from "@/components/ui/OlhoValoresToggle";
import { ExportMenuButton } from "@/components/ui/ExportMenuButton";
import { IconWallet, IconCreditCard, IconTrendingUp, IconAlertTriangle } from "@/components/ui/icons";
import { MesNav } from "@/components/admin/financeiro/MesNav";
import { ContextoToggle } from "@/components/admin/financeiro/ContextoToggle";
import { ContasCard } from "@/components/admin/financeiro/ContasCard";
import { CartoesCard } from "@/components/admin/financeiro/CartoesCard";
import { CategoriasCard } from "@/components/admin/financeiro/CategoriasCard";
import { TransacoesManager } from "@/components/admin/financeiro/TransacoesManager";
import { getDictionary } from "@/lib/i18n/getDictionary";
import { buscarDadosFinanceiro, type FinanceiroSearchParams } from "@/app/admin/financeiro/data";

export const dynamic = "force-dynamic";

interface FinanceiroPageProps {
  searchParams: Promise<FinanceiroSearchParams>;
}

export default async function FinanceiroPage({ searchParams }: FinanceiroPageProps) {
  const { dict } = await getDictionary();
  const params = await searchParams;
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
  } = await buscarDadosFinanceiro(params);

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

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
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
