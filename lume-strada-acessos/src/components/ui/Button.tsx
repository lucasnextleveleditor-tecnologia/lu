import { cn } from "@/lib/utils/cn";
import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "ghost" | "danger";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

const VARIANT_CLASSES: Record<Variant, string> = {
  primary: "bg-accent text-base-950 hover:bg-accent-strong",
  ghost: "border border-base-600 text-ink-secondary hover:text-ink-primary hover:border-ink-muted bg-transparent",
  danger: "border border-status-critical/40 text-danger hover:bg-status-critical/10 bg-transparent",
};

export function Button({ variant = "primary", className, children, ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-40",
        // `focus-visible` (não `focus`) de propósito — o anel só aparece pra
        // navegação por teclado (Tab), sem "piscar" a cada clique de mouse.
        // Antes o Button compartilhado não tinha NENHUM estilo de foco — em
        // cima do fundo quase preto do design system, o outline padrão do
        // navegador é praticamente invisível, então navegar só por teclado
        // (Tab) deixava a pessoa sem saber qual botão estava focado.
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 focus-visible:ring-offset-2 focus-visible:ring-offset-base-950",
        VARIANT_CLASSES[variant],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
