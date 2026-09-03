"use client";

import { useMemo, useState } from "react";
import type { CategoriaRow, TransacaoComRelacoes } from "@/lib/types/financeiro";
import { fmtBRL, fmtPercent } from "@/lib/utils/format";
import { useValoresVisiveis } from "@/lib/valores-visiveis/ValoresVisiveisProvider";
import { useLocale } from "@/lib/i18n/LocaleProvider";

interface GraficoDespesasPorCategoriaProps {
  /** Já filtradas por mês/contexto (mesmo `transacoes` que `buscarDadosFinanceiro` devolve pra página) — nenhuma query nova aqui. */
  transacoes: TransacaoComRelacoes[];
  categorias: CategoriaRow[];
}

interface Fatia {
  categoria: CategoriaRow;
  valor: number;
  pct: number; // 0-100
}

const RAIO = 15.9155; // circunferência ~100 — cada 1 de dasharray = 1%
const CIRCUNFERENCIA = 2 * Math.PI * RAIO;

/**
 * Versão "de produção" do donut "Despesas por Categoria" já desenhado (e
 * validado pela skill interna de dataviz) em `preview/DonutChartCategorias.tsx`
 * — mesmo desenho/paleta/interação, só que ligado a dado REAL do mês/contexto
 * corrente em vez do mock. Cor de cada fatia é a mesma `categoria.cor`
 * escolhida pelo usuário ao criar a categoria (`PALETA_CATEGORIAS`); sem cor
 * própria cai no cinza neutro do sistema de status (`#8a8783`), nunca uma cor
 * inventada. Texto sempre em tokens `ink-*`, nunca na cor da fatia; legenda
 * sempre presente; tooltip nativo (`<title>`) com valor exato ao passar o
 * mouse.
 */
export function GraficoDespesasPorCategoria({ transacoes, categorias }: GraficoDespesasPorCategoriaProps) {
  const { dict } = useLocale();
  const { visivel } = useValoresVisiveis();
  const [hoverId, setHoverId] = useState<string | null>(null);
  const fmt = (v: number) => (visivel ? fmtBRL(v) : "••••");

  const { fatias, total } = useMemo(() => {
    const mapa = new Map<string, number>();
    transacoes
      .filter((t) => t.tipo === "despesa" && t.categoria_id)
      .forEach((t) => mapa.set(t.categoria_id!, (mapa.get(t.categoria_id!) ?? 0) + t.valor));

    const totalDespesas = Array.from(mapa.values()).reduce((acc, v) => acc + v, 0);

    // Ordem categórica FIXA (a mesma do cadastro) — nunca reordenada por
    // valor na atribuição de cor; só a exibição (lista/legenda) é por valor.
    const lista: Fatia[] = categorias
      .filter((c) => c.tipo === "despesa" && mapa.has(c.id))
      .map((categoria) => {
        const valor = mapa.get(categoria.id)!;
        return { categoria, valor, pct: totalDespesas > 0 ? (valor / totalDespesas) * 100 : 0 };
      })
      .sort((a, b) => b.valor - a.valor);

    return { fatias: lista, total: totalDespesas };
  }, [transacoes, categorias]);

  const segmentos = useMemo(() => {
    let acumulado = 0;
    return fatias.map((fatia) => {
      const comprimento = (fatia.pct / 100) * CIRCUNFERENCIA;
      const offset = -((acumulado / 100) * CIRCUNFERENCIA);
      acumulado += fatia.pct;
      return { ...fatia, comprimento, offset };
    });
  }, [fatias]);

  const emDestaque = hoverId ? (fatias.find((f) => f.categoria.id === hoverId) ?? null) : null;

  function limparHover(id: string) {
    setHoverId((atual) => (atual === id ? null : atual));
  }

  if (fatias.length === 0) {
    return (
      <div className="flex h-48 items-center justify-center rounded-xl border border-dashed border-base-700 text-sm text-ink-muted">
        {dict.financeiro.despesasPorCategoriaVazio}
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
              <title>{`${seg.categoria.nome}: ${fmt(seg.valor)} (${fmtPercent(seg.pct / 100)})`}</title>
            </circle>
          ))}
        </svg>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center px-4 text-center">
          <p className="truncate text-[11px] uppercase tracking-wide text-ink-muted">
            {emDestaque ? emDestaque.categoria.nome : dict.financeiro.despesasPorCategoriaTotalLabel}
          </p>
          <p className="text-lg font-bold text-ink-primary">{fmt(emDestaque ? emDestaque.valor : total)}</p>
          {emDestaque && <p className="text-xs text-ink-secondary">{fmtPercent(emDestaque.pct / 100)}</p>}
        </div>
      </div>

      <div className="min-w-0 flex-1 space-y-1">
        {fatias.map((fatia, i) => (
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
              <span className="truncate text-sm text-ink-secondary">
                {fatia.categoria.emoji ? `${fatia.categoria.emoji} ` : ""}
                {fatia.categoria.nome}
              </span>
              {i < 3 && <span className="shrink-0 text-xs text-ink-muted">{fmtPercent(fatia.pct / 100)}</span>}
            </div>
            <span className="shrink-0 text-sm font-medium text-ink-primary">{fmt(fatia.valor)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
