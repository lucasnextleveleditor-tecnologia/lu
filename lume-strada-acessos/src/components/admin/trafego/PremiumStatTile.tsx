import type { ComponentType, SVGProps } from "react";
import type { Tone } from "@/lib/utils/tone";
import { cn } from "@/lib/utils/cn";
import { TONE_GLOW } from "@/components/admin/trafego/tone-glow";

const TONE_ACCENT: Record<Tone, { badge: string; icon: string; ring: string }> = {
  good: { badge: "bg-gradient-to-br from-status-good to-status-good/70", icon: "text-base-950", ring: "ring-status-good/30" },
  warning: { badge: "bg-gradient-to-br from-status-warning to-status-warning/70", icon: "text-base-950", ring: "ring-status-warning/30" },
  critical: { badge: "bg-gradient-to-br from-status-critical to-status-critical/70", icon: "text-white", ring: "ring-status-critical/30" },
  neutral: { badge: "bg-gradient-to-br from-accent to-accent-strong", icon: "text-base-950", ring: "ring-white/10" },
};

interface PremiumStatTileProps {
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  label: string;
  value: string | number;
  tone?: Tone;
  hint?: string;
}

/**
 * Variante "premium" do `StatTile` (badge do ícone em degradê + glow
 * esfumaçado por tone + flutuação no hover) — escopada só pro redesign do
 * módulo de Tráfego & Metas pedido pelo usuário. O `StatTile` padrão
 * continua intocado, é usado em outros módulos (Financeiro, Info-Produtos,
 * Inventário) que não entraram nesse pedido.
 */
export function PremiumStatTile({ icon: Icon, label, value, tone = "neutral", hint }: PremiumStatTileProps) {
  const accent = TONE_ACCENT[tone];
  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-base-700/70 bg-gradient-to-br from-base-900 to-base-950 p-5",
        "transition-all duration-300 hover:-translate-y-1",
        // `TONE_GLOW` já é o único `shadow-[...]` deste elemento — nunca
        // empilhar com outro literal `shadow-[...]` (só um vence, não somam).
        TONE_GLOW[tone]
      )}
    >
      <div className={cn("mb-4 flex h-11 w-11 items-center justify-center rounded-xl ring-1", accent.badge, accent.ring)}>
        <Icon className={cn("h-[22px] w-[22px]", accent.icon)} strokeWidth={2} />
      </div>

      <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">{label}</p>
      <p className="mt-1.5 text-3xl font-bold tracking-tight text-ink-primary">{value}</p>

      {hint && <p className="mt-3 text-xs text-ink-secondary">{hint}</p>}
    </div>
  );
}
