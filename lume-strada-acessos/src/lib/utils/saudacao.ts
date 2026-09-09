/**
 * Saudação por faixa de horário, na hora de QUEM ESTÁ OLHANDO — não na do
 * servidor.
 *
 * Isso importa mais do que parece: o app roda na Vercel, cujos servidores
 * respondem em UTC. Sem fixar o fuso, alguém abrindo o painel às 22h em São
 * Paulo (01h UTC do dia seguinte) receberia "boa madrugada". Como a agência
 * e os clientes estão no Brasil, o fuso é fixo aqui em vez de adivinhado —
 * `Intl` no servidor não tem como saber o relógio do navegador, e mandar a
 * saudação pro cliente calcular criaria diferença entre o HTML do servidor e
 * o do navegador (erro de hidratação do React).
 *
 * As quatro faixas são as pedidas pelo dono do produto:
 *   00:00–05:59  madrugada
 *   06:00–11:59  manhã
 *   12:00–17:59  tarde
 *   18:00–23:59  noite
 */
export type PeriodoDoDia = "madrugada" | "manha" | "tarde" | "noite";

export const FUSO_PADRAO = "America/Sao_Paulo";

/** Hora (0–23) no fuso dado, sem depender do relógio do servidor. */
export function horaNoFuso(agora: Date = new Date(), fuso: string = FUSO_PADRAO): number {
  const hora = new Intl.DateTimeFormat("pt-BR", { hour: "numeric", hour12: false, timeZone: fuso }).format(agora);
  // "24" aparece em algumas implementações para meia-noite; normaliza pra 0.
  return Number(hora) % 24;
}

export function periodoDoDia(agora: Date = new Date(), fuso: string = FUSO_PADRAO): PeriodoDoDia {
  const hora = horaNoFuso(agora, fuso);
  if (hora < 6) return "madrugada";
  if (hora < 12) return "manha";
  if (hora < 18) return "tarde";
  return "noite";
}

/**
 * Primeiro nome, para a saudação soar como uma pessoa falando e não como um
 * sistema lendo um cadastro. Nome vazio devolve `null` — quem chama monta a
 * frase sem o nome, em vez de escrever "Boa tarde, ,".
 */
export function primeiroNome(nomeCompleto: string | null | undefined): string | null {
  const limpo = (nomeCompleto ?? "").trim();
  if (!limpo) return null;
  const primeiro = limpo.split(/\s+/)[0]!;
  return primeiro.charAt(0).toUpperCase() + primeiro.slice(1);
}
