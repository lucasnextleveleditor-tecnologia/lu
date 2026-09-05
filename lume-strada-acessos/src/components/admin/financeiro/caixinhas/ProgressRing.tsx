import { cn } from "@/lib/utils/cn";

interface ProgressRingProps {
  /** 0..1 — já clampado internamente, então pode passar >1 (meta batida) sem se preocupar. */
  pct: number;
  size?: number;
  strokeWidth?: number;
  /** Quando a meta já foi batida (pct >= 1), o anel troca pro verde "good" com glow — reforça a conquista sem precisar de mais um badge. */
  atingida?: boolean;
  className?: string;
}

/**
 * Anel de progresso circular "brilhante" pedido pro card da Caixinha — SVG
 * puro (sem lib nova), trilho fino em `white/10` e preenchimento sólido com
 * ponta arredondada (mesmo mark spec do `Meter`: nunca número dentro da
 * barra, o valor fica no centro como texto). O "glow" é o mesmo tipo de
 * `drop-shadow` já usado no resto da identidade Premium Dark (`TONE_GLOW`),
 * só aplicado como filtro SVG porque aqui o brilho precisa acompanhar a
 * CURVA do anel, não a caixa retangular do card.
 */
export function ProgressRing({ pct, size = 88, strokeWidth = 7, atingida = false, className }: ProgressRingProps) {
  const clamped = Math.max(0, Math.min(1, pct));
  const raio = (size - strokeWidth) / 2;
  const circunferencia = 2 * Math.PI * raio;
  const offset = circunferencia * (1 - clamped);
  const cor = atingida ? "#0ca30c" /* status.good — fixo nos dois modos */ : "rgb(var(--color-accent))"; /* acompanha o tema ativo */

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className={cn("-rotate-90", className)}
      role="progressbar"
      aria-valuenow={Math.round(clamped * 100)}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <circle cx={size / 2} cy={size / 2} r={raio} fill="none" stroke="rgb(var(--glow-rgb) / 0.08)" strokeWidth={strokeWidth} />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={raio}
        fill="none"
        stroke={cor}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circunferencia}
        strokeDashoffset={offset}
        style={{ filter: `drop-shadow(0 0 6px ${atingida ? "rgba(12,163,12,0.65)" : "rgb(var(--glow-rgb) / 0.45)"})`, transition: "stroke-dashoffset 0.5s ease" }}
      />
    </svg>
  );
}
