/**
 * Notificações e avisos.
 *
 * Duas coisas diferentes, e a diferença importa: uma NOTIFICAÇÃO é o que o
 * sistema conta para uma pessoa ("te colocaram numa tarefa"), nasce lida por
 * ninguém e morre lida por uma pessoa só. Um AVISO é o que o administrador
 * conta para a equipe — uma linha lida por muitos, e por isso a leitura mora
 * numa tabela à parte: se fosse uma coluna `read`, o primeiro a marcar como
 * visto faria o aviso sumir para todo mundo.
 */

export type TipoNotificacao =
  | "task_assignment"
  | "mention"
  | "announcement"
  | "contrato"
  | "assinatura"
  | "system";

export interface NotificacaoRow {
  id: string;
  company_id: string;
  user_id: string;
  tipo: TipoNotificacao;
  titulo: string;
  mensagem: string | null;
  /** Rota resolvida por quem CRIOU a notificação — a tela nunca remonta o caminho. */
  href: string | null;
  reference_id: string | null;
  reference_type: string | null;
  ator_id: string | null;
  ator_nome: string | null;
  read: boolean;
  read_at: string | null;
  created_at: string;
}

export type TomAviso = "info" | "atencao" | "critico";
export type PublicoAviso = "all" | "specific_users";

export interface AvisoRow {
  id: string;
  company_id: string;
  sender_id: string | null;
  sender_nome: string | null;
  title: string;
  message: string;
  tone: TomAviso;
  target_type: PublicoAviso;
  target_user_ids: string[];
  arquivado: boolean;
  created_at: string;
}

/** Um aviso do ponto de vista de quem o recebe: com a informação de já ter sido visto ou não. */
export interface AvisoParaMim extends AvisoRow {
  visto: boolean;
}

/**
 * Cor de cada tom. O RÓTULO não mora aqui: ele é texto de tela e vive no
 * dicionário (`dict.notificacoes.tom`), como todo o resto. Cor é dado de
 * marca, igual nos três idiomas; palavra não é.
 */
export const TOM_AVISO: Record<TomAviso, { cor: string; classe: string }> = {
  info: { cor: "#38bdf8", classe: "text-accent" },
  atencao: { cor: "#f59e0b", classe: "text-status-warning" },
  critico: { cor: "#f43f5e", classe: "text-danger" },
};

/**
 * "há 5 min", "ontem" — data absoluta num sino é ruído: o que importa é se é
 * recente.
 *
 * Recebe os textos em vez de embutir: o sino de quem usa o painel em espanhol
 * não pode dizer "há 5 min" só porque quem escreveu estava em português.
 */
export function tempoRelativo(
  iso: string,
  t: { agora: string; haMinutos: string; haHoras: string; ontem: string; haDias: string },
  locale: string
): string {
  const agora = Date.now();
  const quando = new Date(iso).getTime();
  const seg = Math.max(0, Math.floor((agora - quando) / 1000));

  if (seg < 60) return t.agora;
  const min = Math.floor(seg / 60);
  if (min < 60) return t.haMinutos.replace("{n}", String(min));
  const horas = Math.floor(min / 60);
  if (horas < 24) return t.haHoras.replace("{n}", String(horas));
  const dias = Math.floor(horas / 24);
  if (dias === 1) return t.ontem;
  if (dias < 7) return t.haDias.replace("{n}", String(dias));
  return new Date(iso).toLocaleDateString(locale, { day: "2-digit", month: "short" });
}
