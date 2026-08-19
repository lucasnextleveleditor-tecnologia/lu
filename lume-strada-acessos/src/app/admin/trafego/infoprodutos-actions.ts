"use server";

import { revalidatePath } from "next/cache";
import { requireModulo } from "@/lib/auth/requireAdmin";
import { segundaFeiraISO, domingoISO } from "@/lib/utils/infoprodutos";
import { ehImagemPermitida, ehVideoPermitido } from "@/lib/utils/upload";
import type { TipoProduto } from "@/lib/types/infoprodutos";

export type ActionResult = { ok: true } | { ok: false; error: string };
export type ActionResultId = { ok: true; id: string } | { ok: false; error: string };
export type UploadAssinadoCriativoResult =
  | { ok: true; path: string; token: string; tipo: "imagem" | "video" }
  | { ok: false; error: string };

const PATH = "/admin/trafego";
const BUCKET = "infoprodutos";

// ----------------------------------------------------------------------------
// Produtos (Principal / Order Bump)
// ----------------------------------------------------------------------------
export interface ProdutoInput {
  nome: string;
  tipo: TipoProduto;
  valor: number;
}

export async function criarProduto(input: ProdutoInput): Promise<ActionResultId> {
  try {
    const { supabase } = await requireModulo("trafego");
    if (!input.nome.trim()) return { ok: false, error: "Informe o nome do produto." };
    if (input.valor < 0) return { ok: false, error: "O valor não pode ser negativo." };

    const { data, error } = await supabase
      .from("produtos")
      .insert({ nome: input.nome.trim(), tipo: input.tipo, valor: input.valor })
      .select("id")
      .single();

    if (error) return { ok: false, error: error.message };
    revalidatePath(PATH);
    return { ok: true, id: data!.id as string };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Erro desconhecido." };
  }
}

export async function atualizarProduto(id: string, input: ProdutoInput): Promise<ActionResult> {
  try {
    const { supabase } = await requireModulo("trafego");
    if (!input.nome.trim()) return { ok: false, error: "Informe o nome do produto." };

    const { error } = await supabase
      .from("produtos")
      .update({ nome: input.nome.trim(), tipo: input.tipo, valor: input.valor })
      .eq("id", id);

    if (error) return { ok: false, error: error.message };
    revalidatePath(PATH);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Erro desconhecido." };
  }
}

export async function alternarAtivoProduto(id: string, ativo: boolean): Promise<ActionResult> {
  try {
    const { supabase } = await requireModulo("trafego");
    const { error } = await supabase.from("produtos").update({ ativo }).eq("id", id);
    if (error) return { ok: false, error: error.message };
    revalidatePath(PATH);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Erro desconhecido." };
  }
}

export async function removerProduto(id: string): Promise<ActionResult> {
  try {
    const { supabase } = await requireModulo("trafego");
    const { error } = await supabase.from("produtos").delete().eq("id", id);
    if (error) return { ok: false, error: error.message };
    revalidatePath(PATH);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Erro desconhecido." };
  }
}

// ----------------------------------------------------------------------------
// Anúncios (cards diários)
// ----------------------------------------------------------------------------
export interface AnuncioInput {
  data: string; // ISO date
  nomeAnuncio: string | null;
  produtoPrincipalId: string | null;
  orderBumpId: string | null;
  investimento: number;
  visualizacoes: number;
  cliques: number;
  vendasPrincipal: number;
  vendasOrderBump: number;
  receitaBruta: number; // já vem calculado (com possível override) do client
}

export async function criarAnuncio(input: AnuncioInput): Promise<ActionResultId> {
  try {
    const { supabase } = await requireModulo("trafego");

    const { data, error } = await supabase
      .from("anuncios_tracking")
      .insert({
        data: input.data,
        semana_inicio: segundaFeiraISO(input.data),
        nome_anuncio: input.nomeAnuncio?.trim() || null,
        produto_principal_id: input.produtoPrincipalId,
        order_bump_id: input.orderBumpId,
        investimento: input.investimento,
        visualizacoes: input.visualizacoes,
        cliques: input.cliques,
        vendas_principal: input.vendasPrincipal,
        vendas_order_bump: input.vendasOrderBump,
        receita_bruta: input.receitaBruta,
      })
      .select("id")
      .single();

    if (error) return { ok: false, error: error.message };
    revalidatePath(PATH);
    return { ok: true, id: data!.id as string };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Erro desconhecido." };
  }
}

export async function atualizarAnuncio(id: string, input: AnuncioInput): Promise<ActionResult> {
  try {
    const { supabase } = await requireModulo("trafego");

    const { error } = await supabase
      .from("anuncios_tracking")
      .update({
        data: input.data,
        semana_inicio: segundaFeiraISO(input.data),
        nome_anuncio: input.nomeAnuncio?.trim() || null,
        produto_principal_id: input.produtoPrincipalId,
        order_bump_id: input.orderBumpId,
        investimento: input.investimento,
        visualizacoes: input.visualizacoes,
        cliques: input.cliques,
        vendas_principal: input.vendasPrincipal,
        vendas_order_bump: input.vendasOrderBump,
        receita_bruta: input.receitaBruta,
      })
      .eq("id", id);

    if (error) return { ok: false, error: error.message };
    revalidatePath(PATH);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Erro desconhecido." };
  }
}

export async function removerAnuncio(id: string): Promise<ActionResult> {
  try {
    const { supabase } = await requireModulo("trafego");

    // Apaga o criativo do Storage antes da linha, pra não deixar arquivo órfão no bucket.
    const { data: anuncio } = await supabase.from("anuncios_tracking").select("criativo_path").eq("id", id).single();
    if (anuncio?.criativo_path) {
      await supabase.storage.from(BUCKET).remove([anuncio.criativo_path]);
    }

    const { error } = await supabase.from("anuncios_tracking").delete().eq("id", id);
    if (error) return { ok: false, error: error.message };
    revalidatePath(PATH);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Erro desconhecido." };
  }
}

/**
 * Passo 1/2 do upload do criativo — gera uma signed upload URL pro
 * navegador subir o arquivo DIRETO pro Supabase Storage, mesmo motivo/
 * mesmo padrão de `criarUploadAssinadoVersao` em `admin/producao/actions.ts`
 * (o corpo de uma Server Action nunca alcança os 80MB previstos aqui — a
 * Vercel trava toda function serverless em 4.5MB de corpo).
 *
 * A checagem de tipo continua aqui (allowlist, sem SVG — ver Crítico #3)
 * ANTES de gerar a URL, como primeira camada; a segunda camada é o
 * `allowed_mime_types` do bucket "infoprodutos" (ver
 * `supabase/correcoes-auditoria.sql`), que vale mesmo se esse tipo aqui for
 * contornado.
 */
export async function criarUploadAssinadoCriativo(anuncioId: string, nomeArquivo: string, contentType: string): Promise<UploadAssinadoCriativoResult> {
  try {
    const { supabase } = await requireModulo("trafego");

    const tipo: "imagem" | "video" | null = ehImagemPermitida(contentType) ? "imagem" : ehVideoPermitido(contentType) ? "video" : null;
    if (!tipo) return { ok: false, error: "Envie uma imagem (PNG, JPG, WEBP ou GIF) ou um vídeo (MP4, WEBM ou MOV). SVG não é permitido." };

    const extensao = nomeArquivo.includes(".") ? nomeArquivo.split(".").pop() : null;
    const caminho = `${anuncioId}/${Date.now()}${extensao ? `.${extensao}` : ""}`;

    const { data, error } = await supabase.storage.from(BUCKET).createSignedUploadUrl(caminho);
    if (error || !data) return { ok: false, error: error?.message ?? "Não foi possível preparar o upload." };

    return { ok: true, path: caminho, token: data.token, tipo };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Erro desconhecido." };
  }
}

/** Passo 2/2 — depois que o navegador já subiu o arquivo (via `criarUploadAssinadoCriativo`), grava o path/tipo no anúncio. */
export async function confirmarCriativo(anuncioId: string, input: { path: string; tipo: "imagem" | "video" }): Promise<ActionResult> {
  try {
    const { supabase } = await requireModulo("trafego");

    const { error } = await supabase
      .from("anuncios_tracking")
      .update({ criativo_path: input.path, criativo_tipo: input.tipo })
      .eq("id", anuncioId);
    if (error) return { ok: false, error: error.message };

    revalidatePath(PATH);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Erro desconhecido." };
  }
}

export async function removerCriativo(anuncioId: string): Promise<ActionResult> {
  try {
    const { supabase } = await requireModulo("trafego");

    const { data: anuncio } = await supabase.from("anuncios_tracking").select("criativo_path").eq("id", anuncioId).single();
    if (anuncio?.criativo_path) {
      await supabase.storage.from(BUCKET).remove([anuncio.criativo_path]);
    }

    const { error } = await supabase
      .from("anuncios_tracking")
      .update({ criativo_path: null, criativo_tipo: null })
      .eq("id", anuncioId);
    if (error) return { ok: false, error: error.message };

    revalidatePath(PATH);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Erro desconhecido." };
  }
}

// ----------------------------------------------------------------------------
// Calendário de Metas de Lucro
// ----------------------------------------------------------------------------
export async function salvarMetaCalendario(data: string, metaLucro: number): Promise<ActionResult> {
  try {
    const { supabase } = await requireModulo("trafego");
    const { error } = await supabase
      .from("metas_calendario")
      .upsert({ data, meta_lucro: metaLucro }, { onConflict: "data" });

    if (error) return { ok: false, error: error.message };
    revalidatePath(PATH);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Erro desconhecido." };
  }
}

// ----------------------------------------------------------------------------
// Fechamento da Semana — abate os reembolsos e trava o lucro líquido real.
// ----------------------------------------------------------------------------
export async function fecharSemana(semanaInicio: string, reembolsos: number): Promise<ActionResult> {
  try {
    const { supabase } = await requireModulo("trafego");
    if (reembolsos < 0) return { ok: false, error: "O valor de reembolsos não pode ser negativo." };

    const { data: anuncios, error: erroAnuncios } = await supabase
      .from("anuncios_tracking")
      .select("investimento, receita_bruta")
      .eq("semana_inicio", semanaInicio);
    if (erroAnuncios) return { ok: false, error: erroAnuncios.message };

    const investimentoTotal = (anuncios ?? []).reduce((acc, a) => acc + Number(a.investimento), 0);
    const receitaBrutaTotal = (anuncios ?? []).reduce((acc, a) => acc + Number(a.receita_bruta), 0);
    const lucroLiquidoReal = receitaBrutaTotal - investimentoTotal - reembolsos;

    const { error } = await supabase.from("fechamentos_semanais").upsert(
      {
        semana_inicio: semanaInicio,
        semana_fim: domingoISO(semanaInicio),
        receita_bruta_total: receitaBrutaTotal,
        investimento_total: investimentoTotal,
        reembolsos,
        lucro_liquido_real: lucroLiquidoReal,
        fechado_em: new Date().toISOString(),
      },
      { onConflict: "semana_inicio" }
    );

    if (error) return { ok: false, error: error.message };
    revalidatePath(PATH);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Erro desconhecido." };
  }
}
