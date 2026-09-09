import Link from "next/link";
import { notFound } from "next/navigation";
import { requireEquipeOuRedirect } from "@/lib/auth/requireAdmin";
import { getDictionary } from "@/lib/i18n/getDictionary";
import { buscarMapa } from "../data";
import { EditorDoMapa } from "@/components/admin/mapas/EditorDoMapa";
import { IconChevronLeft } from "@/components/ui/icons";

export const dynamic = "force-dynamic";

export default async function MapaPage({ params }: { params: Promise<{ id: string }> }) {
  const { nome } = await requireEquipeOuRedirect();
  const { id } = await params;
  const [dados, { dict }] = await Promise.all([buscarMapa(id), getDictionary()]);

  if (!dados) notFound();

  return (
    // Altura fixa e não a da página: um canvas que cresce com o conteúdo
    // faria a página inteira rolar por baixo do mapa. Aqui o mapa tem o
    // tamanho da janela e a rolagem acontece dentro dele, com zoom e arrasto.
    <div className="flex h-[calc(100vh-8rem)] flex-col">
      <Link
        href="/admin/mapas"
        className="mb-3 inline-flex w-fit items-center gap-1.5 text-xs text-ink-muted transition hover:text-ink-secondary"
      >
        <IconChevronLeft className="h-3.5 w-3.5" />
        {dict.mapaMental.voltar}
      </Link>

      <div className="min-h-0 flex-1">
        <EditorDoMapa dados={dados} meuNome={nome} />
      </div>
    </div>
  );
}
