"use client";

import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { RelatorioFinanceiroData } from "@/lib/types/relatorios";
import { fmtBRL, fmtDataCurta } from "@/lib/utils/format";
import { StatTile } from "@/components/ui/StatTile";
import { Card } from "@/components/ui/Card";
import { ExportMenuButton } from "@/components/ui/ExportMenuButton";
import { IconWallet, IconTrendingUp, IconAlertTriangle, IconDollarSign } from "@/components/ui/icons";
import { CHART_AXIS_STYLE, CHART_CORES, CHART_TOOLTIP_STYLE } from "@/components/admin/relatorios/chartTheme";
import { RelatorioEmptyState, RelatorioSkeleton } from "@/components/admin/relatorios/RelatorioEstados";

interface FinanceiroReportProps {
  data: RelatorioFinanceiroData | null;
  carregando: boolean;
  erro: string | null;
}

export function FinanceiroReport({ data, carregando, erro }: FinanceiroReportProps) {
  if (erro) return <RelatorioEmptyState titulo="Não foi possível carregar o Financeiro" descricao={erro} />;
  if (carregando || !data) return <RelatorioSkeleton />;
  if (data.qtdTransacoes === 0) {
    return <RelatorioEmptyState titulo="Sem lançamentos no período" descricao="Ajuste o intervalo de datas acima ou lance receitas/despesas em Financeiro." />;
  }

  const csvLinhas = data.serieDiaria.map((d) => ({
    data: fmtDataCurta(d.data),
    receitas: d.receitas.toFixed(2),
    despesas: d.despesas.toFixed(2),
    saldo: (d.receitas - d.despesas).toFixed(2),
  }));

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-ink-primary">Financeiro — Fluxo de Caixa &amp; DRE</h2>
          <p className="text-xs text-ink-muted">Contexto profissional · lançamentos por data de vencimento</p>
        </div>
        <ExportMenuButton
          targetId="relatorio-financeiro-export"
          nomeArquivo="relatorio-financeiro"
          dadosCSV={csvLinhas}
          colunasCSV={[
            { chave: "data", rotulo: "Data" },
            { chave: "receitas", rotulo: "Receitas (R$)" },
            { chave: "despesas", rotulo: "Despesas (R$)" },
            { chave: "saldo", rotulo: "Saldo (R$)" },
          ]}
        />
      </div>

      <div id="relatorio-financeiro-export" className="space-y-5 rounded-2xl bg-base-950 p-1">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatTile icon={IconTrendingUp} label="Receitas no Período" value={fmtBRL(data.totalReceitas)} tone="good" />
          <StatTile icon={IconAlertTriangle} label="Despesas no Período" value={fmtBRL(data.totalDespesas)} />
          <StatTile
            icon={IconDollarSign}
            label="Resultado (DRE)"
            value={fmtBRL(data.resultado)}
            tone={data.resultado >= 0 ? "good" : "critical"}
            hint="Receitas − Despesas"
          />
          <StatTile icon={IconWallet} label="Lançamentos" value={data.qtdTransacoes} hint="Receitas + despesas no período" />
        </div>

        <Card>
          <h3 className="mb-4 text-sm font-semibold text-ink-primary">Fluxo de Caixa Projetado</h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.serieDiaria} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="gradReceita" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={CHART_CORES.receita} stopOpacity={0.35} />
                    <stop offset="100%" stopColor={CHART_CORES.receita} stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gradDespesa" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={CHART_CORES.despesa} stopOpacity={0.3} />
                    <stop offset="100%" stopColor={CHART_CORES.despesa} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke={CHART_CORES.grade} strokeDasharray="3 5" vertical={false} />
                <XAxis dataKey="data" tickFormatter={fmtDataCurta} {...CHART_AXIS_STYLE} minTickGap={28} />
                <YAxis tickFormatter={(v: number) => fmtBRL(v).replace(",00", "")} {...CHART_AXIS_STYLE} width={72} />
                <Tooltip
                  {...CHART_TOOLTIP_STYLE}
                  labelFormatter={(v) => fmtDataCurta(String(v))}
                  formatter={(valor: number, nome: string) => [fmtBRL(valor), nome === "receitas" ? "Receitas" : "Despesas"]}
                />
                <Area type="monotone" dataKey="receitas" stroke={CHART_CORES.receita} strokeWidth={2} fill="url(#gradReceita)" />
                <Area type="monotone" dataKey="despesas" stroke={CHART_CORES.despesa} strokeWidth={2} fill="url(#gradDespesa)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-3 flex items-center gap-4 text-xs text-ink-secondary">
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: CHART_CORES.receita }} /> Receitas
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: CHART_CORES.despesa }} /> Despesas
            </span>
          </div>
        </Card>

        {data.porCategoria.length > 0 && (
          <Card>
            <h3 className="mb-4 text-sm font-semibold text-ink-primary">Despesas por Categoria</h3>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.porCategoria} layout="vertical" margin={{ top: 4, right: 24, left: 8, bottom: 0 }}>
                  <CartesianGrid stroke={CHART_CORES.grade} strokeDasharray="3 5" horizontal={false} />
                  <XAxis type="number" tickFormatter={(v: number) => fmtBRL(v).replace(",00", "")} {...CHART_AXIS_STYLE} />
                  <YAxis
                    type="category"
                    dataKey="nome"
                    width={150}
                    tickFormatter={(nome: string, i: number) => (data.porCategoria[i]?.emoji ? `${data.porCategoria[i]!.emoji} ${nome}` : nome)}
                    {...CHART_AXIS_STYLE}
                  />
                  <Tooltip {...CHART_TOOLTIP_STYLE} formatter={(valor: number) => [fmtBRL(valor), "Despesa"]} />
                  <Bar dataKey="valor" radius={[0, 4, 4, 0]} maxBarSize={22}>
                    {data.porCategoria.map((c, i) => (
                      <Cell key={i} fill={c.cor} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
