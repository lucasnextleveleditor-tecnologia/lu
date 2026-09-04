"use client";

import { useMemo } from "react";
import type { TransacaoPreview } from "@/lib/utils/financeiro-preview-mock";
import { CARTOES_PREVIEW, CATEGORIAS_PREVIEW, CONTAS_PREVIEW } from "@/lib/utils/financeiro-preview-mock";
import { addMeses, fmtMesAno, limitesDoMes, toneLimiteCartao } from "@/lib/utils/financeiro";
import { fmtBRL } from "@/lib/utils/format";
import { StatTile } from "@/components/ui/StatTile";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { DonutChartCategorias, type FatiaDonut } from "@/components/admin/financeiro/preview/DonutChartCategorias";
import { IconChevronLeft, IconChevronRight, IconCreditCard, IconTrendingDown, IconTrendingUp, IconWallet } from "@/components/ui/icons";

interface DashboardPreviewProps {
  transacoes: TransacaoPreview[];
  referencia: Date;
  onMudarReferencia: (referencia: Date) => void;
}

export function DashboardPreview({ transacoes, referencia, onMudarReferencia }: DashboardPreviewProps) {
  const { inicio, fim } = limitesDoMes(referencia);
  const doMes = useMemo(() => transacoes.filter((t) => t.data >= inicio && t.data <= fim), [transacoes, inicio, fim]);

  const receitas = useMemo(() => doMes.filter((t) => t.tipo === "receita").reduce((acc, t) => acc + t.valor, 0), [doMes]);
  const despesas = useMemo(() => doMes.filter((t) => t.tipo === "despesa").reduce((acc, t) => acc + t.valor, 0), [doMes]);
  const saldoAtual = useMemo(() => CONTAS_PREVIEW.reduce((acc, c) => acc + c.saldoAtual, 0), []);
  const cartoesTotal = useMemo(
    () => CARTOES_PREVIEW.reduce((acc, c) => acc + c.faturaAberta + (c.faturaFechadaPaga ? 0 : c.faturaFechadaValor), 0),
    []
  );
  const limiteTotal = useMemo(() => CARTOES_PREVIEW.reduce((acc, c) => acc + c.limite, 0), []);

  const despesasPorCategoria = useMemo<FatiaDonut[]>(() => {
    const mapa = new Map<string, number>();
    doMes
      .filter((t) => t.tipo === "despesa")
      .forEach((t) => mapa.set(t.categoriaId, (mapa.get(t.categoriaId) ?? 0) + t.valor));

    const totalDespesas = Array.from(mapa.values()).reduce((acc, v) => acc + v, 0);

    // Ordem categórica FIXA (a mesma de `CATEGORIAS_PREVIEW`) — nunca reordenada
    // por valor na atribuição de cor; só a exibição (lista/legenda) é por valor.
    return CATEGORIAS_PREVIEW.filter((c) => c.tipo === "despesa" && mapa.has(c.id))
      .map((categoria) => ({ categoria, valor: mapa.get(categoria.id)!, pct: totalDespesas > 0 ? (mapa.get(categoria.id)! / totalDespesas) * 100 : 0 }))
      .sort((a, b) => b.valor - a.valor);
  }, [doMes]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => onMudarReferencia(addMeses(referencia, -1))}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-base-600 text-ink-secondary transition hover:border-ink-muted hover:text-ink-primary"
            aria-label="Mês anterior"
          >
            <IconChevronLeft className="h-4 w-4" />
          </button>
          <p className="w-40 text-center text-sm font-medium capitalize">{fmtMesAno(referencia)}</p>
          <button
            onClick={() => onMudarReferencia(addMeses(referencia, 1))}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-base-600 text-ink-secondary transition hover:border-ink-muted hover:text-ink-primary"
            aria-label="Próximo mês"
          >
            <IconChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatTile icon={IconWallet} label="Saldo Atual" value={fmtBRL(saldoAtual)} hint="Soma de todas as contas" />
        <StatTile icon={IconTrendingUp} label="Receitas" value={fmtBRL(receitas)} tone="good" hint="No mês selecionado" />
        <StatTile icon={IconTrendingDown} label="Despesas" value={fmtBRL(despesas)} tone="warning" hint="No mês selecionado" />
        <StatTile
          icon={IconCreditCard}
          label="Cartões de Crédito"
          value={fmtBRL(cartoesTotal)}
          tone={toneLimiteCartao(cartoesTotal, limiteTotal)}
          hint="Faturas em aberto"
        />
      </div>

      <Card>
        <h2 className="mb-4 text-sm font-semibold text-ink-primary">Despesas por Categoria</h2>
        <DonutChartCategorias dados={despesasPorCategoria} total={despesas} />
      </Card>

      <div>
        <h2 className="mb-3 text-sm font-semibold text-ink-primary">Resumo de Cartões</h2>
        {CARTOES_PREVIEW.length === 0 ? (
          <Card className="py-10 text-center text-sm text-ink-muted">Nenhum cartão cadastrado ainda.</Card>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {CARTOES_PREVIEW.map((cartao) => (
              <Card key={cartao.id} className="p-4">
                <div className="mb-3 flex items-center gap-2">
                  <IconCreditCard className="h-4 w-4 text-ink-muted" />
                  <p className="truncate text-sm font-medium text-ink-primary">{cartao.nome}</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-ink-muted">Fatura Aberta</p>
                    <p className="mt-0.5 text-base font-semibold text-ink-primary">{fmtBRL(cartao.faturaAberta)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-ink-muted">Fatura Fechada</p>
                    <p className="mt-0.5 text-base font-semibold text-ink-primary">{fmtBRL(cartao.faturaFechadaValor)}</p>
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between border-t border-base-800 pt-3">
                  <p className="text-xs text-ink-muted">Vence {cartao.vencimento}</p>
                  <Badge tone={cartao.faturaFechadaPaga ? "good" : "warning"} label={cartao.faturaFechadaPaga ? "Paga" : "Em aberto"} />
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
