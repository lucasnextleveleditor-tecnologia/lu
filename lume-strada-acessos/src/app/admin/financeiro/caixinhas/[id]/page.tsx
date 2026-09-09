import Link from "next/link";
import { IconChevronLeft } from "@/components/ui/icons";
import { OlhoValoresToggle } from "@/components/ui/OlhoValoresToggle";
import { CaixinhaDetalhe } from "@/components/admin/financeiro/caixinhas/CaixinhaDetalhe";
import { getDictionary } from "@/lib/i18n/getDictionary";
import { buscarCaixinhaDetalhe } from "@/app/admin/financeiro/caixinhas/data";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

/** Detalhe isolado de uma caixinha — projeção de juros compostos, ações de aporte/resgate/rendimento e histórico completo do ledger. */
export default async function CaixinhaDetalhePage({ params }: PageProps) {
  const { id } = await params;
  const { dict } = await getDictionary();
  const { caixinha, contas, historico } = await buscarCaixinhaDetalhe(id);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Link
          href="/admin/financeiro/caixinhas"
          className="inline-flex items-center gap-1 text-xs font-medium text-ink-muted transition hover:text-ink-primary"
        >
          <IconChevronLeft className="h-3.5 w-3.5" />
          {dict.financeiro.caixinhas.voltarParaCaixinhas}
        </Link>
        {/* Único menu do Financeiro sem o olhinho antes — pedido explícito
            do dono da conta: "para que eu não tenha que voltar na tela
            inicial para conseguir ver os números" (o resto do módulo já
            tinha `OlhoValoresToggle` na própria tela). */}
        <OlhoValoresToggle />
      </div>

      <CaixinhaDetalhe caixinha={caixinha} contas={contas} historico={historico} />
    </div>
  );
}
