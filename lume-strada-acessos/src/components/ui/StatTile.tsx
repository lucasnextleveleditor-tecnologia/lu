import type { ComponentType, ReactNode, SVGProps } from "react";
import { cn } from "@/lib/utils/cn";
import type { Tone } from "@/lib/utils/tone";

/**
 * Cartão de KPI (ícone em badge sólido + rótulo + número grande) usado nas
 * linhas de resumo no topo de cada módulo do admin — inspirado em
 * dashboards tipo "Painel Agency" (badge de ícone bem sólido/contrastado,
 * barra de destaque no topo do card, número grande em negrito). O badge
 * neutro (default) é sólido no `bg-accent` (mesmo token do botão primário),
 * OPCIONALMENTE sobrescrito pela cor de identidade do módulo via a prop
 * `moduleColor` — e os 3 tons de status fixos (bom/atenção/crítico) sempre
 * têm prioridade sobre qualquer cor decorativa quando `tone` não é
 * `"neutral"`. Número e rótulo sempre em `ink-*`, nunca na cor do tone (ver
 * `Badge`/`lib/utils/tone.ts` — a mesma regra de "cor nunca é a única
 * portadora de sentido" vale aqui: o rótulo por extenso já diz o que é, o
 * badge colorido é reforço, não a única pista).
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
  /**
   * Cor de identidade do módulo (hex, ex: `"#34d399"` — ver
   * `colors.module.*` em `tailwind.config.ts`), OPCIONAL. Quando presente e
   * `tone` é `"neutral"` (o default), sobrescreve o badge do ícone com um
   * leve degradê do próprio tom no lugar do `bg-accent` fixo. Nunca
   * sobrescreve os badges de status semântico (`good`/`warning`/`critical`)
   * — cor de módulo é identidade, não pode competir com o significado de
   * status. Sem esta prop, comportamento idêntico ao de antes dela existir.
   */
  moduleColor?: string;
  /**
   * `"destaque"` (padrão) é o cartão de sempre: badge sólido, barra no topo,
   * número em 3xl. `"compacto"` é a versão quieta — sem badge sólido, sem
   * barra, número menor, ícone pequeno ao lado do rótulo.
   *
   * A variante existe porque um painel precisa de níveis. Quando todo cartão
   * grita, a pessoa não lê: varre. O compacto é para o número que vale a pena
   * estar na tela mas não vale interromper ninguém — a maioria deles.
   */
  variant?: "destaque" | "compacto";
}

export function StatTile({ icon: Icon, label, value, tone = "neutral", hint, className, moduleColor, variant = "destaque" }: StatTileProps) {
  const toneMeta = STAT_TONE_META[tone];
  const useModuleColor = tone === "neutral" && Boolean(moduleColor);

  if (variant === "compacto") {
    return (
      <div className={cn("rounded-xl border border-base-800 bg-base-900/60 p-4", className)}>
        <p className="flex items-center gap-1.5 text-xs text-ink-muted">
          <Icon className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate">{label}</span>
        </p>
        <p className="mt-2 truncate pb-0.5 text-xl font-semibold leading-[1.4] tracking-tight text-ink-primary">{value}</p>
        {hint && (
          <p className="mt-1.5 flex items-center gap-1.5 text-[11px] text-ink-muted">
            {tone !== "neutral" && <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", toneMeta.dot)} />}
            <span className="truncate">{hint}</span>
          </p>
        )}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border border-base-700 bg-base-900/80 p-5 backdrop-blur-sm",
        // Sombra ambiente + realce interno no topo — a "profundidade"/glow
        // fixo da identidade visual (nunca colorido por branding).
        "shadow-[inset_0_1px_0_0_rgb(var(--glow-rgb) / 0.05),0_20px_40px_-28px_rgb(var(--glow-rgb) / 0.35)]",
        "transition-transform duration-150 hover:-translate-y-0.5",
        className
      )}
    >
      {/* Barra de destaque no topo do card — gradiente azul do acento, consistente com a nova identidade. */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-transparent via-accent/60 to-transparent" />

      <div
        className={cn(
          "mb-4 flex h-11 w-11 items-center justify-center rounded-xl shadow-sm",
          !useModuleColor && toneMeta.badge
        )}
        style={useModuleColor ? { background: `linear-gradient(135deg, ${moduleColor}, ${moduleColor}dd)` } : undefined}
      >
        <Icon className={cn("h-[22px] w-[22px]", useModuleColor ? "text-white" : toneMeta.icon)} strokeWidth={2} />
      </div>

      <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">{label}</p>
      {/* `truncate` como rede de segurança: o valor formatado (ex: "R$ 2.500,00")
          nasce como um único "token" que o navegador não quebra em duas
          linhas (o espaço entre "R$" e o número é non-breaking, de
          `toLocaleString`) — sem isso, um valor mais largo que o tile
          simplesmente vaza e é cortado no meio pelo `overflow-hidden` do
          card (sem reticências, sem aviso nenhum de que há mais dígito).
          Com `truncate` vira uma elipse legível ("R$ 2.500,0…") no pior
          caso, mas o objetivo é o tile ter largura de sobra e nunca chegar
          nisso (ver comentário no grid de `financeiro/page.tsx`). */}
      <p className="mt-1.5 truncate pb-1 text-3xl font-bold leading-[1.4] tracking-tight text-ink-primary">{value}</p>

      {hint && (
        <p className="mt-3 flex items-center gap-1.5 text-xs text-ink-secondary">
          <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", toneMeta.dot)} />
          {hint}
        </p>
      )}
    </div>
  );
}
