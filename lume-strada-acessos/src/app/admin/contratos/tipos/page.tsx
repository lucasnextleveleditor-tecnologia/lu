import Link from "next/link";
import { IconChevronLeft } from "@/components/ui/icons";
import { TiposContratoManager } from "@/components/admin/contratos/TiposContratoManager";
import { getDictionary } from "@/lib/i18n/getDictionary";
import { buscarTiposContrato } from "@/app/admin/contratos/tipos-data";

export const dynamic = "force-dynamic";

/** Tela de modelos de cláusulas por perfil profissional (Fase 3) — separada da lista principal, mesmo princípio de `/admin/orcamentos/tipos`. */
export default async function TiposContratoPage() {
  const { dict } = await getDictionary();
  const tipos = await buscarTiposContrato();

  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/contratos" className="mb-3 inline-flex items-center gap-1 text-xs font-medium text-ink-muted transition hover:text-ink-primary">
          <IconChevronLeft className="h-3.5 w-3.5" />
          {dict.contratos.voltarParaContratos}
        </Link>
        <h1 className="text-lg font-semibold tracking-tight">{dict.contratos.tiposBtn}</h1>
        <p className="mt-0.5 text-sm text-ink-muted">{dict.contratos.tiposSubtitulo}</p>
      </div>

      <TiposContratoManager tipos={tipos} />
    </div>
  );
}
