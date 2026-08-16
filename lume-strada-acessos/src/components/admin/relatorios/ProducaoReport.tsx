"use client";

import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { RelatorioProducaoData } from "@/lib/types/relatorios";
import { StatTile } from "@/components/ui/StatTile";
import { Card } from "@/components/ui/Card";
import { ExportMenuButton } from "@/components/ui/ExportMenuButton";
import { IconCheckCircle, IconAlertTriangle, IconClipboardList, IconTarget } from "@/components/ui/icons";
import { CHART_AXIS_STYLE, CHART_CORES, CHART_TOOLTIP_STYLE, PALETA_CHART_CATEGORICA } from "@/components/admin/relatorios/chartTheme";
import { RelatorioEmptyState, RelatorioSkeleton } from "@/components/admin/relatorios/RelatorioEstados";

interface ProducaoReportProps {
  data: RelatorioProducaoData | null;
  carregando: boolean;
  erro: string | null;
}

export function ProducaoReport({ data, carregando, erro }: ProducaoReportProps) {
  if (erro) return <RelatorioEmptyState titulo="Não foi possível carregar Produção" descricao={erro} />;
  if (carregando || !data) return <RelatorioSkeleton />;

  const semDadosDoPeriodo = data.tarefasCriadasNoPeriodo === 0 && data.tarefasConcluidasNoPeriodo === 0;

  const csvLinhas = data.produtividade.map((p) => ({ funcionario: p.nome, tarefasConcluidas: p.concluidas }));

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-ink-primary">Produção &amp; Tarefas — Produtividade</h2>
          <p className="text-xs text-ink-muted">Conclusões no período, por responsável · gargalos são sempre o estado atual</p>
        </div>
        <ExportMenuButton
          targetId="relatorio-producao-export"
          nomeArquivo="relatorio-producao"
          dadosCSV={csvLinhas}
          colunasCSV={[
            { chave: "funcionario", rotulo: "Funcionário" },
            { chave: "tarefasConcluidas", rotulo: "Tarefas Concluídas" },
          ]}
        />
      </div>

      <div id="relatorio-producao-export" className="space-y-5 rounded-2xl bg-base-950 p-1">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatTile icon={IconClipboardList} label="Tarefas Criadas no Período" value={data.tarefasCriadasNoPeriodo} />
          <StatTile icon={IconCheckCircle} label="Tarefas Concluídas no Período" value={data.tarefasConcluidasNoPeriodo} tone="good" />
          <StatTile
            icon={IconAlertTriangle}
            label="Gargalos — Atrasadas Agora"
            value={data.tarefasAtrasadas}
            tone={data.tarefasAtrasadas > 0 ? "critical" : "neutral"}
            hint="Prazo vencido, ainda não concluídas"
          />
          <StatTile
            icon={IconTarget}
            label="Tempo Médio de Conclusão"
            value={data.tempoMedioConclusaoDias !== null ? `${Math.round(data.tempoMedioConclusaoDias)} dia(s)` : "—"}
            hint="Da criação até a conclusão"
          />
        </div>

        {semDadosDoPeriodo ? (
          <RelatorioEmptyState titulo="Sem movimentação no período" descricao="Nenhuma tarefa foi criada nem concluída no intervalo selecionado." />
        ) : (
          <Card>
            <h3 className="mb-4 text-sm font-semibold text-ink-primary">Produtividade por Funcionário</h3>
            {data.produtividade.length === 0 ? (
              <p className="py-6 text-center text-sm text-ink-muted">Nenhuma tarefa concluída no período.</p>
            ) : (
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.produtividade} layout="vertical" margin={{ top: 4, right: 24, left: 8, bottom: 0 }}>
                    <CartesianGrid stroke={CHART_CORES.grade} strokeDasharray="3 5" horizontal={false} />
                    <XAxis type="number" allowDecimals={false} {...CHART_AXIS_STYLE} />
                    <YAxis type="category" dataKey="nome" width={150} {...CHART_AXIS_STYLE} />
                    <Tooltip {...CHART_TOOLTIP_STYLE} formatter={(valor: number) => [valor, "Concluídas"]} />
                    <Bar dataKey="concluidas" radius={[0, 4, 4, 0]} maxBarSize={22}>
                      {data.produtividade.map((_, i) => (
                        <Cell key={i} fill={PALETA_CHART_CATEGORICA[i % PALETA_CHART_CATEGORICA.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </Card>
        )}
      </div>
    </div>
  );
}
