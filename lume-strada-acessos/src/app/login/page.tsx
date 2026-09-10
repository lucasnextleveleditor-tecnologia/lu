import { Suspense } from "react";
import { LoginForm } from "@/components/auth/LoginForm";
import { BrandingLogo } from "@/components/branding/BrandingLogo";
import { AnnouncementBanner } from "@/components/branding/AnnouncementBanner";
import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { getBrandingConfig } from "@/lib/branding/getBrandingConfig";
import { getDictionary } from "@/lib/i18n/getDictionary";
import { LOGIN_BG_PRESETS, LOGO_LOGIN_PADRAO, LOGO_LOGIN_PADRAO_CLARA } from "@/lib/branding/constants";
import { cn } from "@/lib/utils/cn";

const POSICAO_CLASSES = {
  esquerda: "justify-center md:justify-start md:pl-16 lg:pl-24",
  direita: "justify-center md:justify-end md:pr-16 lg:pr-24",
  centro: "justify-center",
} as const;

export default async function LoginPage() {
  const branding = await getBrandingConfig();
  const { dict } = await getDictionary();
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

      <div className="fixed right-4 top-4 z-30 flex items-center gap-2">
        <ThemeToggle />
        <LanguageSwitcher />
      </div>

      {branding.banner_ativo_login && (
        <div className="absolute inset-x-0 top-0 z-10 p-4">
          <div className="mx-auto max-w-xl">
            <AnnouncementBanner
              titulo={branding.banner_titulo}
              descricao={branding.banner_descricao}
              linkUrl={branding.banner_link_url}
              linkLabel={branding.banner_link_label}
              imgUrl={branding.banner_img_url}
              tone={branding.banner_tone}
              dispensavel={branding.banner_dispensavel}
              chaveDispensa={`${branding.banner_titulo}|${branding.banner_descricao}|${branding.updated_at}`}
            />
          </div>
        </div>
      )}

      <div className="relative w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center text-center">
          {/* A marca aqui é a da PLATAFORMA, nunca a de uma agência: quem
              chega ainda não foi identificado, então não há agência a
              mostrar. Vem das colunas próprias `login_logo_*`, editadas só
              no Super Admin — se viesse de `logo_url`, o dono do SaaS
              trocaria a logo da própria agência e a porta de entrada de
              todos os clientes mudaria junto. Vazio = losango padrão. */}
          <BrandingLogo
            logoUrl={branding.login_logo_url ?? LOGO_LOGIN_PADRAO}
            logoLightUrl={branding.login_logo_light_url ?? (branding.login_logo_url ? null : LOGO_LOGIN_PADRAO_CLARA)}
            sizeClassName="h-12"
            className="mb-4"
          />
          <h1 className="text-lg font-semibold tracking-tight">{branding.login_title}</h1>
          <p className="mt-1 text-xs text-ink-muted">{branding.login_subtitle}</p>
        </div>

        <div className="rounded-2xl border border-base-700 bg-base-900/80 p-6 backdrop-blur-sm">
          <Suspense fallback={null}>
            <LoginForm />
          </Suspense>
        </div>

        <p className="mt-6 text-center text-xs text-ink-muted">{dict.login.convitePrompt}</p>
      </div>
    </div>
  );
}
