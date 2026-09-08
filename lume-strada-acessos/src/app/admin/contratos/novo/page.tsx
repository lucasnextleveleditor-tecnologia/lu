import Link from "next/link";
import { IconChevronLeft } from "@/components/ui/icons";
import { ContratoBuilder } from "@/components/admin/contratos/ContratoBuilder";
import { getDictionary } from "@/lib/i18n/getDictionary";
import { buscarDadosConstrutorContrato } from "@/app/admin/contratos/data";
import { getNomeApp } from "@/lib/branding/getNomeApp";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{ orcamentoId?: string }>;
}

/**
 * Novo contrato — o construtor cobre os dois jeitos de nascer: a partir de
 * um orçamento já aprovado (pré-seleciona a opção quando a URL chega com
 * `?orcamentoId=`, ex: vindo do botão "Gerar Contrato" no orçamento) ou
 * avulso, deixando o campo de origem em branco.
 */
export default async function NovoContratoPage({ searchParams }: PageProps) {
  const { orcamentoId } = await searchParams;
  const { dict } = await getDictionary();
  const [{ clientes, tiposContrato, orcamentosParaVincular, empresa }, nomeEmpresa] = await Promise.all([buscarDadosConstrutorContrato(), getNomeApp()]);

  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/contratos" className="mb-3 inline-flex items-center gap-1 text-xs font-medium text-ink-muted transition hover:text-ink-primary">
          <IconChevronLeft className="h-3.5 w-3.5" />
          {dict.contratos.voltarParaContratos}
        </Link>
        <h1 className="text-lg font-semibold tracking-tight">{dict.contratos.novoContratoBtn}</h1>
      </div>

      <ContratoBuilder nomeEmpresa={nomeEmpresa} empresa={empresa} clientes={clientes} tiposContrato={tiposContrato} orcamentosParaVincular={orcamentosParaVincular} orcamentoIdInicial={orcamentoId} />
    </div>
  );
}
