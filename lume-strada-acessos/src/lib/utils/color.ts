/**
 * Utilitários de cor pro painel de Aparência — conversão pra o formato que
 * o Tailwind dinâmico precisa (`rgb(var(--x) / <alpha-value>)`) e um
 * checador de contraste WCAG independente (não usa o script da skill de
 * dataviz, que valida a paleta FIXA do app; aqui a cor é escolhida livremente
 * pelo admin em runtime, então o checador roda no navegador/servidor).
 */

const HEX_RE = /^#?([a-f\d]{3}|[a-f\d]{6})$/i;

export function isValidHex(hex: string): boolean {
  return HEX_RE.test(hex.trim());
}

function expandHex(hex: string): string | null {
  const match = HEX_RE.exec(hex.trim());
  const value = match?.[1];
  if (!value) return null;
  return value.length === 3
    ? value
        .split("")
        .map((c) => c + c)
        .join("")
    : value;
}

/** "#d4a24e" -> "212 162 78" — formato space-separated que o Tailwind espera em `rgb(var(--x) / <alpha-value>)`. */
export function hexToRgbTriplet(hex: string): string | null {
  const expanded = expandHex(hex);
  if (!expanded) return null;
  const r = parseInt(expanded.slice(0, 2), 16);
  const g = parseInt(expanded.slice(2, 4), 16);
  const b = parseInt(expanded.slice(4, 6), 16);
  return `${r} ${g} ${b}`;
}

/** Clareia uma cor em direção ao branco — usado pra derivar o tom "strong" (hover) a partir da cor primária escolhida. */
export function lightenHex(hex: string, amount: number): string {
  const triplet = hexToRgbTriplet(hex);
  if (!triplet) return hex;
  const [r = 0, g = 0, b = 0] = triplet.split(" ").map(Number);
  const mix = (channel: number) => Math.round(channel + (255 - channel) * amount);
  return `#${[mix(r), mix(g), mix(b)].map((c) => c.toString(16).padStart(2, "0")).join("")}`;
}

function relativeLuminance(hex: string): number {
  const triplet = hexToRgbTriplet(hex);
  if (!triplet) return 0;
  const [r = 0, g = 0, b = 0] = triplet
    .split(" ")
    .map(Number)
    .map((c) => c / 255)
    .map((c) => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** Razão de contraste WCAG (1:1 a 21:1) entre duas cores hex. */
export function contrastRatio(hexA: string, hexB: string): number {
  const l1 = relativeLuminance(hexA);
  const l2 = relativeLuminance(hexB);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Monta as variáveis CSS de branding a partir da config salva — usado tanto
 * no `<html style>` do layout raiz (aplica pra todo mundo) quanto, com
 * valores locais ainda não salvos, no painel de Aparência (live preview,
 * escopado só ao container do preview).
 */
export function buildBrandingCssVars(cores: { primaryColor: string; accentColor: string }): Record<string, string> {
  const primaryHex = isValidHex(cores.primaryColor) ? cores.primaryColor : "#d4a24e";
  const accentHex = isValidHex(cores.accentColor) ? cores.accentColor : "#e8bd72";
  const strongHex = lightenHex(primaryHex, 0.22);

  return {
    "--primary": primaryHex,
    "--color-accent": hexToRgbTriplet(primaryHex) ?? "212 162 78",
    "--color-accent-strong": hexToRgbTriplet(strongHex) ?? "232 189 114",
    "--color-accent-2": hexToRgbTriplet(accentHex) ?? "232 189 114",
  };
}
