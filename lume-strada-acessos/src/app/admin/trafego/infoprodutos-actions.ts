"use server";

import { revalidatePath } from "next/cache";
import { requireModulo } from "@/lib/auth/requireAdmin";
import { segundaFeiraISO, domingoISO, calcularReceitaLiquida } from "@/lib/utils/infoprodutos";
import { ehImagemPermitida, ehVideoPermitido } from "@/lib/utils/upload";
import type { TipoProduto } from "@/lib/types/infoprodutos";

export type ActionResult = { ok: true } | { ok: false; error: string };
export type ActionResultId = { ok: true; id: string } | { ok: false; error: string };
export type UploadAssinadoCriativoResult =
  | { ok: true; path: string; token: string; tipo: "imagem" | "video" }
  | { ok: false; error: string };

const PATH = "/admin/trafego";
const BUCKET = "infoprodutos";

/**
 * Todo o espaço de Info-Produtos (produtos, anúncios, calendário de metas,
 * fechamento semanal) agora é separado por cliente — ver migração
 * `infoprodutos_por_cliente_e_trafego_tipo_resultado`. `clienteCadastroId`
 * (-> `clientes.id`) é o vínculo gravado em `cliente_cadastro_id` nas 4
 * tabelas; `cliente_id` (-> `profiles.id`) fica sempre null por enquanto —
 * ainda não existe portal do cliente pra Info-Produtos (só a área
 * administrativa lê/escreve essas tabelas, RLS já cobre via `is_staff()` +
 * `company_id`), então não há motivo pra resolver/gravar esse segundo
 * vínculo como em `resolverVinculoCliente` (app/admin/trafego/actions.ts).
 */

// ----------------------------------------------------------------------------
// Produtos (Principal / Order Bump)
// ----------------------------------------------------------------------------
export interface ProdutoInput {
  nome: string;
  tipo: TipoProduto;
  valor: number;
}

export async function criarProduto(clienteCadastroId: string, input: ProdutoInput): Promise<ActionResultId> {
  try {
    const { supabase } = await requireModulo("trafego");
    if (!input.nome.trim()) return { ok: false, error: "Informe o nome do produto." };
    if (input.valor < 0) return { ok: false, error: "O valor não pode ser negativo." };

    const { data, error } = await supabase
      .from("produtos")
      .insert({ cliente_cadastro_id: clienteCadastroId, nome: input.nome.trim(), tipo: input.tipo, valor: input.valor })
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
// Criativos (cadastro — separado do lançamento diário, ver `CriativoRow`)
// ----------------------------------------------------------------------------
export interface CriativoInput {
  nome: string;
  orcamentoDiario: number;
}

export async function criarCriativo(clienteCadastroId: string, input: CriativoInput): Promise<ActionResultId> {
  try {
    const { supabase } = await requireModulo("trafego");
    if (!input.nome.trim()) return { ok: false, error: "Informe o nome do criativo." };
    if (input.orcamentoDiario < 0) return { ok: false, error: "O orçamento diário não pode ser negativo." };

    const { data, error } = await supabase
      .from("criativos")
      .insert({ cliente_cadastro_id: clienteCadastroId, nome: input.nome.trim(), orcamento_diario: input.orcamentoDiario })
      .select("id")
      .single();

    if (error) return { ok: false, error: error.message };
    revalidatePath(PATH);
    return { ok: true, id: data!.id as string };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Erro desconhecido." };
  }
}

export async function atualizarCriativo(id: string, input: CriativoInput): Promise<ActionResult> {
  try {
    const { supabase } = await requireModulo("trafego");
    if (!input.nome.trim()) return { ok: false, error: "Informe o nome do criativo." };
    if (input.orcamentoDiario < 0) return { ok: false, error: "O orçamento diário não pode ser negativo." };

    const { error } = await supabase
      .from("criativos")
      .update({ nome: input.nome.trim(), orcamento_diario: input.orcamentoDiario })
      .eq("id", id);

    if (error) return { ok: false, error: error.message };
    revalidatePath(PATH);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Erro desconhecido." };
  }
}

export async function alternarAtivoCriativo(id: string, ativo: boolean): Promise<ActionResult> {
  try {
    const { supabase } = await requireModulo("trafego");
    const { error } = await supabase.from("criativos").update({ ativo }).eq("id", id);
    if (error) return { ok: false, error: error.message };
    revalidatePath(PATH);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Erro desconhecido." };
  }
}

/**
 * Nome `removerCriativoCadastro` (não `removerCriativo`) de propósito — esse
 * segundo nome já existe mais abaixo pra uma coisa BEM diferente (remove o
 * arquivo de mídia enviado num anúncio, ver `criativo_path`). Isso aqui
 * apaga a linha do CADASTRO de criativos (ver `CriativoRow`).
 */
export async function removerCriativoCadastro(id: string): Promise<ActionResult> {
  try {
    const { supabase } = await requireModulo("trafego");
    const { error } = await supabase.from("criativos").delete().eq("id", id);
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
export interface OrderBumpVendaInput {
  produtoId: string;
  quantidade: number;
}

export interface AnuncioInput {
  data: string; // ISO date
  criativoId: string;
  produtoPrincipalId: string | null;
  /**
   * Substituiu o antigo `orderBumpId` único — agora um anúncio pode ter
   * VÁRIAS linhas de order bump vendido (produto + quantidade), ver
   * `anuncio_order_bump_vendas`. `vendas_order_bump` continua sendo gravado
   * em `anuncios_tracking`, mas como AGREGADO calculado aqui (soma das
   * quantidades), nunca mais como entrada manual — é o que mantém
   * `fecharSemana`/Relatórios/Dashboard 7 Dias funcionando sem mudança.
   */
  orderBumpVendas: OrderBumpVendaInput[];
  investimento: number;
  visualizacoes: number;
  cliques: number;
  vendasPrincipal: number;
  receitaBruta: number; // já vem calculado (com possível override) do client
  taxaPercentual: number; // taxa da plataforma sobre a receita — 0 é um valor válido, nunca omitido
  taxaFixa: number; // taxa fixa em R$ por venda — 0 é um valor válido, nunca omitido
}

/** Grava as linhas de order bump vendido de um anúncio — sempre substitui tudo (apaga e recria), mais simples que fazer diff numa lista curta. */
async function salvarOrderBumpVendas(
  supabase: Awaited<ReturnType<typeof requireModulo>>["supabase"],
  anuncioId: string,
  linhas: OrderBumpVendaInput[]
): Promise<{ ok: true } | { ok: false; error: string }> {
  const { error: erroDelete } = await supabase.from("anuncio_order_bump_vendas").delete().eq("anuncio_id", anuncioId);
  if (erroDelete) return { ok: false, error: erroDelete.message };

  const validas = linhas.filter((l) => l.produtoId && l.quantidade > 0);
  if (validas.length === 0) return { ok: true };

  const { error: erroInsert } = await supabase
    .from("anuncio_order_bump_vendas")
    .insert(validas.map((l) => ({ anuncio_id: anuncioId, produto_id: l.produtoId, quantidade: l.quantidade })));
  if (erroInsert) return { ok: false, error: erroInsert.message };
  return { ok: true };
}

function somaVendasOrderBump(linhas: OrderBumpVendaInput[]): number {
  return linhas.reduce((acc, l) => acc + (l.quantidade > 0 ? l.quantidade : 0), 0);
}

export async function criarAnuncio(clienteCadastroId: string, input: AnuncioInput): Promise<ActionResultId> {
  try {
    const { supabase } = await requireModulo("trafego");
    if (!input.criativoId) return { ok: false, error: "Selecione um Criativo." };

    const { data, error } = await supabase
      .from("anuncios_tracking")
      .insert({
        cliente_cadastro_id: clienteCadastroId,
        data: input.data,
        semana_inicio: segundaFeiraISO(input.data),
        nome_anuncio: null,
        criativo_id: input.criativoId,
        produto_principal_id: input.produtoPrincipalId,
        order_bump_id: null,
        investimento: input.investimento,
        visualizacoes: input.visualizacoes,
        cliques: input.cliques,
        vendas_principal: input.vendasPrincipal,
        vendas_order_bump: somaVendasOrderBump(input.orderBumpVendas),
        receita_bruta: input.receitaBruta,
        taxa_percentual: input.taxaPercentual,
        taxa_fixa: input.taxaFixa,
      })
      .select("id")
      .single();

    if (error) return { ok: false, error: error.message };
    const anuncioId = data!.id as string;

    const resultLinhas = await salvarOrderBumpVendas(supabase, anuncioId, input.orderBumpVendas);
    if (!resultLinhas.ok) return resultLinhas;

    revalidatePath(PATH);
    return { ok: true, id: anuncioId };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Erro desconhecido." };
  }
}

export async function atualizarAnuncio(id: string, input: AnuncioInput): Promise<ActionResult> {
  try {
    const { supabase } = await requireModulo("trafego");
    if (!input.criativoId) return { ok: false, error: "Selecione um Criativo." };

    const { error } = await supabase
      .from("anuncios_tracking")
      .update({
        data: input.data,
        semana_inicio: segundaFeiraISO(input.data),
        nome_anuncio: null,
        criativo_id: input.criativoId,
        produto_principal_id: input.produtoPrincipalId,
        order_bump_id: null,
        investimento: input.investimento,
        visualizacoes: input.visualizacoes,
        cliques: input.cliques,
        vendas_principal: input.vendasPrincipal,
        vendas_order_bump: somaVendasOrderBump(input.orderBumpVendas),
        receita_bruta: input.receitaBruta,
        taxa_percentual: input.taxaPercentual,
        taxa_fixa: input.taxaFixa,
      })
      .eq("id", id);

    if (error) return { ok: false, error: error.message };

    const resultLinhas = await salvarOrderBumpVendas(supabase, id, input.orderBumpVendas);
    if (!resultLinhas.ok) return resultLinhas;

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
    const { supabase, companyId } = await requireModulo("trafego");

    const tipo: "imagem" | "video" | null = ehImagemPermitida(contentType) ? "imagem" : ehVideoPermitido(contentType) ? "video" : null;
    if (!tipo) return { ok: false, error: "Envie uma imagem (PNG, JPG, WEBP ou GIF) ou um vídeo (MP4, WEBM ou MOV). SVG não é permitido." };

    const extensao = nomeArquivo.includes(".") ? nomeArquivo.split(".").pop() : null;
    const caminho = `${companyId}/${anuncioId}/${Date.now()}${extensao ? `.${extensao}` : ""}`;

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
export async function salvarMetaCalendario(clienteCadastroId: string, data: string, metaLucro: number): Promise<ActionResult> {
  try {
    const { supabase } = await requireModulo("trafego");
    const { error } = await supabase
      .from("metas_calendario")
      .upsert({ cliente_cadastro_id: clienteCadastroId, data, meta_lucro: metaLucro }, { onConflict: "cliente_cadastro_id,data" });

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
export async function fecharSemana(clienteCadastroId: string, semanaInicio: string, reembolsos: number): Promise<ActionResult> {
  try {
    const { supabase } = await requireModulo("trafego");
    if (reembolsos < 0) return { ok: false, error: "O valor de reembolsos não pode ser negativo." };

    const { data: anuncios, error: erroAnuncios } = await supabase
      .from("anuncios_tracking")
      .select("investimento, receita_bruta, taxa_percentual, taxa_fixa, vendas_principal, vendas_order_bump")
      .eq("cliente_cadastro_id", clienteCadastroId)
      .eq("semana_inicio", semanaInicio);
    if (erroAnuncios) return { ok: false, error: erroAnuncios.message };

    const investimentoTotal = (anuncios ?? []).reduce((acc, a) => acc + Number(a.investimento), 0);
    const receitaBrutaTotal = (anuncios ?? []).reduce((acc, a) => acc + Number(a.receita_bruta), 0);
    // Lucro é sempre em cima da Receita LÍQUIDA (já descontada a taxa da
    // plataforma de cada lançamento), nunca da bruta — ver `calcularReceitaLiquida`.
    const receitaLiquidaTotal = (anuncios ?? []).reduce(
      (acc, a) =>
        acc +
        calcularReceitaLiquida(
          Number(a.receita_bruta),
          Number(a.taxa_percentual),
          Number(a.taxa_fixa),
          Number(a.vendas_principal) + Number(a.vendas_order_bump)
        ),
      0
    );
    const lucroLiquidoReal = receitaLiquidaTotal - investimentoTotal - reembolsos;

    const { error } = await supabase.from("fechamentos_semanais").upsert(
      {
        cliente_cadastro_id: clienteCadastroId,
        semana_inicio: semanaInicio,
        semana_fim: domingoISO(semanaInicio),
        receita_bruta_total: receitaBrutaTotal,
        receita_liquida_total: receitaLiquidaTotal,
        investimento_total: investimentoTotal,
        reembolsos,
        lucro_liquido_real: lucroLiquidoReal,
        fechado_em: new Date().toISOString(),
      },
      { onConflict: "cliente_cadastro_id,semana_inicio" }
    );

    if (error) return { ok: false, error: error.message };
    revalidatePath(PATH);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Erro desconhecido." };
  }
}

// ----------------------------------------------------------------------------
// Taxa Padrão da Plataforma — um valor por cliente que pré-preenche todo
// NOVO lançamento de anúncio (ver `AnuncioModal`), editável a qualquer
// momento aqui na aba Produtos. Upsert por `cliente_cadastro_id` — cadastrar
// de novo só atualiza o valor existente.
// ----------------------------------------------------------------------------
export async function salvarTaxaPadrao(clienteCadastroId: string, taxaPercentual: number, taxaFixa: number): Promise<ActionResult> {
  try {
    const { supabase } = await requireModulo("trafego");
    if (taxaPercentual < 0 || taxaFixa < 0) return { ok: false, error: "A taxa não pode ser negativa." };

    const { error } = await supabase
      .from("infoprodutos_taxas_padrao")
      .upsert(
        { cliente_cadastro_id: clienteCadastroId, taxa_percentual: taxaPercentual, taxa_fixa: taxaFixa },
        { onConflict: "company_id,cliente_cadastro_id" }
      );

    if (error) return { ok: false, error: error.message };
    revalidatePath(PATH);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Erro desconhecido." };
  }
}
