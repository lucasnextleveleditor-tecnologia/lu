/**
 * Os fusos que o módulo de Eventos oferece.
 *
 * Uma lista CURADA, e não `Intl.supportedValuesOf("timeZone")`, que devolve
 * mais de 400 entradas: rolar "Africa/Abidjan… America/Adak… Antarctica/Casey"
 * para achar São Paulo é o oposto de intuitivo, e a produtora não vai gravar
 * na Antártida. Aqui estão as três regiões onde esse trabalho acontece —
 * América do Sul, América do Norte e Europa — e o suficiente de cada uma para
 * cobrir um evento fora de casa.
 *
 * O identificador é IANA (`America/Sao_Paulo`) e não um deslocamento fixo
 * ("-03:00") de propósito: horário de verão existe, muda de ano para ano, e um
 * evento marcado hoje para dezembro precisa acertar a hora de dezembro. Só o
 * nome da zona carrega essa regra.
 *
 * O fuso NÃO muda a linha AGORA — tempo é absoluto. Ele muda como as horas
 * são ESCRITAS: a mesma timeline abre "21:00" para quem está no Rio e
 * "01:00" para quem está em Lisboa, e as duas estão certas.
 */

export interface GrupoDeFusos {
  /** Chave do rótulo no dicionário (`eventos.fusoRegiao*`). */
  regiao: "americaDoSul" | "americaDoNorte" | "europa";
  fusos: readonly string[];
}

export const FUSOS: readonly GrupoDeFusos[] = [
  {
    regiao: "americaDoSul",
    fusos: [
      "America/Sao_Paulo",
      "America/Bahia",
      "America/Fortaleza",
      "America/Belem",
      "America/Manaus",
      "America/Cuiaba",
      "America/Porto_Velho",
      "America/Rio_Branco",
      "America/Noronha",
      "America/Argentina/Buenos_Aires",
      "America/Montevideo",
      "America/Asuncion",
      "America/Santiago",
      "America/La_Paz",
      "America/Lima",
      "America/Bogota",
      "America/Caracas",
      "America/Guayaquil",
    ],
  },
  {
    regiao: "americaDoNorte",
    fusos: [
      "America/New_York",
      "America/Chicago",
      "America/Denver",
      "America/Phoenix",
      "America/Los_Angeles",
      "America/Anchorage",
      "Pacific/Honolulu",
      "America/Toronto",
      "America/Vancouver",
      "America/Mexico_City",
      "America/Cancun",
    ],
  },
  {
    regiao: "europa",
    fusos: [
      "Europe/Lisbon",
      "Atlantic/Madeira",
      "Atlantic/Azores",
      "Europe/Madrid",
      "Europe/London",
      "Europe/Dublin",
      "Europe/Paris",
      "Europe/Brussels",
      "Europe/Amsterdam",
      "Europe/Berlin",
      "Europe/Zurich",
      "Europe/Vienna",
      "Europe/Rome",
      "Europe/Prague",
      "Europe/Warsaw",
      "Europe/Stockholm",
      "Europe/Oslo",
      "Europe/Copenhagen",
      "Europe/Helsinki",
      "Europe/Athens",
      "Europe/Bucharest",
      "Europe/Istanbul",
    ],
  },
];

export const FUSO_PADRAO = "America/Sao_Paulo";

const TODOS: ReadonlySet<string> = new Set(FUSOS.flatMap((g) => g.fusos));

/** Fuso desconhecido (dado antigo, palpite do navegador) volta ao padrão em vez de quebrar o `Intl`. */
export function fusoValido(valor: string | null | undefined): string {
  return valor && TODOS.has(valor) ? valor : FUSO_PADRAO;
}

/**
 * "São Paulo" a partir de "America/Sao_Paulo".
 *
 * A cidade sai do próprio identificador em vez de uma tabela de tradução: o
 * nome de cidade é o mesmo nas três línguas do painel na esmagadora maioria
 * dos casos, e manter 50 nomes traduzidos à mão para ganhar "Lisboa" em vez
 * de "Lisbon" custa mais do que vale.
 */
export function cidadeDoFuso(fuso: string): string {
  const ultimo = fuso.split("/").pop() ?? fuso;
  return ultimo.replace(/_/g, " ");
}

/**
 * "UTC−03:00" — o deslocamento que o fuso tem NESTA data.
 *
 * Calculado a partir de uma data concreta, e não fixo, porque horário de
 * verão muda o número: Lisboa é UTC+00 em janeiro e UTC+01 em julho. Mostrar
 * o deslocamento errado ao lado do nome é pior do que não mostrar nenhum.
 */
export function deslocamentoDoFuso(fuso: string, quando: Date = new Date()): string {
  try {
    const parte = new Intl.DateTimeFormat("en-US", { timeZone: fuso, timeZoneName: "longOffset" })
      .formatToParts(quando)
      .find((p) => p.type === "timeZoneName")?.value;
    // O Intl devolve "GMT-03:00" e, no fuso zero, só "GMT".
    if (!parte) return "UTC+00:00";
    return parte === "GMT" ? "UTC+00:00" : parte.replace("GMT", "UTC");
  } catch {
    return "UTC+00:00";
  }
}

/** A hora no fuso do evento: "21:30". */
export function horaNoFuso(iso: string, fuso: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: fusoValido(fuso),
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(iso));
}
