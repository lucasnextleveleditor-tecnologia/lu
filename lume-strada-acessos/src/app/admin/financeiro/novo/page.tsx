import Link from "next/link";
import { requireModuloOuRedirect } from "@/lib/auth/requireAdmin";
import { FinanceiroPreviewWorkspace } from "@/components/admin/financeiro/preview/FinanceiroPreviewWorkspace";
import { getDictionary } from "@/lib/i18n/getDictionary";

export const dynamic = "force-dynamic";

/**
 * Rota ISOLADA pro preview visual do novo Financeiro (Mobills-style,
 * Design System "Futurista Minimalista"). Existe só pra validação de
 * layout com dados MOCKADOS — não lê nem escreve nada no Supabase. A rota
 * real `/admin/financeiro` (com o CRUD de verdade) continua 100% intocada;
 * quando o layout for aprovado, este preview vira a página real.
 */
export default async function FinanceiroPreviewPage() {
  await requireModuloOuRedirect("financeiro");
  const { dict } = await getDictionary();

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-accent/30 bg-accent/5 px-4 py-3 text-xs text-ink-secondary">
        <span className="font-semibold text-ink-primary">{dict.financeiro.previewAvisoTitulo}</span> {dict.financeiro.previewAvisoTexto}{" "}
        <Link href="/admin/financeiro" className="text-accent hover:underline">
          /admin/financeiro
        </Link>
        .
      </div>
      <FinanceiroPreviewWorkspace />
    </div>
  );
}
