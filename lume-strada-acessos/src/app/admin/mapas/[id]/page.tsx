import { notFound } from "next/navigation";
import { requireEquipeOuRedirect } from "@/lib/auth/requireAdmin";
import { buscarMapa } from "../data";
import { EditorDoMapa } from "@/components/admin/mapas/EditorDoMapa";

export const dynamic = "force-dynamic";

export default async function MapaPage({ params }: { params: Promise<{ id: string }> }) {
  const { nome } = await requireEquipeOuRedirect();
  const { id } = await params;
  const dados = await buscarMapa(id);

  if (!dados) notFound();

  return (
    // Altura fixa e não a da página: um canvas que cresce com o conteúdo
    // faria a página inteira rolar por baixo do mapa. Aqui o mapa tem o
    // tamanho da janela e a rolagem acontece dentro dele, com zoom e arrasto.
    <div className="flex h-[calc(100vh-8rem)] flex-col">
      <EditorDoMapa dados={dados} meuNome={nome} />
    </div>
  );
}
