import type { ObjetivosDict } from "../pt/objetivos";

export const objetivos: ObjetivosDict = {
  tituloPagina: "Objetivos",
  subtituloPagina: "Descubre si la operación va al ritmo correcto para cumplir la meta del mes y del año.",
  configurarMetasBtn: "Configurar Metas",

  metaMesTitulo: "Meta del Mes",
  metaAnoTitulo: "Meta del Año",
  metaLabel: "Meta",
  faturadoLabel: "Facturado",
  faltaLabel: "Falta",
  metaBatidaLabel: "Meta cumplida",
  semMetaTitulo: "Todavía no hay una meta definida",
  semMetaDescricao: "Configura un valor para empezar a seguir el progreso.",
  definirMetaBtn: "Definir meta",

  ritmoTitulo: "Ritmo del Año",
  ritmoSubtitulo: "Facturación de cada mes comparada con el promedio mensual necesario para cumplir la meta anual.",
  ritmoLegendaMedia: "Promedio mensual necesario",
  ritmoMesFuturoHint: "todavía no llega",
  ritmoSemDados: "Define la meta anual para ver la línea de referencia mensual.",
  mesesAbreviados: ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"],

  tendenciaTitulo: "Tendencia",
  tendenciaSubtitulo: "Estimación de cierre al ritmo actual — regla de tres con los días ya transcurridos, no es garantía de nada.",
  tendenciaMesTexto: "A este ritmo, {mes} cierra alrededor de {valor}.",
  tendenciaAnoTexto: "A este ritmo, {ano} cierra alrededor de {valor}.",
  tendenciaPctMeta: "{pct} de la meta",
  statusAcimaRitmo: "Por encima del ritmo",
  statusNoRitmo: "En ritmo",
  statusAbaixoRitmo: "Por debajo del ritmo",
  statusSemMeta: "Sin meta definida",

  modalTitulo: "Configurar Metas",
  modalSubtitulo: "Estos valores alimentan el progreso del mes y del año en esta página.",
  metaMensalLabel: "Meta de facturación del mes",
  metaAnualLabel: "Meta de facturación del año",
  hintMetaMensal: "Vale para el mes actual — ajústala siempre que cambie el objetivo.",
  hintMetaAnual: "Vale para todo el año actual.",
  hintLimparMeta: "Deja en blanco para quitar la meta.",
  erroSalvar: "No se pudieron guardar las metas — inténtalo de nuevo.",
};
