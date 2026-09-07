import Link from "next/link";
import { IconChevronLeft } from "@/components/ui/icons";
import { TiposOrcamentoManager } from "@/components/admin/orcamentos/TiposOrcamentoManager";
import { getDictionary } from "@/lib/i18n/getDictionary";
import { buscarTiposOrcamento } from "@/app/admin/orcamentos/tipos-data";
import { buscarDadosCatalogo } from "@/app/admin/orcamentos/data";

export const dynamic = "force-dynamic";

/** Tela de modelos por perfil profissional (Fase 2) — separada da lista principal, mesmo princípio de `/catalogo` e `/portfolio`. */
export default async function TiposOrcamentoPage() {
  const { dict } = await getDictionary();
  const [tipos, { servicosComCategoria }] = await Promise.all([buscarTiposOrcamento(), buscarDadosCatalogo()]);

  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/orcamentos" className="mb-3 inline-flex items-center gap-1 text-xs font-medium text-ink-muted transition hover:text-ink-primary">
          <IconChevronLeft className="h-3.5 w-3.5" />
          {dict.orcamentos.voltarParaOrcamentos}
        </Link>
        <h1 className="text-lg font-semibold tracking-tight">{dict.orcamentos.tiposBtn}</h1>
        <p className="mt-0.5 text-sm text-ink-muted">{dict.orcamentos.tiposSubtitulo}</p>
      </div>

      <TiposOrcamentoManager tipos={tipos} servicosComCategoria={servicosComCategoria} />
    </div>
  );
}
