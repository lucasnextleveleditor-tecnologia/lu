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

export const TOM_AVISO: Record<TomAviso, { rotulo: string; cor: string; classe: string }> = {
  info: { rotulo: "Informativo", cor: "#38bdf8", classe: "text-accent" },
  atencao: { rotulo: "Atenção", cor: "#f59e0b", classe: "text-status-warning" },
  critico: { rotulo: "Urgente", cor: "#f43f5e", classe: "text-danger" },
};

/**
 * Rótulo curto do tipo, para a linha de cima da notificação no sino.
 *
 * Existe para a pessoa entender a natureza do aviso ANTES de ler o texto —
 * "menção" e "tarefa" pedem reações diferentes, e uma lista onde tudo parece
 * igual obriga a ler tudo.
 */
export const ROTULO_TIPO: Record<TipoNotificacao, string> = {
  task_assignment: "Tarefa",
  mention: "Menção",
  announcement: "Aviso da empresa",
  contrato: "Contrato",
  assinatura: "Assinatura",
  system: "Sistema",
};

/**
 * Encontra os `@nome` de um texto.
 *
 * A regra de verdade — a que decide quem recebe — mora no banco
 * (`notificar_mencoes`), para valer venha o texto de onde vier. Esta cópia
 * serve à TELA: destacar o que já é menção enquanto se digita, e avisar
 * quantas pessoas serão notificadas antes de enviar.
 */
export function extrairMencoes(texto: string): string[] {
  const achados = texto.match(/@([A-Za-zÀ-ÿ0-9_.-]{2,40})/g) ?? [];
  return Array.from(new Set(achados.map((m) => m.slice(1))));
}

/** "há 5 min", "ontem" — data absoluta num sino é ruído: o que importa é se é recente. */
export function tempoRelativo(iso: string): string {
  const agora = Date.now();
  const quando = new Date(iso).getTime();
  const seg = Math.max(0, Math.floor((agora - quando) / 1000));

  if (seg < 60) return "agora";
  const min = Math.floor(seg / 60);
  if (min < 60) return `há ${min} min`;
  const horas = Math.floor(min / 60);
  if (horas < 24) return `há ${horas} h`;
  const dias = Math.floor(horas / 24);
  if (dias === 1) return "ontem";
  if (dias < 7) return `há ${dias} dias`;
  return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
}
