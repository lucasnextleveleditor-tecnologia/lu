import { NextResponse } from "next/server";
import { requireModulo } from "@/lib/auth/requireAdmin";
import { createAdminClient } from "@/lib/supabase/admin";
import type { AssinaturaDocumentoRow } from "@/lib/types/assinatura";
import { nomeDeArquivo, respostaPdf } from "@/lib/pdf/entregarPdf";

export const dynamic = "force-dynamic";

/**
 * Baixa o PDF de um documento — para quem é da agência.
 *
 * A autorização vem da consulta feita com a sessão de quem chama: o RLS de
 * `assinatura_documentos` já limita à própria empresa, então um id de outra
 * agência simplesmente não devolve linha e a rota responde 404. Só DEPOIS
 * disso o arquivo é lido com Service Role, porque o bucket é privado.
 *
 * Por padrão entrega o assinado quando ele existe; `?original=1` força o
 * arquivo como foi enviado — é dele que saiu o hash, e é ele que se
 * apresenta quando alguém quer conferir que o texto não mudou.
 */
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  let supabase;
  try {
    ({ supabase } = await requireModulo("orcamentos"));
  } catch {
    return NextResponse.json({ error: "Sem permissão." }, { status: 403 });
  }

  const { data: documento } = await supabase
    .from("assinatura_documentos")
    .select("*")
    .eq("id", id)
    .maybeSingle<AssinaturaDocumentoRow>();
  if (!documento) return NextResponse.json({ error: "Documento não encontrado." }, { status: 404 });

  const querOriginal = new URL(request.url).searchParams.get("original") === "1";
  const assinado = !querOriginal && documento.arquivo_assinado_path ? documento.arquivo_assinado_path : null;
  const caminho = assinado ?? documento.arquivo_path;

  const admin = createAdminClient();
  const { data: arquivo } = await admin.storage.from("assinaturas").download(caminho);
  if (!arquivo) return NextResponse.json({ error: "Arquivo indisponível." }, { status: 404 });

  return respostaPdf(await arquivo.arrayBuffer(), nomeDeArquivo(documento.titulo, assinado !== null));
}
