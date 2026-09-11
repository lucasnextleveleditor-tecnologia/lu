import type { NotificacoesDict } from "../pt/notificacoes";

export const notificacoes: NotificacoesDict = {
  titulo: "Notificaciones",
  naoLidas: "{n} sin leer",
  marcarTodas: "Marcar todas como leídas",
  marcarComoVisto: "Marcar como visto",
  carregando: "Cargando…",
  vazioTitulo: "Nada por aquí",
  vazioAjuda: "Te avisamos cuando entras en una tarea, te mencionan o la empresa publica un comunicado.",
  administracao: "Administración",
  tipo: {
    task_assignment: "Tarea",
    mention: "Mención",
    announcement: "Comunicado de la empresa",
    contrato: "Contrato",
    assinatura: "Firma",
    system: "Sistema",
  },
  tom: { info: "Informativo", atencao: "Atención", critico: "Urgente" },
  agora: "ahora",
  haMinutos: "hace {n} min",
  haHoras: "hace {n} h",
  ontem: "ayer",
  haDias: "hace {n} días",
};
