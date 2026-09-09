"use server";

import { revalidatePath } from "next/cache";
import { requireModulo } from "@/lib/auth/requireAdmin";
import type { CampoAssinaturaRow, SignatarioRow, TipoCampo } from "@/lib/types/assinatura";
import { gerarDocumentoAssinado } from "@/lib/pdf/gerarDocumentoAssinado";
import { getNomeApp } from "@/lib/branding/getNomeApp";

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

/**
 * Manda o documento para assinatura.
 *
 * Confere ANTES de mudar o status: sem signatário não há para quem mandar;
 * sem e-mail não há como identificar quem assinou; e um signatário sem
 * nenhum campo marcado assinaria um documento onde a assinatura dele não
 * apareceria em lugar nenhum — o erro mais fácil de cometer e o mais chato
 * de descobrir depois, com o contrato já na mão do cliente.
 */
export async function enviarParaAssinatura(id: string): Promise<Resultado> {
  try {
    const { supabase, companyId } = await requireModulo("orcamentos");

    const [{ data: signatarios }, { data: campos }] = await Promise.all([
      supabase.from("assinatura_signatarios").select("id, nome, email").eq("documento_id", id),
      supabase.from("assinatura_campos").select("signatario_id").eq("documento_id", id),
    ]);

    const lista = (signatarios ?? []) as { id: string; nome: string; email: string }[];
    if (lista.length === 0) return { ok: false, error: "Adicione pelo menos um signatário." };

    const semEmail = lista.find((s) => !s.email?.trim());
    if (semEmail) return { ok: false, error: `Falta o e-mail de ${semEmail.nome || "um dos signatários"}.` };

    const comCampo = new Set(((campos ?? []) as { signatario_id: string }[]).map((c) => c.signatario_id));
    const semCampo = lista.find((s) => !comCampo.has(s.id));
    if (semCampo) {
      return { ok: false, error: `Marque onde ${semCampo.nome || semCampo.email} assina antes de enviar.` };
    }

    const agora = new Date().toISOString();
    const { error } = await supabase
      .from("assinatura_documentos")
      .update({ status: "enviado", enviado_em: agora, atualizado_em: agora })
      .eq("id", id);
    if (error) return { ok: false, error: error.message };

    await supabase.from("assinatura_eventos").insert({
      company_id: companyId,
      documento_id: id,
      tipo: "enviado",
      descricao: `Enviado para ${lista.length} ${lista.length === 1 ? "signatário" : "signatários"}`,
    });

    revalidatePath(`${ROTA}/${id}`);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Erro desconhecido." };
  }
}

/** Volta o documento para rascunho — para corrigir um campo mal posicionado antes que alguém assine. */
export async function voltarParaRascunho(id: string): Promise<Resultado> {
  try {
    const { supabase } = await requireModulo("orcamentos");

    const { data: assinados } = await supabase
      .from("assinatura_signatarios")
      .select("id")
      .eq("documento_id", id)
      .eq("status", "assinado");

    // Alguém já assinou: mexer no documento agora invalidaria a assinatura
    // dessa pessoa, que assinou OUTRO arquivo. Não se desfaz.
    if ((assinados ?? []).length > 0) {
      return { ok: false, error: "Alguém já assinou. Cancele e crie um novo documento em vez de alterar este." };
    }

    const { error } = await supabase.from("assinatura_documentos").update({ status: "rascunho" }).eq("id", id);
    if (error) return { ok: false, error: error.message };
    revalidatePath(`${ROTA}/${id}`);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Erro desconhecido." };
  }
}

/**
 * Refaz o PDF carimbado.
 *
 * A geração normal acontece no fim da requisição de quem assinou por último
 * — e é justamente ali que ela pode falhar (Storage fora do ar, arquivo
 * grande, tempo estourado) sem que ninguém da agência esteja olhando. Sem
 * este botão, o documento ficaria concluído para sempre sem via final, e a
 * única saída seria refazer tudo com o cliente.
 *
 * Refazer é seguro: a função sobrescreve o mesmo caminho a partir do
 * original, que nunca é alterado — o resultado é idêntico ao que teria sido
 * gerado na hora.
 */
export async function regerarDocumentoAssinado(id: string): Promise<Resultado> {
  try {
    const { supabase } = await requireModulo("orcamentos");

    // A leitura passa pelo RLS de propósito: é ela que garante que o id é de
    // um documento da própria empresa antes de a geração rodar com Service
    // Role, que não confere empresa nenhuma.
    const { data: documento } = await supabase
      .from("assinatura_documentos")
      .select("id, status")
      .eq("id", id)
      .maybeSingle<{ id: string; status: string }>();
    if (!documento) return { ok: false, error: "Documento não encontrado." };
    if (documento.status !== "assinado") {
      return { ok: false, error: "O PDF final só existe depois que todos assinarem." };
    }

    const resultado = await gerarDocumentoAssinado(id, await getNomeApp());
    if (!resultado.ok) return { ok: false, error: resultado.error };

    revalidatePath(`${ROTA}/${id}`);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Erro desconhecido." };
  }
}
