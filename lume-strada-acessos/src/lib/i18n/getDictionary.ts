import { cache } from "react";
import { cookies } from "next/headers";
import { DEFAULT_LOCALE, LOCALE_COOKIE, isLocale, type Locale } from "@/lib/i18n/locales";
import { criarFormatador, moedaDe, MOEDA_PADRAO, type FormatadorMoeda, type Moeda } from "@/lib/types/moeda";
import { createClient } from "@/lib/supabase/server";
import { pt, type Dictionary } from "@/lib/i18n/dictionaries/pt";
import { en } from "@/lib/i18n/dictionaries/en";
import { es } from "@/lib/i18n/dictionaries/es";
import { ptPT } from "@/lib/i18n/dictionaries/pt-PT";

/**
 * Cada idioma entra como FUNCAO, e nao como objeto pronto: o portugues de
 * Portugal e derivado do de Brasil na primeira chamada (ver
 * `dictionaries/pt-PT/index.ts`), e como objeto pronto essa travessia
 * aconteceria no carregamento do modulo, em toda instancia do servidor,
 * inclusive nas que nunca vao servir uma pessoa em Portugal.
 */
const DICIONARIOS: Record<Locale, () => Dictionary> = { pt: () => pt, pt_PT: ptPT, en: () => en, es: () => es };

/**
 * A moeda e o idioma padrão da empresa de quem está logado.
 *
 * `cache()` do React: uma leitura por requisição, por mais componentes que
 * peçam. Nunca lança — sem sessão (tela de login, link público) cai no
 * padrão, porque uma configuração ausente não pode derrubar a página.
 *
 * A RLS de `companies` já restringe a UMA linha, a da própria empresa, então
 * não há filtro por id aqui: ninguém enxerga a configuração de outra empresa.
 */
export const getConfigDaEmpresa = cache(async (): Promise<{ moeda: Moeda; idiomaPadrao: Locale | null }> => {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("companies")
      .select("moeda, idioma_padrao")
      .maybeSingle<{ moeda: string | null; idioma_padrao: string | null }>();
    return {
      moeda: moedaDe(data?.moeda),
      idiomaPadrao: isLocale(data?.idioma_padrao) ? data.idioma_padrao : null,
    };
  } catch {
    return { moeda: MOEDA_PADRAO, idiomaPadrao: null };
  }
});

/**
 * Lê o idioma e a moeda e devolve tudo pronto pra usar — chamado em todo
 * SERVER COMPONENT que precisa de texto traduzido ou de valor em dinheiro
 * (`const { dict, fmtMoeda } = await getDictionary()`). Componentes CLIENTE
 * usam `useLocale()` (`LocaleProvider.tsx`) em vez desta função — ela
 * depende de `next/headers`, que só existe no servidor.
 *
 * A ORDEM entre o idioma escolhido e o padrão da empresa importa e é
 * deliberada: o cookie de quem está lendo vence. O padrão da empresa diz com
 * que língua o sistema ABRE para quem nunca escolheu; não tira de ninguém o
 * direito de trocar na tela.
 */
export async function getDictionary(): Promise<{
  locale: Locale;
  dict: Dictionary;
  moeda: Moeda;
  fmtMoeda: FormatadorMoeda;
}> {
  const cookieStore = await cookies();
  const escolhido = cookieStore.get(LOCALE_COOKIE)?.value;
  const { moeda, idiomaPadrao } = await getConfigDaEmpresa();
  const locale = isLocale(escolhido) ? escolhido : (idiomaPadrao ?? DEFAULT_LOCALE);
  return { locale, dict: DICIONARIOS[locale](), moeda, fmtMoeda: criarFormatador(moeda, locale) };
}

export type { Dictionary };
