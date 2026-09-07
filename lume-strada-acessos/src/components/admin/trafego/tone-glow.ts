import type { Tone } from "@/lib/utils/tone";

/**
 * Sombra "glow" esfumaçada por tone — usada nos cards premium de Tráfego &
 * Metas (MetaCard, KPI row) pra reforçar visualmente o status. Sempre como
 * REFORÇO: o rótulo/Badge ao lado já diz o status por extenso, a cor nunca
 * é a única pista. Mesma paleta fixa de `lib/utils/tone.ts`, só que como
 * `box-shadow` esfumaçado em vez de fundo/borda — escopado a este módulo.
 *
 * Cada valor já inclui o reflexo interno no topo (`inset 0 1px 0 0 white`)
 * JUNTO com o glow colorido, como uma ÚNICA declaração `shadow-[...]` — ver
 * `TarefaCard.tsx` pro motivo: duas classes `shadow-[...]` no mesmo
 * elemento não somam, só uma vence. Se algum consumidor precisar do glow
 * SEM reflexo (ex: em cima de um elemento fino como o `Meter`), não deve
 * combinar isso com outro `shadow-[...]` próprio.
 */
export const TONE_GLOW: Record<Tone, string> = {
  good: "shadow-[inset_0_1px_0_0_rgb(var(--glow-rgb) / 0.06),0_0_28px_-12px_rgba(12,163,12,0.5)]",
  warning: "shadow-[inset_0_1px_0_0_rgb(var(--glow-rgb) / 0.06),0_0_28px_-12px_rgba(250,178,25,0.5)]",
  critical: "shadow-[inset_0_1px_0_0_rgb(var(--glow-rgb) / 0.06),0_0_28px_-12px_rgba(211,59,59,0.45)]",
  neutral: "shadow-[inset_0_1px_0_0_rgb(var(--glow-rgb) / 0.06),0_0_28px_-12px_rgba(138,135,131,0.35)]",
};
