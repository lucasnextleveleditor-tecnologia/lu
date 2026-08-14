"use client";

import { useMemo, useState } from "react";
import type { CategoriaPreview } from "@/lib/utils/financeiro-preview-mock";
import { fmtBRL, fmtPercent } from "@/lib/utils/format";

export interface FatiaDonut {
  categoria: CategoriaPreview;
  valor: number;
  pct: number; // 0-100
}

interface DonutChartCategoriasProps {
  /** Já ordenado desc por valor, só categorias de despesa com valor > 0. */
  dados: FatiaDonut[];
  total: number;
}

// Raio escolhido pra que a circunferência dê ~100 — cada 1 de dasharray vira 1%.
const RAIO = 15.9155;
const CIRCUNFERENCIA = 2 * Math.PI * RAIO;

/**
 * Donut "Despesas por Categoria" — paleta categórica de 7 tons validada pela
 * skill interna de dataviz (ordem fixa, nunca ciclada; rodada contra a
 * superfície escura real do app `#09090b`: banda de luminosidade, piso de
 * croma, separação CVD ΔE 8.4+, piso visão normal ΔE 19.3+ e contraste ≥3:1
 * todos passam — ver `financeiro-preview-mock.ts`). O texto (nome, valor,
 * %) sempre em tokens `ink-*`, nunca na cor da fatia — só a bolinha ao lado
 * carrega a identidade. Legenda sempre presente (lista à direita); as 3
 * maiores fatias ganham rótulo direto de porcentagem — nunca todas, pra não
 * poluir. Hover destaca a fatia e atualiza o número central (tooltip nativo
 * do gráfico, sem popover flutuante).
 */
export function DonutChartCategorias({ dados, total }: DonutChartCategoriasProps) {
  const [hoverId, setHoverId] = useState<string | null>(null);

  const segmentos = useMemo(() => {
    let acumulado = 0;
    return dados.map((fatia) => {
      const comprimento = (fatia.pct / 100) * CIRCUNFERENCIA;
      const offset = -((acumulado / 100) * CIRCUNFERENCIA);
      acumulado += fatia.pct;
      return { ...fatia, comprimento, offset };
    });
  }, [dados]);

  const emDestaque = hoverId ? (dados.find((f) => f.categoria.id === hoverId) ?? null) : null;

  function limparHover(id: string) {
    setHoverId((atual) => (atual === id ? null : atual));
  }

  if (dados.length === 0) {
    return (
      <div className="flex h-48 items-center justify-center rounded-xl border border-dashed border-base-700 text-sm text-ink-muted">
        Nenhuma despesa lançada neste mês.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
      <div className="relative mx-auto h-44 w-44 shrink-0 sm:mx-0">
        <svg viewBox="0 0 36 36" className="h-full w-full -rotate-90">
          <circle cx="18" cy="18" r={RAIO} fill="none" stroke="currentColor" strokeWidth="4.5" className="text-base-800" />
          {segmentos.map((seg) => (
            <circle
              key={seg.categoria.id}
              cx="18"
              cy="18"
              r={RAIO}
              fill="none"
              stroke={seg.categoria.cor ?? "#8a8783"}
              strokeWidth={hoverId === seg.categoria.id ? 5.5 : 4.5}
              strokeDasharray={`${seg.comprimento} ${CIRCUNFERENCIA - seg.comprimento}`}
              strokeDashoffset={seg.offset}
              strokeLinecap="butt"
              style={{ transition: "stroke-width 120ms ease, opacity 120ms ease" }}
              opacity={hoverId && hoverId !== seg.categoria.id ? 0.45 : 1}
              className="cursor-pointer"
              onMouseEnter={() => setHoverId(seg.categoria.id)}
              onMouseLeave={() => limparHover(seg.categoria.id)}
            >
              <title>{`${seg.categoria.nome}: ${fmtBRL(seg.valor)} (${fmtPercent(seg.pct / 100)})`}</title>
            </circle>
          ))}
        </svg>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center px-4 text-center">
          <p className="truncate text-[11px] uppercase tracking-wide text-ink-muted">{emDestaque ? emDestaque.categoria.nome : "Total"}</p>
          <p className="text-lg font-bold text-ink-primary">{fmtBRL(emDestaque ? emDestaque.valor : total)}</p>
          {emDestaque && <p className="text-xs text-ink-secondary">{fmtPercent(emDestaque.pct / 100)}</p>}
        </div>
      </div>

      <div className="min-w-0 flex-1 space-y-1">
        {dados.map((fatia, i) => (
          <div
            key={fatia.categoria.id}
            onMouseEnter={() => setHoverId(fatia.categoria.id)}
            onMouseLeave={() => limparHover(fatia.categoria.id)}
            className={`flex items-center justify-between gap-3 rounded-lg px-2 py-1.5 transition ${
              hoverId === fatia.categoria.id ? "bg-base-800/70" : ""
            }`}
          >
            <div className="flex min-w-0 items-center gap-2">
              <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: fatia.categoria.cor ?? "#8a8783" }} />
              <span className="truncate text-sm text-ink-secondary">{fatia.categoria.nome}</span>
              {i < 3 && <span className="shrink-0 text-xs text-ink-muted">{fmtPercent(fatia.pct / 100)}</span>}
            </div>
            <span className="shrink-0 text-sm font-medium text-ink-primary">{fmtBRL(fatia.valor)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
