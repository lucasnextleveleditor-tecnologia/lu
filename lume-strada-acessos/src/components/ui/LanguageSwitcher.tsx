"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { definirIdioma } from "@/lib/i18n/actions";
import { LOCALES, LOCALE_LABELS, type Locale } from "@/lib/i18n/locales";
import { FlagBR, FlagUS, FlagES } from "@/components/ui/flags";
import { cn } from "@/lib/utils/cn";

const FLAGS: Record<Locale, typeof FlagBR> = { pt: FlagBR, en: FlagUS, es: FlagES };

interface LanguageSwitcherProps {
  className?: string;
  /** Modo compacto — só a bandeira no gatilho, sem o nome do idioma ao lado (usado quando o espaço é curto). */
  compact?: boolean;
}

/**
 * Seletor de idioma — dropdown próprio (não `<select>` nativo) porque
 * precisa mostrar a BANDEIRA de cada idioma, algo que um `<select>` nativo
 * não deixa customizar dentro das `<option>` de forma confiável entre
 * navegadores. Ao trocar, grava o cookie (`definirIdioma`, Server Action) e
 * chama `router.refresh()` — Server Components recarregam com o dicionário
 * novo; componentes cliente reagem sozinhos porque `LocaleProvider` recebe
 * um `dict` novo do layout raiz nesse mesmo refresh.
 */
export function LanguageSwitcher({ className, compact = false }: LanguageSwitcherProps) {
  const { locale, dict } = useLocale();
  const router = useRouter();
  const [aberto, setAberto] = useState(false);
  const [pending, startTransition] = useTransition();
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!aberto) return;
    function handlePointerDown(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) setAberto(false);
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setAberto(false);
    }
    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [aberto]);

  function escolher(novoLocale: Locale) {
    setAberto(false);
    startTransition(async () => {
      await definirIdioma(novoLocale);
      router.refresh();
    });
  }

  const FlagAtual = FLAGS[locale];

  return (
    <div ref={wrapperRef} className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => setAberto((v) => !v)}
        disabled={pending}
        aria-label={dict.common.idioma}
        className={cn(
          "flex items-center gap-1.5 rounded-full border border-base-600 bg-base-900/90 px-2.5 py-1.5 text-ink-primary shadow-[0_8px_20px_-10px_rgba(0,0,0,0.8)] backdrop-blur-sm transition hover:border-ink-muted",
          pending && "opacity-60"
        )}
      >
        <FlagAtual className="h-3.5 w-5 shrink-0 rounded-[2px]" />
        {!compact && <span className="text-xs font-medium">{LOCALE_LABELS[locale]}</span>}
      </button>

      {aberto && (
        <div className="absolute right-0 top-[calc(100%+6px)] z-50 min-w-[150px] overflow-hidden rounded-xl border border-base-700 bg-base-900 py-1 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.8)]">
          {LOCALES.map((l) => {
            const Flag = FLAGS[l];
            const ativo = l === locale;
            return (
              <button
                key={l}
                type="button"
                onClick={() => escolher(l)}
                className={cn(
                  "flex w-full items-center gap-2.5 px-3 py-2 text-left text-xs font-medium transition",
                  ativo ? "bg-base-800 text-ink-primary" : "text-ink-secondary hover:bg-base-800 hover:text-ink-primary"
                )}
              >
                <Flag className="h-3.5 w-5 shrink-0 rounded-[2px]" />
                {LOCALE_LABELS[l]}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
