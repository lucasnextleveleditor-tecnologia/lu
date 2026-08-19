/**
 * Idiomas suportados pela interface — PT é o idioma "nativo" do produto
 * (comentários de código, nomes de tabela/coluna no banco etc. continuam
 * SEMPRE em português, só a interface visível pro usuário é traduzida).
 */
export type Locale = "pt" | "en" | "es";

export const LOCALES: Locale[] = ["pt", "en", "es"];

export const DEFAULT_LOCALE: Locale = "pt";

export const LOCALE_LABELS: Record<Locale, string> = {
  pt: "Português",
  en: "English",
  es: "Español",
};

/** Cookie que guarda o idioma escolhido — sem prefixo de URL (`/en/admin`), de propósito: é um painel interno, não um site multi-idioma indexado por buscador, e trocar de idioma no meio de uma sessão não deveria mudar a URL que a pessoa tem salva/compartilhada. */
export const LOCALE_COOKIE = "lsf_locale";

export function isLocale(valor: string | undefined | null): valor is Locale {
  return !!valor && (LOCALES as string[]).includes(valor);
}
