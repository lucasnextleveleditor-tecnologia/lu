import "server-only";
import { createClient } from "@/lib/supabase/server";
import type {
  AssinaturaDocumentoRow,
  EventoAssinaturaRow,
  CampoAssinaturaRow,
  DocumentoCompleto,
  SignatarioRow,
} from "@/lib/types/assinatura";

/** Documentos da empresa, com a contagem de quem já assinou. O RLS já limita à empresa. */
export async function listarDocumentos(
  arquivados = false
): Promise<(AssinaturaDocumentoRow & { total_signatarios: number; assinados: number })[]> {
  const supabase = await createClient();
  const [docsRes, signRes] = await Promise.all([
    supabase
      .from("assinatura_documentos")
      .select("*")
      .eq("arquivado", arquivados)
      .order("atualizado_em", { ascending: false }),
    supabase.from("assinatura_signatarios").select("documento_id, status"),
  ]);

  // Uma consulta só para todos os signatários e a contagem somada aqui —
  // pedir por documento seriam N consultas para o que cabe numa.
  const porDoc = new Map<string, { total: number; assinados: number }>();
  for (const s of (signRes.data ?? []) as { documento_id: string; status: string }[]) {
    const atual = porDoc.get(s.documento_id) ?? { total: 0, assinados: 0 };
    atual.total += 1;
    if (s.status === "assinado") atual.assinados += 1;
    porDoc.set(s.documento_id, atual);
  }

  return ((docsRes.data ?? []) as AssinaturaDocumentoRow[]).map((d) => ({
    ...d,
    total_signatarios: porDoc.get(d.id)?.total ?? 0,
    assinados: porDoc.get(d.id)?.assinados ?? 0,
  }));
}

/**
 * Um documento inteiro, com uma URL assinada do PDF.
 *
 * O bucket é privado, então a URL nasce aqui, no servidor, com validade
 * curta — nunca um endereço fixo que continuaria abrindo o contrato depois
 * de vazar num histórico de navegador.
 */
export async function buscarDocumento(
  id: string
): Promise<(DocumentoCompleto & { eventos: EventoAssinaturaRow[]; urlArquivo: string | null }) | null> {
  const supabase = await createClient();

  const { data: documento } = await supabase
    .from("assinatura_documentos")
    .select("*")
    .eq("id", id)
    .maybeSingle<AssinaturaDocumentoRow>();
  if (!documento) return null;

  const [signRes, camposRes, eventosRes, urlRes] = await Promise.all([
    supabase.from("assinatura_signatarios").select("*").eq("documento_id", id).order("ordem"),
    supabase.from("assinatura_campos").select("*").eq("documento_id", id).order("pagina"),
    supabase.from("assinatura_eventos").select("*").eq("documento_id", id).order("created_at"),
    supabase.storage.from("assinaturas").createSignedUrl(documento.arquivo_path, 60 * 60),
  ]);

  return {
    documento,
    signatarios: (signRes.data ?? []) as SignatarioRow[],
    campos: (camposRes.data ?? []) as CampoAssinaturaRow[],
    eventos: (eventosRes.data ?? []) as EventoAssinaturaRow[],
    urlArquivo: urlRes.data?.signedUrl ?? null,
  };
}
