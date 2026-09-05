"use client";

import { useMemo, useState } from "react";
import type { HistoricoMensalPonto } from "@/app/admin/financeiro/data";
import { fmtMesCurto } from "@/lib/utils/financeiro";
import { fmtBRL } from "@/lib/utils/format";
import { useValoresVisiveis } from "@/lib/valores-visiveis/ValoresVisiveisProvider";
import { useLocale } from "@/lib/i18n/LocaleProvider";

interface GraficoReceitaDespesaProps {
  /** Do mês mais antigo pro mais recente — ver `buscarHistoricoMensal`. */
  dados: HistoricoMensalPonto[];
}

const ALTURA_BARRAS = 150;
const ALTURA_TOTAL = 210;
const LARGURA_MIN_POR_MES = 68;
const LARGURA_BARRA = 20; // <=24px (spec de marca do skill de dataviz)
const GAP_BARRA = 4;
const PAD_LATERAL = 12;

// Cores fixas do sistema de status do app (`tailwind.config.ts` — nunca uma
// cor nova): receita/despesa mapeiam direto pra bom/crítico, igual já é
// convenção em `CategoriasCard`/`StatTile` (receita sempre verde). O ponto
// de "resultado" usa a mesma paleta pra indicar se o mês fechou no
// positivo ou no negativo — nunca uma cor fora dessa paleta reservada.
const COR_RECEITA = "#0ca30c";
const COR_DESPESA = "#d03b3b";
const COR_NEUTRO = "#8a8783";

/** Arredonda pra cima pro próximo número "redondo" (1/2/5 × 10^n) — só define até onde a barra mais alta pode crescer (deixa ar acima), nunca é exibido como tick de eixo. */
function tetoArredondado(valor: number): number {
  if (valor <= 0) return 1;
  const grandeza = Math.pow(10, Math.floor(Math.log10(valor)));
  const passo = valor / grandeza;
  const proximo = passo <= 1 ? 1 : passo <= 2 ? 2 : passo <= 5 ? 5 : 10;
  return proximo * grandeza;
}

/**
 * Receita (verde) x Despesa (vermelho) dos últimos meses, em barras pareadas
 * por mês, mais um ponto de "resultado" (saldo do mês) sob o rótulo — verde
 * quando o mês fecha no positivo, vermelho quando fecha no negativo, cinza
 * neutro quando empata. Mesmo espírito de `preview/DonutChartCategorias.tsx`:
 * SVG puro, sem lib de gráfico, hover local, `<title>` nativo como tooltip,
 * texto sempre em tokens `ink-*` (nunca na cor da barra), legenda sempre
 * presente. Sem eixo numérico de propósito — o valor exato de cada barra/
 * ponto já vem no tooltip nativo ao passar o mouse, e o StatTile "Resultado
 * do Mês" (ver `page.tsx`) já cobre o número exato do mês corrente.
 */
export function GraficoReceitaDespesa({ dados }: GraficoReceitaDespesaProps) {
  const { dict } = useLocale();
  const { visivel } = useValoresVisiveis();
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);

  const fmt = (v: number) => (visivel ? fmtBRL(v) : "••••");

  const maxValor = useMemo(
    () => tetoArredondado(Math.max(1, ...dados.flatMap((d) => [d.receitas, d.despesas]))),
    [dados]
  );

  const largura = Math.max(dados.length * LARGURA_MIN_POR_MES, 320);
  const larguraGrupo = (largura - PAD_LATERAL * 2) / Math.max(dados.length, 1);

  function altura(valor: number): number {
    return Math.max((valor / maxValor) * ALTURA_BARRAS, valor > 0 ? 1 : 0);
  }

  const semDados = dados.every((d) => d.receitas === 0 && d.despesas === 0);

  if (semDados) {
    return (
      <div className="flex h-48 items-center justify-center rounded-xl border border-dashed border-base-700 text-sm text-ink-muted">
        {dict.financeiro.graficoSemDados}
      </div>
    );
  }

  function limparHover(i: number) {
    setHoverIdx((atual) => (atual === i ? null : atual));
  }

  return (
    <div>
      <div className="overflow-x-auto">
        <svg
          viewBox={`0 0 ${largura} ${ALTURA_TOTAL}`}
          className="h-[210px] w-full"
          style={{ minWidth: dados.length * LARGURA_MIN_POR_MES }}
          preserveAspectRatio="none"
        >
          <line
            x1={PAD_LATERAL}
            y1={ALTURA_BARRAS}
            x2={largura - PAD_LATERAL}
            y2={ALTURA_BARRAS}
            stroke="currentColor"
            strokeWidth={1}
            className="text-base-700"
          />

          {dados.map((ponto, i) => {
            const cx = PAD_LATERAL + larguraGrupo * i + larguraGrupo / 2;
            const hReceita = altura(ponto.receitas);
            const hDespesa = altura(ponto.despesas);
            const destacado = hoverIdx === i;
            const opacidade = hoverIdx !== null && !destacado ? 0.4 : 1;
            const corResultado = ponto.saldo > 0 ? COR_RECEITA : ponto.saldo < 0 ? COR_DESPESA : COR_NEUTRO;
            const mesLabel = fmtMesCurto(ponto.mes);

            return (
              <g
                key={ponto.mesParam}
                onMouseEnter={() => setHoverIdx(i)}
                onMouseLeave={() => limparHover(i)}
                className="cursor-pointer"
                style={{ transition: "opacity 120ms ease" }}
                opacity={opacidade}
              >
                <rect
                  x={cx - LARGURA_BARRA - GAP_BARRA / 2}
                  y={ALTURA_BARRAS - hReceita}
                  width={LARGURA_BARRA}
                  height={Math.max(hReceita, 1)}
                  rx={3}
                  fill={COR_RECEITA}
                >
                  <title>
                    {dict.financeiro.graficoReceitaTooltip.replace("{mes}", mesLabel).replace("{valor}", fmt(ponto.receitas))}
                  </title>
                </rect>
                <rect
                  x={cx + GAP_BARRA / 2}
                  y={ALTURA_BARRAS - hDespesa}
                  width={LARGURA_BARRA}
                  height={Math.max(hDespesa, 1)}
                  rx={3}
                  fill={COR_DESPESA}
                >
                  <title>
                    {dict.financeiro.graficoDespesaTooltip.replace("{mes}", mesLabel).replace("{valor}", fmt(ponto.despesas))}
                  </title>
                </rect>

                <text
                  x={cx}
                  y={ALTURA_BARRAS + 18}
                  textAnchor="middle"
                  fill="currentColor"
                  className="text-ink-muted text-[10px] font-medium capitalize"
                >
                  {mesLabel}
                </text>

                <circle cx={cx} cy={ALTURA_BARRAS + 32} r={4} fill={corResultado} stroke="currentColor" strokeWidth={2} className="text-base-900">
                  <title>
                    {dict.financeiro.graficoResultadoTooltip.replace("{mes}", mesLabel).replace("{valor}", fmt(ponto.saldo))}
                  </title>
                </circle>
              </g>
            );
          })}
        </svg>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-ink-secondary">
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: COR_RECEITA }} />
          {dict.financeiro.graficoReceitaLegenda}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: COR_DESPESA }} />
          {dict.financeiro.graficoDespesaLegenda}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="flex shrink-0 items-center -space-x-0.5">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: COR_RECEITA }} />
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: COR_DESPESA }} />
          </span>
          {dict.financeiro.graficoResultadoLegenda}
        </span>
      </div>
    </div>
  );
}
