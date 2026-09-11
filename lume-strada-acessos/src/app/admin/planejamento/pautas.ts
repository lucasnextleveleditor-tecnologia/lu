"use server";

import { revalidatePath } from "next/cache";
import { requireModulo } from "@/lib/auth/requireAdmin";
import { registrar } from "@/lib/eventos/registrar";
import type { CanalDoPost, FormatoDoPost, TarefaRow, TipoDePauta } from "@/lib/types/producao";

/**
 * O calendário de conteúdo — os posts de um ciclo, antes de virarem trabalho.
 *
 * Um post AQUI e uma tarefa em Produção são A MESMA LINHA de
 * `prod_tarefas`, só que marcada com `em_pauta = true`. A alternativa era uma
 * tabela de posts própria e um botão que copiasse os dados para a produção —
 * e copiar significa duas linhas com título, cliente, data e briefing iguais,
 * que divergem no primeiro dia em que alguém corrigir a data de um lado só.
 *
 * O efeito prático: "subir para produção" não move nada. Ele tira a marca,
 * escolhe o responsável e completa com a RECEITA do formato o que ficou em
 * branco — e a mesma linha aparece no Kanban, com o briefing e as referências
 * já nos campos certos, porque nunca saíram de lá.
 *
 * A permissão é a de CLIENTES (quem monta o plano monta a pauta), e não a de
 * produção: a social media que escreve as ideias não precisa ter acesso ao
 * quadro de produção para escrevê-las.
 */

export type ResultadoPauta = { ok: true; row: TarefaRow } | { ok: false; error: string };
export type ResultadoSimples = { ok: true } | { ok: false; error: string };

export interface CamposDaPauta {
  titulo: string;
  tipo_pauta: TipoDePauta;
  data_entrega: string | null;
  post_canal: CanalDoPost | null;
  post_formato: FormatoDoPost | null;
  tipo_servico_id: string | null;
  formatos_exportacao: string | null;
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
 */
export async function criarPauta(
  planoId: string,
  campos: Partial<CamposDaPauta>
): Promise<ResultadoPauta> {
  try {
    const { supabase, user } = await requireModulo("clientes");
    const titulo = (campos.titulo ?? "").trim();
    if (!titulo) return { ok: false, error: "SEM_TITULO" };

    const { data: plano, error: erroPlano } = await supabase
      .from("planos_estrategicos")
      .select("id, cliente_id")
      .eq("id", planoId)
      .maybeSingle<{ id: string; cliente_id: string }>();
    if (erroPlano) return { ok: false, error: erroPlano.message };
    if (!plano) return { ok: false, error: "PLANO_NAO_ENCONTRADO" };

    // As duas colunas de vínculo seguem o desenho de `resolverVinculoCliente`
    // em produção: `cliente_cadastro_id` é o vínculo de verdade, `cliente_id`
    // só existe quando aquele cliente tem login — e é a que o portal dele usa.
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
        status: "backlog",
        cliente_cadastro_id: plano.cliente_id,
        cliente_id: cliente?.profile_id ?? null,
        tipo_pauta: campos.tipo_pauta ?? "post",
        data_entrega: campos.data_entrega || null,
        post_canal: campos.post_canal ?? null,
        post_formato: campos.post_formato ?? null,
      })
      .select("*")
      .single<TarefaRow>();

    if (error) return { ok: false, error: error.message };

    await registrar(supabase, user.id, {
      acao: "pauta_criada",
      entidade: "pauta",
      entidadeId: data.id,
      // A pauta E a tarefa (uma linha de prod_tarefas com em_pauta), então a
      // trilha da peça começa aqui — antes de ela virar trabalho de alguém.
      tarefaId: data.id,
      clienteId: plano.cliente_id,
      titulo,
      detalhe: { tipo: campos.tipo_pauta ?? "post", dia: campos.data_entrega ?? null },
    });

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
    if (campos.tipo_pauta !== undefined) payload.tipo_pauta = campos.tipo_pauta;
    if (campos.data_entrega !== undefined) payload.data_entrega = campos.data_entrega || null;
    if (campos.post_canal !== undefined) payload.post_canal = campos.post_canal ?? null;
    if (campos.post_formato !== undefined) payload.post_formato = campos.post_formato ?? null;
    if (campos.tipo_servico_id !== undefined) payload.tipo_servico_id = campos.tipo_servico_id || null;
    if (campos.formatos_exportacao !== undefined) {
      payload.formatos_exportacao = campos.formatos_exportacao?.trim() || null;
    }
    if (campos.briefing !== undefined) payload.briefing = campos.briefing?.trim() || null;
    if (campos.referencias_estilo !== undefined) {
      // Mesma limpeza de produção: o campo de UI manda uma linha por input,
      // inclusive os que ninguém preencheu, para os campos não pularem de
      // posição enquanto se digita.
      const linhas = (campos.referencias_estilo ?? "")
        .split("\n")
        .map((l) => l.trim())
        .filter(Boolean);
      payload.referencias_estilo = linhas.length > 0 ? linhas.join("\n") : null;
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
    const { supabase, user } = await requireModulo("clientes");

    // Lido antes de apagar — depois do delete não há de onde tirar o nome.
    const { data: antes } = await supabase
      .from("prod_tarefas")
      .select("titulo, cliente_cadastro_id")
      .eq("id", id)
      .maybeSingle<{ titulo: string; cliente_cadastro_id: string | null }>();

    const { error } = await supabase.from("prod_tarefas").delete().eq("id", id).eq("em_pauta", true);
    if (error) return { ok: false, error: error.message };

    await registrar(supabase, user.id, {
      acao: "pauta_removida",
      entidade: "pauta",
      entidadeId: id,
      tarefaId: id,
      clienteId: antes?.cliente_cadastro_id ?? null,
      titulo: antes?.titulo ?? null,
    });

    revalidar();
    return { ok: true };
  } catch (err) {
    return { ok: false, error: mensagem(err) };
  }
}

/**
 * O bloco da marca, pronto para colar no briefing.
 *
 * É a resposta para "o editor abre a tarefa e não sabe como aquela marca
 * fala". A informação existe desde o primeiro dia — foi o cliente que
 * escreveu, no Onboarding — e nunca chegava em quem produz. Aqui ela vira um
 * botão: um clique, o texto entra no briefing, e a social media edita o que
 * quiser em cima.
 *
 * Colar TEXTO e não apontar para o onboarding de propósito. O briefing é o
 * retrato do que valia quando a peça foi pedida; se a marca mudar o tom de voz
 * em março, a peça de janeiro não deve mudar de instrução junto.
 *
 * Devolve `null` quando não há onboarding preenchido — e aí a tela nem mostra
 * o botão, em vez de mostrar um botão que não faz nada.
 */
export async function blocoDaMarca(planoId: string): Promise<{ ok: true; html: string | null } | { ok: false; error: string }> {
  try {
    const { supabase } = await requireModulo("clientes");

    const { data: plano } = await supabase
      .from("planos_estrategicos")
      .select("cliente_id")
      .eq("id", planoId)
      .maybeSingle<{ cliente_id: string }>();
    if (!plano) return { ok: true, html: null };

    const { data: onb } = await supabase
      .from("cliente_onboarding")
      .select("tom_de_voz, diretrizes_marca, drive_ativos_url, paleta_cores, publico_alvo")
      .eq("cliente_id", plano.cliente_id)
      .maybeSingle<{
        tom_de_voz: string | null;
        diretrizes_marca: string | null;
        drive_ativos_url: string | null;
        paleta_cores: string[] | null;
        publico_alvo: string | null;
      }>();
    if (!onb) return { ok: true, html: null };

    const partes: string[] = [];
    const linha = (rotulo: string, valor: string | null | undefined) => {
      if (!valor || !valor.trim()) return;
      partes.push(`<p><strong>${rotulo}:</strong> ${escapar(valor.trim())}</p>`);
    };

    linha("Tom de voz", onb.tom_de_voz);
    linha("Público-alvo", onb.publico_alvo);
    linha("Diretrizes de marca", onb.diretrizes_marca);
    if (onb.paleta_cores && onb.paleta_cores.length > 0) {
      linha("Paleta", onb.paleta_cores.join(", "));
    }
    linha("Drive de ativos", onb.drive_ativos_url);

    return { ok: true, html: partes.length > 0 ? partes.join("") : null };
  } catch (err) {
    return { ok: false, error: mensagem(err) };
  }
}

/** O briefing é HTML. O que vem do onboarding é texto digitado por gente. */
function escapar(texto: string): string {
  return texto
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\n/g, "<br />");
}

/**
 * Solta os posts para a produção.
 *
 * É o botão inteiro do módulo. Faz três coisas: tira a marca, põe a tarefa em
 * "A Fazer" e escreve o responsável — e completa com a RECEITA do formato o
 * que a social media deixou em branco.
 *
 * "O que ficou em branco" é a regra toda: a receita nunca sobrescreve. Se ela
 * escreveu os formatos de exportação daquele post à mão, foi porque aquele
 * post é diferente — e um padrão que apaga a exceção é pior do que nenhum
 * padrão.
 *
 * `backlog` não serve como destino: a coluna de backlog em Produção é "coisa
 * que existe mas ninguém pegou", e um post com responsável e data já é
 * trabalho combinado. Por isso `a_fazer`.
 *
 * O responsável é opcional de propósito. Nem sempre se sabe quem vai editar na
 * hora de soltar o mês inteiro, e travar o botão nisso faria a pessoa escolher
 * qualquer um só para destravar — o que é pior do que ninguém.
 */
export async function subirParaProducao(
  ids: string[],
  responsavelId: string | null
): Promise<{ ok: true; quantos: number } | { ok: false; error: string }> {
  try {
    const { supabase, user } = await requireModulo("clientes");
    const limpos = ids.filter(Boolean);
    if (limpos.length === 0) return { ok: false, error: "NENHUM_SELECIONADO" };

    const [postsRes, receitasRes] = await Promise.all([
      supabase
        .from("prod_tarefas")
        .select("id, post_formato, tipo_servico_id, formatos_exportacao, data_entrega, data_entrega_v1")
        .in("id", limpos)
        .eq("em_pauta", true)
        .overrideTypes<
          {
            id: string;
            post_formato: FormatoDoPost | null;
            tipo_servico_id: string | null;
            formatos_exportacao: string | null;
            data_entrega: string | null;
            data_entrega_v1: string | null;
          }[],
          { merge: false }
        >(),
      supabase
        .from("post_receitas")
        .select("formato, tipo_servico_id, formatos_exportacao, dias_v1")
        .overrideTypes<
          {
            formato: FormatoDoPost;
            tipo_servico_id: string | null;
            formatos_exportacao: string | null;
            dias_v1: number | null;
          }[],
          { merge: false }
        >(),
    ]);

    if (postsRes.error) return { ok: false, error: postsRes.error.message };
    const posts = postsRes.data ?? [];
    if (posts.length === 0) return { ok: false, error: "NENHUM_SELECIONADO" };

    // Receita ausente não é erro: significa "este formato não tem padrão", e a
    // tarefa sobe com os campos como estão.
    const receitaDe = new Map((receitasRes.data ?? []).map((r) => [r.formato, r]));

    const resultados = await Promise.all(
      posts.map(async (post) => {
        const patch: Record<string, unknown> = { em_pauta: false, status: "a_fazer" };
        if (responsavelId) patch.responsavel_id = responsavelId;

        const receita = post.post_formato ? receitaDe.get(post.post_formato) : undefined;
        if (receita) {
          if (!post.tipo_servico_id && receita.tipo_servico_id) {
            patch.tipo_servico_id = receita.tipo_servico_id;
          }
          if (!post.formatos_exportacao?.trim() && receita.formatos_exportacao?.trim()) {
            patch.formatos_exportacao = receita.formatos_exportacao.trim();
          }
          if (!post.data_entrega_v1 && post.data_entrega && receita.dias_v1 !== null) {
            patch.data_entrega_v1 = subtrairDias(post.data_entrega, receita.dias_v1);
          }
        }

        const { error } = await supabase.from("prod_tarefas").update(patch).eq("id", post.id).eq("em_pauta", true);
        if (error) return null;

        // Um registro POR PEÇA aqui, além do evento de lote mais abaixo. São
        // trilhas diferentes: na do cliente, soltar o mês é um gesto só; na da
        // peça, "veio para a produção" é o passo que falta para a história
        // dela fazer sentido do começo ao fim.
        await registrar(supabase, user.id, {
          acao: "pauta_subiu",
          entidade: "pauta",
          entidadeId: post.id,
          tarefaId: post.id,
          para: "a_fazer",
        });
        return post.id;
      })
    );

    const subiram = resultados.filter(Boolean).length;

    // UM evento para a leva inteira, e não um por post. Soltar o mês é um
    // gesto só; trinta linhas iguais no mesmo segundo afogariam a trilha e
    // esconderiam tudo o que veio antes.
    if (subiram > 0) {
      const { data: dono } = await supabase
        .from("prod_tarefas")
        .select("cliente_cadastro_id")
        .eq("id", posts[0]!.id)
        .maybeSingle<{ cliente_cadastro_id: string | null }>();

      await registrar(supabase, user.id, {
        acao: "pauta_subiu",
        entidade: "pauta",
        clienteId: dono?.cliente_cadastro_id ?? null,
        para: "a_fazer",
        detalhe: { quantos: subiram, com_responsavel: Boolean(responsavelId) },
      });
    }

    revalidar();
    if (subiram === 0) return { ok: false, error: "NENHUM_SELECIONADO" };
    return { ok: true, quantos: subiram };
  } catch (err) {
    return { ok: false, error: mensagem(err) };
  }
}

/** Em UTC, como todo cálculo de data do sistema. */
function subtrairDias(iso: string, dias: number): string {
  const partes = iso.split("-").map(Number);
  const d = new Date(Date.UTC(partes[0] ?? 1970, (partes[1] ?? 1) - 1, partes[2] ?? 1));
  d.setUTCDate(d.getUTCDate() - dias);
  return d.toISOString().slice(0, 10);
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
    const { supabase, user } = await requireModulo("clientes");
    const { error } = await supabase
      .from("prod_tarefas")
      .update({ em_pauta: true, status: "backlog" })
      .eq("id", id)
      .eq("em_pauta", false)
      .in("status", ["a_fazer", "backlog"]);
    if (error) return { ok: false, error: error.message };

    const { data: alvo } = await supabase
      .from("prod_tarefas")
      .select("titulo, cliente_cadastro_id")
      .eq("id", id)
      .maybeSingle<{ titulo: string; cliente_cadastro_id: string | null }>();

    await registrar(supabase, user.id, {
      acao: "pauta_devolvida",
      entidade: "pauta",
      entidadeId: id,
      tarefaId: id,
      clienteId: alvo?.cliente_cadastro_id ?? null,
      titulo: alvo?.titulo ?? null,
    });

    revalidar();
    return { ok: true };
  } catch (err) {
    return { ok: false, error: mensagem(err) };
  }
}
