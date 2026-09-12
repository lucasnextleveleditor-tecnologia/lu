/**
 * Idiomas suportados pela interface — PT é o idioma "nativo" do produto
 * (comentários de código, nomes de tabela/coluna no banco etc. continuam
 * SEMPRE em português, só a interface visível pro usuário é traduzida).
 */
// "pt-PT" na FORMA BCP-47 exata, e nao "pt_PT": este valor e passado direto
// para `toLocaleDateString`/`toLocaleString` em dezenas de telas, e um
// underscore ali e `RangeError: Incorrect locale information provided` --
// pagina inteira em branco, nao numero mal formatado. O preco e ter que citar
// a chave nos objetos; e barato perto disso.
export type Locale = "pt" | "pt-PT" | "en" | "es";

export const LOCALES: Locale[] = ["pt", "pt-PT", "en", "es"];

export const DEFAULT_LOCALE: Locale = "pt";

/**
 * O que `Intl` entende. `toLocaleDateString("pt")` até funciona, mas cai no
 * padrão europeu de Portugal em alguns navegadores — e "11/09" virando
 * "11.09" muda a leitura de uma data no meio de uma frase. Fixar a região
 * tira essa variação do caminho.
 */
export const LOCALE_BCP47: Record<Locale, string> = {
  pt: "pt-BR",
  "pt-PT": "pt-PT",
  en: "en-US",
  es: "es-ES",
};

export const LOCALE_LABELS: Record<Locale, string> = {
  // Com duas variantes de portugues na lista, "Portugues" sozinho deixa de
  // identificar qual: quem ve as duas linhas precisa da regiao no rotulo.
  pt: "Português (BR)",
  "pt-PT": "Português (PT)",
  en: "English",
  es: "Español",
};

/** Cookie que guarda o idioma escolhido — sem prefixo de URL (`/en/admin`), de propósito: é um painel interno, não um site multi-idioma indexado por buscador, e trocar de idioma no meio de uma sessão não deveria mudar a URL que a pessoa tem salva/compartilhada. */
export const LOCALE_COOKIE = "lsf_locale";

export function isLocale(valor: string | undefined | null): valor is Locale {
  return !!valor && (LOCALES as string[]).includes(valor);
}
