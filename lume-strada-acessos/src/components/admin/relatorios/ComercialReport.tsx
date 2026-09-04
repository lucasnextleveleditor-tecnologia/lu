"use client";

import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { RelatorioComercialData } from "@/lib/types/relatorios";
import { fmtBRL, fmtPercent } from "@/lib/utils/format";
import { StatTile } from "@/components/ui/StatTile";
import { Card } from "@/components/ui/Card";
import { ExportMenuButton } from "@/components/ui/ExportMenuButton";
import { IconTarget, IconTrendingUp, IconCheckCircle, IconClipboardList } from "@/components/ui/icons";
import { CHART_AXIS_STYLE, CHART_CORES, CHART_TOOLTIP_STYLE, PALETA_CHART_CATEGORICA } from "@/components/admin/relatorios/chartTheme";
import { RelatorioEmptyState, RelatorioSkeleton } from "@/components/admin/relatorios/RelatorioEstados";
import { useLocale } from "@/lib/i18n/LocaleProvider";

interface ComercialReportProps {
  data: RelatorioComercialData | null;
  carregando: boolean;
  erro: string | null;
}

export function ComercialReport({ data, carregando, erro }: ComercialReportProps) {
  const { dict } = useLocale();
  if (erro) return <RelatorioEmptyState titulo={dict.relatorios.comercialErroTitulo} descricao={erro} />;
  if (carregando || !data) return <RelatorioSkeleton />;
  if (data.totalLeadsNoPeriodo === 0) {
    return <RelatorioEmptyState titulo={dict.relatorios.comercialVazioTitulo} descricao={dict.relatorios.comercialVazioDescricao} />;
  }

  const csvLinhas = data.funil.map((f) => ({ etapa: f.label, total: f.total }));

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-ink-primary">{dict.relatorios.comercialTitulo}</h2>
          <p className="text-xs text-ink-muted">{dict.relatorios.comercialSubtitulo}</p>
        </div>
        <ExportMenuButton
          targetId="relatorio-comercial-export"
          nomeArquivo="relatorio-comercial"
          dadosCSV={csvLinhas}
          colunasCSV={[
            { chave: "etapa", rotulo: dict.relatorios.comercialCsvEtapa },
            { chave: "total", rotulo: dict.relatorios.comercialCsvTotalLeads },
          ]}
        />
      </div>

      <div id="relatorio-comercial-export" className="space-y-5 rounded-2xl bg-base-950 p-1">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatTile icon={IconClipboardList} label={dict.relatorios.comercialStatLeadsPeriodo} value={data.totalLeadsNoPeriodo} />
          <StatTile
            icon={IconCheckCircle}
            label={dict.relatorios.comercialStatTaxaConversao}
            value={data.taxaConversao !== null ? fmtPercent(data.taxaConversao) : "—"}
            tone={data.taxaConversao !== null && data.taxaConversao >= 0.5 ? "good" : "neutral"}
            hint={dict.relatorios.comercialStatTaxaConversaoHint
              .replace("{fechados}", String(data.fechados))
              .replace("{perdidos}", String(data.perdidos))}
          />
          <StatTile
            icon={IconTarget}
            label={dict.relatorios.comercialStatTempoFechamento}
            value={data.tempoMedioFechamentoDias !== null ? `${Math.round(data.tempoMedioFechamentoDias)} ${dict.relatorios.diasSufixo}` : "—"}
            hint={dict.relatorios.comercialStatTempoFechamentoHint}
          />
          <StatTile icon={IconTrendingUp} label={dict.relatorios.comercialStatValorFechado} value={fmtBRL(data.valorFechadoNoPeriodo)} tone="good" />
        </div>

        <Card>
          <h3 className="mb-4 text-sm font-semibold text-ink-primary">{dict.relatorios.comercialFunilTitulo}</h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.funil} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid stroke={CHART_CORES.grade} strokeDasharray="3 5" vertical={false} />
                <XAxis dataKey="label" {...CHART_AXIS_STYLE} interval={0} angle={-18} textAnchor="end" height={56} />
                <YAxis allowDecimals={false} {...CHART_AXIS_STYLE} width={36} />
                <Tooltip {...CHART_TOOLTIP_STYLE} formatter={(valor: number) => [valor, dict.relatorios.leadsLabel]} />
                <Bar dataKey="total" radius={[4, 4, 0, 0]} maxBarSize={48}>
                  {data.funil.map((_, i) => (
                    <Cell key={i} fill={PALETA_CHART_CATEGORICA[i % PALETA_CHART_CATEGORICA.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
}
