"use client";

import type { DreCategoriaLinha, DreMensal as DreMensalData } from "@/app/admin/financeiro/fluxo-caixa/data";

import { useValoresVisiveis } from "@/lib/valores-visiveis/ValoresVisiveisProvider";
import { useLocale } from "@/lib/i18n/LocaleProvider";

interface DreMensalProps {
  dre: DreMensalData;
}

// Mesmas cores fixas do sistema de status já usadas no resto do módulo
// (`FluxoCaixaChart`/`GraficoReceitaDespesa`) — nunca uma cor nova.
const COR_RECEITA = "#0ca30c";
const COR_DESPESA = "#d03b3b";
const COR_NEUTRO = "#8a8783";

/**
 * DRE (Demonstração de Resultado) simplificada do mês navegado — Receita
 * Bruta e Despesas quebradas por categoria (maior valor primeiro, mesma
 * ordem de `GraficoDespesasPorCategoria`), terminando no Resultado Líquido
 * em destaque. Pedido explícito do dono da conta: "eu quero uma visão de
 * DRE mensal". Só as três linhas clássicas de uma DRE de agência pequena —
 * sem custo direto/impostos separados, que não existem como conceito no
 * cadastro de categorias hoje (só `tipo: receita | despesa`).
 */
export function DreMensal({ dre }: DreMensalProps) {
  const { dict, fmtMoeda } = useLocale();
  const { visivel } = useValoresVisiveis();
  const fmt = (v: number) => (visivel ? fmtMoeda(v) : "••••");
  const t = dict.financeiro.fluxoCaixa;

  const semDados = dre.receitaBruta === 0 && dre.despesaTotal === 0;

  if (semDados) {
    return (
      <div className="flex h-32 items-center justify-center rounded-xl border border-dashed border-base-700 text-sm text-ink-muted">
        {t.dreVazio}
      </div>
    );
  }

  const corResultado = dre.resultadoLiquido > 0 ? COR_RECEITA : dre.resultadoLiquido < 0 ? COR_DESPESA : COR_NEUTRO;

  return (
    <div className="space-y-5">
      <DreBloco titulo={t.receitaBrutaLabel} total={dre.receitaBruta} cor={COR_RECEITA} linhas={dre.receitasPorCategoria} fmt={fmt} semCategoriaLabel={dict.common.semCategoria} />
      <DreBloco
        titulo={t.despesasLabel}
        total={dre.despesaTotal}
        cor={COR_DESPESA}
        linhas={dre.despesasPorCategoria}
        fmt={fmt}
        semCategoriaLabel={dict.common.semCategoria}
        negativo
      />

      <div className="flex items-center justify-between rounded-lg border border-base-700 bg-base-950/60 px-4 py-3">
        <span className="text-sm font-semibold text-ink-primary">{t.resultadoLiquidoLabel}</span>
        <span className="text-base font-bold" style={{ color: corResultado }}>
          {fmt(dre.resultadoLiquido)}
        </span>
      </div>
    </div>
  );
}

interface DreBlocoProps {
  titulo: string;
  total: number;
  cor: string;
  linhas: DreCategoriaLinha[];
  fmt: (v: number) => string;
  semCategoriaLabel: string;
  negativo?: boolean;
}

function DreBloco({ titulo, total, cor, linhas, fmt, semCategoriaLabel, negativo }: DreBlocoProps) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-2">
        <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-ink-muted">
          <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: cor }} />
          {titulo}
        </span>
        <span className="text-sm font-semibold text-ink-primary">
          {negativo && total > 0 ? "− " : ""}
          {fmt(total)}
        </span>
      </div>
      {linhas.length > 0 && (
        <div className="space-y-1 border-l border-base-800 pl-3">
          {linhas.map((linha) => (
            <div key={linha.nome ?? "__sem__"} className="flex items-center justify-between gap-2 text-xs">
              <span className="text-ink-secondary">{linha.nome ?? semCategoriaLabel}</span>
              <span className="text-ink-primary">{fmt(linha.valor)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
