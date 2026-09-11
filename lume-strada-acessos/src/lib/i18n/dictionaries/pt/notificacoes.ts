export interface NotificacoesDict {
  titulo: string;
  /** `{n}` = quantas. */
  naoLidas: string;
  marcarTodas: string;
  marcarComoVisto: string;
  carregando: string;
  vazioTitulo: string;
  vazioAjuda: string;
  administracao: string;
  /** Rótulo curto na linha de cima — dá a natureza do aviso antes de a pessoa ler o texto. */
  tipo: {
    task_assignment: string;
    mention: string;
    announcement: string;
    contrato: string;
    assinatura: string;
    system: string;
  };
  tom: { info: string; atencao: string; critico: string };
  agora: string;
  /** `{n}` = quantos. */
  haMinutos: string;
  haHoras: string;
  ontem: string;
  haDias: string;
}

export const notificacoes: NotificacoesDict = {
  titulo: "Notificações",
  naoLidas: "{n} não lidas",
  marcarTodas: "Marcar todas como lidas",
  marcarComoVisto: "Marcar como visto",
  carregando: "Carregando…",
  vazioTitulo: "Nada por aqui",
  vazioAjuda: "Você é avisado quando entrar numa tarefa, for mencionado ou a empresa publicar um comunicado.",
  administracao: "Administração",
  tipo: {
    task_assignment: "Tarefa",
    mention: "Menção",
    announcement: "Aviso da empresa",
    contrato: "Contrato",
    assinatura: "Assinatura",
    system: "Sistema",
  },
  tom: { info: "Informativo", atencao: "Atenção", critico: "Urgente" },
  agora: "agora",
  haMinutos: "há {n} min",
  haHoras: "há {n} h",
  ontem: "ontem",
  haDias: "há {n} dias",
};
