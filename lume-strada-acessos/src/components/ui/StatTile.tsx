import type { ComponentType, ReactNode, SVGProps } from "react";
import { cn } from "@/lib/utils/cn";
import type { Tone } from "@/lib/utils/tone";

/**
 * Cartão de KPI (ícone em badge sólido + rótulo + número grande) usado nas
 * linhas de resumo no topo de cada módulo do admin — inspirado em
 * dashboards tipo "Painel Agency" (badge de ícone bem sólido/contrastado,
 * barra de destaque no topo do card, número grande em negrito), só que
 * SEM NENHUMA cor de marca: o badge neutro é sólido em branco/preto
 * (`bg-accent` + `text-base-950`, os mesmos tokens do botão primário) e só
 * os 3 tons de status fixos (bom/atenção/crítico) usam cor — nunca uma cor
 * "decorativa" nova. Número e rótulo sempre em `ink-*`, nunca na cor do
 * tone (ver `Badge`/`lib/utils/tone.ts` — a mesma regra de "cor nunca é a
 * única portadora de sentido" vale aqui: o rótulo por extenso já diz o que
 * é, o badge colorido é reforço, não a única pista).
 */
const STAT_TONE_META: Record<Tone, { badge: string; icon: string; dot: string }> = {
  neutral: { badge: "bg-accent", icon: "text-base-950", dot: "bg-ink-secondary" },
  good: { badge: "bg-status-good", icon: "text-base-950", dot: "bg-status-good" },
  warning: { badge: "bg-status-warning", icon: "text-base-950", dot: "bg-status-warning" },
  critical: { badge: "bg-status-critical", icon: "text-white", dot: "bg-status-critical" },
};

interface StatTileProps {
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  label: string;
  /** Normalmente `string | number`, mas aceita `ReactNode` pra permitir `<ValorPrivado>` nos tiles de Financeiro/Dashboard (ver `components/ui/ValorPrivado.tsx`). */
  value: ReactNode;
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
        // Sombra ambiente + realce interno no topo — a "profundidade"/glow
        // fixo da identidade visual (nunca colorido por branding).
        "shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05),0_20px_40px_-28px_rgba(255,255,255,0.35)]",
        "transition-transform duration-150 hover:-translate-y-0.5",
        className
      )}
    >
      {/* Barra de destaque no topo do card — gradiente branco fixo, nunca colorido por branding. */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-transparent via-white/70 to-transparent" />

      <div className={cn("mb-4 flex h-11 w-11 items-center justify-center rounded-xl shadow-sm", toneMeta.badge)}>
        <Icon className={cn("h-[22px] w-[22px]", toneMeta.icon)} strokeWidth={2} />
      </div>

      <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">{label}</p>
      <p className="mt-1.5 text-3xl font-bold tracking-tight text-ink-primary">{value}</p>

      {hint && (
        <p className="mt-3 flex items-center gap-1.5 text-xs text-ink-secondary">
          <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", toneMeta.dot)} />
          {hint}
        </p>
      )}
    </div>
  );
}
