import { Suspense } from "react";
import { LoginForm } from "@/components/auth/LoginForm";
import { BrandingLogo } from "@/components/branding/BrandingLogo";
import { getBrandingConfig } from "@/lib/branding/getBrandingConfig";
import { LOGIN_BG_PRESETS } from "@/lib/branding/constants";
import { cn } from "@/lib/utils/cn";

const POSICAO_CLASSES = {
  esquerda: "justify-center md:justify-start md:pl-16 lg:pl-24",
  direita: "justify-center md:justify-end md:pr-16 lg:pr-24",
  centro: "justify-center",
} as const;

export default async function LoginPage() {
  const branding = await getBrandingConfig();
  const preset = LOGIN_BG_PRESETS.find((p) => p.key === branding.login_bg_preset) ?? LOGIN_BG_PRESETS[0]!;

  return (
    <div
      className={cn(
        "relative flex min-h-screen items-center overflow-hidden p-4",
        !branding.login_bg_url && preset.className,
        POSICAO_CLASSES[branding.login_box_position]
      )}
      style={
        branding.login_bg_url
          ? { backgroundImage: `url(${branding.login_bg_url})`, backgroundSize: "cover", backgroundPosition: "center" }
          : undefined
      }
    >
      {/* Imagem de fundo customizada precisa de um véu escuro por cima pra caixa de login continuar legível — os padrões prontos já nascem escuros. */}
      {branding.login_bg_url && <div className="absolute inset-0 bg-base-950/70" />}

      <div className="relative w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center text-center">
          <BrandingLogo logoUrl={branding.logo_dark_url ?? branding.logo_url} sizeClassName="h-12" className="mb-4" />
          <h1 className="text-lg font-semibold tracking-tight">{branding.login_title}</h1>
          <p className="mt-1 text-xs text-ink-muted">{branding.login_subtitle}</p>
        </div>

        <div className="rounded-2xl border border-base-700 bg-base-900/80 p-6 backdrop-blur-sm">
          <Suspense fallback={null}>
            <LoginForm />
          </Suspense>
        </div>

        <p className="mt-6 text-center text-xs text-ink-muted">
          Recebeu um convite por e-mail? Abra o link da mensagem para definir sua senha antes do primeiro acesso.
        </p>
      </div>
    </div>
  );
}
