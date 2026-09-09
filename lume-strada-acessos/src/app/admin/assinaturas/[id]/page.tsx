import Link from "next/link";
import { notFound } from "next/navigation";
import { requireModuloOuRedirect } from "@/lib/auth/requireAdmin";
import { buscarDocumento } from "../data";
import { EditorDeCampos } from "@/components/admin/assinaturas/EditorDeCampos";
import { IconChevronLeft } from "@/components/ui/icons";

export const dynamic = "force-dynamic";

export default async function DocumentoPage({ params }: { params: Promise<{ id: string }> }) {
  await requireModuloOuRedirect("orcamentos");
  const { id } = await params;
  const dados = await buscarDocumento(id);
  if (!dados) notFound();

  return (
    // Altura da janela: o documento rola DENTRO da área, não a página inteira
    // por baixo dele — senão o painel de signatários sairia da tela junto.
    <div className="-mx-3 -mb-4 flex h-[calc(100vh-6.5rem)] flex-col sm:-mx-5">
      <Link
        href="/admin/assinaturas"
        className="mb-3 inline-flex w-fit items-center gap-1.5 px-3 text-xs text-ink-muted transition hover:text-ink-secondary sm:px-5"
      >
        <IconChevronLeft className="h-3.5 w-3.5" />
        Assinatura de PDF
      </Link>

      <div className="min-h-0 flex-1 px-3 sm:px-5">
        <EditorDeCampos dados={dados} urlArquivo={dados.urlArquivo} />
      </div>
    </div>
  );
}
