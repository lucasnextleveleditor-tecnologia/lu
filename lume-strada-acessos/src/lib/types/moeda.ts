import type { Locale } from "@/lib/i18n/locales";

/**
 * A moeda em que a empresa trabalha.
 *
 * É da EMPRESA, não de quem está olhando: é a unidade em que o faturamento é
 * medido, então precisa ser a mesma para o time inteiro. O IDIOMA é o
 * contrário — cada pessoa troca na tela quando quiser, e o número se adapta
 * a ela.
 *
 * São essas quatro porque são as dos países das três línguas do sistema:
 * português (Brasil e Portugal), inglês (Estados Unidos, Reino Unido,
 * Irlanda) e espanhol (Espanha).
 *
 * Trocar a moeda NÃO converte nada do que já foi lançado. A cotação de cada
 * dia era outra, e reescrever o histórico pela cotação de hoje falsificaria
 * o passado — nenhum sistema de gestão faz isso.
 */
export const MOEDAS = {
  BRL: { rotulo: "Real", simbolo: "R$", onde: "Brasil" },
  USD: { rotulo: "Dólar americano", simbolo: "US$", onde: "Estados Unidos" },
  EUR: { rotulo: "Euro", simbolo: "€", onde: "Portugal, Espanha, Irlanda" },
  GBP: { rotulo: "Libra esterlina", simbolo: "£", onde: "Reino Unido" },
} as const;

export type Moeda = keyof typeof MOEDAS;

export const ORDEM_MOEDAS: Moeda[] = ["BRL", "USD", "EUR", "GBP"];
export const MOEDA_PADRAO: Moeda = "BRL";

export function ehMoeda(valor: string | null | undefined): valor is Moeda {
  return !!valor && valor in MOEDAS;
}

/** Nunca confia no que veio do banco: linha antiga pode ter texto livre. */
export function moedaDe(valor: string | null | undefined): Moeda {
  return ehMoeda(valor) ? valor : MOEDA_PADRAO;
}

/**
 * O idioma da interface decide o FORMATO do número; a moeda decide o
 * símbolo. São coisas diferentes, e é por isso que os dois entram aqui.
 *
 * Quem lê em português vê "€ 1.234,56"; a mesma tela, em inglês, vira
 * "€1,234.56". O valor é o mesmo — muda só como aquele leitor está
 * acostumado a ler números.
 */
const LOCALE_NUMERICO: Record<Locale, string> = {
  pt: "pt-BR",
  pt_PT: "pt-PT",
  en: "en-US",
  es: "es-ES",
};

export function formatarMoeda(valor: number, moeda: Moeda, locale: Locale): string {
  return valor.toLocaleString(LOCALE_NUMERICO[locale] ?? "pt-BR", {
    style: "currency",
    currency: moeda,
    minimumFractionDigits: 2,
  });
}

/** Uma função já amarrada na moeda e no idioma — tem a mesma cara de `fmtMoeda(valor)` nos lugares que a usam. */
export type FormatadorMoeda = (valor: number) => string;

export function criarFormatador(moeda: Moeda, locale: Locale): FormatadorMoeda {
  // `Intl.NumberFormat` guardado uma vez: criar um formatador a cada célula
  // de uma tabela de trezentas linhas é caro, e o resultado é o mesmo.
  const nf = new Intl.NumberFormat(LOCALE_NUMERICO[locale] ?? "pt-BR", {
    style: "currency",
    currency: moeda,
    minimumFractionDigits: 2,
  });
  return (valor: number) => nf.format(valor);
}

/**
 * A moeda de UMA empresa, pelo id.
 *
 * Existe para os caminhos PÚBLICOS — o PDF de um contrato aberto por link,
 * por exemplo. Ali não há sessão, então `getDictionary()` cairia no padrão e
 * o cliente veria a proposta em real quando a agência trabalha em euro.
 * Quem chama passa um cliente Supabase que já enxergue a linha (Service Role
 * nos links públicos, sessão no painel).
 */
export async function moedaDaEmpresa(
  db: { from: (t: string) => any },
  companyId: string | null | undefined
): Promise<Moeda> {
  if (!companyId) return MOEDA_PADRAO;
  try {
    const { data } = await db.from("companies").select("moeda").eq("id", companyId).maybeSingle();
    return moedaDe((data as { moeda?: string | null } | null)?.moeda);
  } catch {
    return MOEDA_PADRAO;
  }
}
