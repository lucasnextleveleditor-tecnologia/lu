import type { NotificacoesDict } from "../pt/notificacoes";

export const notificacoes: NotificacoesDict = {
  titulo: "Notifications",
  naoLidas: "{n} unread",
  marcarTodas: "Mark all as read",
  marcarComoVisto: "Mark as seen",
  carregando: "Loading…",
  vazioTitulo: "Nothing here",
  vazioAjuda: "You get a note when you're put on a task, mentioned, or the company posts an announcement.",
  administracao: "Management",
  tipo: {
    task_assignment: "Task",
    mention: "Mention",
    announcement: "Company announcement",
    contrato: "Contract",
    assinatura: "Signature",
    system: "System",
  },
  tom: { info: "Info", atencao: "Heads-up", critico: "Urgent" },
  agora: "just now",
  haMinutos: "{n} min ago",
  haHoras: "{n} h ago",
  ontem: "yesterday",
  haDias: "{n} days ago",
};
