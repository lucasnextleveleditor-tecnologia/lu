"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "@/lib/theme/ThemeProvider";
import { definirTema } from "@/lib/theme/actions";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { IconMoon, IconSun } from "@/components/ui/icons";
import { cn } from "@/lib/utils/cn";

interface ThemeToggleProps {
  className?: string;
}

/**
 * Botão de modo escuro/claro — sempre ao lado do `LanguageSwitcher` (mesmo
 * gatilho circular, mesmo tamanho, mesma sombra) porque os dois vivem juntos
 * no canto fixo superior direito em toda tela do sistema. Mostra o ícone do
 * modo OPOSTO ao atual (lua quando está escuro, sol quando está claro) — é
 * a convenção universal desse tipo de botão: o ícone descreve pra onde o
 * clique leva, não o estado atual. Mesmo padrão de persistência do idioma:
 * grava o cookie (`definirTema`, Server Action) e chama `router.refresh()` —
 * a classe em `<html>` já é setada no servidor (`app/layout.tsx`), então o
 * refresh troca o tema sem qualquer flash.
 */
export function ThemeToggle({ className }: ThemeToggleProps) {
  const { theme } = useTheme();
  const { dict } = useLocale();
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function alternar() {
    const novoTema = theme === "dark" ? "light" : "dark";
    startTransition(async () => {
      await definirTema(novoTema);
      router.refresh();
    });
  }

  const rotulo = theme === "dark" ? dict.common.modoClaro : dict.common.modoEscuro;

  return (
    <button
      type="button"
      onClick={alternar}
      disabled={pending}
      aria-label={rotulo}
      title={rotulo}
      className={cn(
        "flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-base-600 bg-base-900/90 text-ink-primary shadow-[0_8px_20px_-10px_rgba(0,0,0,0.8)] backdrop-blur-sm transition hover:border-ink-muted",
        pending && "opacity-60",
        className
      )}
    >
      {theme === "dark" ? <IconSun className="h-4 w-4" /> : <IconMoon className="h-4 w-4" />}
    </button>
  );
}
