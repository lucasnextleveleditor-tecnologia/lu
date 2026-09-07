"use client";

import { cn } from "@/lib/utils/cn";

/**
 * Toggle switch — usado no modal de Permissões (RBAC por funcionário) pra
 * ligar/desligar o acesso a cada módulo. Mesma paleta fixa preto/branco/zinc
 * do resto do app: ligado = `bg-accent` (branco sólido, mesmo token do botão
 * primário), desligado = `bg-base-700`. Nunca uma cor "decorativa" nova —
 * consistente com a regra de `StatTile`/`Badge`.
 */
interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  label?: string;
  className?: string;
}

export function Switch({ checked, onChange, disabled, label, className }: SwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors duration-150",
        "disabled:cursor-not-allowed disabled:opacity-40",
        checked ? "bg-accent" : "bg-base-700",
        className
      )}
    >
      <span
        className={cn(
          "inline-block h-[18px] w-[18px] transform rounded-full bg-base-950 shadow transition-transform duration-150",
          checked ? "translate-x-[22px] bg-base-950" : "translate-x-[3px] bg-ink-secondary"
        )}
      />
    </button>
  );
}
