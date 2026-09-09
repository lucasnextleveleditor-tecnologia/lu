import Link from "next/link";
import { IconChevronLeft } from "@/components/ui/icons";
import { ContratoDetalhe } from "@/components/admin/contratos/ContratoDetalhe";
import { calcularTotalContrato } from "@/lib/types/contratos";
import { getDictionary } from "@/lib/i18n/getDictionary";
import { buscarContratoPorId } from "@/app/admin/contratos/data";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ContratoDetalhePage({ params }: PageProps) {
  const { id } = await params;
  const { dict } = await getDictionary();
  const contrato = await buscarContratoPorId(id);

  return (
    <div className="space-y-6">
      <Link href="/admin/contratos/lista" className="inline-flex items-center gap-1 text-xs font-medium text-ink-muted transition hover:text-ink-primary">
        <IconChevronLeft className="h-3.5 w-3.5" />
        {dict.contratos.voltarParaContratos}
      </Link>

      <ContratoDetalhe contrato={{ ...contrato, total: calcularTotalContrato(contrato.itens) }} />
    </div>
  );
}
