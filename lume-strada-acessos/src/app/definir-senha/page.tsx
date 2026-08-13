import { SetPasswordForm } from "@/components/auth/SetPasswordForm";
import { BrandingLogo } from "@/components/branding/BrandingLogo";
import { getBrandingConfig } from "@/lib/branding/getBrandingConfig";

export default async function DefinirSenhaPage() {
  const branding = await getBrandingConfig();

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center text-center">
          <BrandingLogo logoUrl={branding.logo_dark_url ?? branding.logo_url} sizeClassName="h-12" className="mb-4" />
          <h1 className="text-lg font-semibold tracking-tight">Bem-vindo(a) à Lume Strada</h1>
          <p className="mt-1 text-xs text-ink-muted">Defina uma senha para concluir seu cadastro</p>
        </div>
        <div className="rounded-2xl border border-base-700 bg-base-900/80 p-6">
          <SetPasswordForm />
        </div>
      </div>
    </div>
  );
}
