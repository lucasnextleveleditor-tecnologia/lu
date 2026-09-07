import Link from "next/link";
import { IconChevronLeft } from "@/components/ui/icons";
import { PortfolioManager } from "@/components/admin/orcamentos/PortfolioManager";
import { MarcaOrcamentoForm } from "@/components/admin/orcamentos/MarcaOrcamentoForm";
import { getDictionary } from "@/lib/i18n/getDictionary";
import { buscarDadosPortfolio } from "@/app/admin/orcamentos/portfolio-data";

export const dynamic = "force-dynamic";

/**
 * Tela dedicada ao Portfólio + Marca da agência — Fase 1 do sistema guiado
 * de Orçamentos/Contratos. Separada da lista principal e do Catálogo, mesmo
 * princípio de `/orcamentos/catalogo`: cada tela de cadastro de apoio no
 * seu próprio espaço, sem sobrecarregar a lista de orçamentos.
 */
export default async function PortfolioOrcamentosPage() {
  const { dict } = await getDictionary();
  const { itens, marca } = await buscarDadosPortfolio();

  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/orcamentos" className="mb-3 inline-flex items-center gap-1 text-xs font-medium text-ink-muted transition hover:text-ink-primary">
          <IconChevronLeft className="h-3.5 w-3.5" />
          {dict.orcamentos.voltarParaOrcamentos}
        </Link>
        <h1 className="text-lg font-semibold tracking-tight">{dict.orcamentos.portfolioBtn}</h1>
      </div>

      <MarcaOrcamentoForm marca={marca} />
      <PortfolioManager itens={itens} />
    </div>
  );
}
