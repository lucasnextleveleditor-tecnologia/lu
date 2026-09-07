import { fmtBRL, fmtPercent } from "@/lib/utils/format";
import { StatTile } from "@/components/ui/StatTile";
import { Card } from "@/components/ui/Card";
import { IconWallet, IconBarChart2, IconTrendingDown, IconTrendingUp } from "@/components/ui/icons";
import { getDictionary } from "@/lib/i18n/getDictionary";

export interface DistribuicaoCategoria {
  categoriaId: string;
  categoriaNome: string;
  valorAtual: number;
}

interface DashboardPatrimonioProps {
  totalInvestido: number;
  patrimonioAtual: number;
  depreciacaoTotal: number; // totalInvestido - patrimonioAtual — positivo é depreciação, negativo é valorização líquida
  percentualMedio: number; // depreciacaoTotal / totalInvestido
  itensConsiderados: number; // itens ativos com valor_pago E valor_atual preenchidos — entram na conta
  itensExcluidos: number; // itens ativos sem os dois valores — não entram, mas o admin precisa saber que existem
  distribuicao: DistribuicaoCategoria[];
}

/**
 * Dashboard Financeiro do Inventário — 3 KPIs (Investido / Patrimônio Atual /
 * Depreciação) + distribuição do patrimônio atual por categoria, em barras
 * horizontais monocromáticas cinza/branco (skill de dataviz: cada barra é
 * uma categoria diferente — não uma série contínua —, então a rampa aqui é
 * só um degradê decorativo de claro→escuro por ranking, nunca uma cor com
 * significado próprio; o rótulo direto em cada barra é quem carrega a
 * identidade, igual ao resto do app, que não usa cor de marca nenhuma).
 * Recebe os números já calculados pelo server component da página — este
 * componente é só apresentação.
 */
export async function DashboardPatrimonio({
  totalInvestido,
  patrimonioAtual,
  depreciacaoTotal,
  percentualMedio,
  itensConsiderados,
  itensExcluidos,
  distribuicao,
}: DashboardPatrimonioProps) {
  const { dict } = await getDictionary();
  const apreciou = depreciacaoTotal < 0;
  const maiorValor = distribuicao.reduce((max, d) => Math.max(max, d.valorAtual), 0);

  const itemLabelInvestido = itensConsiderados === 1 ? dict.inventario.itemAtivoSingular : dict.inventario.itensAtivosPlural;
  const itemLabelExcluidos = itensExcluidos === 1 ? dict.inventario.itemNaoEntraSingular : dict.inventario.itensNaoEntramPlural;
  const itemArtigoExcluidos = itensExcluidos === 1 ? dict.inventario.oItemSingular : dict.inventario.osItensPlural;

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <StatTile
          icon={IconWallet}
          label={dict.inventario.statValorInvestido}
          value={fmtBRL(totalInvestido)}
          hint={dict.inventario.hintValorInvestido
            .replace("{count}", String(itensConsiderados))
            .replace("{itemLabel}", itemLabelInvestido)}
        />
        <StatTile
          icon={IconBarChart2}
          label={dict.inventario.statPatrimonioAtual}
          value={fmtBRL(patrimonioAtual)}
          hint={dict.inventario.hintPatrimonioAtual}
        />
        <StatTile
          icon={apreciou ? IconTrendingUp : IconTrendingDown}
          label={apreciou ? dict.inventario.valorizacaoTotal : dict.inventario.depreciacaoTotalLabel}
          value={fmtBRL(Math.abs(depreciacaoTotal))}
          tone={apreciou ? "good" : "neutral"}
          hint={`${apreciou ? "+" : "-"}${fmtPercent(Math.abs(percentualMedio))} ${dict.inventario.sufixoDesvalorizacaoMedia}`}
        />
      </div>

      {itensExcluidos > 0 && (
        <p className="text-xs text-ink-muted">
          {dict.inventario.itensExcluidosAviso
            .replace("{count}", String(itensExcluidos))
            .replace("{itemLabel}", itemLabelExcluidos)
            .replace("{itemArtigo}", itemArtigoExcluidos)
            .replace("{tab}", dict.inventario.tabItensEtiquetas)}
        </p>
      )}

      <Card className="p-5">
        <p className="mb-4 text-sm font-semibold text-ink-primary">{dict.inventario.tituloDistribuicaoCategoria}</p>
        {distribuicao.length === 0 ? (
          <p className="text-sm text-ink-muted">{dict.inventario.distribuicaoVazia}</p>
        ) : (
          <div className="space-y-3">
            {distribuicao.map((d, i) => {
              const pct = maiorValor > 0 ? (d.valorAtual / maiorValor) * 100 : 0;
              // Degradê claro→escuro por ranking (não por valor absoluto) — só decorativo,
              // o rótulo com nome + valor ao lado é quem identifica cada barra.
              const opacidade = Math.max(0.35, 1 - i * 0.12);
              return (
                <div key={d.categoriaId} title={`${d.categoriaNome}: ${fmtBRL(d.valorAtual)}`}>
                  <div className="mb-1 flex items-center justify-between gap-3">
                    <span className="truncate text-xs font-medium text-ink-secondary">{d.categoriaNome}</span>
                    <span className="shrink-0 text-xs text-ink-muted">{fmtBRL(d.valorAtual)}</span>
                  </div>
                  <div className="h-2.5 w-full overflow-hidden rounded-full bg-base-800">
                    <div
                      className="h-full rounded-full bg-white transition-[width]"
                      style={{ width: `${pct}%`, opacity: opacidade }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}
