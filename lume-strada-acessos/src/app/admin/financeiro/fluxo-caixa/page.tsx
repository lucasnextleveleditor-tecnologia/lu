import Link from "next/link";
import { fmtBRL, fmtDataCurta } from "@/lib/utils/format";
import { fmtMesAno } from "@/lib/utils/financeiro";
import { StatTile } from "@/components/ui/StatTile";
import { Card } from "@/components/ui/Card";
import { ValorPrivado } from "@/components/ui/ValorPrivado";
import { OlhoValoresToggle } from "@/components/ui/OlhoValoresToggle";
import { IconWallet, IconTrendingDown, IconChevronLeft, IconAlertTriangle, IconActivity, IconBarChart2, IconCalendar } from "@/components/ui/icons";
import { ContextoToggle } from "@/components/admin/financeiro/ContextoToggle";
import { MesNav } from "@/components/admin/financeiro/MesNav";
import { PeriodoFluxoCaixaToggle } from "@/components/admin/financeiro/PeriodoFluxoCaixaToggle";
import { FluxoCaixaChart } from "@/components/admin/financeiro/FluxoCaixaChart";
import { DreMensal } from "@/components/admin/financeiro/DreMensal";
import { FluxoDiarioTable } from "@/components/admin/financeiro/FluxoDiarioTable";
import { getDictionary } from "@/lib/i18n/getDictionary";
import { buscarFluxoCaixa, buscarFluxoMensal, type FluxoCaixaSearchParams } from "@/app/admin/financeiro/fluxo-caixa/data";

export const dynamic = "force-dynamic";

interface FluxoCaixaPageProps {
  searchParams: Promise<FluxoCaixaSearchParams>;
}

/**
 * Fluxo de Caixa — tela própria, separada do dashboard principal do
 * Financeiro (pedido explícito do dono da conta: o dashboard principal já
 * estava "carregado demais"). Projeção dia a dia do saldo, sem depender de
 * nenhum lançamento novo: só o saldo atual das contas + o que já foi
 * lançado como pendente. Opcional por natureza — quem não quer usar nunca
 * precisa nem abrir essa tela, o link fica só no cabeçalho da principal.
 */
export default async function FluxoCaixaPage({ searchParams }: FluxoCaixaPageProps) {
  const { dict } = await getDictionary();
  const t = dict.financeiro.fluxoCaixa;
  const params = await searchParams;
  // Independentes entre si — a projeção (`dias`, daqui pra frente) e a
  // DRE/Fluxo Diário (`mes`, navegação por calendário) são duas seções
  // separadas da mesma tela, cada uma com sua própria busca.
  const [{ contexto, dias, saldoInicial, pontos }, { referencia: referenciaMes, mesParamStr, dre, diario }] = await Promise.all([
    buscarFluxoCaixa(params),
    buscarFluxoMensal(params),
  ]);

  const saldoFinal = pontos.at(-1)?.saldoProjetado ?? saldoInicial;
  const pontoMaisBaixo = pontos.reduce((menor, p) => (p.saldoProjetado < menor.saldoProjetado ? p : menor), {
    data: "",
    saldoProjetado: saldoInicial,
    receitas: 0,
    despesas: 0,
  });
  const ficaNegativo = pontos.some((p) => p.saldoProjetado < 0);

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin/financeiro"
          className="mb-3 inline-flex items-center gap-1 text-xs font-medium text-ink-muted transition hover:text-ink-primary"
        >
          <IconChevronLeft className="h-3.5 w-3.5" />
          {dict.financeiro.voltarParaFinanceiro}
        </Link>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-lg font-semibold tracking-tight">{t.tituloPagina}</h1>
            <p className="mt-0.5 text-sm text-ink-muted">{t.subtituloPagina}</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <OlhoValoresToggle />
            <ContextoToggle referencia={referenciaMes} contexto={contexto} basePath="/admin/financeiro/fluxo-caixa" dias={dias} />
            <MesNav referencia={referenciaMes} contexto={contexto} basePath="/admin/financeiro/fluxo-caixa" dias={dias} />
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <span className="text-xs font-semibold uppercase tracking-wide text-ink-muted">{t.periodoLabel}</span>
        <PeriodoFluxoCaixaToggle dias={dias} contexto={contexto} mes={mesParamStr} />
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        <StatTile icon={IconWallet} label={t.statSaldoAtual} value={<ValorPrivado valor={fmtBRL(saldoInicial)} />} />
        <StatTile
          icon={saldoFinal >= saldoInicial ? IconActivity : IconTrendingDown}
          label={t.statSaldoProjetado}
          value={<ValorPrivado valor={fmtBRL(saldoFinal)} />}
          tone={saldoFinal < 0 ? "critical" : saldoFinal < saldoInicial ? "warning" : "good"}
          hint={t.hintSaldoProjetadoFim.replace("{data}", pontos.at(-1) ? fmtDataCurta(pontos.at(-1)!.data) : "")}
        />
        <StatTile
          icon={IconAlertTriangle}
          label={t.statMenorSaldo}
          value={<ValorPrivado valor={fmtBRL(pontoMaisBaixo.saldoProjetado)} />}
          tone={pontoMaisBaixo.saldoProjetado < 0 ? "critical" : "neutral"}
          hint={pontoMaisBaixo.data ? t.hintMenorSaldoData.replace("{data}", fmtDataCurta(pontoMaisBaixo.data)) : undefined}
        />
      </div>

      {ficaNegativo && (
        <div className="flex items-start gap-2.5 rounded-xl border border-status-critical/30 bg-status-critical/10 p-4 text-sm text-ink-primary">
          <IconAlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-status-critical" />
          <p>{t.alertaSaldoNegativoTexto.replace("{data}", fmtDataCurta(pontoMaisBaixo.data))}</p>
        </div>
      )}

      <Card>
        <div className="mb-4 flex items-center gap-2">
          <IconActivity className="h-4 w-4 text-ink-muted" />
          <div>
            <h2 className="text-sm font-semibold text-ink-primary">{t.graficoTitulo}</h2>
            <p className="text-xs text-ink-muted">{t.graficoSubtitulo}</p>
          </div>
        </div>
        <FluxoCaixaChart pontos={pontos} />
      </Card>

      {/* DRE Mensal + Fluxo de Caixa Diário — pedido explícito do dono da
          conta, navegados pelo `MesNav` do cabeçalho (não pelo "Período" da
          projeção acima, que é uma janela daqui pra frente, não um mês do
          calendário). Mesmo layout 2/3 colunas já usado pra "Receita x
          Despesa"/"Despesas por Categoria" na página principal do
          Financeiro — a DRE é o bloco mais compacto, a tabela diária é a
          que mais precisa de largura. */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        <Card className="lg:col-span-2">
          <div className="mb-4 flex items-center gap-2">
            <IconBarChart2 className="h-4 w-4 text-ink-muted" />
            <div>
              <h2 className="text-sm font-semibold text-ink-primary">{t.dreMensalTitulo}</h2>
              <p className="text-xs capitalize text-ink-muted">{fmtMesAno(referenciaMes)}</p>
            </div>
          </div>
          <DreMensal dre={dre} />
        </Card>
        <Card className="lg:col-span-3">
          <div className="mb-4 flex items-center gap-2">
            <IconCalendar className="h-4 w-4 text-ink-muted" />
            <div>
              <h2 className="text-sm font-semibold text-ink-primary">{t.diarioTitulo}</h2>
              <p className="text-xs text-ink-muted">{t.diarioSubtitulo}</p>
            </div>
          </div>
          <FluxoDiarioTable diario={diario} />
        </Card>
      </div>
    </div>
  );
}
