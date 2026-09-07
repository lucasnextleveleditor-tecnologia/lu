import Link from "next/link";
import { IconChevronLeft } from "@/components/ui/icons";
import { CatalogoManager } from "@/components/admin/orcamentos/CatalogoManager";
import { getDictionary } from "@/lib/i18n/getDictionary";
import { buscarDadosCatalogo } from "@/app/admin/orcamentos/data";

export const dynamic = "force-dynamic";

/** Tela dedicada ao catálogo (categorias + serviços com valor padrão) — separada da lista principal de orçamentos pra não sobrecarregar aquela tela com CRUD de cadastro. */
export default async function CatalogoOrcamentosPage() {
  const { dict } = await getDictionary();
  const { categorias, servicosComCategoria } = await buscarDadosCatalogo();

  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/orcamentos" className="mb-3 inline-flex items-center gap-1 text-xs font-medium text-ink-muted transition hover:text-ink-primary">
          <IconChevronLeft className="h-3.5 w-3.5" />
          {dict.orcamentos.voltarParaOrcamentos}
        </Link>
        <h1 className="text-lg font-semibold tracking-tight">{dict.orcamentos.catalogoBtn}</h1>
      </div>

      <div className="max-w-3xl">
        <CatalogoManager categorias={categorias} servicosComCategoria={servicosComCategoria} />
      </div>
    </div>
  );
}
