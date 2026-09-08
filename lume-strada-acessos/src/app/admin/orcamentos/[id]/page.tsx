import Link from "next/link";
import { IconChevronLeft } from "@/components/ui/icons";
import { OrcamentoHub } from "@/components/admin/orcamentos/OrcamentoHub";
import { getDictionary } from "@/lib/i18n/getDictionary";
import { buscarOrcamentoPorId } from "@/app/admin/orcamentos/data";
import { buscarContratoVinculado, buscarDadosConstrutorContrato } from "@/app/admin/contratos/data";
import { getNomeApp } from "@/lib/branding/getNomeApp";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

/**
 * Hub único do orçamento — aba "Orçamento" + aba "Contrato" (`OrcamentoHub`,
 * ver comentário lá). Busca os 3 conjuntos de dados sempre em paralelo
 * (orçamento, contrato já vinculado se existir, dados de apoio do
 * construtor de contrato) — mesmo quando a aba Contrato ainda está
 * bloqueada, pra manter a lógica de fetch simples/sem condicional, custo
 * extra pequeno, mesmo padrão de outras telas do projeto que já buscam tudo
 * de uma vez.
 */
export default async function OrcamentoDetalhePage({ params }: PageProps) {
  const { id } = await params;
  const { dict } = await getDictionary();
  const [orcamento, contratoVinculado, dadosContrato, nomeEmpresa] = await Promise.all([
    buscarOrcamentoPorId(id),
    buscarContratoVinculado(id),
    buscarDadosConstrutorContrato(),
    getNomeApp(),
  ]);

  return (
    <div className="space-y-4">
      <Link href="/admin/orcamentos" className="inline-flex items-center gap-1 text-xs font-medium text-ink-muted transition hover:text-ink-primary print:hidden">
        <IconChevronLeft className="h-3.5 w-3.5" />
        {dict.orcamentos.voltarParaOrcamentos}
      </Link>

      <OrcamentoHub orcamento={orcamento} contratoVinculado={contratoVinculado} dadosContrato={dadosContrato} nomeEmpresa={nomeEmpresa} />
    </div>
  );
}
