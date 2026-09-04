/**
 * Sistema de "tone" compartilhado por todo indicador de estado do app —
 * badge de status de acesso (Ativo/Inativo/Expirado) e badge de status de
 * tráfego (Abaixo da Meta/No Caminho/Meta Batida) usam o mesmo conjunto de
 * 4 tons fixos, nunca cores inventadas por tela.
 *
 * Regra seguida aqui (skill interna de dataviz): a cor nunca é a única
 * portadora de significado — todo tone vem com um rótulo de texto, e o
 * TEXTO do badge fica em `ink-primary` (nunca na cor do tone), porque a cor
 * "critical" sozinha (#d03b3b) não atinge 4.5:1 de contraste em texto
 * pequeno no fundo escuro do app — só a bolinha/borda/fundo usam a cor.
 */
export type Tone = "good" | "warning" | "critical" | "neutral";

interface ToneMeta {
  badgeClassName: string;
  dotClassName: string;
  /** Preenchimento do Meter (cor sólida do tone). */
  meterFillClassName: string;
  /** Trilho do Meter — mesma rampa, bem mais clara (ver dataviz: "lighter step of the same ramp"). */
  meterTrackClassName: string;
}

export const TONE_META: Record<Tone, ToneMeta> = {
  good: {
    badgeClassName: "bg-status-good/15 border-status-good/30 text-ink-primary",
    dotClassName: "bg-status-good",
    meterFillClassName: "bg-status-good",
    meterTrackClassName: "bg-status-good/15",
  },
  warning: {
    badgeClassName: "bg-status-warning/15 border-status-warning/30 text-ink-primary",
    dotClassName: "bg-status-warning",
    meterFillClassName: "bg-status-warning",
    meterTrackClassName: "bg-status-warning/15",
  },
  critical: {
    badgeClassName: "bg-status-critical/15 border-status-critical/30 text-ink-primary",
    dotClassName: "bg-status-critical",
    meterFillClassName: "bg-status-critical",
    meterTrackClassName: "bg-status-critical/15",
  },
  neutral: {
    badgeClassName: "bg-status-neutral/15 border-status-neutral/30 text-ink-primary",
    dotClassName: "bg-status-neutral",
    meterFillClassName: "bg-status-neutral",
    meterTrackClassName: "bg-status-neutral/15",
  },
};
