"use client";

import { useMemo, useState } from "react";
import type { FluxoCaixaPonto } from "@/lib/types/financeiro";
import { fmtBRL, fmtDataCurta } from "@/lib/utils/format";
import { useValoresVisiveis } from "@/lib/valores-visiveis/ValoresVisiveisProvider";
import { useLocale } from "@/lib/i18n/LocaleProvider";

interface FluxoCaixaChartProps {
  /** Do dia 0 (hoje) pro fim da janela — ver `buscarFluxoCaixa`. */
  pontos: FluxoCaixaPonto[];
}

const ALTURA_GRAFICO = 160;
const ALTURA_TOTAL = 220;
const LARGURA_MIN_POR_DIA = 12;
const PAD_LATERAL = 12;

// Mesmas cores fixas do sistema de status já usadas em `GraficoReceitaDespesa`
// (nunca uma cor nova) — aqui indicam se o saldo projetado daquele dia está
// no positivo ou no negativo, mesmo espírito do ponto de "resultado" do
// gráfico mensal.
const COR_RECEITA = "#0ca30c";
const COR_DESPESA = "#d03b3b";

/**
 * Saldo projetado dia a dia, em linha — mesmo espírito de `GraficoReceitaDespesa`:
 * SVG puro, sem lib de gráfico, `<title>` nativo como tooltip por dia, hover
 * local pra destacar o ponto, legenda sempre presente. A linha muda de cor
 * (verde/vermelha) segmento a segmento conforme o saldo do dia de destino é
 * positivo ou negativo — não é uma paleta nova, é a mesma paleta de
 * bom/crítico do resto do app. Uma linha tracejada em y=0 só aparece quando
 * a janela realmente cruza o zero (evita ruído visual quando o saldo nunca
 * fica negativo).
 */
export function FluxoCaixaChart({ pontos }: FluxoCaixaChartProps) {
  const { dict } = useLocale();
  const { visivel } = useValoresVisiveis();
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);

  const fmt = (v: number) => (visivel ? fmtBRL(v) : "••••");

  const { min, max } = useMemo(() => {
    const valores = pontos.map((p) => p.saldoProjetado);
    return { min: Math.min(0, ...valores), max: Math.max(0, ...valores) };
  }, [pontos]);

  if (pontos.length === 0) {
    return (
      <div className="flex h-48 items-center justify-center rounded-xl border border-dashed border-base-700 text-sm text-ink-muted">
        {dict.financeiro.fluxoCaixa.semDados}
      </div>
    );
  }

  const largura = Math.max(pontos.length * LARGURA_MIN_POR_DIA, 320);
  const passoX = (largura - PAD_LATERAL * 2) / Math.max(pontos.length - 1, 1);
  const amplitude = max - min || 1;

  const x = (i: number) => PAD_LATERAL + passoX * i;
  const y = (valor: number) => ALTURA_GRAFICO - ((valor - min) / amplitude) * ALTURA_GRAFICO;
  const zeroY = y(0);

  const passoLabel = Math.max(1, Math.ceil(pontos.length / 8));
  // O último dia sempre tem rótulo (fim da janela é sempre informação
  // relevante) — mas só quando não cair colado no penúltimo rótulo já
  // mostrado pelo passo normal, senão os dois textos se sobrepõem.
  const ultimoIdx = pontos.length - 1;
  const mostraUltimoSeparado = ultimoIdx % passoLabel >= passoLabel / 2 || ultimoIdx < passoLabel;

  function limparHover(i: number) {
    setHoverIdx((atual) => (atual === i ? null : atual));
  }

  return (
    <div>
      <div className="overflow-x-auto">
        <svg
          viewBox={`0 0 ${largura} ${ALTURA_TOTAL}`}
          className="h-[220px] w-full"
          style={{ minWidth: pontos.length * LARGURA_MIN_POR_DIA }}
          preserveAspectRatio="none"
        >
          {min < 0 && (
            <line
              x1={PAD_LATERAL}
              y1={zeroY}
              x2={largura - PAD_LATERAL}
              y2={zeroY}
              stroke="currentColor"
              strokeWidth={1}
              strokeDasharray="4 3"
              className="text-base-700"
            />
          )}

          {pontos.slice(1).map((ponto, idx) => {
            const anterior = pontos[idx]!;
            const destacado = hoverIdx === idx || hoverIdx === idx + 1;
            const opacidade = hoverIdx !== null && !destacado ? 0.35 : 1;
            return (
              <line
                key={ponto.data}
                x1={x(idx)}
                y1={y(anterior.saldoProjetado)}
                x2={x(idx + 1)}
                y2={y(ponto.saldoProjetado)}
                stroke={ponto.saldoProjetado >= 0 ? COR_RECEITA : COR_DESPESA}
                strokeWidth={2}
                opacity={opacidade}
                style={{ transition: "opacity 120ms ease" }}
              />
            );
          })}

          {pontos.map((ponto, i) => {
            const destacado = hoverIdx === i;
            const cor = ponto.saldoProjetado >= 0 ? COR_RECEITA : COR_DESPESA;
            const mostrarLabel = i % passoLabel === 0 || (i === ultimoIdx && mostraUltimoSeparado);
            return (
              <g key={ponto.data} onMouseEnter={() => setHoverIdx(i)} onMouseLeave={() => limparHover(i)} className="cursor-pointer">
                <circle cx={x(i)} cy={y(ponto.saldoProjetado)} r={destacado ? 5 : 8} fill={destacado ? cor : "transparent"}>
                  <title>
                    {dict.financeiro.fluxoCaixa.graficoTooltip.replace("{data}", fmtDataCurta(ponto.data)).replace("{valor}", fmt(ponto.saldoProjetado))}
                  </title>
                </circle>
                {mostrarLabel && (
                  <text x={x(i)} y={ALTURA_GRAFICO + 18} textAnchor="middle" fill="currentColor" className="text-ink-muted text-[10px] font-medium">
                    {fmtDataCurta(ponto.data).slice(0, 5)}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-ink-secondary">
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: COR_RECEITA }} />
          {dict.financeiro.fluxoCaixa.graficoSaldoPositivoLegenda}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: COR_DESPESA }} />
          {dict.financeiro.fluxoCaixa.graficoSaldoNegativoLegenda}
        </span>
      </div>
    </div>
  );
}
