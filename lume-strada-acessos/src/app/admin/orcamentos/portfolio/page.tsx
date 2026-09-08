import Link from "next/link";
import { IconChevronLeft } from "@/components/ui/icons";
import { PortfolioManager } from "@/components/admin/orcamentos/PortfolioManager";
import { getDictionary } from "@/lib/i18n/getDictionary";
import { buscarDadosPortfolio } from "@/app/admin/orcamentos/portfolio-data";

export const dynamic = "force-dynamic";

/**
 * Tela dedicada à biblioteca de Portfólio (fotos/vídeos reutilizáveis entre
 * vários orçamentos). Marca da agência e conteúdo institucional (antes
 * também nesta tela) foram pro construtor de orçamento — ver
 * `MarcaApresentacaoCard.tsx` — porque eram configurações da empresa
 * escondidas numa aba separada do fluxo de montar o orçamento, o que
 * deixava confuso.
 */
export default async function PortfolioOrcamentosPage() {
  const { dict } = await getDictionary();
  const { itens } = await buscarDadosPortfolio();

  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/orcamentos" className="mb-3 inline-flex items-center gap-1 text-xs font-medium text-ink-muted transition hover:text-ink-primary">
          <IconChevronLeft className="h-3.5 w-3.5" />
          {dict.orcamentos.voltarParaOrcamentos}
        </Link>
        <h1 className="text-lg font-semibold tracking-tight">{dict.orcamentos.portfolioBtn}</h1>
        <p className="mt-1 text-xs text-ink-muted">{dict.orcamentos.portfolioMarcaMovidaAviso}</p>
      </div>

      <PortfolioManager itens={itens} />
    </div>
  );
}
