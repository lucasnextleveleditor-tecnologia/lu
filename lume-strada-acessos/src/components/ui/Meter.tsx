import { cn } from "@/lib/utils/cn";
import { TONE_META, type Tone } from "@/lib/utils/tone";

/**
 * Meter — "uma razão contra um limite" (ver skill de dataviz: forma certa
 * pra meta vs. realizado, não um gráfico de barras). Preenchimento sólido na
 * cor do tone; trilho na mesma rampa, bem mais claro, pra o estado se ler no
 * bar inteiro. Pontas arredondadas, fino (8px) — nunca um número dentro da
 * barra (o valor fica no texto ao lado, no componente que usa o Meter).
 */
export function Meter({ pct, tone, className }: { pct: number; tone: Tone; className?: string }) {
  const clamped = Math.max(0, Math.min(1, pct));
  const meta = TONE_META[tone];

  return (
    <div
      className={cn("h-2 w-full overflow-hidden rounded-full", meta.meterTrackClassName, className)}
      role="progressbar"
      aria-valuenow={Math.round(clamped * 100)}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div className={cn("h-full rounded-full transition-[width]", meta.meterFillClassName)} style={{ width: `${clamped * 100}%` }} />
    </div>
  );
}
