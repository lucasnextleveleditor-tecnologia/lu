"use client";

import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { RelatorioInventarioData } from "@/lib/types/relatorios";
import { fmtBRL, fmtPercent } from "@/lib/utils/format";
import { StatTile } from "@/components/ui/StatTile";
import { Card } from "@/components/ui/Card";
import { ExportMenuButton } from "@/components/ui/ExportMenuButton";
import { IconWallet, IconTrendingDown, IconBox } from "@/components/ui/icons";
import { CHART_AXIS_STYLE, CHART_CORES, CHART_TOOLTIP_STYLE, PALETA_CHART_CATEGORICA } from "@/components/admin/relatorios/chartTheme";
import { RelatorioEmptyState, RelatorioSkeleton } from "@/components/admin/relatorios/RelatorioEstados";

interface InventarioReportProps {
  data: RelatorioInventarioData | null;
  carregando: boolean;
  erro: string | null;
}

export function InventarioReport({ data, carregando, erro }: InventarioReportProps) {
  if (erro) return <RelatorioEmptyState titulo="Não foi possível carregar o Inventário" descricao={erro} />;
  if (carregando || !data) return <RelatorioSkeleton />;
  if (data.itensConsiderados === 0) {
    return (
      <RelatorioEmptyState
        titulo="Sem itens com valores cadastrados"
        descricao="Preencha valor pago e valor atual dos itens ativos em Inventário & Patrimônio para calcular a depreciação."
      />
    );
  }

  const csvLinhas = data.distribuicao.map((d) => ({ categoria: d.categoriaNome, valorAtual: d.valorAtual.toFixed(2) }));

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-ink-primary">Inventário — Depreciação do Patrimônio</h2>
          <p className="text-xs text-ink-muted">Sempre uma foto do agora — não é filtrado pelo período selecionado acima</p>
        </div>
        <ExportMenuButton
          targetId="relatorio-inventario-export"
          nomeArquivo="relatorio-inventario"
          dadosCSV={csvLinhas}
          colunasCSV={[
            { chave: "categoria", rotulo: "Categoria" },
            { chave: "valorAtual", rotulo: "Valor Atual (R$)" },
          ]}
        />
      </div>

      <div id="relatorio-inventario-export" className="space-y-5 rounded-2xl bg-base-950 p-1">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatTile icon={IconWallet} label="Total Investido" value={fmtBRL(data.totalInvestido)} hint={`${data.itensConsiderados} item(ns) considerado(s)`} />
          <StatTile icon={IconBox} label="Patrimônio Atual" value={fmtBRL(data.patrimonioAtual)} />
          <StatTile
            icon={IconTrendingDown}
            label="Depreciação Total"
            value={fmtBRL(data.depreciacaoTotal)}
            tone={data.depreciacaoTotal > 0 ? "warning" : "good"}
            hint={data.depreciacaoTotal < 0 ? "Valorização líquida" : "Perda de valor acumulada"}
          />
          <StatTile
            icon={IconTrendingDown}
            label="Depreciação Média"
            value={fmtPercent(data.percentualMedio)}
            tone={data.percentualMedio > 0.3 ? "warning" : "neutral"}
          />
        </div>

        <Card>
          <h3 className="mb-4 text-sm font-semibold text-ink-primary">Patrimônio Atual por Categoria</h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.distribuicao} layout="vertical" margin={{ top: 4, right: 24, left: 8, bottom: 0 }}>
                <CartesianGrid stroke={CHART_CORES.grade} strokeDasharray="3 5" horizontal={false} />
                <XAxis type="number" tickFormatter={(v: number) => fmtBRL(v).replace(",00", "")} {...CHART_AXIS_STYLE} />
                <YAxis type="category" dataKey="categoriaNome" width={150} {...CHART_AXIS_STYLE} />
                <Tooltip {...CHART_TOOLTIP_STYLE} formatter={(valor: number) => [fmtBRL(valor), "Valor Atual"]} />
                <Bar dataKey="valorAtual" radius={[0, 4, 4, 0]} maxBarSize={22}>
                  {data.distribuicao.map((_, i) => (
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
