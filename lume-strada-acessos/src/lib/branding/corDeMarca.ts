/**
 * Cor de marca por empresa — utilidades de cor compartilhadas pelo formulário
 * (`CorDaMarcaCard`), pela Server Action que salva (`salvarCoresMarca`) e pelo
 * `<style>` que aplica a cor no app (`BrandingAccentStyle`).
 *
 * Por que só UMA cor é escolhida pela agência: o sistema tem três variáveis de
 * acento (`--color-accent`, `--color-accent-strong` pro hover e
 * `--color-accent-2` pro par do gradiente). Pedir três cores pra quem só quer
 * "usar o azul da minha marca" é jogar no colo do usuário um problema de
 * design; então a agência escolhe a principal e as outras duas são derivadas
 * dela aqui, sempre com a mesma relação de claridade que a paleta original do
 * app já tinha.
 */

/** Aceita `#RGB` e `#RRGGBB`, com ou sem `#`. */
export function ehHexValido(hex: string): boolean {
  return /^#?(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(hex.trim());
}

export function normalizarHex(hex: string): string {
  const limpo = hex.trim().replace(/^#/, "");
  const completo = limpo.length === 3 ? limpo.split("").map((c) => c + c).join("") : limpo;
  return `#${completo.toUpperCase()}`;
}

function paraCanais(hex: string): [number, number, number] | null {
  if (!ehHexValido(hex)) return null;
  const limpo = normalizarHex(hex).slice(1);
  return [parseInt(limpo.slice(0, 2), 16), parseInt(limpo.slice(2, 4), 16), parseInt(limpo.slice(4, 6), 16)];
}

/**
 * Formato "r g b" (separado por espaço) — é o que `tailwind.config.ts` espera
 * dentro de `rgb(var(--x) / <alpha-value>)`. Um hex direto na variável
 * quebraria toda classe com opacidade (`bg-accent/15`, usada em dezenas de
 * lugares), por isso a conversão.
 */
export function hexParaTriploRgb(hex: string): string | null {
  const canais = paraCanais(hex);
  return canais ? canais.join(" ") : null;
}

/** Mistura a cor com branco (`fator` 0→1). Usado pra derivar o tom de hover. */
export function clarear(hex: string, fator: number): string {
  const canais = paraCanais(hex);
  if (!canais) return hex;
  const misturado = canais.map((c) => Math.round(c + (255 - c) * fator));
  return `#${misturado.map((c) => c.toString(16).padStart(2, "0")).join("").toUpperCase()}`;
}

/**
 * Luminância relativa (WCAG). Serve pra decidir se o texto por cima de um
 * botão preenchido com a cor da marca deve ser branco ou quase-preto — sem
 * isso, uma agência que escolhe amarelo fica com botão ilegível.
 */
export function luminancia(hex: string): number {
  const canais = paraCanais(hex);
  if (!canais) return 0;
  // Desestruturar o resultado de `.map()` daria `number | undefined` pro
  // TypeScript (ele não sabe que o array continua com 3 posições) — daí a
  // função nomeada aplicada canal a canal.
  const linearizar = (c: number) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * linearizar(canais[0]) + 0.7152 * linearizar(canais[1]) + 0.0722 * linearizar(canais[2]);
}

/** Cor de texto legível sobre um fundo preenchido com `hex`. */
export function contrasteSobre(hex: string): "#FFFFFF" | "#0B0E17" {
  return luminancia(hex) > 0.45 ? "#0B0E17" : "#FFFFFF";
}

/**
 * Paleta de partida — nomeada e escolhida pra este projeto, não copiada de
 * lugar nenhum. `accent2` é o par do gradiente de cada uma; quem usa a cor
 * livre (hex digitado) recebe um `accent2` derivado por `clarear`.
 */
export const PRESETS_MARCA = [
  { chave: "azul", cor: "#4F7CFF", accent2: "#22D3EE" },
  { chave: "verde", cor: "#2E9E6B", accent2: "#5FD3A0" },
  { chave: "ambar", cor: "#D4A24E", accent2: "#E8BD72" },
  { chave: "vinho", cor: "#B4485F", accent2: "#E07A8B" },
  { chave: "violeta", cor: "#7C5CFF", accent2: "#B49CFF" },
  { chave: "grafite", cor: "#6B7280", accent2: "#9CA3AF" },
] as const;

export type ChavePresetMarca = (typeof PRESETS_MARCA)[number]["chave"];

/** Par do gradiente pra uma cor livre: a própria cor bem mais clara. */
export function accent2Derivado(hex: string): string {
  return clarear(hex, 0.42);
}
