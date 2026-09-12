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

/**
 * Os quatro tipos de bloco, na palavra que a produtora usa.
 *
 * `ativacao` existe separada de `show` porque é a única que tem DONO: alguém
 * pagou para ela acontecer e para ser registrada. Uma ativação sem foto é uma
 * conversa com o cliente na segunda-feira; um show sem foto é material a menos.
 * `boom` é instante (CO₂, pirotecnia, confete) — a grade desenha pino, não
 * barra. `operacao` é o trabalho da casa (montagem, passagem de som): entra na
 * grade porque ocupa a equipe, mesmo não sendo palco.
 */
export const TIPOS_BLOCO = ["show", "ativacao", "boom", "operacao"] as const;
export type TipoBloco = (typeof TIPOS_BLOCO)[number];

/**
 * A PERGUNTA ÚNICA da hora de criar um bloco — e a regra inteira do atraso em
 * cascata (ver `lib/eventos/cascata.ts`).
 */
export const ANCORAS_BLOCO = ["encadeado", "cravado"] as const;
export type AncoraBloco = (typeof ANCORAS_BLOCO)[number];

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
  /** Fuso IANA do LOCAL do evento. Muda como as horas são escritas, nunca a linha AGORA. */
  fuso: string;
  /** Instante do PLAY. A diferença para `inicio` é o atraso da abertura. Null = ainda não começou. */
  iniciado_em: string | null;
  encerrado_em: string | null;
  /** Modelo salvo no fim de um evento — não aparece na lista, só na hora de duplicar. */
  modelo: boolean;
  duplicado_de: string | null;
  /** Carimbos dos dois botões do Fechamento. Sem eles, apertar duas vezes cria tudo duas vezes. */
  entregas_criadas_em: string | null;
  custos_lancados_em: string | null;
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
  /** O que a tela SUGERE ao criar um bloco aqui. Quem decide continua sendo o bloco. */
  modo_padrao: AncoraBloco;
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
  ancora: AncoraBloco;
  inicio: string;
  /** Null quando `tipo === "boom"`: instante não tem fim, e a grade desenha pino em vez de barra. */
  fim: string | null;
  /** O que a tela edita (+/− de 5 em 5). Quando o bloco anda, é a duração que fica igual. */
  duracao_min: number | null;
  /** Quem cobre. É o que permite ver a mesma pessoa escalada em dois blocos ao mesmo tempo. */
  responsavel_id: string | null;
  /** Quanto este bloco já andou no total. O Fechamento usa para "previsto × realizado". */
  atraso_min: number;
  /** Desempate quando dois blocos começam no mesmo minuto. */
  ordem: number;
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
  /** O combinado do dia. Com o ponto, fecha a conta do evento sem ninguém somar nada. */
  cache: number;
  extras: number;
  checkin_em: string | null;
  checkout_em: string | null;
  observacao: string | null;
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
  /** Para quem esse material é. O balanço do Fechamento sai por aqui, não por ambiente. */
  destinatario: string | null;
  cliente_id: string | null;
  /** O porquê do "não rolou" — a coluna NÃO EXISTE do Fechamento. */
  motivo: string | null;
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


/** O que vai para o evento. Ligado ao Inventário quando dá, texto livre quando não dá. */
export interface KitRow {
  id: string;
  company_id: string;
  evento_id: string;
  /** Null = item que não é patrimônio da casa ("tripé emprestado do João"). */
  item_inventario_id: string | null;
  nome: string;
  quantidade: number;
  responsavel_id: string | null;
  saiu: boolean;
  voltou: boolean;
  observacao: string | null;
  ordem: number;
  created_at: string;
  updated_at: string;
}

export const TIPOS_OCORRENCIA = ["atraso", "ocorrencia", "status", "captura", "entrega"] as const;
export type TipoOcorrencia = (typeof TIPOS_OCORRENCIA)[number];

/**
 * O log do evento: o que aconteceu fora do previsto, com hora e autor.
 *
 * Dois campos de autor porque existem dois tipos de gente aqui — quem está
 * logado no painel e o freelancer que entrou pelo link e não tem conta.
 */
export interface OcorrenciaRow {
  id: string;
  company_id: string;
  evento_id: string;
  bloco_id: string | null;
  ambiente_id: string | null;
  tipo: TipoOcorrencia;
  texto: string;
  /** Só para `atraso`. Negativo quando o evento adiantou. */
  minutos: number | null;
  autor_profile_id: string | null;
  autor_equipe_id: string | null;
  created_at: string;
}

export const STATUS_REALTIME = ["pedido", "editando", "entregue", "cancelado"] as const;
export type StatusRealtime = (typeof STATUS_REALTIME)[number];

/** Entrega realtime: pedido → editor → link, com o prazo correndo. */
export interface RealtimeRow {
  id: string;
  company_id: string;
  evento_id: string;
  bloco_id: string | null;
  pedido: string;
  editor_equipe_id: string | null;
  editor_profile_id: string | null;
  prazo_em: string | null;
  status: StatusRealtime;
  link: string | null;
  tarefa_id: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * O modo em que a tela do evento abre.
 *
 * Não é uma preferência: é consequência do status. Quem abre um evento que
 * começa daqui a duas semanas quer planejar; quem abre o de hoje, no meio do
 * show, quer ver o relógio. Perguntar seria fazer a pessoa responder uma coisa
 * que o sistema já sabe.
 */
export const MODOS_EVENTO = ["plano", "aovivo", "fechamento"] as const;
export type ModoEvento = (typeof MODOS_EVENTO)[number];

export function modoDoStatus(status: StatusEvento): ModoEvento {
  if (status === "ao_vivo") return "aovivo";
  if (status === "pos" || status === "encerrado") return "fechamento";
  return "plano";
}
