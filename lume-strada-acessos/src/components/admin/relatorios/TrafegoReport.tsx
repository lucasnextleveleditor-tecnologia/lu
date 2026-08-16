"use client";

import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { RelatorioTrafegoData } from "@/lib/types/relatorios";
import { fmtBRL, fmtDataCurta, fmtPercent } from "@/lib/utils/format";
import { StatTile } from "@/components/ui/StatTile";
import { Card } from "@/components/ui/Card";
import { ExportMenuButton } from "@/components/ui/ExportMenuButton";
import { IconTrendingUp, IconTarget, IconDollarSign, IconTrendingDown } from "@/components/ui/icons";
import { CHART_AXIS_STYLE, CHART_CORES, CHART_TOOLTIP_STYLE, PALETA_CHART_CATEGORICA } from "@/components/admin/relatorios/chartTheme";
import { RelatorioEmptyState, RelatorioSkeleton } from "@/components/admin/relatorios/RelatorioEstados";

interface TrafegoReportProps {
  data: RelatorioTrafegoData | null;
  carregando: boolean;
  erro: string | null;
}

export function TrafegoReport({ data, carregando, erro }: TrafegoReportProps) {
  if (erro) return <RelatorioEmptyState titulo="Não foi possível carregar o Tráfego" descricao={erro} />;
  if (carregando || !data) return <RelatorioSkeleton />;

  const semNadaNoPeriodo = data.totalInvestimento === 0 && data.totalReceitaBruta === 0 && data.investimentoPorCliente.length === 0;
  if (semNadaNoPeriodo) {
    return (
      <RelatorioEmptyState
        titulo="Sem tracking no período"
        descricao="Nenhum anúncio de Info-Produtos nem registro de tráfego por cliente foi lançado no intervalo selecionado."
      />
    );
  }

  const csvLinhas = data.serieDiaria.map((d) => ({
    data: fmtDataCurta(d.data),
    investimento: d.investimento.toFixed(2),
    receitaBruta: d.receitaBruta.toFixed(2),
  }));

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-ink-primary">Tráfego &amp; Metas — ROI, ROAS e Lucro Líquido</h2>
          <p className="text-xs text-ink-muted">Consolidado do tracking de Info-Produtos (única fonte do módulo com receita)</p>
        </div>
        <ExportMenuButton
          targetId="relatorio-trafego-export"
          nomeArquivo="relatorio-trafego"
          dadosCSV={csvLinhas}
          colunasCSV={[
            { chave: "data", rotulo: "Data" },
            { chave: "investimento", rotulo: "Investimento (R$)" },
            { chave: "receitaBruta", rotulo: "Receita Bruta (R$)" },
          ]}
        />
      </div>

      <div id="relatorio-trafego-export" className="space-y-5 rounded-2xl bg-base-950 p-1">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatTile icon={IconTarget} label="ROAS" value={data.roas !== null ? `${data.roas.toFixed(2)}x` : "—"} hint="Receita ÷ Investimento" />
          <StatTile
            icon={IconTrendingUp}
            label="ROI"
            value={data.roi !== null ? fmtPercent(data.roi) : "—"}
            tone={data.roi !== null && data.roi >= 0 ? "good" : "critical"}
            hint="(Receita − Investimento) ÷ Investimento"
          />
          <StatTile
            icon={IconDollarSign}
            label="Lucro Líquido"
            value={fmtBRL(data.lucroLiquido)}
            tone={data.lucroLiquido >= 0 ? "good" : "critical"}
            hint="Receita − Investimento − Reembolsos"
          />
          <StatTile icon={IconTrendingDown} label="Reembolsos" value={fmtBRL(data.totalReembolsos)} tone={data.totalReembolsos > 0 ? "warning" : "neutral"} />
        </div>

        <Card>
          <h3 className="mb-4 text-sm font-semibold text-ink-primary">Investimento vs. Receita Bruta</h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.serieDiaria} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="gradReceitaTrafego" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={CHART_CORES.receita} stopOpacity={0.35} />
                    <stop offset="100%" stopColor={CHART_CORES.receita} stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gradInvestimento" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={CHART_CORES.investimento} stopOpacity={0.3} />
                    <stop offset="100%" stopColor={CHART_CORES.investimento} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke={CHART_CORES.grade} strokeDasharray="3 5" vertical={false} />
                <XAxis dataKey="data" tickFormatter={fmtDataCurta} {...CHART_AXIS_STYLE} minTickGap={28} />
                <YAxis tickFormatter={(v: number) => fmtBRL(v).replace(",00", "")} {...CHART_AXIS_STYLE} width={72} />
                <Tooltip
                  {...CHART_TOOLTIP_STYLE}
                  labelFormatter={(v) => fmtDataCurta(String(v))}
                  formatter={(valor: number, nome: string) => [fmtBRL(valor), nome === "receitaBruta" ? "Receita Bruta" : "Investimento"]}
                />
                <Area type="monotone" dataKey="receitaBruta" stroke={CHART_CORES.receita} strokeWidth={2} fill="url(#gradReceitaTrafego)" />
                <Area type="monotone" dataKey="investimento" stroke={CHART_CORES.investimento} strokeWidth={2} fill="url(#gradInvestimento)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-3 flex items-center gap-4 text-xs text-ink-secondary">
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: CHART_CORES.receita }} /> Receita Bruta
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: CHART_CORES.investimento }} /> Investimento
            </span>
          </div>
        </Card>

        {data.fechamentosNoPeriodo.length > 0 && (
          <Card>
            <h3 className="mb-4 text-sm font-semibold text-ink-primary">Lucro Líquido vs. Reembolsos — Fechamentos Semanais</h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={data.fechamentosNoPeriodo.map((f) => ({ semana: fmtDataCurta(f.semanaInicio), lucro: f.lucroLiquidoReal, reembolsos: f.reembolsos }))}
                  margin={{ top: 4, right: 8, left: 0, bottom: 0 }}
                >
                  <CartesianGrid stroke={CHART_CORES.grade} strokeDasharray="3 5" vertical={false} />
                  <XAxis dataKey="semana" {...CHART_AXIS_STYLE} />
                  <YAxis tickFormatter={(v: number) => fmtBRL(v).replace(",00", "")} {...CHART_AXIS_STYLE} width={72} />
                  <Tooltip {...CHART_TOOLTIP_STYLE} formatter={(valor: number, nome: string) => [fmtBRL(valor), nome === "lucro" ? "Lucro Líquido" : "Reembolsos"]} />
                  <Bar dataKey="lucro" radius={[4, 4, 0, 0]} maxBarSize={36}>
                    {data.fechamentosNoPeriodo.map((f, i) => (
                      <Cell key={i} fill={f.lucroLiquidoReal >= 0 ? CHART_CORES.bom : CHART_CORES.critico} />
                    ))}
                  </Bar>
                  <Bar dataKey="reembolsos" radius={[4, 4, 0, 0]} maxBarSize={36} fill={CHART_CORES.atencao} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        )}

        {data.investimentoPorCliente.length > 0 && (
          <Card>
            <h3 className="mb-4 text-sm font-semibold text-ink-primary">Investimento por Cliente (Tráfego)</h3>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.investimentoPorCliente} layout="vertical" margin={{ top: 4, right: 24, left: 8, bottom: 0 }}>
                  <CartesianGrid stroke={CHART_CORES.grade} strokeDasharray="3 5" horizontal={false} />
                  <XAxis type="number" tickFormatter={(v: number) => fmtBRL(v).replace(",00", "")} {...CHART_AXIS_STYLE} />
                  <YAxis type="category" dataKey="nome" width={150} {...CHART_AXIS_STYLE} />
                  <Tooltip {...CHART_TOOLTIP_STYLE} formatter={(valor: number, nome: string) => (nome === "investido" ? [fmtBRL(valor), "Investido"] : [valor, "Leads"])} />
                  <Bar dataKey="investido" radius={[0, 4, 4, 0]} maxBarSize={22}>
                    {data.investimentoPorCliente.map((_, i) => (
                      <Cell key={i} fill={PALETA_CHART_CATEGORICA[i % PALETA_CHART_CATEGORICA.length]} />
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
