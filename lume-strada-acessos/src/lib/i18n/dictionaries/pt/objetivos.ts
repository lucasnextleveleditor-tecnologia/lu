/**
 * Módulo "Objetivos" (`/admin/objetivos`) — meta de faturamento do mês e do
 * ano comparada ao que já foi lançado no Financeiro (`fin_transacoes`), com
 * um gráfico do ritmo mês a mês e uma tendência de fechamento calculada por
 * regra de três simples (dias já passados vs. dias que faltam) — nunca uma
 * "IA" de verdade, só aritmética, mas explicada de um jeito direto. Ver
 * `src/app/admin/objetivos/data.ts` pra fonte dos números.
 */
export interface ObjetivosDict {
  tituloPagina: string;
  subtituloPagina: string;
  configurarMetasBtn: string;

  metaMesTitulo: string;
  metaAnoTitulo: string;
  metaLabel: string;
  faturadoLabel: string;
  faltaLabel: string;
  metaBatidaLabel: string;
  semMetaTitulo: string;
  semMetaDescricao: string;
  definirMetaBtn: string;

  ritmoTitulo: string;
  ritmoSubtitulo: string;
  ritmoLegendaMedia: string;
  ritmoMesFuturoHint: string;
  ritmoSemDados: string;
  mesesAbreviados: string[];

  tendenciaTitulo: string;
  tendenciaSubtitulo: string;
  tendenciaMesTexto: string;
  tendenciaAnoTexto: string;
  tendenciaPctMeta: string;
  statusAcimaRitmo: string;
  statusNoRitmo: string;
  statusAbaixoRitmo: string;
  statusSemMeta: string;

  modalTitulo: string;
  modalSubtitulo: string;
  metaMensalLabel: string;
  metaAnualLabel: string;
  hintMetaMensal: string;
  hintMetaAnual: string;
  hintLimparMeta: string;
  erroSalvar: string;
}

export const objetivos: ObjetivosDict = {
  tituloPagina: "Objetivos",
  subtituloPagina: "Acompanhe se a operação está no ritmo certo pra bater a meta do mês e do ano.",
  configurarMetasBtn: "Configurar Metas",

  metaMesTitulo: "Meta do Mês",
  metaAnoTitulo: "Meta do Ano",
  metaLabel: "Meta",
  faturadoLabel: "Faturado",
  faltaLabel: "Falta",
  metaBatidaLabel: "Meta batida",
  semMetaTitulo: "Nenhuma meta definida ainda",
  semMetaDescricao: "Configure um valor pra começar a acompanhar o progresso.",
  definirMetaBtn: "Definir meta",

  ritmoTitulo: "Ritmo do Ano",
  ritmoSubtitulo: "Faturamento de cada mês comparado à média mensal necessária pra bater a meta anual.",
  ritmoLegendaMedia: "Média mensal necessária",
  ritmoMesFuturoHint: "ainda não chegou",
  ritmoSemDados: "Defina a meta anual pra ver a linha de referência mensal.",
  mesesAbreviados: ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"],

  tendenciaTitulo: "Tendência",
  tendenciaSubtitulo: "Estimativa de fechamento no ritmo atual — regra de três com os dias já passados, não é garantia de nada.",
  tendenciaMesTexto: "Nesse ritmo, {mes} fecha em torno de {valor}.",
  tendenciaAnoTexto: "Nesse ritmo, {ano} fecha em torno de {valor}.",
  tendenciaPctMeta: "{pct} da meta",
  statusAcimaRitmo: "Acima do ritmo",
  statusNoRitmo: "No ritmo",
  statusAbaixoRitmo: "Abaixo do ritmo",
  statusSemMeta: "Sem meta definida",

  modalTitulo: "Configurar Metas",
  modalSubtitulo: "Esses valores alimentam o progresso do mês e do ano nesta página.",
  metaMensalLabel: "Meta de faturamento do mês",
  metaAnualLabel: "Meta de faturamento do ano",
  hintMetaMensal: "Vale pro mês corrente — ajuste sempre que quiser mudar o alvo.",
  hintMetaAnual: "Vale pro ano corrente inteiro.",
  hintLimparMeta: "Deixe em branco pra remover a meta.",
  erroSalvar: "Não foi possível salvar as metas — tente de novo.",
};
