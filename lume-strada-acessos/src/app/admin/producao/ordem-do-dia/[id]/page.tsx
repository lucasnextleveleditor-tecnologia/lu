import Link from "next/link";
import { notFound } from "next/navigation";
import { requireModuloOuRedirect } from "@/lib/auth/requireAdmin";
import { getBrandingConfig } from "@/lib/branding/getBrandingConfig";
import { getNomeApp } from "@/lib/branding/getNomeApp";
import { getDictionary } from "@/lib/i18n/getDictionary";
import { buscarOrdemDoDia, opcoesDoEditor } from "../data";
import { FolhaOrdemDoDia } from "@/components/admin/producao/ordem-do-dia/FolhaOrdemDoDia";
import { IconChevronLeft } from "@/components/ui/icons";

export const dynamic = "force-dynamic";

export default async function OrdemDoDiaPage({ params }: { params: Promise<{ id: string }> }) {
  await requireModuloOuRedirect("producao");
  const { id } = await params;

  const [dados, opcoes, branding, nomeApp, { dict }] = await Promise.all([
    buscarOrdemDoDia(id),
    opcoesDoEditor(),
    getBrandingConfig(),
    getNomeApp(),
    getDictionary(),
  ]);

  if (!dados) notFound();

  return (
    <div>
      <Link
        href="/admin/producao/ordem-do-dia"
        className="mb-5 inline-flex items-center gap-1.5 text-xs text-ink-muted transition hover:text-ink-secondary print:hidden"
      >
        <IconChevronLeft className="h-3.5 w-3.5" />
        {dict.ordemDoDia.tituloPagina}
      </Link>

      <FolhaOrdemDoDia
        dados={dados}
        clientes={opcoes.clientes}
        equipeCadastro={opcoes.equipe}
        logoUrl={branding.logo_dark_url ?? branding.logo_url}
        nomeApp={nomeApp}
      />
    </div>
  );
}
