/**
 * Menções `@nome` — a regra de quem é quem.
 *
 * Escrever `@` e escolher alguém numa lista é fácil. O difícil é o texto
 * SOBREVIVER: ele é salvo como texto puro (ou como HTML, no briefing), é
 * reaberto, é editado por outra pessoa, é copiado de um campo para outro. Não
 * existe onde pendurar um id no meio de uma frase sem que a primeira edição
 * manual quebre o vínculo.
 *
 * Por isso a menção NÃO guarda id nenhum: ela é só o texto `@apelido`, e o
 * apelido é derivado do nome por uma regra determinística (`apelidoDe`).
 * Quem recebe é recalculado a cada salvamento, comparando os apelidos do
 * texto com os apelidos da equipe de hoje. Consequências, ditas de frente:
 *
 * - Trocar o nome de alguém em Equipe quebra as menções antigas dessa pessoa.
 *   É o preço de não ter id no texto, e é barato: a menção já cumpriu seu
 *   papel (avisar) no momento em que foi escrita.
 * - Dois nomes que geram o mesmo apelido (dois "Ana Souza") notificam os
 *   dois. Preferimos avisar duas pessoas a escolher a errada em silêncio.
 */

/**
 * "Lucas Melo" → "lucasmelo". Sem acento, sem espaço, minúsculo.
 *
 * Tira acento em vez de transliterar à mão porque quem digita `@ana` depois
 * de ver "Ana Sá" na lista não vai lembrar de acentuar — e uma menção que
 * exige acerto de acento é uma menção que não chega.
 */
export function apelidoDe(nome: string): string {
  return nome
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

/**
 * O `@` e o que vem depois dele, dentro de um texto qualquer.
 *
 * Mínimo de 2 caracteres para não transformar cada e-mail (`@`, `@g`) numa
 * tentativa de menção, e teto de 40 para o caso de alguém colar um parágrafo
 * inteiro grudado num arroba.
 */
const REGEX_MENCAO = /@([a-z0-9]{2,40})/gi;

/** Todos os apelidos mencionados num texto, sem repetição e já normalizados. */
export function apelidosMencionados(texto: string | null | undefined): string[] {
  if (!texto) return [];
  const achados = texto.matchAll(REGEX_MENCAO);
  return Array.from(new Set(Array.from(achados, (m) => m[1]!.toLowerCase())));
}

/**
 * O briefing é HTML (`contentEditable`). Um `@ana` pode estar partido ao meio
 * por uma tag — `@<b>ana</b>` — e a regex nunca o veria. Tirar as tags antes
 * de procurar resolve isso, e de quebra impede que um atributo (`<a
 * href="mailto:x@y">`) vire menção.
 */
export function textoDeHtml(html: string | null | undefined): string {
  if (!html) return "";
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

export interface MembroMencionavel {
  /** `profiles.id` — quem recebe a notificação. Nulo em quem ainda não tem acesso ao sistema. */
  profileId: string | null;
  nome: string;
  cargo: string | null;
}

/**
 * Cruza os `@` escritos com a equipe de hoje.
 *
 * Devolve só quem tem conta (`profileId`): mencionar um freelancer que ainda
 * não recebeu acesso é legítimo como anotação, mas não há sino para tocar.
 */
export function destinatariosDasMencoes(
  textos: (string | null | undefined)[],
  equipe: MembroMencionavel[]
): MembroMencionavel[] {
  const apelidos = new Set(textos.flatMap((t) => apelidosMencionados(t)));
  if (apelidos.size === 0) return [];

  const encontrados = new Map<string, MembroMencionavel>();
  for (const membro of equipe) {
    if (!membro.profileId) continue;
    if (apelidos.has(apelidoDe(membro.nome))) encontrados.set(membro.profileId, membro);
  }
  return Array.from(encontrados.values());
}

/**
 * O trecho que a pessoa está digitando depois de um `@`, para alimentar a
 * lista de sugestões — ou `null` quando o cursor não está numa menção.
 *
 * O `@` só abre a lista quando está no começo do texto ou depois de um
 * espaço/quebra de linha. Sem essa condição, digitar um e-mail abriria o
 * seletor de pessoas no meio da palavra, toda vez.
 */
export function mencaoEmDigitacao(textoAteOCursor: string): { termo: string; inicio: number } | null {
  const m = /(^|[\s(\[])@([a-z0-9]*)$/i.exec(textoAteOCursor);
  if (!m) return null;
  const termo = m[2] ?? "";
  return { termo: termo.toLowerCase(), inicio: textoAteOCursor.length - termo.length - 1 };
}

/** Filtra a equipe pelo que já foi digitado — por apelido e por nome, porque quem digita `@ana` e quem digita `@souza` procura a mesma pessoa. */
export function filtrarEquipe(equipe: MembroMencionavel[], termo: string): MembroMencionavel[] {
  if (!termo) return equipe.slice(0, 8);
  const alvo = apelidoDe(termo);
  return equipe.filter((m) => apelidoDe(m.nome).includes(alvo)).slice(0, 8);
}
