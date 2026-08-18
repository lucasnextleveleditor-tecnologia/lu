import { requireAdminOuRedirect } from "@/lib/auth/requireAdmin";
import { getBrandingConfig } from "@/lib/branding/getBrandingConfig";
import { AparenciaForm } from "@/components/admin/aparencia/AparenciaForm";
import { getDictionary } from "@/lib/i18n/getDictionary";

export const dynamic = "force-dynamic";

export default async function AparenciaPage() {
  await requireAdminOuRedirect();
  const branding = await getBrandingConfig();
  const { dict } = await getDictionary();

  return (
    <div>
      <div className="mb-5">
        <h1 className="text-lg font-semibold tracking-tight">{dict.aparencia.tituloPagina}</h1>
        <p className="mt-0.5 text-sm text-ink-muted">{dict.aparencia.subtituloPagina}</p>
      </div>
      <AparenciaForm initialBranding={branding} />
    </div>
  );
}
