"use server";

import { revalidatePath } from "next/cache";
import { requireModulo } from "@/lib/auth/requireAdmin";
import type { CampoAssinaturaRow, SignatarioRow, TipoCampo } from "@/lib/types/assinatura";

export type Resultado = { ok: true } | { ok: false; error: string };

const ROTA = "/admin/assinaturas";

/**
 * Prepara o envio do PDF.
 *
 * O arquivo não passa pela Server Action: ela assina o caminho e o navegador
 * envia direto ao Storage. Um contrato de 20 MB atravessando a ação gastaria
 * o dobro da banda e esbarraria no limite de corpo da requisição.
 *
 * O caminho começa SEMPRE com o id da empresa vindo do servidor — é esse
 * primeiro segmento que a política do bucket confere. Vindo do navegador,
 * bastaria trocá-lo para escrever na pasta de outra empresa.
 */
export async function prepararEnvioPdf(
  nomeArquivo: string
): Promise<{ ok: true; caminho: string; token: string } | { ok: false; error: string }> {
  try {
    const { supabase, companyId } = await requireModulo("orcamentos");
    if (!companyId) return { ok: false, error: "Sua conta não está ligada a uma empresa." };

    const seguro = nomeArquivo.replace(/[^a-zA-Z0-9._-]/g, "-").slice(-80);
    const caminho = `${companyId}/${crypto.randomUUID()}-${seguro}`;

    const { data, error } = await supabase.storage.from("assinaturas").createSignedUploadUrl(caminho);
    if (error || !data) return { ok: false, error: error?.message ?? "Não foi possível preparar o envio." };

    return { ok: true, caminho, token: data.token };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Erro desconhecido." };
  }
}

/** Registra o documento depois que o arquivo já subiu. */
export async function criarDocumento(input: {
  titulo: string;
  arquivoPath: string;
  arquivoNome: string;
  paginas: number;
  hash: string;
}): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  try {
    const { supabase, user, companyId } = await requireModulo("orcamentos");

    const { data, error } = await supabase
      .from("assinatura_documentos")
      .insert({
        titulo: input.titulo.trim() || input.arquivoNome,
        arquivo_path: input.arquivoPath,
        arquivo_nome: input.arquivoNome,
        paginas: Math.max(1, input.paginas),
        hash_original: input.hash,
        criado_por: user.id,
      })
      .select("id")
      .single<{ id: string }>();

    if (error || !data) return { ok: false, error: error?.message ?? "Não foi possível criar o documento." };

    await supabase.from("assinatura_eventos").insert({
      company_id: companyId,
      documento_id: data.id,
      tipo: "criado",
      descricao: `Documento enviado: ${input.arquivoNome}`,
    });

    revalidatePath(ROTA);
    return { ok: true, id: data.id };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Erro desconhecido." };
  }
}

export async function renomearDocumento(id: string, titulo: string): Promise<Resultado> {
  try {
    const { supabase } = await requireModulo("orcamentos");
    const { error } = await supabase
      .from("assinatura_documentos")
      .update({ titulo: titulo.trim(), atualizado_em: new Date().toISOString() })
      .eq("id", id);
    if (error) return { ok: false, error: error.message };
    revalidatePath(ROTA);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Erro desconhecido." };
  }
}

export async function definirOrdemObrigatoria(id: string, valor: boolean): Promise<Resultado> {
  try {
    const { supabase } = await requireModulo("orcamentos");
    const { error } = await supabase.from("assinatura_documentos").update({ ordem_obrigatoria: valor }).eq("id", id);
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Erro desconhecido." };
  }
}

export async function excluirDocumento(id: string): Promise<Resultado> {
  try {
    const { supabase } = await requireModulo("orcamentos");

    // O arquivo sai do Storage junto: guardar o PDF de um documento que
    // ninguém mais consegue abrir é só custo e risco.
    const { data: doc } = await supabase
      .from("assinatura_documentos")
      .select("arquivo_path")
      .eq("id", id)
      .maybeSingle<{ arquivo_path: string }>();

    const { error } = await supabase.from("assinatura_documentos").delete().eq("id", id);
    if (error) return { ok: false, error: error.message };
    if (doc?.arquivo_path) await supabase.storage.from("assinaturas").remove([doc.arquivo_path]);

    revalidatePath(ROTA);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Erro desconhecido." };
  }
}

export async function arquivarDocumento(id: string, arquivado: boolean): Promise<Resultado> {
  try {
    const { supabase } = await requireModulo("orcamentos");
    const { error } = await supabase.from("assinatura_documentos").update({ arquivado }).eq("id", id);
    if (error) return { ok: false, error: error.message };
    revalidatePath(ROTA);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Erro desconhecido." };
  }
}

// ----------------------------------------------------------------------------
// Signatários
// ----------------------------------------------------------------------------

export async function adicionarSignatario(
  documentoId: string
): Promise<{ ok: true; signatario: SignatarioRow } | { ok: false; error: string }> {
  try {
    const { supabase } = await requireModulo("orcamentos");

    const { count } = await supabase
      .from("assinatura_signatarios")
      .select("id", { count: "exact", head: true })
      .eq("documento_id", documentoId);

    const { data, error } = await supabase
      .from("assinatura_signatarios")
      .insert({ documento_id: documentoId, ordem: count ?? 0 })
      .select("*")
      .single<SignatarioRow>();

    if (error || !data) return { ok: false, error: error?.message ?? "Não foi possível adicionar o signatário." };
    return { ok: true, signatario: data };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Erro desconhecido." };
  }
}

const CAMPOS_SIGNATARIO = ["nome", "email", "documento", "papel", "ordem"] as const;

export async function salvarSignatario(
  documentoId: string,
  signatarioId: string,
  valores: Record<string, unknown>
): Promise<Resultado> {
  try {
    const { supabase } = await requireModulo("orcamentos");
    const permitidos = Object.fromEntries(
      Object.entries(valores).filter(([chave]) => (CAMPOS_SIGNATARIO as readonly string[]).includes(chave))
    );
    if (Object.keys(permitidos).length === 0) return { ok: true };

    const { error } = await supabase
      .from("assinatura_signatarios")
      .update(permitidos)
      .eq("id", signatarioId)
      .eq("documento_id", documentoId);
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Erro desconhecido." };
  }
}

export async function removerSignatario(documentoId: string, signatarioId: string): Promise<Resultado> {
  try {
    const { supabase } = await requireModulo("orcamentos");
    // Os campos daquela pessoa saem por cascata no banco.
    const { error } = await supabase
      .from("assinatura_signatarios")
      .delete()
      .eq("id", signatarioId)
      .eq("documento_id", documentoId);
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Erro desconhecido." };
  }
}

// ----------------------------------------------------------------------------
// Campos sobre as páginas
// ----------------------------------------------------------------------------

export async function adicionarCampo(
  documentoId: string,
  input: { signatarioId: string; pagina: number; tipo: TipoCampo; x: number; y: number; largura: number; altura: number }
): Promise<{ ok: true; campo: CampoAssinaturaRow } | { ok: false; error: string }> {
  try {
    const { supabase } = await requireModulo("orcamentos");

    const { data, error } = await supabase
      .from("assinatura_campos")
      .insert({
        documento_id: documentoId,
        signatario_id: input.signatarioId,
        pagina: Math.max(0, Math.floor(input.pagina)),
        tipo: input.tipo,
        // Preso entre 0 e 1: um campo com fração negativa cairia fora da
        // página no PDF final, onde não há tela para mostrar o erro.
        x: Math.min(1, Math.max(0, input.x)),
        y: Math.min(1, Math.max(0, input.y)),
        largura: Math.min(1, Math.max(0.02, input.largura)),
        altura: Math.min(1, Math.max(0.01, input.altura)),
      })
      .select("*")
      .single<CampoAssinaturaRow>();

    if (error || !data) return { ok: false, error: error?.message ?? "Não foi possível adicionar o campo." };
    return { ok: true, campo: data };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Erro desconhecido." };
  }
}

export async function moverCampo(
  documentoId: string,
  campoId: string,
  posicao: { x: number; y: number; largura?: number; altura?: number }
): Promise<Resultado> {
  try {
    const { supabase } = await requireModulo("orcamentos");
    const { error } = await supabase
      .from("assinatura_campos")
      .update({
        x: Math.min(1, Math.max(0, posicao.x)),
        y: Math.min(1, Math.max(0, posicao.y)),
        ...(posicao.largura != null ? { largura: Math.min(1, Math.max(0.02, posicao.largura)) } : {}),
        ...(posicao.altura != null ? { altura: Math.min(1, Math.max(0.01, posicao.altura)) } : {}),
      })
      .eq("id", campoId)
      .eq("documento_id", documentoId);
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Erro desconhecido." };
  }
}

export async function removerCampo(documentoId: string, campoId: string): Promise<Resultado> {
  try {
    const { supabase } = await requireModulo("orcamentos");
    const { error } = await supabase.from("assinatura_campos").delete().eq("id", campoId).eq("documento_id", documentoId);
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Erro desconhecido." };
  }
}
