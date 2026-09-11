"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/requireAdmin";

/**
 * Padrões de produção por formato de post — e o cadastro de formatos da
 * empresa, que vive ao lado porque é a mesma tela.
 *
 * O padrão é configurado uma vez pelo administrador e aplicado em todo post
 * que sobe do calendário de conteúdo — e só nos campos que ficaram em branco.
 * É o que tira da social media o trabalho de preencher tipo de serviço,
 * formatos de exportação e prazo do primeiro corte trinta vezes por mês.
 *
 * `requireAdmin` e não `requireModulo`: a RLS das duas tabelas já exige
 * `is_admin()` para escrever, e a checagem aqui barra antes de tentar. É uma
 * regra da agência, não uma preferência de quem está montando o mês — um
 * padrão trocado em silêncio muda como toda peça futura nasce.
 *
 * Os erros saem como CÓDIGO, não como frase. A tela roda em três idiomas e
 * quem lê a mensagem é o dono da agência; "FORMATO_EM_USO" vira texto no
 * dicionário, do lado de fora. Erro que vem do Postgres passa cru — é bug, não
 * conversa com o usuário.
 */

export type ResultadoReceita = { ok: true } | { ok: false; error: string };
export type ResultadoFormato = { ok: true; slug: string } | { ok: false; error: string };

// "/admin" está aqui porque é onde mora a aba Conteúdo, que monta o seletor de
// formato com este cadastro. Sem ele, criar um formato não aparece no
// calendário até alguém dar F5.
const PATHS = ["/admin/configuracoes", "/admin/planejamento", "/admin"];
const revalidar = () => PATHS.forEach((p) => revalidatePath(p));

function mensagem(err: unknown): string {
  return err instanceof Error ? err.message : "Erro desconhecido.";
}

/**
 * O slug é o que fica gravado na peça (`prod_tarefas.post_formato`), então ele
 * nasce do nome mas nunca mais muda com ele: renomear "Podcast" para "Podcast
 * (corte)" mexe em `nome`, e as peças continuam apontando para `podcast`.
 */
function slugificar(nome: string): string {
  const base = nome
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 32)
    .replace(/_+$/g, "");
  return base || "formato";
}

// ----------------------------------------------------------------------------
// Padrões (post_receitas)
// ----------------------------------------------------------------------------

export async function salvarReceitaDePost(
  formato: string,
  campos: { tipo_servico_id: string | null; formatos_exportacao: string | null; dias_v1: number | null }
): Promise<ResultadoReceita> {
  try {
    const { supabase } = await requireAdmin();

    // A lista fechada saiu do banco quando os formatos viraram cadastro da
    // empresa (`supabase/formatos-de-post.sql`), então a conferência mora
    // aqui: um padrão para um formato que não existe nunca seria aplicado, e
    // ninguém descobriria por quê.
    const { data: existe, error: erroFormato } = await supabase
      .from("post_formatos")
      .select("slug")
      .eq("slug", formato)
      .maybeSingle<{ slug: string }>();
    if (erroFormato) return { ok: false, error: erroFormato.message };
    if (!existe) return { ok: false, error: "FORMATO_DESCONHECIDO" };

    const dias =
      campos.dias_v1 === null || !Number.isFinite(campos.dias_v1)
        ? null
        : Math.min(90, Math.max(0, Math.round(campos.dias_v1)));

    // Upsert por (company_id, formato), que é a unique da tabela. Sem isso,
    // salvar duas vezes o mesmo formato criaria dois padrões e a aplicação
    // teria que escolher um deles — o tipo de coisa que só aparece meses
    // depois, quando alguém pergunta por que o Reels virou Carrossel.
    const { error } = await supabase.from("post_receitas").upsert(
      {
        formato,
        tipo_servico_id: campos.tipo_servico_id || null,
        formatos_exportacao: campos.formatos_exportacao?.trim() || null,
        dias_v1: dias,
      },
      { onConflict: "company_id,formato" }
    );

    if (error) return { ok: false, error: error.message };
    revalidar();
    return { ok: true };
  } catch (err) {
    return { ok: false, error: mensagem(err) };
  }
}

/** Tira o padrão do formato — os posts daquele formato voltam a subir em branco. */
export async function limparReceitaDePost(formato: string): Promise<ResultadoReceita> {
  try {
    const { supabase } = await requireAdmin();
    const { error } = await supabase.from("post_receitas").delete().eq("formato", formato);
    if (error) return { ok: false, error: error.message };
    revalidar();
    return { ok: true };
  } catch (err) {
    return { ok: false, error: mensagem(err) };
  }
}

// ----------------------------------------------------------------------------
// Cadastro de formatos (post_formatos)
// ----------------------------------------------------------------------------

/**
 * Cria um formato da agência ("Podcast", "Newsletter").
 *
 * `company_id` sai de fora do insert de propósito: a coluna tem
 * `default current_company_id()`, e mandar NULL explícito NÃO cai no default
 * do Postgres — cairia direto na violação de `not null`.
 */
export async function criarFormatoDePost(nome: string): Promise<ResultadoFormato> {
  try {
    const { supabase } = await requireAdmin();

    const limpo = nome.trim().replace(/\s+/g, " ");
    if (!limpo) return { ok: false, error: "FORMATO_SEM_NOME" };
    if (limpo.length > 40) return { ok: false, error: "FORMATO_NOME_LONGO" };

    const { data, error: erroLer } = await supabase
      .from("post_formatos")
      .select("slug, nome, ordem")
      .overrideTypes<{ slug: string; nome: string | null; ordem: number }[], { merge: false }>();
    if (erroLer) return { ok: false, error: erroLer.message };
    const lista = data ?? [];

    // Nome repetido não vira formato novo — inclusive se o existente estiver
    // oculto. Dois "Podcast" na lista seriam indistinguíveis na hora de
    // classificar o post.
    if (lista.some((f) => (f.nome ?? "").trim().toLowerCase() === limpo.toLowerCase())) {
      return { ok: false, error: "FORMATO_DUPLICADO" };
    }

    const usados = new Set(lista.map((f) => f.slug));
    const raiz = slugificar(limpo);
    let slug = raiz;
    for (let n = 2; usados.has(slug); n++) slug = `${raiz.slice(0, 28)}_${n}`;

    const ordem = lista.reduce((max, f) => Math.max(max, f.ordem), -1) + 1;

    const { error } = await supabase.from("post_formatos").insert({ slug, nome: limpo, ordem, ativo: true });
    if (error) return { ok: false, error: error.message };

    revalidar();
    return { ok: true, slug };
  } catch (err) {
    return { ok: false, error: mensagem(err) };
  }
}

async function definirUso(slug: string, ativo: boolean): Promise<ResultadoReceita> {
  try {
    const { supabase } = await requireAdmin();
    const { error } = await supabase.from("post_formatos").update({ ativo }).eq("slug", slug);
    if (error) return { ok: false, error: error.message };
    revalidar();
    return { ok: true };
  } catch (err) {
    return { ok: false, error: mensagem(err) };
  }
}

/** Põe o formato de volta na tela e no seletor do Calendário. */
export async function mostrarFormatoDePost(slug: string): Promise<ResultadoReceita> {
  return definirUso(slug, true);
}

/**
 * Tira o formato da tela e do seletor, SEM apagar o padrão nem desclassificar
 * as peças antigas. É o que "não uso mais isso" quer dizer na prática: o
 * Carrossel de março continua sendo um Carrossel.
 */
export async function ocultarFormatoDePost(slug: string): Promise<ResultadoReceita> {
  return definirUso(slug, false);
}

/**
 * Exclui de vez — só para o formato que a própria agência criou e que nenhuma
 * peça usa. É a saída para o erro de digitação ("Pdcast"), não para "parei de
 * vender isso": esse é o `ocultar` acima.
 */
export async function removerFormatoDePost(slug: string): Promise<ResultadoReceita> {
  try {
    const { supabase } = await requireAdmin();

    const { data: formato, error: erroLer } = await supabase
      .from("post_formatos")
      .select("slug, nome")
      .eq("slug", slug)
      .maybeSingle<{ slug: string; nome: string | null }>();
    if (erroLer) return { ok: false, error: erroLer.message };
    if (!formato) return { ok: false, error: "FORMATO_DESCONHECIDO" };
    if (!formato.nome) return { ok: false, error: "FORMATO_NATIVO" };

    const { count, error: erroContar } = await supabase
      .from("prod_tarefas")
      .select("id", { count: "exact", head: true })
      .eq("post_formato", slug);
    if (erroContar) return { ok: false, error: erroContar.message };
    if ((count ?? 0) > 0) return { ok: false, error: "FORMATO_EM_USO" };

    // O padrão sai junto: sem formato, ele não teria mais o que preencher.
    const { error: erroReceita } = await supabase.from("post_receitas").delete().eq("formato", slug);
    if (erroReceita) return { ok: false, error: erroReceita.message };

    const { error } = await supabase.from("post_formatos").delete().eq("slug", slug);
    if (error) return { ok: false, error: error.message };

    revalidar();
    return { ok: true };
  } catch (err) {
    return { ok: false, error: mensagem(err) };
  }
}
