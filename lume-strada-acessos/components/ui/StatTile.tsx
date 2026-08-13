import type { ComponentType, SVGProps } from "react";
import { cn } from "@/lib/utils/cn";
import type { Tone } from "@/lib/utils/tone";

/**
 * Cartão de KPI (número grande + ícone + rótulo) usado nas linhas de
 * resumo no topo de cada módulo do admin — segue a mesma paleta de 4 tons
 * fixos usada em `Badge`/`Meter` (ver `lib/utils/tone.ts`): a cor nunca vai
 * no número nem no rótulo (sempre `ink-*`), só no ícone/aro do badge —
 * exatamente como a bolinha do `Badge`, nunca a única portadora de sentido
 * (o rótulo abaixo do número já diz o que é).
 */
const STAT_TONE_META: Record<Tone, { badge: string; icon: string }> = {
  neutral: { badge: "border-base-600 bg-base-800", icon: "text-ink-primary" },
  good: { badge: "border-status-good/30 bg-status-good/10", icon: "text-status-good" },
  warning: { badge: "border-status-warning/30 bg-status-warning/10", icon: "text-status-warning" },
  critical: { badge: "border-status-critical/30 bg-status-critical/10", icon: "text-status-critical" },
};

interface StatTileProps {
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  label: string;
  value: string | number;
  tone?: Tone;
  hint?: string;
  className?: string;
}

export function StatTile({ icon: Icon, label, value, tone = "neutral", hint, className }: StatTileProps) {
  const toneMeta = STAT_TONE_META[tone];

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border border-base-700 bg-base-900/80 p-5 backdrop-blur-sm",
        "shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)]",
        className
      )}
    >
      {/* Linha de destaque sutil no topo do card — o "glow" fixo da identidade visual, nunca colorido por branding. */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent" />

      <div className={cn("mb-4 flex h-10 w-10 items-center justify-center rounded-xl border", toneMeta.badge)}>
        <Icon className={cn("h-5 w-5", toneMeta.icon)} />
      </div>

      <p className="text-2xl font-semibold tracking-tight text-ink-primary">{value}</p>
      <p className="mt-1 text-xs uppercase tracking-wide text-ink-muted">{label}</p>

      {hint && <p className="mt-3 border-t border-base-800 pt-3 text-xs text-ink-secondary">{hint}</p>}
    </div>
  );
}
