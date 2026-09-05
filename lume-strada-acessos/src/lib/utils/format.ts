/** Data de hoje em ISO (yyyy-mm-dd), respeitando o fuso local do servidor/navegador. */
export function todayISO(): string {
  const d = new Date();
  const tz = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - tz).toISOString().slice(0, 10);
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

export function fmtBRL(valor: number): string {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 2 });
}

/** Formata um valor em moeda estrangeira (USD/EUR) — usado só pra EXIBIR o valor original de uma transação convertida (ver `fin_transacoes.valor_original`); nunca participa de soma nenhuma. */
export function fmtMoedaEstrangeira(valor: number, moeda: "USD" | "EUR"): string {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: moeda, minimumFractionDigits: 2 });
}

export function fmtPercent(valor: number): string {
  return `${Math.round(valor * 100)}%`;
}
