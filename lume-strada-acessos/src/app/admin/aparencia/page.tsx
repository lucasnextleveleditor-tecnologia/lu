import { requireAdminOuRedirect } from "@/lib/auth/requireAdmin";
import { getBrandingConfig } from "@/lib/branding/getBrandingConfig";
import { AparenciaForm } from "@/components/admin/aparencia/AparenciaForm";

export const dynamic = "force-dynamic";

export default async function AparenciaPage() {
  await requireAdminOuRedirect();
  const branding = await getBrandingConfig();

  return (
    <div>
      <div className="mb-5">
        <h1 className="text-lg font-semibold tracking-tight">Aparência & White-Label</h1>
        <p className="mt-0.5 text-sm text-ink-muted">
          Logotipo, cores e a identidade visual da tela de login — aplicado pra todo mundo assim que você salvar.
        </p>
      </div>
      <AparenciaForm initialBranding={branding} />
    </div>
  );
}
