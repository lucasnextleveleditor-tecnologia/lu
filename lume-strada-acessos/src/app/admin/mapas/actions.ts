"use server";

import { revalidatePath } from "next/cache";
import { requireEquipe } from "@/lib/auth/requireAdmin";
import type { AcessoPublicoMapa, MapaNoRow } from "@/lib/types/mapa-mental";

export type Resultado = { ok: true } | { ok: false; error: string };
export type ResultadoNo = { ok: true; no: MapaNoRow } | { ok: false; error: string };

const ROTA = "/admin/mapas";

/** Campos que um balão aceita receber do navegador. Nada fora desta lista é gravado. */
const CAMPOS_NO = [
  "texto",
  "cor",
  "colapsado",
  "desloc_x",
  "desloc_y",
  "lado",
  "ordem",
  "pai_id",
  "link",
  "imagem_path",
  "fonte",
  "tamanho",
  "negrito",
  "italico",
  "forma",
] as const;

function apenasPermitidos(valores: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(Object.entries(valores).filter(([chave]) => (CAMPOS_NO as readonly string[]).includes(chave)));
}

/**
 * Cria o mapa JÁ com o balão do meio.
 *
 * Um mapa mental sem raiz não é um mapa vazio — é um mapa quebrado: não há
 * onde clicar para começar. Nascer com a raiz é o que faz a primeira tecla
 * digitada já virar conteúdo.
 */
export async function criarMapa(titulo = ""): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  try {
    const { supabase, user } = await requireEquipe();

    const { data: mapa, error } = await supabase
      .from("mapas_mentais")
      .insert({ titulo, criado_por: user.id })
      .select("id")
      .single<{ id: string }>();
    if (error || !mapa) return { ok: false, error: error?.message ?? "Não foi possível criar o mapa." };

    const { error: erroRaiz } = await supabase.from("mapa_nos").insert({ mapa_id: mapa.id, pai_id: null, texto: titulo, ordem: 0 });
    if (erroRaiz) return { ok: false, error: erroRaiz.message };

    revalidatePath(ROTA);
    return { ok: true, id: mapa.id };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Erro desconhecido." };
  }
}

export async function renomearMapa(id: string, titulo: string): Promise<Resultado> {
  try {
    const { supabase } = await requireEquipe();
    const { error } = await supabase
      .from("mapas_mentais")
      .update({ titulo: titulo.trim(), atualizado_em: new Date().toISOString() })
      .eq("id", id);
    if (error) return { ok: false, error: error.message };
    revalidatePath(ROTA);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Erro desconhecido." };
  }
}

/** Tira da lista principal sem destruir nada — o mapa continua inteiro, link público e tudo. */
export async function arquivarMapa(id: string, arquivado: boolean): Promise<Resultado> {
  try {
    const { supabase } = await requireEquipe();
    const { error } = await supabase.from("mapas_mentais").update({ arquivado }).eq("id", id);
    if (error) return { ok: false, error: error.message };
    revalidatePath(ROTA);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Erro desconhecido." };
  }
}

export async function excluirMapa(id: string): Promise<Resultado> {
  try {
    const { supabase } = await requireEquipe();
    const { error } = await supabase.from("mapas_mentais").delete().eq("id", id);
    if (error) return { ok: false, error: error.message };
    revalidatePath(ROTA);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Erro desconhecido." };
  }
}

/** Liga, muda ou desliga o link público. `privado` derruba o link sem trocar a URL. */
export async function definirAcessoPublico(id: string, acesso: AcessoPublicoMapa): Promise<Resultado> {
  try {
    const { supabase } = await requireEquipe();
    const { error } = await supabase.from("mapas_mentais").update({ acesso_publico: acesso }).eq("id", id);
    if (error) return { ok: false, error: error.message };
    revalidatePath(`${ROTA}/${id}`);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Erro desconhecido." };
  }
}

export async function adicionarNo(mapaId: string, paiId: string, valores: Record<string, unknown> = {}): Promise<ResultadoNo> {
  try {
    const { supabase } = await requireEquipe();

    const { count } = await supabase
      .from("mapa_nos")
      .select("id", { count: "exact", head: true })
      .eq("mapa_id", mapaId)
      .eq("pai_id", paiId);

    const { data, error } = await supabase
      .from("mapa_nos")
      .insert({ mapa_id: mapaId, pai_id: paiId, ordem: count ?? 0, ...apenasPermitidos(valores) })
      .select("*")
      .single<MapaNoRow>();
    if (error || !data) return { ok: false, error: error?.message ?? "Não foi possível adicionar o balão." };

    await supabase.from("mapas_mentais").update({ atualizado_em: new Date().toISOString() }).eq("id", mapaId);
    return { ok: true, no: data };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Erro desconhecido." };
  }
}

export async function salvarNo(mapaId: string, noId: string, valores: Record<string, unknown>): Promise<Resultado> {
  try {
    const { supabase } = await requireEquipe();
    const permitidos = apenasPermitidos(valores);
    if (Object.keys(permitidos).length === 0) return { ok: true };

    const { error } = await supabase.from("mapa_nos").update(permitidos).eq("id", noId).eq("mapa_id", mapaId);
    if (error) return { ok: false, error: error.message };

    await supabase.from("mapas_mentais").update({ atualizado_em: new Date().toISOString() }).eq("id", mapaId);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Erro desconhecido." };
  }
}

/** Apaga o balão e, por cascata no banco, todo o ramo abaixo dele. */
export async function removerNo(mapaId: string, noId: string): Promise<Resultado> {
  try {
    const { supabase } = await requireEquipe();
    const { error } = await supabase.from("mapa_nos").delete().eq("id", noId).eq("mapa_id", mapaId).not("pai_id", "is", null);
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Erro desconhecido." };
  }
}

/** Zera todo ajuste manual de posição: o mapa volta a se arrumar sozinho. */
export async function reorganizarMapa(mapaId: string): Promise<Resultado> {
  try {
    const { supabase } = await requireEquipe();
    const { error } = await supabase
      .from("mapa_nos")
      .update({ desloc_x: null, desloc_y: null, lado: null })
      .eq("mapa_id", mapaId);
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Erro desconhecido." };
  }
}

/**
 * Devolve balões apagados ao mapa, COM OS MESMOS IDS.
 *
 * O id igual é o ponto todo: um ramo apagado tem filhos que apontam para o
 * pai por id, e recriar com ids novos devolveria uma penca de balões soltos
 * em vez do ramo que existia. Por isso o desfazer restaura, e não recria.
 *
 * A lista tem de vir com os pais ANTES dos filhos — é a ordem em que a tela
 * já coleta o ramo ao apagar. Inserimos um a um por isso: um `insert` em
 * lote não garante a ordem, e a chave estrangeira de `pai_id` reprovaria o
 * filho que chegasse primeiro.
 */
export async function restaurarNos(mapaId: string, nos: Record<string, unknown>[]): Promise<Resultado> {
  try {
    const { supabase, companyId } = await requireEquipe();
    if (nos.length === 0) return { ok: true };

    for (const no of nos) {
      const permitidos = apenasPermitidos(no);
      const { error } = await supabase.from("mapa_nos").insert({
        id: no.id,
        mapa_id: mapaId,
        company_id: companyId,
        pai_id: no.pai_id ?? null,
        ...permitidos,
      });
      // Já existe (dois desfazeres seguidos, ou o colega restaurou antes):
      // não é erro, o mapa já está como deveria.
      if (error && error.code !== "23505") return { ok: false, error: error.message };
    }

    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Erro desconhecido." };
  }
}

export async function comentarNo(mapaId: string, noId: string, autor: string, texto: string): Promise<Resultado> {
  try {
    const { supabase, companyId, nome } = await requireEquipe();
    if (!texto.trim()) return { ok: true };
    const { error } = await supabase.from("mapa_comentarios").insert({
      company_id: companyId,
      mapa_id: mapaId,
      no_id: noId,
      autor: autor.trim() || nome,
      texto: texto.trim(),
    });
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Erro desconhecido." };
  }
}

/**
 * Prepara o envio de uma imagem para um balão.
 *
 * O arquivo NÃO passa por aqui: devolvemos uma URL assinada e o navegador
 * envia direto para o Storage. É o mesmo desenho de Produção e Financeiro —
 * um anexo de 5 MB atravessando a Server Action gastaria o dobro da banda e
 * esbarraria no limite de corpo da requisição.
 *
 * O caminho começa SEMPRE com o id da empresa vindo do servidor. Se viesse
 * do navegador, bastaria trocar o prefixo para escrever na pasta de outra
 * empresa — a política do bucket confere exatamente esse primeiro segmento.
 */
export async function prepararEnvioImagem(
  mapaId: string,
  nomeArquivo: string
): Promise<{ ok: true; caminho: string; token: string } | { ok: false; error: string }> {
  try {
    const { supabase, companyId } = await requireEquipe();
    if (!companyId) return { ok: false, error: "Sua conta não está ligada a uma empresa." };

    const extensao = (nomeArquivo.split(".").pop() ?? "png").toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 5) || "png";
    const caminho = `${companyId}/${mapaId}/${crypto.randomUUID()}.${extensao}`;

    const { data, error } = await supabase.storage.from("mapas").createSignedUploadUrl(caminho);
    if (error || !data) return { ok: false, error: error?.message ?? "Não foi possível preparar o envio." };

    return { ok: true, caminho, token: data.token };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Erro desconhecido." };
  }
}
