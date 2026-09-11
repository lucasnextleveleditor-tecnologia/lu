/**
 * O fuso em que o sistema pensa. Datas como vencimento, entrega e
 * expiracao sao dias de calendario da agencia, nao instantes.
 */
export const FUSO_APP = "America/Sao_Paulo";

/**
 * Data de hoje (yyyy-mm-dd) no fuso da agencia — nao no fuso do processo.
 *
 * A versao anterior usava o fuso local, e o servidor roda em UTC: das 21h a
 * meia-noite no Brasil, "hoje" no servidor ja era amanha. Isso marcava
 * orcamento como expirado 3 horas antes da hora e datava lancamento
 * financeiro no dia seguinte. `en-CA` porque e o locale que formata
 * exatamente como yyyy-mm-dd.
 */
export function todayISO(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: FUSO_APP,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

export function addDaysISO(iso: string, delta: number): string {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + delta);
  return d.toISOString().slice(0, 10);
}

/**
 * Soma `delta` meses a uma data ISO, CLAMPANDO o dia pro último dia válido
 * do mês de destino em vez de deixar o `Date` do JS "rolar" pro mês
 * seguinte — usada pra gerar o vencimento de cada parcela do Financeiro
 * (ver `criarTransacaoParcelada`). Sem isso, "31/01 + 1 mês" viraria
 * "03/03" (rollover padrão do JS Date); com o clamp vira "28/29 de
 * fevereiro", que é o comportamento esperado de qualquer parcelamento.
 */
export function addMonthsISO(iso: string, delta: number): string {
  const [y, m, d] = iso.split("-").map(Number);
  const primeiroDiaAlvo = new Date(Date.UTC(y!, m! - 1 + delta, 1));
  const ultimoDiaDoMes = new Date(Date.UTC(primeiroDiaAlvo.getUTCFullYear(), primeiroDiaAlvo.getUTCMonth() + 1, 0)).getUTCDate();
  const diaFinal = Math.min(d!, ultimoDiaDoMes);
  const resultado = new Date(Date.UTC(primeiroDiaAlvo.getUTCFullYear(), primeiroDiaAlvo.getUTCMonth(), diaFinal));
  return resultado.toISOString().slice(0, 10);
}

export function fmtDataCurta(iso: string): string {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

/** "Terça-feira, 12 de agosto" — usado no cabeçalho do seletor de dia do módulo de Tráfego. */
export function fmtDataExtensa(iso: string): string {
  const label = new Date(`${iso}T00:00:00`).toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
  });
  return label.charAt(0).toUpperCase() + label.slice(1);
}

// `fmtBRL` foi removida de propósito: ela travava o sistema inteiro em real.
// Dinheiro agora sai por `fmtMoeda`, que vem do `useLocale()` nos componentes
// cliente e do `getDictionary()` nos server components — os dois já amarrados
// na moeda da empresa e no idioma de quem está lendo (ver `lib/types/moeda.ts`).

/** Formata um valor em moeda estrangeira (USD/EUR) — usado só pra EXIBIR o valor original de uma transação convertida (ver `fin_transacoes.valor_original`); nunca participa de soma nenhuma. */
export function fmtMoedaEstrangeira(valor: number, moeda: "USD" | "EUR"): string {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: moeda, minimumFractionDigits: 2 });
}

export function fmtPercent(valor: number): string {
  return `${Math.round(valor * 100)}%`;
}

/** Aplica a máscara de CPF (11 dígitos) ou CNPJ (14 dígitos) pra exibição — se não bater nenhum dos dois tamanhos, devolve os dígitos como vieram (nunca quebra a tela por causa de um dado antigo/inválido). */
export function fmtCpfCnpj(valor: string): string {
  const digitos = valor.replace(/\D/g, "");
  if (digitos.length === 11) {
    return digitos.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
  }
  if (digitos.length === 14) {
    return digitos.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5");
  }
  return valor;
}

/**
 * "quinta-feira" — o dia da semana de uma data ISO, no idioma de quem olha.
 *
 * Existe porque "10/09/2026" não responde a pergunta que se faz olhando para
 * um prazo: cai em dia útil? é véspera de fim de semana? dá para gravar? Quem
 * trabalha com entrega raciocina por dia da semana, e traduzir a data de
 * cabeça é um trabalho pequeno feito dezenas de vezes por dia.
 *
 * `timeZone: "UTC"` não é detalhe: a data vem como `yyyy-mm-dd` puro e é lida
 * como meia-noite UTC. Sem fixar o fuso, quem estiver a oeste de Greenwich vê
 * o dia ANTERIOR — o prazo de sexta virando quinta na tela.
 */
export function diaDaSemanaDe(iso: string, locale: string): string {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString(locale, { weekday: "long", timeZone: "UTC" });
}
