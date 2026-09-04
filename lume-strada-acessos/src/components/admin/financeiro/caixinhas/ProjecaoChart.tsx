"use client";

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { projetarJurosCompostos, type CaixinhaTaxaPeriodo } from "@/lib/types/financeiro";
import { fmtBRL } from "@/lib/utils/format";
import { CHART_AXIS_STYLE, CHART_CORES, CHART_TOOLTIP_STYLE } from "@/components/admin/relatorios/chartTheme";
import { useLocale } from "@/lib/i18n/LocaleProvider";

const MESES_ABREV = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];

/** "R$ 1,2 mil" / "R$ 12,3 mil" — rótulo compacto pro eixo Y (o valor exato já mora no tooltip). */
function fmtBRLCompacto(valor: number): string {
  if (Math.abs(valor) >= 1000) return `R$ ${(valor / 1000).toLocaleString("pt-BR", { maximumFractionDigits: 1 })} mil`;
  return `R$ ${Math.round(valor)}`;
}

interface ProjecaoChartProps {
  saldoAtual: number;
  taxaRendimento: number;
  taxaRendimentoPeriodo: CaixinhaTaxaPeriodo;
}

/**
 * Projeção de juros compostos dos próximos 12 meses — um único mark
 * (magnitude ao longo do tempo, ver skill de dataviz: "change over time" ->
 * area/line, cor única `status.good` porque é a mesma semântica de
 * "crescimento" já usada em todo o app pra entrada de dinheiro, nunca uma
 * cor nova inventada). Sem meta/segunda série: o valor-alvo da caixinha (se
 * tiver) já aparece como referência textual no card, não precisa duplicar
 * como uma segunda linha aqui.
 */
export function ProjecaoChart({ saldoAtual, taxaRendimento, taxaRendimentoPeriodo }: ProjecaoChartProps) {
  const { dict } = useLocale();
  const pontos = projetarJurosCompostos(saldoAtual, taxaRendimento, taxaRendimentoPeriodo, 12);
  const dados = pontos.map((p) => ({
    label: p.mes === 0 ? dict.financeiro.caixinhas.projecaoHoje : MESES_ABREV[new Date(`${p.data}T00:00:00Z`).getUTCMonth()],
    valor: p.valor,
  }));

  if (taxaRendimento <= 0) {
    return (
      <p className="rounded-lg border border-dashed border-base-700 bg-base-950/40 p-4 text-center text-xs text-ink-muted">
        {dict.financeiro.caixinhas.projecaoSemTaxa}
      </p>
    );
  }

  return (
    <div className="h-56 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={dados} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="gradProjecaoCaixinha" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={CHART_CORES.bom} stopOpacity={0.35} />
              <stop offset="100%" stopColor={CHART_CORES.bom} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke={CHART_CORES.grade} vertical={false} />
          <XAxis dataKey="label" {...CHART_AXIS_STYLE} interval={1} />
          <YAxis {...CHART_AXIS_STYLE} width={64} tickFormatter={fmtBRLCompacto} />
          <Tooltip {...CHART_TOOLTIP_STYLE} formatter={(valor: number) => [fmtBRL(valor), dict.financeiro.caixinhas.projecaoTooltipLabel]} />
          <Area type="monotone" dataKey="valor" stroke={CHART_CORES.bom} strokeWidth={2} fill="url(#gradProjecaoCaixinha)" dot={false} activeDot={{ r: 4, fill: CHART_CORES.bom, stroke: CHART_CORES.tooltipFundo, strokeWidth: 2 }} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
