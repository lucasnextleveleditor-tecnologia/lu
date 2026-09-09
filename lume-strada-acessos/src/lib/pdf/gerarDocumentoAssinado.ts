import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import type {
  AssinaturaDocumentoRow,
  CampoAssinaturaRow,
  EventoAssinaturaRow,
  SignatarioRow,
} from "@/lib/types/assinatura";
import { carimbarAssinaturas, hashDeBytes } from "./carimbarAssinaturas";

/**
 * Gera (ou regenera) o PDF final de um documento e guarda no Storage.
 *
 * Roda com Service Role porque é chamada logo depois da última assinatura —
 * e quem assinou não tem conta no sistema. O `documentoId` nunca vem do
 * navegador nessas chamadas: vem do documento que o token abriu.
 *
 * É idempotente: rodar de novo sobrescreve o arquivo final com o mesmo
 * conteúdo. Isso importa porque a geração acontece no fim de uma requisição
 * de quem está assinando — se algo falhar ali, o painel pode mandar refazer
 * sem duplicar nada.
 */
export async function gerarDocumentoAssinado(
  documentoId: string,
  nomeApp: string
): Promise<{ ok: true; caminho: string } | { ok: false; error: string }> {
  const admin = createAdminClient();

  const { data: documento } = await admin
    .from("assinatura_documentos")
    .select("*")
    .eq("id", documentoId)
    .maybeSingle<AssinaturaDocumentoRow>();
  if (!documento) return { ok: false, error: "Documento não encontrado." };

  const [signRes, camposRes, eventosRes, arquivoRes] = await Promise.all([
    admin.from("assinatura_signatarios").select("*").eq("documento_id", documentoId).order("ordem"),
    admin.from("assinatura_campos").select("*").eq("documento_id", documentoId).order("pagina"),
    admin.from("assinatura_eventos").select("*").eq("documento_id", documentoId).order("created_at"),
    admin.storage.from("assinaturas").download(documento.arquivo_path),
  ]);

  if (!arquivoRes.data) return { ok: false, error: "Não consegui ler o arquivo original." };

  try {
    const bytes = await carimbarAssinaturas({
      original: await arquivoRes.data.arrayBuffer(),
      documento,
      signatarios: (signRes.data ?? []) as SignatarioRow[],
      campos: (camposRes.data ?? []) as CampoAssinaturaRow[],
      eventos: (eventosRes.data ?? []) as EventoAssinaturaRow[],
      nomeApp,
    });

    // Caminho derivado do original, com sufixo — fica evidente, só de olhar
    // o Storage, qual arquivo é o assinado e de qual original ele veio.
    const caminho = documento.arquivo_path.replace(/\.pdf$/i, "") + "-assinado.pdf";

    const { error } = await admin.storage
      .from("assinaturas")
      .upload(caminho, bytes, { contentType: "application/pdf", upsert: true });
    if (error) return { ok: false, error: error.message };

    await admin
      .from("assinatura_documentos")
      .update({
        arquivo_assinado_path: caminho,
        hash_assinado: await hashDeBytes(bytes),
        assinado_gerado_em: new Date().toISOString(),
      })
      .eq("id", documentoId);

    return { ok: true, caminho };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Não consegui montar o PDF assinado." };
  }
}
