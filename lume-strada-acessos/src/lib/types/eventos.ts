/**
 * Eventos — a operação de campo.
 *
 * Ver `supabase/eventos.sql` para o porquê de cada decisão do modelo. Duas
 * valem repetir aqui, porque afetam todo código que toca nestes tipos:
 *
 * 1. **Prefixo `ev_` nas tabelas.** `public.eventos` já é a trilha de
 *    auditoria do sistema; o módulo mora em `ev_eventos`, `ev_ambientes`,
 *    `ev_blocos`, `ev_equipe` e `ev_capturas`.
 *
 * 2. **Tudo que é tempo é INSTANTE (ISO com fuso), nunca hora do dia.** Evento
 *    vira a madrugada: "CO₂ à uma" é 01:00 do dia seguinte ao início. Um
 *    `"01:00"` solto ordenaria antes das 21:00 e jogaria o boom para o começo
 *    da grade.
 */

export const STATUS_EVENTO = ["planejamento", "montagem", "ao_vivo", "pos", "encerrado"] as const;
export type StatusEvento = (typeof STATUS_EVENTO)[number];

export const TIPOS_BLOCO = ["atracao", "boom", "operacao"] as const;
export type TipoBloco = (typeof TIPOS_BLOCO)[number];

export const CATEGORIAS_CAPTURA = [
  "palco",
  "publico",
  "drone",
  "patrocinador",
  "boom",
  "bastidores",
  "depoimento",
  "outro",
] as const;
export type CategoriaCaptura = (typeof CATEGORIAS_CAPTURA)[number];

export const STATUS_CAPTURA = ["pendente", "captado", "nao_rolou"] as const;
export type StatusCaptura = (typeof STATUS_CAPTURA)[number];

export interface EventoRow {
  id: string;
  company_id: string;
  /** Contratante. Null = evento próprio da casa. */
  cliente_id: string | null;
  nome: string;
  local: string | null;
  /** ISO com fuso — o recorte que a grade desenha. */
  inicio: string;
  fim: string;
  status: StatusEvento;
  observacoes: string | null;
  created_at: string;
  updated_at: string;
}

/** Palco/área. Dois ambientes no mesmo horário é o normal aqui, não conflito. */
export interface AmbienteRow {
  id: string;
  company_id: string;
  evento_id: string;
  nome: string;
  /** Hex da faixa na grade. Null = a tela escolhe pela ordem. */
  cor: string | null;
  ordem: number;
  created_at: string;
  updated_at: string;
}

export interface BlocoRow {
  id: string;
  company_id: string;
  evento_id: string;
  ambiente_id: string | null;
  titulo: string;
  tipo: TipoBloco;
  inicio: string;
  /** Null quando `tipo === "boom"`: instante não tem fim, e a grade desenha pino em vez de barra. */
  fim: string | null;
  observacoes: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Uma pessoa escalada, com o acesso temporário dela.
 *
 * `token` nunca vai para o navegador de quem não é da equipe da agência: ele é
 * a credencial inteira de `/evento/<token>`. Quem lista a equipe no painel
 * recebe o token para poder COPIAR o link e mandar — é o mesmo trato do
 * `portal_token` do cliente.
 */
export interface EquipeEventoRow {
  id: string;
  company_id: string;
  evento_id: string;
  nome: string;
  funcao: string | null;
  telefone: string | null;
  /** Vínculo com o cadastro da casa. Null para freelancer, que é a maioria num evento grande. */
  equipe_membro_id: string | null;
  token: string;
  token_expira_em: string | null;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Um item da pauta de captação: algo que precisa EXISTIR quando o evento
 * acabar. Não é tarefa nem compromisso — é cobertura.
 */
export interface CapturaRow {
  id: string;
  company_id: string;
  evento_id: string;
  /** Null = em qualquer lugar do evento (ex: "foto de público"). */
  ambiente_id: string | null;
  /** Momento da programação a que o item está amarrado, quando houver. */
  bloco_id: string | null;
  titulo: string;
  categoria: CategoriaCaptura;
  precisa_foto: boolean;
  precisa_video: boolean;
  /** A janela em que ainda dá para captar. Fora dela não adianta mais. */
  janela_inicio: string | null;
  janela_fim: string | null;
  /** Cobertura contratada (patrocinador). Falhar custa dinheiro, não só material. */
  obrigatorio: boolean;
  responsavel_id: string | null;
  status: StatusCaptura;
  marcado_por: string | null;
  marcado_em: string | null;
  observacao: string | null;
  ordem: number;
  created_at: string;
  updated_at: string;
}

/**
 * O estado de um item NA TELA — que é mais do que a coluna `status` guarda.
 *
 * "Perdido" não existe no banco de propósito: ele não é um estado que alguém
 * escolhe, é uma conclusão do relógio. Um item pendente cuja janela já fechou
 * está perdido, e vai continuar perdido sem ninguém mexer nele. Guardar isso
 * numa coluna exigiria um processo varrendo a tabela de minuto em minuto só
 * para escrever o óbvio — e um item ficaria "pendente" na tela até esse
 * processo rodar.
 */
export type EstadoCaptura = "captado" | "pendente" | "perdido" | "nao_rolou";

export function estadoDaCaptura(captura: Pick<CapturaRow, "status" | "janela_fim">, agoraISO: string): EstadoCaptura {
  if (captura.status === "captado") return "captado";
  if (captura.status === "nao_rolou") return "nao_rolou";
  if (captura.janela_fim && captura.janela_fim < agoraISO) return "perdido";
  return "pendente";
}

/** Evento com o que a lista precisa mostrar sem abrir cada um. */
export type EventoComResumo = EventoRow & {
  cliente_nome: string | null;
  ambientes: number;
  equipe: number;
  capturas_total: number;
  capturas_captadas: number;
  /** Pendentes com a janela já fechada — o número que importa. */
  capturas_perdidas: number;
};
