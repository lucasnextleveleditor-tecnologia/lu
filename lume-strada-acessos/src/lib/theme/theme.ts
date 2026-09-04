/**
 * Modo de cor da interface — preto/escuro é a identidade visual FIXA da
 * plataforma (ver `tailwind.config.ts`), mas o usuário pode alternar pra um
 * modo claro por preferência pessoal (pedido explícito: botão ao lado do
 * seletor de idioma). Mesmo padrão do `locales.ts`: cookie sem prefixo de
 * URL, resolvido no servidor ANTES do primeiro render, pra nunca ter flash
 * do tema errado.
 */
export type Theme = "dark" | "light";

export const THEMES: Theme[] = ["dark", "light"];

/** Preto/escuro continua o padrão pra quem nunca escolheu — é a identidade histórica do app. */
export const DEFAULT_THEME: Theme = "dark";

/** Cookie que guarda o tema escolhido. */
export const THEME_COOKIE = "lsf_theme";

export function isTheme(valor: string | undefined | null): valor is Theme {
  return !!valor && (THEMES as string[]).includes(valor);
}
