import { cookies } from "next/headers";
import { DEFAULT_LOCALE, LOCALE_COOKIE, isLocale, type Locale } from "@/lib/i18n/locales";
import { pt, type Dictionary } from "@/lib/i18n/dictionaries/pt";
import { en } from "@/lib/i18n/dictionaries/en";
import { es } from "@/lib/i18n/dictionaries/es";

const DICIONARIOS: Record<Locale, Dictionary> = { pt, en, es };

/**
 * Lê o idioma escolhido (cookie `lsf_locale`, sem prefixo de URL) e retorna
 * o dicionário completo pronto pra usar — chamado em todo SERVER COMPONENT
 * que precisa de texto traduzido (`const { dict } = await getDictionary()`).
 * Componentes CLIENTE usam `useLocale()` (`LocaleProvider.tsx`) em vez
 * desta função — ela depende de `next/headers`, que só existe no servidor.
 */
export async function getDictionary(): Promise<{ locale: Locale; dict: Dictionary }> {
  const cookieStore = await cookies();
  const valor = cookieStore.get(LOCALE_COOKIE)?.value;
  const locale = isLocale(valor) ? valor : DEFAULT_LOCALE;
  return { locale, dict: DICIONARIOS[locale] };
}

export type { Dictionary };
