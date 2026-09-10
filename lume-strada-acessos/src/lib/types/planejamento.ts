/**
 * Planejamento Estratégico e Cronograma.
 *
 * O ciclo de trabalho com o cliente: 1, 2 ou 3 meses, escopo fechado, datas
 * marcadas. Onde o Onboarding responde "quem é esse cliente" uma vez só, o
 * Planejamento responde "o que vamos fazer para ele NESTES próximos meses".
 *
 * Por isso é HISTÓRICO e não documento vivo: `cliente_onboarding` tem uma
 * linha por cliente, `planos_estrategicos` tem várias — o plano de julho não
 * pode ser sobrescrito pelo de outubro, porque é dele que se tira o que foi
 * combinado no ciclo passado.
 */

export const DURACOES_DO_CICLO = [1, 2, 3] as const;
export type DuracaoDoCiclo = (typeof DURACOES_DO_CICLO)[number];

export const STATUS_DO_PLANO = ["rascunho", "ativo", "encerrado", "cancelado"] as const;
export type StatusDoPlano = (typeof STATUS_DO_PLANO)[number];

/**
 * A régua de avisos, igual à do banco.
 *
 * Aqui ela serve só para a tela CONTAR à pessoa quando o sino vai tocar. A
 * régua de verdade — a que dispara — mora na função `avisar_planos_vencendo()`
 * e no `check` de `plano_alertas.dias_restantes`. Se um dia mudar, muda nos
 * dois lugares: esta cópia é texto, aquela é comportamento.
 */
export const MARCOS_DE_AVISO = [20, 15, 10, 5, 4, 3, 2, 1] as const;

export interface PlanoRow {
  id: string;
  company_id: string;
  cliente_id: string;

  // A) Resumo do ciclo
  duracao_meses: DuracaoDoCiclo;
  data_inicio: string;
  /** GERADA pelo banco. Nunca enviada daqui — ver `fimDoCiclo()`. */
  data_fim: string;
  foco_estrategico: string | null;
  orcamento_midia_total: number | null;

  // B) Escopo de entregas
  qtd_posts_social: number;
  qtd_campanhas_trafego: number;
  pecas_extras: string[];
  escopo_observacoes: string | null;

  // C) Cronograma
  data_limite_pautas: string | null;
  data_limite_artes: string | null;
  data_go_live: string | null;
  data_reuniao_resultados: string | null;

  status: StatusDoPlano;
  criado_por: string | null;
  atualizado_por: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * O que o formulário edita — e só isso.
 *
 * `data_fim` fica de fora porque é calculada pelo banco; `status` fica de
 * fora porque muda por botão, não por campo; `company_id` e `cliente_id`
 * ficam de fora porque quem os define é quem cria a linha.
 */
export type CamposDoPlano = Omit<
  PlanoRow,
  | "id"
  | "company_id"
  | "cliente_id"
  | "data_fim"
  | "status"
  | "criado_por"
  | "atualizado_por"
  | "created_at"
  | "updated_at"
>;

/**
 * A lista branca de gravação.
 *
 * Não é organização, é segurança: a action grava SÓ o que está aqui. Sem
 * ela, o navegador poderia mandar `status: "ativo"` junto com os campos do
 * formulário e ativar um ciclo sem passar pela conferência. A RLS impede
 * escrever na empresa errada; ela não impede escrever na coluna errada —
 * isso é trabalho da aplicação.
 */
export const CAMPOS_EDITAVEIS: readonly (keyof CamposDoPlano)[] = [
  "duracao_meses",
  "data_inicio",
  "foco_estrategico",
  "orcamento_midia_total",
  "qtd_posts_social",
  "qtd_campanhas_trafego",
  "pecas_extras",
  "escopo_observacoes",
  "data_limite_pautas",
  "data_limite_artes",
  "data_go_live",
  "data_reuniao_resultados",
];

/**
 * O "não" do banco quando já existe um ciclo ativo para aquele cliente,
 * traduzido em código.
 *
 * Mora aqui, e não no arquivo de actions, porque um módulo `"use server"` só
 * pode exportar funções async — exportar uma constante de lá derruba o build
 * do Next com "Only async functions are allowed to be exported".
 */
export const JA_EXISTE_ATIVO = "JA_EXISTE_ATIVO";

/** Hoje em UTC, no formato do banco. */
export function hojeISO(): string {
  return new Date().toISOString().slice(0, 10);
}

/**
 * Quantos dias faltam para uma data — em UTC, de propósito.
 *
 * O Cron compara com `current_date`, que é UTC. Se a tela contasse pelo fuso
 * do navegador, a pessoa leria "faltam 5 dias" numa terça à noite e receberia
 * o aviso de 4 dias na manhã seguinte — parecendo erro do sistema. Contando
 * do mesmo jeito, a tela diz exatamente o que o sino vai dizer.
 */
export function diasAte(iso: string): number {
  const partes = iso.split("-");
  const ano = Number(partes[0]);
  const mes = Number(partes[1]);
  const dia = Number(partes[2]);
  if (!Number.isFinite(ano) || !Number.isFinite(mes) || !Number.isFinite(dia)) return 0;

  const agora = new Date();
  const hoje = Date.UTC(agora.getUTCFullYear(), agora.getUTCMonth(), agora.getUTCDate());
  return Math.round((Date.UTC(ano, mes - 1, dia) - hoje) / 86_400_000);
}

/**
 * O fim do ciclo, calculado igual ao banco — para a tela MOSTRAR enquanto a
 * pessoa escolhe a duração.
 *
 * É uma previsão, não a verdade: quem grava `data_fim` é a coluna gerada do
 * Postgres, e é dela que o Cron lê. Esta função existe só para o campo não
 * ficar em branco até salvar.
 *
 * O `Math.min` com o último dia do mês reproduz o "grampeamento" do Postgres:
 * 31/01 + 1 mês = 28/02 (e não 03/03, que é o que o JavaScript faria sozinho
 * ao estourar o mês). Sem isso, a tela mostraria uma data e o banco gravaria
 * outra — o pior tipo de divergência, porque as duas parecem certas.
 */
export function fimDoCiclo(inicioISO: string, meses: number): string {
  const partes = inicioISO.split("-");
  const ano = Number(partes[0]);
  const mes = Number(partes[1]);
  const dia = Number(partes[2]);
  if (!Number.isFinite(ano) || !Number.isFinite(mes) || !Number.isFinite(dia)) return "";

  const alvo = mes - 1 + meses;
  const anoAlvo = ano + Math.floor(alvo / 12);
  const mesAlvo = ((alvo % 12) + 12) % 12;
  const ultimoDia = new Date(Date.UTC(anoAlvo, mesAlvo + 1, 0)).getUTCDate();

  const fim = new Date(Date.UTC(anoAlvo, mesAlvo, Math.min(dia, ultimoDia)));
  fim.setUTCDate(fim.getUTCDate() - 1);
  return fim.toISOString().slice(0, 10);
}

/** 0 a 1 — quanto do ciclo já passou. Serve à barrinha da lista. */
export function progressoDoCiclo(inicioISO: string, fimISO: string): number {
  const total = diasAte(fimISO) - diasAte(inicioISO);
  if (total <= 0) return 1;
  const decorrido = -diasAte(inicioISO);
  return Math.min(1, Math.max(0, decorrido / total));
}

/** O próximo dia em que o sino vai tocar, ou `null` se a régua já passou. */
export function proximoAviso(diasRestantes: number): number | null {
  for (const marco of MARCOS_DE_AVISO) {
    if (marco <= diasRestantes) return marco;
  }
  return null;
}

/** Um ciclo que ainda não venceu e já entrou na zona de aviso. */
export function estaVencendo(diasRestantes: number): boolean {
  return diasRestantes <= MARCOS_DE_AVISO[0] && diasRestantes >= 0;
}
