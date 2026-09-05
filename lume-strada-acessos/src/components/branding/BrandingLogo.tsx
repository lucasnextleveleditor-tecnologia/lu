"use client";

import { cn } from "@/lib/utils/cn";
import { useLocale } from "@/lib/i18n/LocaleProvider";

interface BrandingLogoProps {
  /** URL da logo enviada no painel de Aparência — `null` cai no losango padrão da Lume. */
  logoUrl: string | null;
  /** Classe de ALTURA (ex: "h-8", "h-12") — a largura segue automaticamente (logo real) ou fica quadrada (marca padrão). */
  sizeClassName?: string;
  className?: string;
}

export function BrandingLogo({ logoUrl, sizeClassName = "h-8", className }: BrandingLogoProps) {
  const { dict } = useLocale();

  if (logoUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- logo vem de um bucket Supabase arbitrário (domínio do projeto do cliente), sem domínio fixo pra configurar em next/image.
      <img src={logoUrl} alt={dict.aparencia.logoAlt} className={cn("w-auto shrink-0 object-contain", sizeClassName, className)} />
    );
  }

  return (
    <div
      className={cn(
        "flex aspect-square shrink-0 items-center justify-center rounded-lg border border-accent/30 bg-accent/10",
        sizeClassName,
        className
      )}
    >
      <div className="h-[30%] w-[30%] rotate-45 bg-accent" />
    </div>
  );
}
