import Link from "next/link";
import { IconChevronLeft } from "@/components/ui/icons";
import { ContratoBuilder } from "@/components/admin/contratos/ContratoBuilder";
import { getDictionary } from "@/lib/i18n/getDictionary";
import { buscarDadosConstrutorContrato, buscarContratoPorId } from "@/app/admin/contratos/data";
import { getNomeApp } from "@/lib/branding/getNomeApp";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditarContratoPage({ params }: PageProps) {
  const { id } = await params;
  const { dict } = await getDictionary();
  const [{ clientes, tiposContrato, orcamentosParaVincular }, contrato, nomeEmpresa] = await Promise.all([buscarDadosConstrutorContrato(), buscarContratoPorId(id), getNomeApp()]);

  return (
    <div className="space-y-6">
      <div>
        <Link href={`/admin/contratos/${id}`} className="mb-3 inline-flex items-center gap-1 text-xs font-medium text-ink-muted transition hover:text-ink-primary">
          <IconChevronLeft className="h-3.5 w-3.5" />
          {dict.contratos.voltarParaContratos}
        </Link>
        <h1 className="text-lg font-semibold tracking-tight">{dict.orcamentos.editarBtn}</h1>
      </div>

      <ContratoBuilder nomeEmpresa={nomeEmpresa} clientes={clientes} tiposContrato={tiposContrato} orcamentosParaVincular={orcamentosParaVincular} contratoParaEditar={contrato} />
    </div>
  );
}
