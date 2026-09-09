import { NextResponse } from "next/server";
import { buscarPorToken } from "@/app/assinar/acesso";
import { createAdminClient } from "@/lib/supabase/admin";
import { nomeDeArquivo, respostaPdf } from "@/lib/pdf/entregarPdf";

export const dynamic = "force-dynamic";

/**
 * A via de quem assinou.
 *
 * Sem login, como toda a rota `/assinar` — o que abre a porta é o token, que
 * é único por pessoa e só vale enquanto o documento não foi cancelado
 * (`buscarPorToken` já recusa rascunho e cancelado).
 *
 * Enquanto faltar alguém assinar, o que se baixa é o original: é o texto que
 * a pessoa leu. Assim que o documento fecha, passa a entregar o carimbado,
 * com o manifesto de autenticidade no fim — a via que ela guarda.
 */
export async function GET(_request: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;

  const acesso = await buscarPorToken(token);
  if (!acesso) return NextResponse.json({ error: "Link inválido." }, { status: 404 });

  const { documento } = acesso;
  const assinado = documento.status === "assinado" ? documento.arquivo_assinado_path : null;
  const caminho = assinado ?? documento.arquivo_path;

  const admin = createAdminClient();
  const { data: arquivo } = await admin.storage.from("assinaturas").download(caminho);
  if (!arquivo) return NextResponse.json({ error: "Arquivo indisponível." }, { status: 404 });

  return respostaPdf(await arquivo.arrayBuffer(), nomeDeArquivo(documento.titulo, assinado !== null));
}
