import "server-only";
import { cache } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * A trilha: quem fez o que, quando, em cada passo do fluxo.
 *
 * Uma linha por passo, numa tabela só para todos os módulos. A pergunta que
 * se faz na prática é "o que aconteceu com este cliente?", e ela atravessa
 * onboarding, planejamento, conteúdo e produção — com histórico espalhado por
 * módulo, responder isso seria juntar quatro consultas e torcer para as datas
 * baterem.
 *
 * DUAS REGRAS que valem para todo uso deste arquivo:
 *
 * 1. REGISTRAR NUNCA DERRUBA A AÇÃO. Todo `registrar` é engolido por um
 *    try/catch. Perder o registro de que a tarefa mudou de status é ruim;
 *    impedir a pessoa de mudar o status porque o registro falhou é pior — e
 *    seria a primeira coisa a acontecer no dia em que essa tabela ficasse
 *    indisponível.
 *
 * 2. O NOME DO ATOR É UM RETRATO. Guardamos `ator_nome` junto com `ator_id`,
 *    e isso não é redundância: funcionário desligado tem o perfil apagado, e
 *    uma trilha que passa a dizer "alguém aprovou" perde a razão de existir.
 */

export type AcaoEvento =
  | "onboarding_salvo"
  | "onboarding_concluido"
  | "onboarding_reaberto"
  | "onboarding_link_enviado"
  | "onboarding_respondido_cliente"
  | "plano_criado"
  | "plano_editado"
  | "plano_ativado"
  | "plano_encerrado"
  | "plano_cancelado"
  | "pauta_criada"
  | "pauta_removida"
  | "pauta_subiu"
  | "pauta_devolvida"
  | "tarefa_criada"
  | "tarefa_status"
  | "tarefa_removida"
  | "versao_enviada"
  | "versao_aprovada"
  | "versao_alteracao_solicitada";

export type EntidadeEvento = "onboarding" | "plano" | "pauta" | "tarefa" | "versao";
export type TipoDeAtor = "equipe" | "cliente" | "sistema";

export interface EventoRow {
  id: string;
  company_id: string;
  acao: AcaoEvento;
  entidade: EntidadeEvento;
  entidade_id: string | null;
  tarefa_id: string | null;
  cliente_id: string | null;
  titulo: string | null;
  de: string | null;
  para: string | null;
  ator_id: string | null;
  ator_nome: string | null;
  ator_tipo: TipoDeAtor;
  detalhe: Record<string, unknown> | null;
  created_at: string;
}

export interface NovoEvento {
  acao: AcaoEvento;
  entidade: EntidadeEvento;
  entidadeId?: string | null;
  /**
   * A que TAREFA o evento pertence.
   *
   * Existe separado de `entidadeId` porque um evento de versao aponta para o
   * id da VERSAO - e sem isto, "tudo o que aconteceu com esta peca" nao teria
   * como ser perguntado numa consulta so.
   */
  tarefaId?: string | null;
  clienteId?: string | null;
  titulo?: string | null;
  de?: string | null;
  para?: string | null;
  detalhe?: Record<string, unknown> | null;
}

/* eslint-disable @typescript-eslint/no-explicit-any */
type Cliente = SupabaseClient<any, any, any>;

/**
 * O nome de quem está logado, memorizado por REQUISIÇÃO (`cache` do React).
 *
 * Uma ação que registra três eventos não deve fazer três consultas ao mesmo
 * perfil. Memorizar em escopo de módulo seria mais barato ainda e estaria
 * errado: o processo do servidor atende várias pessoas, e o nome ficaria
 * preso ao primeiro que passou.
 */
const nomeDoAtor = cache(async (supabase: Cliente, userId: string): Promise<string | null> => {
  const { data } = await supabase
    .from("profiles")
    .select("full_name, email")
    .eq("id", userId)
    .maybeSingle<{ full_name: string | null; email: string }>();
  return data?.full_name?.trim() || data?.email || null;
});

/**
 * Registra um passo feito por alguém da EQUIPE, com a sessão de quem fez.
 *
 * `company_id` sai do default da tabela (`current_company_id()`), que resolve
 * a partir do próprio login — não há como carimbar o evento na empresa errada.
 */
export async function registrar(supabase: Cliente, userId: string, evento: NovoEvento): Promise<void> {
  try {
    const nome = await nomeDoAtor(supabase, userId);
    await supabase.from("eventos").insert({
      acao: evento.acao,
      entidade: evento.entidade,
      entidade_id: evento.entidadeId ?? null,
      tarefa_id: evento.tarefaId ?? null,
      cliente_id: evento.clienteId ?? null,
      titulo: evento.titulo ?? null,
      de: evento.de ?? null,
      para: evento.para ?? null,
      ator_id: userId,
      ator_nome: nome,
      ator_tipo: "equipe",
      detalhe: evento.detalhe ?? null,
    });
  } catch {
    // Silêncio proposital — ver a regra 1 no topo do arquivo.
  }
}

/**
 * Registra um passo feito de FORA: o cliente respondendo um briefing por link,
 * aprovando uma versão no portal.
 *
 * Aqui não existe `auth.uid()` nem sessão, então três coisas mudam: quem
 * escreve é o Service Role (que ignora a RLS), o `company_id` precisa ser
 * passado à mão (o default devolveria nulo e a inserção quebraria), e o nome
 * do ator é o que a pessoa digitou ou o nome do cliente no cadastro — não há
 * perfil para consultar.
 */
export async function registrarDoCliente(
  admin: Cliente,
  companyId: string,
  nomeDoCliente: string | null,
  evento: NovoEvento
): Promise<void> {
  try {
    await admin.from("eventos").insert({
      company_id: companyId,
      acao: evento.acao,
      entidade: evento.entidade,
      entidade_id: evento.entidadeId ?? null,
      tarefa_id: evento.tarefaId ?? null,
      cliente_id: evento.clienteId ?? null,
      titulo: evento.titulo ?? null,
      de: evento.de ?? null,
      para: evento.para ?? null,
      ator_id: null,
      ator_nome: nomeDoCliente,
      ator_tipo: "cliente",
      detalhe: evento.detalhe ?? null,
    });
  } catch {
    // Silêncio proposital — ver a regra 1 no topo do arquivo.
  }
}
