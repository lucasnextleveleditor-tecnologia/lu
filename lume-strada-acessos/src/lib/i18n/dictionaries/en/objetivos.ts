import type { ObjetivosDict } from "../pt/objetivos";

export const objetivos: ObjetivosDict = {
  tituloPagina: "Goals",
  subtituloPagina: "See whether the business is on pace to hit this month's and this year's target.",
  configurarMetasBtn: "Set Goals",

  metaMesTitulo: "Monthly Goal",
  metaAnoTitulo: "Annual Goal",
  metaLabel: "Goal",
  faturadoLabel: "Earned",
  faltaLabel: "Left",
  metaBatidaLabel: "Goal reached",
  semMetaTitulo: "No goal set yet",
  semMetaDescricao: "Set a value to start tracking progress.",
  definirMetaBtn: "Set goal",

  ritmoTitulo: "Yearly Pace",
  ritmoSubtitulo: "Each month's revenue compared to the monthly average needed to hit the annual goal.",
  ritmoLegendaMedia: "Required monthly average",
  ritmoMesFuturoHint: "not here yet",
  ritmoSemDados: "Set the annual goal to see the monthly reference line.",
  mesesAbreviados: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],

  tendenciaTitulo: "Trend",
  tendenciaSubtitulo: "A closing estimate at the current pace — simple math based on days elapsed, not a guarantee.",
  tendenciaMesTexto: "At this pace, {mes} closes around {valor}.",
  tendenciaAnoTexto: "At this pace, {ano} closes around {valor}.",
  tendenciaPctMeta: "{pct} of the goal",
  statusAcimaRitmo: "Ahead of pace",
  statusNoRitmo: "On pace",
  statusAbaixoRitmo: "Behind pace",
  statusSemMeta: "No goal set",

  modalTitulo: "Set Goals",
  modalSubtitulo: "These values feed the month and year progress on this page.",
  metaMensalLabel: "Monthly revenue goal",
  metaAnualLabel: "Annual revenue goal",
  hintMetaMensal: "Applies to the current month — adjust it whenever the target changes.",
  hintMetaAnual: "Applies to the whole current year.",
  hintLimparMeta: "Leave blank to remove the goal.",
  erroSalvar: "Couldn't save the goals — try again.",
};
