import { NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { requireEquipe } from "@/lib/auth/requireAdmin";
import { getNomeApp } from "@/lib/branding/getNomeApp";
import { buscarMapa } from "@/app/admin/mapas/data";
import { urlImagemMapa } from "@/lib/mapa-mental/imagem";
import { MapaPdfDocument } from "@/lib/pdf/MapaPdfDocument";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * PDF vetorial de um mapa mental.
 *
 * Protegido por `requireEquipe` e, dentro de `buscarMapa`, pelo RLS por
 * empresa — um id de outra empresa devolve `null` e vira 404, nunca o PDF
 * alheio. Mesmo padrão de `api/orcamentos/[id]/pdf`.
 */
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireEquipe();
  } catch {
    return new NextResponse("Não autorizado.", { status: 401 });
  }

  const { id } = await params;
  const [dados, nomeApp] = await Promise.all([buscarMapa(id), getNomeApp()]);

  if (!dados) return new NextResponse("Mapa não encontrado.", { status: 404 });

  const imagens: Record<string, string> = {};
  for (const no of dados.nos) {
    const url = urlImagemMapa(no.imagem_path);
    if (url) imagens[no.id] = url;
  }

  const buffer = await renderToBuffer(
    <MapaPdfDocument
      titulo={dados.mapa.titulo}
      nomeApp={nomeApp}
      nos={dados.nos}
      imagens={imagens}
      gerarEm={new Date().toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })}
    />
  );

  // Nome de arquivo a partir do título, sem acento nem barra — um nome com
  // "/" quebra o download em alguns navegadores.
  const nomeArquivo =
    (dados.mapa.titulo || "mapa-mental")
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-zA-Z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .toLowerCase()
      .slice(0, 60) || "mapa-mental";

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${nomeArquivo}.pdf"`,
    },
  });
}
