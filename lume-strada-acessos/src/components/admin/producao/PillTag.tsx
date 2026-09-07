import type { Tone } from "@/lib/utils/tone";
import { cn } from "@/lib/utils/cn";

const PILL_META: Record<Tone, { bg: string; border: string; text: string; glow: string }> = {
  good: {
    bg: "bg-status-good/15",
    border: "border-status-good/40",
    text: "text-status-good",
    glow: "shadow-[0_0_10px_-2px_rgba(12,163,12,0.5)]",
  },
  warning: {
    bg: "bg-status-warning/15",
    border: "border-status-warning/40",
    text: "text-status-warning",
    glow: "shadow-[0_0_10px_-2px_rgba(250,178,25,0.5)]",
  },
  critical: {
    bg: "bg-status-critical/15",
    border: "border-status-critical/40",
    // Texto pequeno usa `danger` (5.54:1), nunca `status-critical` puro
    // (4.12:1 — abaixo do piso AA pra texto pequeno, ver tailwind.config.ts).
    text: "text-danger",
    glow: "shadow-[0_0_10px_-2px_rgba(211,59,59,0.45)]",
  },
  neutral: {
    bg: "bg-base-800/70",
    border: "border-base-600/50",
    text: "text-ink-secondary",
    glow: "",
  },
};

/**
 * Pílula "neon" — variante mais vibrante do `Badge` padrão (que fica em
 * `ink-primary` sempre), escopada só pro redesign premium do módulo de
 * Produção (Kanban + Lista): aqui o texto vai DIRETO na cor do tone porque
 * o fundo é bem mais escuro/saturado que o normal, e o glow reforça (nunca
 * substitui) o rótulo por extenso. Fora daqui o `Badge` padrão continua
 * sendo o componente certo pros outros módulos — essa pílula não mexe em
 * nada compartilhado.
 */
export function PillTag({ tone, label, className }: { tone: Tone; label: string; className?: string }) {
  const meta = PILL_META[tone];
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide",
        meta.bg,
        meta.border,
        meta.text,
        meta.glow,
        className
      )}
    >
      {label}
    </span>
  );
}
