/**
 * Tamanho de arquivo em texto curto, no idioma de quem está lendo.
 *
 * As unidades (B, KB, MB, GB) NÃO são traduzidas de propósito: são as mesmas
 * nos três idiomas do app, e inventar variação regional aqui só criaria
 * chance de erro. O que muda é o separador decimal — "1,5 MB" em português e
 * espanhol, "1.5 MB" em inglês — e isso quem resolve é o `Intl`, não um
 * `replace(".", ",")` fixo como era antes.
 *
 * Uma casa decimal até 10 MB e nenhuma acima disso: "8,4 MB" ajuda a
 * comparar, "347,2 MB" só polui.
 */
const KB = 1024;
const MB = 1024 * KB;
const GB = 1024 * MB;

export function fmtBytes(bytes: number, locale: string = "pt-BR"): string {
  const n = (valor: number, casas: number) =>
    valor.toLocaleString(locale, { minimumFractionDigits: casas, maximumFractionDigits: casas });

  if (!Number.isFinite(bytes) || bytes < 0) return "—";
  if (bytes < KB) return `${bytes} B`;
  if (bytes < MB) return `${n(bytes / KB, 0)} KB`;
  if (bytes < GB) return `${n(bytes / MB, bytes < 10 * MB ? 1 : 0)} MB`;
  return `${n(bytes / GB, 1)} GB`;
}
