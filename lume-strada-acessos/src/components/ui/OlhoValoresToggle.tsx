"use client";

import { useValoresVisiveis } from "@/lib/valores-visiveis/ValoresVisiveisProvider";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { IconEye, IconEyeOff } from "@/components/ui/icons";
import { cn } from "@/lib/utils/cn";

interface OlhoValoresToggleProps {
  className?: string;
}

/**
 * Botão de olho que mostra/oculta os valores financeiros da tela — alterna
 * `ValoresVisiveisProvider` (montado no `AdminShell`, cobre Financeiro e
 * Dashboard ao mesmo tempo). Colocado no cabeçalho de cada tela com dado
 * financeiro; todas as instâncias compartilham o mesmo estado.
 */
export function OlhoValoresToggle({ className }: OlhoValoresToggleProps) {
  const { visivel, alternar } = useValoresVisiveis();
  const { dict } = useLocale();
  const Icon = visivel ? IconEyeOff : IconEye;
  const label = visivel ? dict.common.ocultarValores : dict.common.mostrarValores;

  return (
    <button
      type="button"
      onClick={alternar}
      aria-label={label}
      title={label}
      className={cn(
        "flex h-8 w-8 items-center justify-center rounded-lg border border-base-600 text-ink-secondary transition hover:border-ink-muted hover:text-ink-primary",
        className
      )}
    >
      <Icon className="h-4 w-4" />
    </button>
  );
}
