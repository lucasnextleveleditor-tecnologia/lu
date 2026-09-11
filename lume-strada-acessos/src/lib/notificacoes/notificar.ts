import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { destinatariosDasMencoes, textoDeHtml, type MembroMencionavel } from "@/lib/notificacoes/mencoes";

/**
 * O lado servidor do sino.
 *
 * Vale aqui a MESMA regra da trilha de eventos (`lib/eventos/registrar.ts`):
 * notificar nunca derruba a ação. Perder um aviso é ruim; impedir alguém de
 * salvar a tarefa porque o aviso falhou é pior, e seria a primeira coisa a
 * acontecer no dia em que `notifications` ficasse indisponível. Todo caminho
 * daqui termina em try/catch que engole.
 *
 * A escrita vai por RPC (`criar_notificacoes`, `security definer`) e não por
 * `insert`: notificar é escrever na linha de outra pessoa, e as policies de
 * `notifications` — corretamente — só deixam cada um mexer na própria. A
 * função no banco é a única porta, e ela impõe empresa, papel e tipo.
 */

export type TipoNotificavel = "task_assignment" | "mention";

interface Destino {
  userIds: string[];
  tipo: TipoNotificavel;
  /** O QUÊ — normalmente o título da tarefa. Nunca uma frase pronta. */
  titulo: string;
  /** Complemento curto, opcional. Também sem frase pronta. */
  mensagem?: string | null;
  href?: string | null;
  referenceId?: string | null;
  referenceType?: string | null;
}

/**
 * Título e mensagem guardam DADO, não frase.
 *
 * A notificação nasce quando alguém salva, e quem vai lê-la pode estar com a
 * interface em outro idioma — o sino de um editor em espanhol não pode dizer
 * "te mencionou" em português só porque quem escreveu estava em português.
 * Por isso o texto fixo ("Tarefa", "Menção") vem do dicionário na hora de
 * desenhar a linha, a partir de `tipo`, e o que viaja no banco é só o nome
 * da tarefa e o de quem agiu.
 */
export async function notificar(supabase: SupabaseClient, destino: Destino): Promise<void> {
  try {
    const ids = Array.from(new Set(destino.userIds.filter(Boolean)));
    if (ids.length === 0) return;

    await supabase.rpc("criar_notificacoes", {
      p_user_ids: ids,
      p_tipo: destino.tipo,
      p_titulo: destino.titulo,
      p_mensagem: destino.mensagem ?? null,
      p_href: destino.href ?? null,
      p_reference_id: destino.referenceId ?? null,
      p_reference_type: destino.referenceType ?? null,
    });
  } catch {
    // Silêncio proposital — ver o cabeçalho do arquivo.
  }
}

/** A equipe que pode ser mencionada: nome para casar com o `@`, `profile_id` para receber. */
export async function equipeMencionavel(supabase: SupabaseClient): Promise<MembroMencionavel[]> {
  try {
    const { data } = await supabase.from("equipe_membros").select("nome, cargo, profile_id").order("nome");
    return ((data ?? []) as { nome: string; cargo: string | null; profile_id: string | null }[]).map((m) => ({
      nome: m.nome,
      cargo: m.cargo,
      profileId: m.profile_id,
    }));
  } catch {
    return [];
  }
}

/**
 * De quem é a conta por trás de um "responsável" de Produção.
 *
 * São três tabelas porque são três papéis diferentes da mesma pessoa:
 * `prod_funcionarios` é quem aparece no seletor de responsável,
 * `equipe_membros` é o cadastro de gente da empresa, e `profiles` é a conta
 * de acesso. Nem todo funcionário tem cadastro, nem todo cadastro tem conta
 * — um freelancer pode aparecer no Kanban sem nunca ter entrado no sistema.
 * Por isso o retorno é anulável e ninguém aqui trata isso como erro.
 */
export async function profileDoResponsavel(
  supabase: SupabaseClient,
  funcionarioId: string | null | undefined
): Promise<string | null> {
  if (!funcionarioId) return null;
  try {
    const { data } = await supabase
      .from("prod_funcionarios")
      .select("equipe_membros:equipe_membro_id (profile_id)")
      .eq("id", funcionarioId)
      .maybeSingle<{ equipe_membros: { profile_id: string | null } | null }>();
    return data?.equipe_membros?.profile_id ?? null;
  } catch {
    return null;
  }
}

/**
 * Quem foi mencionado nos textos de uma tarefa.
 *
 * Recebe os campos crus — o briefing vem como HTML e os outros como texto — e
 * o HTML é achatado antes da busca, senão um `@ana` partido por uma tag
 * (`@<b>ana</b>`) passaria despercebido.
 */
export async function mencionadosEm(
  supabase: SupabaseClient,
  textos: { texto?: string | null; html?: string | null }[]
): Promise<string[]> {
  try {
    const equipe = await equipeMencionavel(supabase);
    if (equipe.length === 0) return [];
    const planos = textos.map((t) => (t.html !== undefined ? textoDeHtml(t.html) : (t.texto ?? "")));
    return destinatariosDasMencoes(planos, equipe).map((m) => m.profileId!).filter(Boolean);
  } catch {
    return [];
  }
}

/** O endereço que abre a tarefa direto — é ele que o sino usa no clique. */
export function linkDaTarefa(tarefaId: string): string {
  return `/admin/producao?tarefa=${tarefaId}`;
}
