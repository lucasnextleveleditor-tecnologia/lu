"use server";

import { revalidatePath } from "next/cache";
import { requireModulo, requireAdmin } from "@/lib/auth/requireAdmin";
import { createAdminClient } from "@/lib/supabase/admin";
import { ehImagemPermitida, ehVideoPermitido } from "@/lib/utils/upload";
import type { TipoMidiaPortfolio } from "@/lib/types/orcamentos";

export type ActionResult = { ok: true } | { ok: false; error: string };
export type ActionResultId = { ok: true; id: string } | { ok: false; error: string };
export type UploadAssinadoPortfolioResult =
  | { ok: true; path: string; token: string; tipo: TipoMidiaPortfolio }
  | { ok: false; error: string };
export type UploadMarcaResult = { ok: true; url: string } | { ok: false; error: string };

const PATH = "/admin/orcamentos/portfolio";
const BUCKET = "orcamentos-midia";
const MARCA_TAMANHO_MAX_BYTES = 3 * 1024 * 1024; // 3MB — mesmo teto de branding (logo/banner/rodapé são imagens leves, não vídeo)

// ----------------------------------------------------------------------------
// Portfólio — itens de imagem/vídeo, cadastrados uma vez e reutilizáveis
// entre vários orçamentos (ver `orc_portfolio_itens`).
// ----------------------------------------------------------------------------

/**
 * Passo 1/2 do upload de um item de portfólio — gera uma signed upload URL
 * pro navegador subir o arquivo DIRETO pro Storage (mesmo padrão/mesmo
 * motivo de `criarUploadAssinadoCriativo` em `admin/trafego/infoprodutos-actions.ts`:
 * o corpo de uma Server Action nunca alcança os até 80MB previstos aqui — a
 * Vercel trava toda function serverless em 4.5MB de corpo). Cobre imagem E
 * vídeo com o mesmo fluxo, ao contrário de `infoprodutos` que separa
 * upload direto (imagem pequena) de signed URL (vídeo) — aqui não vale a
 * pena manter os dois caminhos só pra isso.
 */
export async function criarUploadAssinadoPortfolio(nomeArquivo: string, contentType: string): Promise<UploadAssinadoPortfolioResult> {
  try {
    const { supabase } = await requireModulo("orcamentos");

    const tipo: TipoMidiaPortfolio | null = ehImagemPermitida(contentType) ? "imagem" : ehVideoPermitido(contentType) ? "video" : null;
    if (!tipo) return { ok: false, error: "Envie uma imagem (PNG, JPG, WEBP ou GIF) ou um vídeo (MP4, WEBM ou MOV). SVG não é permitido." };

    const extensao = nomeArquivo.includes(".") ? nomeArquivo.split(".").pop() : null;
    const caminho = `portfolio/${crypto.randomUUID()}${extensao ? `.${extensao}` : ""}`;

    const { data, error } = await supabase.storage.from(BUCKET).createSignedUploadUrl(caminho);
    if (error || !data) return { ok: false, error: error?.message ?? "Não foi possível preparar o upload." };

    return { ok: true, path: caminho, token: data.token, tipo };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Erro desconhecido." };
  }
}

/** Passo 2/2 — depois que o navegador já subiu o arquivo, cria a linha do item de portfólio. */
export async function confirmarPortfolioItem(input: {
  titulo: string;
  path: string;
  tipo: TipoMidiaPortfolio;
  categoriaProfissao: string | null;
}): Promise<ActionResultId> {
  try {
    const { supabase } = await requireModulo("orcamentos");
    if (!input.titulo.trim()) return { ok: false, error: "Dê um título pro item antes de salvar." };

    const { data, error } = await supabase
      .from("orc_portfolio_itens")
      .insert({
        titulo: input.titulo.trim(),
        tipo_midia: input.tipo,
        path: input.path,
        categoria_profissao: input.categoriaProfissao,
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

export async function atualizarPortfolioItem(id: string, input: { titulo: string; categoriaProfissao: string | null }): Promise<ActionResult> {
  try {
    const { supabase } = await requireModulo("orcamentos");
    if (!input.titulo.trim()) return { ok: false, error: "Informe um título." };

    const { error } = await supabase
      .from("orc_portfolio_itens")
      .update({ titulo: input.titulo.trim(), categoria_profissao: input.categoriaProfissao })
      .eq("id", id);

    if (error) return { ok: false, error: error.message };
    revalidatePath(PATH);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Erro desconhecido." };
  }
}

/** Apaga o arquivo do Storage antes da linha, pra não deixar arquivo órfão no bucket — mesmo padrão de `removerAnuncio`/`removerCriativo`. */
export async function removerPortfolioItem(id: string): Promise<ActionResult> {
  try {
    const { supabase } = await requireModulo("orcamentos");

    const { data: item } = await supabase.from("orc_portfolio_itens").select("path").eq("id", id).single();
    if (item?.path) {
      await supabase.storage.from(BUCKET).remove([item.path]);
    }

    const { error } = await supabase.from("orc_portfolio_itens").delete().eq("id", id);
    if (error) return { ok: false, error: error.message };
    revalidatePath(PATH);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Erro desconhecido." };
  }
}

/**
 * Substitui por completo a seleção de itens de Portfólio anexados a um
 * orçamento (apaga e recria, mesmo padrão de `salvarOrderBumpVendas` em
 * `admin/trafego/infoprodutos-actions.ts`) — mais simples que diffar uma
 * lista curta, e um vínculo de portfólio não carrega estado próprio que
 * precisasse sobreviver entre chamadas.
 */
export async function salvarPortfolioDoOrcamento(orcamentoId: string, portfolioItemIds: string[]): Promise<ActionResult> {
  try {
    const { supabase } = await requireModulo("orcamentos");

    const { error: erroLimpar } = await supabase.from("orc_orcamento_portfolio").delete().eq("orcamento_id", orcamentoId);
    if (erroLimpar) return { ok: false, error: erroLimpar.message };

    if (portfolioItemIds.length > 0) {
      const { error: erroInserir } = await supabase
        .from("orc_orcamento_portfolio")
        .insert(portfolioItemIds.map((portfolioItemId, index) => ({ orcamento_id: orcamentoId, portfolio_item_id: portfolioItemId, ordem: index })));
      if (erroInserir) return { ok: false, error: erroInserir.message };
    }

    revalidatePath("/admin/orcamentos");
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Erro desconhecido." };
  }
}

// ----------------------------------------------------------------------------
// Marca da agência (logo/banner/rodapé) — POR EMPRESA, escrita via Service
// Role. Mesmo precedente/mesma justificativa de `atualizarNomeApp` em
// `admin/aparencia/actions.ts`: `companies` só tem policy de UPDATE pra
// super_admin (de propósito — ver `multitenant-migration.sql`), então a
// Service Role escreve só as 3 colunas `orc_*`, travada na PRÓPRIA empresa
// de quem chama via `.eq("id", companyId)` (vindo de `requireAdmin()`,
// nunca do client). `requireAdmin()` (não `requireModulo`) de propósito:
// identidade visual da agência não é delegável por permissão de
// funcionário, mesma regra já aplicada em Aparência.
// ----------------------------------------------------------------------------
export type CampoMarcaOrcamento = "orc_logo_path" | "orc_banner_path" | "orc_rodape_path";

export async function uploadMarcaOrcamento(campo: CampoMarcaOrcamento, formData: FormData): Promise<UploadMarcaResult> {
  try {
    const { companyId } = await requireAdmin();
    const file = formData.get("file");

    if (!(file instanceof File) || file.size === 0) return { ok: false, error: "Selecione um arquivo." };
    if (file.size > MARCA_TAMANHO_MAX_BYTES) return { ok: false, error: "Arquivo muito grande (máximo 3MB)." };
    if (!ehImagemPermitida(file.type)) return { ok: false, error: "Envie um arquivo de imagem (PNG, JPG, WEBP ou GIF). SVG não é permitido." };

    const extensao = file.name.split(".").pop()?.toLowerCase() || "png";
    const caminho = `marca/${companyId}/${campo}-${Date.now()}.${extensao}`;

    const admin = createAdminClient();
    const { error: erroUpload } = await admin.storage.from(BUCKET).upload(caminho, file, { upsert: true, contentType: file.type });
    if (erroUpload) return { ok: false, error: erroUpload.message };

    const { data: urlData } = admin.storage.from(BUCKET).getPublicUrl(caminho);

    const { error: erroUpdate } = await admin.from("companies").update({ [campo]: caminho }).eq("id", companyId);
    if (erroUpdate) return { ok: false, error: erroUpdate.message };

    revalidatePath(PATH);
    return { ok: true, url: urlData.publicUrl };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Erro desconhecido." };
  }
}

/** Desvincula um asset (logo/banner/rodapé volta a "sem imagem") sem apagar o arquivo do bucket — mesmo raciocínio de `removerBrandingAsset`. */
export async function removerMarcaOrcamento(campo: CampoMarcaOrcamento): Promise<ActionResult> {
  try {
    const { companyId } = await requireAdmin();
    const admin = createAdminClient();
    const { error } = await admin.from("companies").update({ [campo]: null }).eq("id", companyId);
    if (error) return { ok: false, error: error.message };
    revalidatePath(PATH);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Erro desconhecido." };
  }
}

/**
 * Salva o texto institucional (apresentação da empresa + lista de clientes
 * atendidos + mensagem de encerramento/agradecimento) exibido na proposta
 * (capa do PDF, ver `OrcamentoPdfDocument.tsx`, e página pública, ver
 * `OrcamentoPropostaPreview.tsx`) — mesmo padrão de Service Role/`requireAdmin()`
 * de `uploadMarcaOrcamento` acima (`companies` só tem policy de UPDATE pra
 * super_admin). Diferente dos campos de upload (que salvam sozinhos ao trocar
 * o arquivo), aqui é texto livre digitado à mão — precisa de um botão
 * "Salvar" explícito no form (`MarcaApresentacaoCard.tsx`, dentro do próprio
 * construtor de orçamento — não vive mais numa aba separada).
 */
export async function salvarInstitucionalOrcamento(input: { textoInstitucional: string; clientesAtendidos: string; textoEncerramento: string }): Promise<ActionResult> {
  try {
    const { companyId } = await requireAdmin();
    const admin = createAdminClient();
    const { error } = await admin
      .from("companies")
      .update({
        orc_texto_institucional: input.textoInstitucional.trim() || null,
        orc_clientes_atendidos: input.clientesAtendidos.trim() || null,
        orc_texto_encerramento: input.textoEncerramento.trim() || null,
      })
      .eq("id", companyId);
    if (error) return { ok: false, error: error.message };
    revalidatePath(PATH);
    revalidatePath("/admin/orcamentos");
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Erro desconhecido." };
  }
}
