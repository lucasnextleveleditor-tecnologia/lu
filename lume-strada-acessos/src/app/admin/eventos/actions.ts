"use server";

import { revalidatePath } from "next/cache";
import { requireModulo } from "@/lib/auth/requireAdmin";
import type { StatusEvento } from "@/lib/types/eventos";
import { fusoValido } from "@/lib/utils/fusos";

/**
 * As ações do módulo de Eventos.
 *
 * `requireModulo("eventos")`: o módulo tem permissão própria, ligada por
 * funcionário no painel de "Módulos Liberados". Nem todo mundo que mexe em
 * tarefa vai a evento — o editor que fica na ilha não precisa ver a operação
 * de campo, e o freelancer de sábado não precisa ver o board da semana.
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
  /** Fuso IANA do LOCAL do evento. Muda só como as horas sao escritas. */
  fuso: string;
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
/**
 * `baseId` = o evento (ou modelo) de onde este nasce.
 *
 * Quando ele vem, os ambientes digitados são ignorados e a estrutura inteira é
 * copiada da origem — ambientes E programação —, com todos os horários
 * deslocados pela diferença entre o começo novo e o antigo. É o que faz um
 * festival mensal levar três minutos em vez de uma tarde.
 *
 * O que NÃO é copiado: pauta marcada, equipe, ponto, kit e ocorrências. Aquilo
 * aconteceu num sábado específico. O que se repete é a forma.
 */
export async function criarEvento(input: EventoInput, ambientes: string[], baseId?: string | null): Promise<ResultadoEventoId> {
  try {
    const { supabase } = await requireModulo("eventos");

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
        fuso: fusoValido(input.fuso),
        observacoes: input.observacoes?.trim() || null,
      })
      .select("id")
      .single<{ id: string }>();

    if (error || !data) return { ok: false, error: error?.message ?? "Erro desconhecido." };

    if (baseId) {
      await copiarEstrutura(supabase, baseId, data.id, input.inicio);
      revalidar();
      return { ok: true, id: data.id };
    }

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
    const { supabase } = await requireModulo("eventos");

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
        fuso: fusoValido(input.fuso),
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
    const { supabase } = await requireModulo("eventos");
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
    const { supabase } = await requireModulo("eventos");
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
    const { supabase } = await requireModulo("eventos");
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
    const { supabase } = await requireModulo("eventos");
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
    const { supabase } = await requireModulo("eventos");
    const { error } = await supabase.from("ev_ambientes").delete().eq("id", id);
    if (error) return { ok: false, error: error.message };
    revalidar();
    return { ok: true };
  } catch (err) {
    return { ok: false, error: mensagem(err) };
  }
}


/**
 * Copia ambientes e programação de um evento para outro, deslocando o relógio.
 *
 * Falhar aqui NÃO desfaz o evento: ele existe, e a pessoa consegue montar a
 * grade na mão. Derrubar o evento inteiro porque a cópia de uma estrutura não
 * entrou trocaria um problema pequeno por um grande — a mesma regra dos
 * ambientes logo acima.
 */
async function copiarEstrutura(
  supabase: Awaited<ReturnType<typeof requireModulo>>["supabase"],
  baseId: string,
  novoId: string,
  novoInicio: string
): Promise<void> {
  try {
    const { data: base } = await supabase
      .from("ev_eventos")
      .select("inicio")
      .eq("id", baseId)
      .maybeSingle<{ inicio: string }>();
    if (!base) return;

    const delta = new Date(novoInicio).getTime() - new Date(base.inicio).getTime();
    const mover = (iso: string) => new Date(new Date(iso).getTime() + delta).toISOString();

    const { data: ambientes } = await supabase
      .from("ev_ambientes")
      .select("id, nome, cor, ordem, modo_padrao")
      .eq("evento_id", baseId)
      .order("ordem")
      .overrideTypes<{ id: string; nome: string; cor: string | null; ordem: number; modo_padrao: string }[], { merge: false }>();

    const dePara = new Map<string, string>();
    for (const a of ambientes ?? []) {
      const { data: novo } = await supabase
        .from("ev_ambientes")
        .insert({ evento_id: novoId, nome: a.nome, cor: a.cor, ordem: a.ordem, modo_padrao: a.modo_padrao })
        .select("id")
        .single<{ id: string }>();
      if (novo) dePara.set(a.id, novo.id);
    }

    const { data: blocos } = await supabase
      .from("ev_blocos")
      .select("ambiente_id, titulo, tipo, ancora, inicio, fim, duracao_min, ordem")
      .eq("evento_id", baseId)
      .overrideTypes<
        {
          ambiente_id: string | null;
          titulo: string;
          tipo: string;
          ancora: string;
          inicio: string;
          fim: string | null;
          duracao_min: number | null;
          ordem: number;
        }[],
        { merge: false }
      >();

    if (blocos?.length) {
      await supabase.from("ev_blocos").insert(
        blocos.map((b) => ({
          evento_id: novoId,
          ambiente_id: b.ambiente_id ? (dePara.get(b.ambiente_id) ?? null) : null,
          titulo: b.titulo,
          tipo: b.tipo,
          ancora: b.ancora,
          inicio: mover(b.inicio),
          fim: b.fim ? mover(b.fim) : null,
          duracao_min: b.duracao_min,
          ordem: b.ordem,
        }))
      );
    }
  } catch {
    // Ver o comentário acima.
  }
}
