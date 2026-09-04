"use client";

import { BrandingLogo } from "@/components/branding/BrandingLogo";
import { LOGIN_BG_PRESETS } from "@/lib/branding/constants";
import { cn } from "@/lib/utils/cn";
import type { LoginBgPreset, LoginBoxPosition } from "@/lib/types/database";
import { useLocale } from "@/lib/i18n/LocaleProvider";

interface LoginPreviewProps {
  logoUrl: string | null;
  titulo: string;
  subtitulo: string;
  posicao: LoginBoxPosition;
  bgPreset: LoginBgPreset;
  bgUrl: string | null;
}

const POSICAO_CLASSES: Record<LoginBoxPosition, string> = {
  esquerda: "justify-start pl-4",
  direita: "justify-end pr-4",
  centro: "justify-center",
};

/** Maquete em miniatura da tela de login — mesma lógica de fundo/posição/logo da página real (`app/login/page.tsx`), só que escalada pra caber num card de preview. */
export function LoginPreview({ logoUrl, titulo, subtitulo, posicao, bgPreset, bgUrl }: LoginPreviewProps) {
  const { dict } = useLocale();
  const preset = LOGIN_BG_PRESETS.find((p) => p.key === bgPreset) ?? LOGIN_BG_PRESETS[0]!;

  return (
    <div
      className={cn(
        "relative flex h-56 items-center overflow-hidden rounded-xl border border-base-700 p-3",
        !bgUrl && preset.className,
        POSICAO_CLASSES[posicao]
      )}
      style={bgUrl ? { backgroundImage: `url(${bgUrl})`, backgroundSize: "cover", backgroundPosition: "center" } : undefined}
    >
      {bgUrl && <div className="absolute inset-0 bg-base-950/70" />}
      <div className="relative w-32 rounded-lg border border-base-700 bg-base-900/90 p-2.5 text-center shadow-lg">
        <BrandingLogo logoUrl={logoUrl} sizeClassName="h-5" className="mx-auto mb-1.5" />
        <p className="truncate text-[10px] font-semibold leading-tight text-ink-primary">{titulo || dict.aparencia.previewTituloFallback}</p>
        <p className="mt-0.5 truncate text-[8px] text-ink-muted">{subtitulo || dict.aparencia.subtituloLabel}</p>
        <div className="mt-2 space-y-1">
          <div className="h-2 rounded bg-base-800" />
          <div className="h-2 rounded bg-base-800" />
        </div>
        <div className="mt-2 h-4 rounded bg-accent" />
      </div>
    </div>
  );
}
