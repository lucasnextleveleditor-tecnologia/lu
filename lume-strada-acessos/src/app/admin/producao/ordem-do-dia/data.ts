import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { CronogramaRow, EquipeOrdemRow, LocacaoRow, OrdemDoDiaCompleta, OrdemDoDiaRow } from "@/lib/types/ordem-do-dia";

/**
 * Todas as ordens do dia da empresa, mais recentes primeiro. O RLS já limita
 * à própria empresa, então não há filtro por `company_id` aqui.
 */
export async function listarOrdensDoDia(): Promise<(OrdemDoDiaRow & { cliente_nome: string | null })[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("ordens_do_dia")
    .select("*, clientes(nome)")
    .order("data", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false });

  return (data ?? []).map((linha) => {
    const { clientes, ...ordem } = linha as OrdemDoDiaRow & { clientes: { nome: string } | null };
    return { ...ordem, cliente_nome: clientes?.nome ?? null };
  });
}

/** Uma folha inteira. `null` quando o id não existe ou é de outra empresa (o RLS resolve as duas). */
export async function buscarOrdemDoDia(id: string): Promise<OrdemDoDiaCompleta | null> {
  const supabase = await createClient();

  const { data: ordem } = await supabase
    .from("ordens_do_dia")
    .select("*, clientes(nome)")
    .eq("id", id)
    .maybeSingle<OrdemDoDiaRow & { clientes: { nome: string } | null }>();

  if (!ordem) return null;

  // As três listas são independentes entre si — buscar em paralelo em vez de
  // uma depois da outra corta o tempo de abertura da folha pela metade.
  const [locacoesRes, cronogramaRes, equipeRes] = await Promise.all([
    supabase.from("ordem_dia_locacoes").select("*").eq("ordem_id", id).order("ordem"),
    supabase.from("ordem_dia_cronograma").select("*").eq("ordem_id", id).order("ordem"),
    supabase.from("ordem_dia_equipe").select("*").eq("ordem_id", id).order("ordem"),
  ]);

  const { clientes, ...semRelacao } = ordem;

  return {
    ordem: semRelacao as OrdemDoDiaRow,
    locacoes: (locacoesRes.data ?? []) as LocacaoRow[],
    cronograma: (cronogramaRes.data ?? []) as CronogramaRow[],
    equipe: (equipeRes.data ?? []) as EquipeOrdemRow[],
    clienteNome: clientes?.nome ?? null,
  };
}

/** Cadastros usados pelos seletores do editor: clientes, equipe da casa e captações agendadas. */
export async function opcoesDoEditor() {
  const supabase = await createClient();
  const [clientesRes, equipeRes, tarefasRes] = await Promise.all([
    supabase.from("clientes").select("id, nome").order("nome"),
    supabase.from("equipe_membros").select("id, nome, cargo, telefone").order("nome"),
    supabase
      .from("prod_tarefas")
      .select("id, titulo, cliente_id, data_captacao")
      .not("data_captacao", "is", null)
      .order("data_captacao", { ascending: false })
      .limit(50),
  ]);

  return {
    clientes: (clientesRes.data ?? []) as { id: string; nome: string }[],
    equipe: (equipeRes.data ?? []) as { id: string; nome: string; cargo: string | null; telefone: string | null }[],
    captacoes: (tarefasRes.data ?? []) as { id: string; titulo: string; cliente_id: string | null; data_captacao: string | null }[],
  };
}
