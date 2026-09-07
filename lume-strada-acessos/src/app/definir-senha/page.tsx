import { SetPasswordForm } from "@/components/auth/SetPasswordForm";
import { BrandingLogo } from "@/components/branding/BrandingLogo";
import { getBrandingConfig } from "@/lib/branding/getBrandingConfig";
import { getDictionary } from "@/lib/i18n/getDictionary";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

export default async function DefinirSenhaPage() {
  const branding = await getBrandingConfig();
  const { dict } = await getDictionary();

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="fixed right-4 top-4 z-30">
        <ThemeToggle />
      </div>
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center text-center">
          <BrandingLogo logoUrl={branding.logo_dark_url ?? branding.logo_url} sizeClassName="h-12" className="mb-4" />
          <h1 className="text-lg font-semibold tracking-tight">{dict.login.definirSenhaTitulo}</h1>
          <p className="mt-1 text-xs text-ink-muted">{dict.login.definirSenhaSubtitulo}</p>
        </div>
        <div className="rounded-2xl border border-base-700 bg-base-900/80 p-6">
          <SetPasswordForm />
        </div>
      </div>
    </div>
  );
}
