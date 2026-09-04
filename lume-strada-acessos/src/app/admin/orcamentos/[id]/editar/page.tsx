import Link from "next/link";
import { IconChevronLeft } from "@/components/ui/icons";
import { OrcamentoBuilder } from "@/components/admin/orcamentos/OrcamentoBuilder";
import { getDictionary } from "@/lib/i18n/getDictionary";
import { buscarDadosConstrutor, buscarOrcamentoPorId } from "@/app/admin/orcamentos/data";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditarOrcamentoPage({ params }: PageProps) {
  const { id } = await params;
  const { dict } = await getDictionary();
  const [{ categorias, servicosComCategoria, clientes }, orcamento] = await Promise.all([buscarDadosConstrutor(), buscarOrcamentoPorId(id)]);

  return (
    <div className="space-y-6">
      <div>
        <Link href={`/admin/orcamentos/${id}`} className="mb-3 inline-flex items-center gap-1 text-xs font-medium text-ink-muted transition hover:text-ink-primary">
          <IconChevronLeft className="h-3.5 w-3.5" />
          {dict.orcamentos.voltarParaOrcamentos}
        </Link>
        <h1 className="text-lg font-semibold tracking-tight">{dict.orcamentos.editarBtn}</h1>
      </div>

      <OrcamentoBuilder categorias={categorias} servicosComCategoria={servicosComCategoria} clientes={clientes} orcamentoParaEditar={orcamento} />
    </div>
  );
}
