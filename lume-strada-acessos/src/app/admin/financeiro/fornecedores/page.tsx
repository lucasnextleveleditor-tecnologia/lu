import Link from "next/link";
import { IconChevronLeft } from "@/components/ui/icons";
import { FornecedoresCard } from "@/components/admin/financeiro/FornecedoresCard";
import { getDictionary } from "@/lib/i18n/getDictionary";
import { buscarFornecedores } from "@/app/admin/financeiro/data";

export const dynamic = "force-dynamic";

/**
 * Fornecedores — tela própria, separada do dashboard principal do Financeiro
 * E da tela de Fluxo de Caixa (pedido explícito do dono da conta: tirar o
 * card daqui de dentro do dashboard, mas SEM misturar com a tela nova de
 * Fluxo de Caixa). Reaproveita o mesmo `FornecedoresCard` que já existia no
 * dashboard — só muda onde ele mora — e `buscarFornecedores` (leve, só a
 * tabela de fornecedores, sem trazer contas/cartões/transações do mês à
 * toa como `buscarDadosFinanceiro` faria).
 */
export default async function FornecedoresPage() {
  const { dict } = await getDictionary();
  const fornecedores = await buscarFornecedores();

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin/financeiro"
          className="mb-3 inline-flex items-center gap-1 text-xs font-medium text-ink-muted transition hover:text-ink-primary"
        >
          <IconChevronLeft className="h-3.5 w-3.5" />
          {dict.financeiro.voltarParaFinanceiro}
        </Link>
        <div>
          <h1 className="text-lg font-semibold tracking-tight">{dict.financeiro.fornecedoresTituloPagina}</h1>
          <p className="mt-0.5 text-sm text-ink-muted">{dict.financeiro.fornecedoresSubtituloPagina}</p>
        </div>
      </div>

      <div className="max-w-2xl">
        <FornecedoresCard fornecedores={fornecedores} />
      </div>
    </div>
  );
}
