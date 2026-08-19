// ============================================================================
// Paleta e tokens de gráfico do Hub de Relatórios — hex "crus" (Recharts não
// aceita classe Tailwind em `stroke`/`fill`), mas todos os valores aqui são
// os MESMOS tokens já usados no resto do app (`tailwind.config.ts`), nunca
// uma cor nova inventada só pra gráfico. Segue a skill interna de dataviz:
// grid/eixo recessivo, série "boa" em verde/`status.good`, série "neutra"
// (não é bom nem ruim, só a outra ponta da comparação — ex: despesa,
// investimento) em cinza/`status.neutral`, nunca vermelho pra algo que não é
// de fato um estado crítico.
// ============================================================================

export const CHART_CORES = {
  grade: "#27272a", // base-700 — grid/eixo recessivo
  eixoTexto: "#71717a", // ink-muted
  tooltipFundo: "#09090b", // base-900
  tooltipBorda: "#27272a", // base-700
  tooltipTexto: "#ffffff", // ink-primary
  receita: "#0ca30c", // status.good — mesma cor de "entrada de dinheiro" do FinanceiroDoMesCard
  despesa: "#8a8783", // status.neutral — não é "ruim", só a outra ponta da comparação
  investimento: "#8a8783", // status.neutral — mesmo raciocínio de despesa
  bom: "#0ca30c", // status.good
  atencao: "#fab219", // status.warning — usado em reembolsos (dinheiro que volta, precisa de atenção)
  critico: "#d03b3b", // status.critical
} as const;

/** As 7 cores categóricas fixas (mesma paleta validada do Financeiro) — usada em qualquer gráfico de barras por categoria/status/funcionário, ciclando na mesma ordem, nunca gerando cor nova. */
export { PALETA_CATEGORIAS as PALETA_CHART_CATEGORICA } from "@/lib/utils/financeiro";

export const CHART_TOOLTIP_STYLE = {
  contentStyle: {
    backgroundColor: "rgba(9,9,11,0.95)",
    border: `1px solid ${CHART_CORES.tooltipBorda}`,
    borderRadius: 12,
    padding: "8px 12px",
    boxShadow: "0 20px 40px -20px rgba(0,0,0,0.9)",
  },
  labelStyle: { color: CHART_CORES.eixoTexto, fontSize: 11, marginBottom: 4, textTransform: "uppercase" as const, letterSpacing: "0.03em" },
  itemStyle: { color: CHART_CORES.tooltipTexto, fontSize: 12, padding: 0 },
  cursor: { fill: "rgba(255,255,255,0.04)" },
};

export const CHART_AXIS_STYLE = {
  tick: { fill: CHART_CORES.eixoTexto, fontSize: 11 },
  axisLine: { stroke: CHART_CORES.grade },
  tickLine: { stroke: CHART_CORES.grade },
};
