import Link from "next/link";
import { IconChevronLeft } from "@/components/ui/icons";
import { OrcamentoDetalhe } from "@/components/admin/orcamentos/OrcamentoDetalhe";
import { getDictionary } from "@/lib/i18n/getDictionary";
import { buscarOrcamentoPorId } from "@/app/admin/orcamentos/data";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function OrcamentoDetalhePage({ params }: PageProps) {
  const { id } = await params;
  const { dict } = await getDictionary();
  const orcamento = await buscarOrcamentoPorId(id);

  return (
    <div className="space-y-4">
      <Link href="/admin/orcamentos" className="inline-flex items-center gap-1 text-xs font-medium text-ink-muted transition hover:text-ink-primary print:hidden">
        <IconChevronLeft className="h-3.5 w-3.5" />
        {dict.orcamentos.voltarParaOrcamentos}
      </Link>

      <OrcamentoDetalhe orcamento={orcamento} />
    </div>
  );
}
