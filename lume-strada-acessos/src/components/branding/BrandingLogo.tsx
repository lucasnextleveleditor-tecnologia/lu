"use client";

import { cn } from "@/lib/utils/cn";
import { useLocale } from "@/lib/i18n/LocaleProvider";

interface BrandingLogoProps {
  /** URL da logo enviada no painel — `null` cai no losango padrão. */
  logoUrl: string | null;
  /**
   * Versão para fundo CLARO. Quando existe, as duas são desenhadas e o CSS
   * decide qual aparece — e não o servidor: assim a troca de modo não
   * depende de recarregar nada, e uma logo branca nunca fica invisível no
   * tema claro.
   */
  logoLightUrl?: string | null;
  /** Classe de ALTURA (ex: "h-8", "h-12") — a largura segue automaticamente (logo real) ou fica quadrada (marca padrão). */
  sizeClassName?: string;
  /**
   * A logo ocupa toda a largura disponível, limitada pela altura de
   * `sizeClassName`. Serve ao cabeçalho da sidebar, onde a marca é o bloco
   * inteiro. Não vale para o losango padrão, que é quadrado por natureza e
   * ficaria gigante esticado.
   */
  larguraTotal?: boolean;
  className?: string;
}

export function BrandingLogo({ logoUrl, logoLightUrl, sizeClassName = "h-8", larguraTotal, className }: BrandingLogoProps) {
  const { dict } = useLocale();
  // `w-auto` e `w-full` na mesma string se anulariam de forma imprevisível
  // (o `cn` daqui é só um join, quem decide é a ordem do CSS) — por isso a
  // largura é escolhida antes, e só uma das duas entra.
  const comum = cn("shrink-0 object-contain", larguraTotal ? "w-full max-w-full" : "w-auto", sizeClassName, className);

  if (logoUrl && logoLightUrl) {
    return (
      <>
        {/* eslint-disable-next-line @next/next/no-img-element -- logo vem de um bucket Supabase arbitrário, sem domínio fixo pra configurar em next/image. */}
        <img src={logoLightUrl} alt={dict.aparencia.logoAlt} className={cn(comum, "block dark:hidden")} />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={logoUrl} alt="" aria-hidden className={cn(comum, "hidden dark:block")} />
      </>
    );
  }

  if (logoUrl) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={logoUrl} alt={dict.aparencia.logoAlt} className={comum} />;
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
