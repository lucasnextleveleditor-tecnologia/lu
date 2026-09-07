// ============================================================================
// Paleta e tokens de gráfico do Hub de Relatórios — Recharts não aceita
// classe Tailwind em `stroke`/`fill`/`backgroundColor`, mas aceita qualquer
// cor CSS válida, incluindo `var(...)` — por isso grid/eixo/tooltip usam
// `rgb(var(--color-x))`, os MESMOS tokens de `base`/`ink` do resto do app
// (`tailwind.config.ts` + `globals.css`), o que os faz virar claro/escuro
// sozinhos junto com o resto da interface, sem precisar de uma versão "modo
// claro" separada deste arquivo. As cores de STATUS (receita/despesa/bom/
// atenção/crítico) continuam em hex fixo de propósito — segue a skill
// interna de dataviz: paleta de status nunca é temática, é a mesma nos dois
// modos, sempre com ícone/rótulo junto. `despesa`/`investimento` em cinza
// neutro (não é "ruim", só a outra ponta da comparação), nunca vermelho pra
// algo que não é de fato um estado crítico.
// ============================================================================

export const CHART_CORES = {
  grade: "rgb(var(--color-base-700))", // grid/eixo recessivo
  eixoTexto: "rgb(var(--color-ink-muted))",
  tooltipFundo: "rgb(var(--color-base-900))",
  tooltipBorda: "rgb(var(--color-base-700))",
  tooltipTexto: "rgb(var(--color-ink-primary))",
  receita: "#0ca30c", // status.good (fixo) — mesma cor de "entrada de dinheiro" do FinanceiroDoMesCard
  despesa: "#8a8783", // status.neutral (fixo) — não é "ruim", só a outra ponta da comparação
  investimento: "#8a8783", // status.neutral (fixo) — mesmo raciocínio de despesa
  bom: "#0ca30c", // status.good (fixo)
  atencao: "#fab219", // status.warning (fixo) — usado em reembolsos (dinheiro que volta, precisa de atenção)
  critico: "#d03b3b", // status.critical (fixo)
} as const;

/** As 7 cores categóricas fixas (mesma paleta validada do Financeiro) — usada em qualquer gráfico de barras por categoria/status/funcionário, ciclando na mesma ordem, nunca gerando cor nova. */
export { PALETA_CATEGORIAS as PALETA_CHART_CATEGORICA } from "@/lib/utils/financeiro";

export const CHART_TOOLTIP_STYLE = {
  contentStyle: {
    backgroundColor: "rgb(var(--color-base-900) / 0.95)",
    border: `1px solid ${CHART_CORES.tooltipBorda}`,
    borderRadius: 12,
    padding: "8px 12px",
    // Sombra de elevação — preto funciona nos dois modos (mesma convenção
    // de sombra sob card/dropdown do resto do app), não precisa de `--glow-rgb`.
    boxShadow: "0 20px 40px -20px rgba(0,0,0,0.9)",
  },
  labelStyle: { color: CHART_CORES.eixoTexto, fontSize: 11, marginBottom: 4, textTransform: "uppercase" as const, letterSpacing: "0.03em" },
  itemStyle: { color: CHART_CORES.tooltipTexto, fontSize: 12, padding: 0 },
  cursor: { fill: "rgb(var(--glow-rgb) / 0.04)" },
};

export const CHART_AXIS_STYLE = {
  tick: { fill: CHART_CORES.eixoTexto, fontSize: 11 },
  axisLine: { stroke: CHART_CORES.grade },
  tickLine: { stroke: CHART_CORES.grade },
};
