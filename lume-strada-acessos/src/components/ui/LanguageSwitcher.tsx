"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { definirIdioma } from "@/lib/i18n/actions";
import { LOCALES, LOCALE_LABELS, type Locale } from "@/lib/i18n/locales";
import { IconGlobe } from "@/components/ui/icons";
import { cn } from "@/lib/utils/cn";

interface LanguageSwitcherProps {
  className?: string;
  /** Modo compacto (sidebar recolhida do admin) — só o ícone + `<select>` nativo sem rótulo ao lado. */
  compact?: boolean;
}

/**
 * Seletor de idioma — usa um `<select>` nativo (não um dropdown customizado)
 * de propósito: acessível por teclado/leitor de tela de graça, e não precisa
 * de nenhuma lib extra só pra isso. Ao trocar, grava o cookie
 * (`definirIdioma`, Server Action) e chama `router.refresh()` — os Server
 * Components (páginas) recarregam com o dicionário novo; os componentes
 * cliente já reagem sozinhos porque `LocaleProvider` recebe um `dict` novo
 * do layout raiz nesse mesmo refresh.
 */
export function LanguageSwitcher({ className, compact = false }: LanguageSwitcherProps) {
  const { locale } = useLocale();
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function handleChange(novoLocale: Locale) {
    startTransition(async () => {
      await definirIdioma(novoLocale);
      router.refresh();
    });
  }

  return (
    <div
      className={cn(
        "flex items-center gap-1.5 rounded-lg border border-base-600 bg-base-900 px-2 text-ink-muted transition hover:text-ink-primary",
        pending && "opacity-60",
        className
      )}
    >
      <IconGlobe className="h-3.5 w-3.5 shrink-0" />
      <select
        value={locale}
        disabled={pending}
        onChange={(e) => handleChange(e.target.value as Locale)}
        aria-label="Idioma / Language / Idioma"
        className={cn(
          "cursor-pointer appearance-none bg-transparent py-1.5 pr-1 text-xs font-medium text-ink-primary focus:outline-none",
          compact && "w-0 opacity-0" // no modo compacto o texto some, só o globo fica visível — o <select> continua clicável cobrindo o ícone
        )}
      >
        {LOCALES.map((l) => (
          <option key={l} value={l} className="bg-base-900 text-ink-primary">
            {LOCALE_LABELS[l]}
          </option>
        ))}
      </select>
    </div>
  );
}
