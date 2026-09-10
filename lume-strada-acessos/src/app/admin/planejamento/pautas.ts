"use server";

import { revalidatePath } from "next/cache";
import { requireModulo } from "@/lib/auth/requireAdmin";
import type { CanalDoPost, FormatoDoPost, TarefaRow } from "@/lib/types/producao";

/**
 * O calendário de conteúdo — os posts de um ciclo, antes de virarem trabalho.
 *
 * Um post AQUI e uma tarefa em Produção são A MESMA LINHA de
 * `prod_tarefas`, só que marcada com `em_pauta = true`. A alternativa era uma
 * tabela de posts própria e um botão que copiasse os dados para a produção —
 * e copiar significa duas linhas com título, cliente, data e briefing iguais,
 * que divergem no primeiro dia em que alguém corrigir a data de um lado só.
 *
 * O efeito prático: "subir para produção" não move nada. Ele só tira a marca
 * e escolhe o responsável — e a mesma linha aparece no Kanban, no calendário
 * de Produção e no "Por funcionário", com o briefing e as referências já nos
 * campos certos, porque nunca saíram de lá.
 *
 * A permissão é a de CLIENTES (quem monta o plano monta a pauta), e não a de
 * produção: a social media que escreve as ideias não precisa ter acesso ao
 * quadro de produção para escrevê-las.
 */

export type ResultadoPauta = { ok: true; row: TarefaRow } | { ok: false; error: string };
export type ResultadoSimples = { ok: true } | { ok: false; error: string };

export interface CamposDaPauta {
  titulo: string;
  data_entrega: string | null;
  post_canal: CanalDoPost | null;
  post_formato: FormatoDoPost | null;
  briefing: string | null;
  referencias_estilo: string | null;
}

const PATHS = ["/admin", "/admin/planejamento", "/admin/producao"];
const revalidar = () => PATHS.forEach((p) => revalidatePath(p));

function mensagem(err: unknown): string {
  return err instanceof Error ? err.message : "Erro desconhecido.";
}

/**
 * Cria um post do ciclo.
 *
 * O cliente NÃO vem da tela: vem do plano. Deixar a tela mandar o cliente
 * abriria a porta para um post de um ciclo aparecer preso a outro cliente —
 * e o cliente é o que decide quem vê a peça no portal.
 *
 * As duas colunas de vínculo (`cliente_cadastro_id` e `cliente_id`) seguem o
 * mesmo desenho de `resolverVinculoCliente` em produção: a primeira é o
 * vínculo de verdade, a segunda só existe quando aquele cliente tem login, e
 * é a que o portal dele usa.
 */
export async function criarPauta(
  planoId: string,
  campos: Partial<CamposDaPauta>
): Promise<ResultadoPauta> {
  try {
    const { supabase } = await requireModulo("clientes");
    const titulo = (campos.titulo ?? "").trim();
    if (!titulo) return { ok: false, error: "SEM_TITULO" };

    const { data: plano, error: erroPlano } = await supabase
      .from("planos_estrategicos")
      .select("id, cliente_id")
      .eq("id", planoId)
      .maybeSingle<{ id: string; cliente_id: string }>();
    if (erroPlano) return { ok: false, error: erroPlano.message };
    if (!plano) return { ok: false, error: "PLANO_NAO_ENCONTRADO" };

    const { data: cliente } = await supabase
      .from("clientes")
      .select("profile_id")
      .eq("id", plano.cliente_id)
      .maybeSingle<{ profile_id: string | null }>();

    const { data, error } = await supabase
      .from("prod_tarefas")
      .insert({
        titulo,
        plano_id: plano.id,
        // A marca. Enquanto ela existir, esta linha não aparece em Produção,
        // nem no painel, nem na agenda, nem no portal do cliente.
        em_pauta: true,
        // Nasce em `backlog` porque é onde ela vai estar quando subir: subir
        // para produção mexe no status, não no lugar da fila.
        status: "backlog",
        cliente_cadastro_id: plano.cliente_id,
        cliente_id: cliente?.profile_id ?? null,
        data_entrega: campos.data_entrega || null,
        post_canal: campos.post_canal ?? null,
        post_formato: campos.post_formato ?? null,
        briefing: campos.briefing?.trim() || null,
        referencias_estilo: campos.referencias_estilo?.trim() || null,
      })
      .select("*")
      .single<TarefaRow>();

    if (error) return { ok: false, error: error.message };
    revalidar();
    return { ok: true, row: data };
  } catch (err) {
    return { ok: false, error: mensagem(err) };
  }
}

/**
 * Salva um post.
 *
 * O `.eq("em_pauta", true)` no fim não é enfeite: é o que garante que esta
 * action só mexe em pauta. Sem ele, o id de uma tarefa que já está em
 * produção — com responsável, entregas e aprovação do cliente — poderia ser
 * reescrito por esta tela, que não tem nenhuma das travas de lá.
 */
export async function salvarPauta(
  id: string,
  campos: Partial<CamposDaPauta>
): Promise<ResultadoPauta> {
  try {
    const { supabase } = await requireModulo("clientes");

    const payload: Record<string, unknown> = {};
    if (campos.titulo !== undefined) {
      const titulo = campos.titulo.trim();
      if (!titulo) return { ok: false, error: "SEM_TITULO" };
      payload.titulo = titulo;
    }
    if (campos.data_entrega !== undefined) payload.data_entrega = campos.data_entrega || null;
    if (campos.post_canal !== undefined) payload.post_canal = campos.post_canal ?? null;
    if (campos.post_formato !== undefined) payload.post_formato = campos.post_formato ?? null;
    if (campos.briefing !== undefined) payload.briefing = campos.briefing?.trim() || null;
    if (campos.referencias_estilo !== undefined) {
      payload.referencias_estilo = campos.referencias_estilo?.trim() || null;
    }

    const { data, error } = await supabase
      .from("prod_tarefas")
      .update(payload)
      .eq("id", id)
      .eq("em_pauta", true)
      .select("*")
      .single<TarefaRow>();

    if (error) return { ok: false, error: error.message };
    revalidar();
    return { ok: true, row: data };
  } catch (err) {
    return { ok: false, error: mensagem(err) };
  }
}

/** Apaga um post. Só enquanto for pauta — depois de subir, quem apaga é a Produção. */
export async function removerPauta(id: string): Promise<ResultadoSimples> {
  try {
    const { supabase } = await requireModulo("clientes");
    const { error } = await supabase.from("prod_tarefas").delete().eq("id", id).eq("em_pauta", true);
    if (error) return { ok: false, error: error.message };
    revalidar();
    return { ok: true };
  } catch (err) {
    return { ok: false, error: mensagem(err) };
  }
}

/**
 * Solta os posts para a produção.
 *
 * É o botão inteiro do módulo, e ele faz três coisas numa linha: tira a
 * marca, põe a tarefa em "A Fazer" e escreve o responsável. Nenhum dado é
 * copiado, porque nunca houve cópia — o briefing que a social media escreveu
 * já está em `briefing`, as referências em `referencias_estilo`, o cliente e a
 * data nos campos de sempre.
 *
 * `backlog` não serve como destino aqui: a coluna de backlog em Produção é
 * "coisa que existe mas ninguém pegou", e um post com responsável e data já
 * é trabalho combinado. Por isso `a_fazer`.
 *
 * O responsável é opcional de propósito. Nem sempre se sabe quem vai editar
 * na hora de soltar o mês inteiro, e travar o botão nisso faria a pessoa
 * escolher qualquer um só para destravar — o que é pior do que ninguém.
 */
export async function subirParaProducao(
  ids: string[],
  responsavelId: string | null
): Promise<{ ok: true; quantos: number } | { ok: false; error: string }> {
  try {
    const { supabase } = await requireModulo("clientes");
    const limpos = ids.filter(Boolean);
    if (limpos.length === 0) return { ok: false, error: "NENHUM_SELECIONADO" };

    const payload: Record<string, unknown> = { em_pauta: false, status: "a_fazer" };
    if (responsavelId) payload.responsavel_id = responsavelId;

    const { data, error } = await supabase
      .from("prod_tarefas")
      .update(payload)
      .in("id", limpos)
      .eq("em_pauta", true)
      .select("id");

    if (error) return { ok: false, error: error.message };
    revalidar();
    return { ok: true, quantos: (data ?? []).length };
  } catch (err) {
    return { ok: false, error: mensagem(err) };
  }
}

/**
 * Devolve um post para a pauta.
 *
 * Existe porque subir o mês inteiro de uma vez é um clique, e um clique se
 * erra. Só volta o que ainda não começou (`a_fazer` ou `backlog`) — uma peça
 * que já está em produção ou em preview com o cliente não pode virar ideia de
 * novo por um botão numa tela de planejamento.
 */
export async function devolverParaPauta(id: string): Promise<ResultadoSimples> {
  try {
    const { supabase } = await requireModulo("clientes");
    const { error } = await supabase
      .from("prod_tarefas")
      .update({ em_pauta: true, status: "backlog" })
      .eq("id", id)
      .eq("em_pauta", false)
      .in("status", ["a_fazer", "backlog"]);
    if (error) return { ok: false, error: error.message };
    revalidar();
    return { ok: true };
  } catch (err) {
    return { ok: false, error: mensagem(err) };
  }
}
