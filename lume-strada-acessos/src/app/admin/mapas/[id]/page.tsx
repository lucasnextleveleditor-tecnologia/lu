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
    // faria a página inteira rolar por baixo do mapa. Aqui o mapa ocupa quase
    // toda a janela — as margens laterais do painel são anuladas com margem
    // negativa, porque num quadro de ideias cada centímetro de tela vale, e a
    // rolagem acontece DENTRO do mapa, com zoom e arrasto.
    <div className="-mx-3 -mb-4 -mt-2 flex h-[calc(100vh-6rem)] flex-col sm:-mx-5">
      <EditorDoMapa dados={dados} meuNome={nome} />
    </div>
  );
}
