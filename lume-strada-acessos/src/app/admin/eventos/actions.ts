"use server";

import { revalidatePath } from "next/cache";
import { requireModulo } from "@/lib/auth/requireAdmin";
import type { StatusEvento } from "@/lib/types/eventos";

/**
 * As ações do módulo de Eventos.
 *
 * `requireModulo("producao")` e não uma chave nova: um evento é produção de
 * campo, e quem opera produção é exatamente quem opera evento. Criar uma
 * permissão "eventos" separada obrigaria o dono da agência a ligar mais uma
 * caixinha para cada pessoa da equipe que já pode mexer em tarefa — e a
 * primeira reclamação seria "por que meu editor não vê o evento?".
 *
 * Erros que a pessoa vai ler saem como CÓDIGO, traduzidos no dicionário.
 */

const PATH = "/admin/eventos";
const revalidar = () => revalidatePath(PATH);

export type ResultadoEvento = { ok: true } | { ok: false; error: string };
export type ResultadoEventoId = { ok: true; id: string } | { ok: false; error: string };

function mensagem(err: unknown): string {
  return err instanceof Error ? err.message : "Erro desconhecido.";
}

export interface EventoInput {
  nome: string;
  clienteId: string | null;
  local: string | null;
  /** ISO com fuso. A tela monta a partir da data + hora escolhidas. */
  inicio: string;
  fim: string;
  observacoes: string | null;
}

/**
 * Cria o evento e, junto, os ambientes iniciais.
 *
 * Os dois no mesmo passo de propósito: um evento sem nenhum ambiente não
 * desenha grade nenhuma, e a tela seguinte seria uma tela vazia pedindo para
 * a pessoa cadastrar algo antes de poder fazer qualquer coisa. Quem está
 * criando um evento já sabe quantos palcos vai ter.
 */
export async function criarEvento(input: EventoInput, ambientes: string[]): Promise<ResultadoEventoId> {
  try {
    const { supabase } = await requireModulo("producao");

    const nome = input.nome.trim();
    if (!nome) return { ok: false, error: "EVENTO_SEM_NOME" };
    if (!input.inicio || !input.fim) return { ok: false, error: "EVENTO_SEM_DATA" };
    if (input.fim <= input.inicio) return { ok: false, error: "EVENTO_FIM_ANTES" };

    const { data, error } = await supabase
      .from("ev_eventos")
      .insert({
        nome,
        cliente_id: input.clienteId || null,
        local: input.local?.trim() || null,
        inicio: input.inicio,
        fim: input.fim,
        observacoes: input.observacoes?.trim() || null,
      })
      .select("id")
      .single<{ id: string }>();

    if (error || !data) return { ok: false, error: error?.message ?? "Erro desconhecido." };

    const limpos = ambientes.map((a) => a.trim()).filter(Boolean).slice(0, 20);
    if (limpos.length > 0) {
      const { error: erroAmbientes } = await supabase
        .from("ev_ambientes")
        .insert(limpos.map((nome, i) => ({ evento_id: data.id, nome, ordem: i })));
      // Falhar aqui não desfaz o evento: ele existe, e ambiente se acrescenta
      // depois numa tela que já vai existir. Derrubar o evento inteiro porque
      // um palco não entrou seria pior.
      if (erroAmbientes) {
        revalidar();
        return { ok: true, id: data.id };
      }
    }

    revalidar();
    return { ok: true, id: data.id };
  } catch (err) {
    return { ok: false, error: mensagem(err) };
  }
}

export async function atualizarEvento(id: string, input: EventoInput): Promise<ResultadoEvento> {
  try {
    const { supabase } = await requireModulo("producao");

    const nome = input.nome.trim();
    if (!nome) return { ok: false, error: "EVENTO_SEM_NOME" };
    if (!input.inicio || !input.fim) return { ok: false, error: "EVENTO_SEM_DATA" };
    if (input.fim <= input.inicio) return { ok: false, error: "EVENTO_FIM_ANTES" };

    const { error } = await supabase
      .from("ev_eventos")
      .update({
        nome,
        cliente_id: input.clienteId || null,
        local: input.local?.trim() || null,
        inicio: input.inicio,
        fim: input.fim,
        observacoes: input.observacoes?.trim() || null,
      })
      .eq("id", id);

    if (error) return { ok: false, error: error.message };
    revalidar();
    return { ok: true };
  } catch (err) {
    return { ok: false, error: mensagem(err) };
  }
}

/**
 * Troca a fase da operação.
 *
 * Sem máquina de estados amarrada: dá para voltar de `ao_vivo` para `montagem`
 * se alguém adiantou o botão. Num evento as coisas acontecem fora de ordem, e
 * um sistema que impede a correção vira um sistema que as pessoas contornam.
 */
export async function mudarStatusEvento(id: string, status: StatusEvento): Promise<ResultadoEvento> {
  try {
    const { supabase } = await requireModulo("producao");
    const { error } = await supabase.from("ev_eventos").update({ status }).eq("id", id);
    if (error) return { ok: false, error: error.message };
    revalidar();
    return { ok: true };
  } catch (err) {
    return { ok: false, error: mensagem(err) };
  }
}

/** Apaga o evento inteiro — ambientes, programação, equipe e pauta vão junto (`on delete cascade`). */
export async function removerEvento(id: string): Promise<ResultadoEvento> {
  try {
    const { supabase } = await requireModulo("producao");
    const { error } = await supabase.from("ev_eventos").delete().eq("id", id);
    if (error) return { ok: false, error: error.message };
    revalidar();
    return { ok: true };
  } catch (err) {
    return { ok: false, error: mensagem(err) };
  }
}

// ----------------------------------------------------------------------------
// Ambientes
// ----------------------------------------------------------------------------

export async function criarAmbiente(eventoId: string, nome: string): Promise<ResultadoEvento> {
  try {
    const { supabase } = await requireModulo("producao");
    const limpo = nome.trim();
    if (!limpo) return { ok: false, error: "AMBIENTE_SEM_NOME" };

    const { data } = await supabase
      .from("ev_ambientes")
      .select("ordem")
      .eq("evento_id", eventoId)
      .order("ordem", { ascending: false })
      .limit(1)
      .maybeSingle<{ ordem: number }>();

    const { error } = await supabase
      .from("ev_ambientes")
      .insert({ evento_id: eventoId, nome: limpo, ordem: (data?.ordem ?? -1) + 1 });

    if (error) return { ok: false, error: error.message };
    revalidar();
    return { ok: true };
  } catch (err) {
    return { ok: false, error: mensagem(err) };
  }
}

export async function renomearAmbiente(id: string, nome: string): Promise<ResultadoEvento> {
  try {
    const { supabase } = await requireModulo("producao");
    const limpo = nome.trim();
    if (!limpo) return { ok: false, error: "AMBIENTE_SEM_NOME" };
    const { error } = await supabase.from("ev_ambientes").update({ nome: limpo }).eq("id", id);
    if (error) return { ok: false, error: error.message };
    revalidar();
    return { ok: true };
  } catch (err) {
    return { ok: false, error: mensagem(err) };
  }
}

/**
 * Apaga o ambiente. A programação dele vai junto (`cascade`), mas os itens da
 * pauta NÃO — eles perdem a âncora (`on delete set null`) e continuam na
 * lista. Sumir com "foto do patrocinador" porque alguém apagou o palco seria
 * exatamente o tipo de perda silenciosa que este módulo existe para evitar.
 */
export async function removerAmbiente(id: string): Promise<ResultadoEvento> {
  try {
    const { supabase } = await requireModulo("producao");
    const { error } = await supabase.from("ev_ambientes").delete().eq("id", id);
    if (error) return { ok: false, error: error.message };
    revalidar();
    return { ok: true };
  } catch (err) {
    return { ok: false, error: mensagem(err) };
  }
}
