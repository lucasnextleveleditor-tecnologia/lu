/**
 * O atraso em cascata — a regra que faz a grade do evento andar sozinha.
 *
 * O PROBLEMA QUE ISTO RESOLVE. O show das 22h começa 22h30. Numa planilha,
 * alguém reescreve doze células e confere na mão — e é nesse momento, com o
 * evento correndo, que a conta sai errada. Aqui é um botão: +30 no bloco que
 * atrasou.
 *
 * AS TRÊS REGRAS, e são só três:
 *
 *   1. O bloco que atrasou anda.
 *   2. Anda junto o que vem DEPOIS dele, NO MESMO AMBIENTE, e que foi criado
 *      como "segue o anterior". O palco 2 não anda porque o palco 1 atrasou —
 *      são duas operações paralelas, e é justamente por isso que o evento tem
 *      ambientes.
 *   3. O que é "hora cravada" não se move NUNCA. Ativação contratada, virada
 *      da meia-noite, alvará de som, horário do artista: são compromissos com
 *      terceiros, e o relógio deles não atrasa junto com o nosso.
 *
 * E A PARTE QUE IMPORTA: o que a função NÃO faz. Ela não conserta as colisões
 * que o atraso criou. Ela APONTA cada uma e devolve — a tela pergunta, a
 * pessoa responde com um toque. Um sistema que empurra a ativação do
 * patrocinador sozinho, porque o show atrasou, está tomando uma decisão
 * comercial que não é dele; e um sistema que some com o problema é pior do que
 * a planilha, porque na planilha pelo menos a pessoa estava olhando.
 *
 * Tudo aqui é FUNÇÃO PURA sobre ISO: nada de fuso, nada de banco, nada de
 * React. É o pedaço que precisa estar certo, então é o pedaço que dá para
 * testar sozinho.
 */

export type AncoraDoBloco = "encadeado" | "cravado";

/** O mínimo que a cascata precisa saber de um bloco. */
export interface BlocoParaCascata {
  id: string;
  ambiente_id: string | null;
  titulo: string;
  tipo: string;
  ancora: AncoraDoBloco;
  /** ISO com fuso. */
  inicio: string;
  /** ISO, ou null para boom (instante). */
  fim: string | null;
  /** Desempate quando dois blocos começam no mesmo minuto. */
  ordem: number;
  /** Quem cobre — é o que permite ver a pessoa escalada em dois lugares ao mesmo tempo. */
  responsavel_id: string | null;
}

export interface Deslocamento {
  id: string;
  inicio: string;
  fim: string | null;
}

export type TipoDeColisao =
  /** Dois blocos do MESMO ambiente agora se sobrepõem. */
  | "sobreposicao"
  /** A mesma pessoa ficou escalada em dois blocos ao mesmo tempo. */
  | "mesma_pessoa"
  /** Um item de hora cravada trocou de lugar com o bloco que ele acompanhava. */
  | "ordem_trocada";

export interface Colisao {
  tipo: TipoDeColisao;
  /** O bloco cravado (ou o segundo bloco) que a tela vai oferecer para empurrar junto. */
  blocoId: string;
  titulo: string;
  /** Com quem ele colidiu. */
  contraId: string;
  contraTitulo: string;
}

export interface ResultadoDaCascata {
  deslocados: Deslocamento[];
  colisoes: Colisao[];
}

const MINUTO = 60_000;

function mover(iso: string, minutos: number): string {
  return new Date(new Date(iso).getTime() + minutos * MINUTO).toISOString();
}

function ms(iso: string): number {
  return new Date(iso).getTime();
}

/** Fim efetivo: um boom não tem fim, então ele ocupa só o próprio instante. */
function fimEfetivo(bloco: { inicio: string; fim: string | null }): number {
  return bloco.fim ? ms(bloco.fim) : ms(bloco.inicio);
}

function seSobrepoe(a: { inicio: string; fim: string | null }, b: { inicio: string; fim: string | null }): boolean {
  // Encostar não é sobrepor: um bloco que termina 22h e outro que começa 22h
  // são a operação normal de um palco, não um conflito.
  return ms(a.inicio) < fimEfetivo(b) && ms(b.inicio) < fimEfetivo(a);
}

/**
 * Aplica `minutos` ao bloco e a quem anda junto, e devolve o que mudou e o que
 * passou a colidir.
 *
 * `minutos` pode ser negativo — o evento também adianta, e quando adianta é
 * ainda mais importante a pauta andar junto: janela que fechou cedo é captação
 * marcada como perdida sem ter sido perdida.
 */
export function aplicarAtraso(
  blocos: readonly BlocoParaCascata[],
  blocoId: string,
  minutos: number
): ResultadoDaCascata {
  const alvo = blocos.find((b) => b.id === blocoId);
  if (!alvo || minutos === 0) return { deslocados: [], colisoes: [] };

  const naOrdem = (a: BlocoParaCascata, b: BlocoParaCascata) =>
    ms(a.inicio) - ms(b.inicio) || a.ordem - b.ordem || a.id.localeCompare(b.id);

  // Quem anda: o próprio alvo, mais os encadeados que vêm depois dele no mesmo
  // ambiente. Comparação por (início, ordem, id) para não depender de dois
  // blocos terem horários diferentes.
  const doAmbiente = blocos
    .filter((b) => b.ambiente_id === alvo.ambiente_id)
    .sort(naOrdem);

  const posicaoDoAlvo = doAmbiente.findIndex((b) => b.id === alvo.id);
  const andam = new Set<string>([alvo.id]);
  for (let i = posicaoDoAlvo + 1; i < doAmbiente.length; i++) {
    const b = doAmbiente[i]!;
    // Um cravado no meio da fila NÃO interrompe a corrente: o show seguinte
    // continua encadeado no anterior e anda: só o cravado fica parado. Parar
    // a corrente ali esconderia metade do atraso.
    if (b.ancora === "encadeado") andam.add(b.id);
  }

  const depois = new Map<string, BlocoParaCascata>();
  const deslocados: Deslocamento[] = [];
  for (const b of blocos) {
    if (!andam.has(b.id)) {
      depois.set(b.id, b);
      continue;
    }
    const novo: BlocoParaCascata = {
      ...b,
      inicio: mover(b.inicio, minutos),
      fim: b.fim ? mover(b.fim, minutos) : null,
    };
    depois.set(b.id, novo);
    deslocados.push({ id: novo.id, inicio: novo.inicio, fim: novo.fim });
  }

  return { deslocados, colisoes: acharColisoes(blocos, depois, andam) };
}

/**
 * O que passou a colidir DEPOIS do movimento.
 *
 * Só conta o que é novo: um evento cheio costuma já ter sobreposições de
 * propósito (a operação de montagem por cima da passagem de som, por exemplo).
 * Avisar de novo sobre o que já estava assim treina a pessoa a ignorar o
 * aviso — e aí, no dia em que o aviso importa, ninguém lê.
 */
function acharColisoes(
  antes: readonly BlocoParaCascata[],
  depois: ReadonlyMap<string, BlocoParaCascata>,
  andaram: ReadonlySet<string>
): Colisao[] {
  const antesPorId = new Map(antes.map((b) => [b.id, b]));
  const lista = [...depois.values()];
  const colisoes: Colisao[] = [];
  const jaVisto = new Set<string>();

  const registrar = (c: Colisao) => {
    const chave = `${c.tipo}|${[c.blocoId, c.contraId].sort().join("|")}`;
    if (jaVisto.has(chave)) return;
    jaVisto.add(chave);
    colisoes.push(c);
  };

  for (const a of lista) {
    for (const b of lista) {
      if (a.id >= b.id) continue;
      // Pelo menos um dos dois tem que ter se mexido; o resto do evento não é
      // problema deste atraso.
      if (!andaram.has(a.id) && !andaram.has(b.id)) continue;

      const aAntes = antesPorId.get(a.id)!;
      const bAntes = antesPorId.get(b.id)!;
      const colidiaAntes = seSobrepoe(aAntes, bAntes);
      const colideAgora = seSobrepoe(a, b);

      // O que se mexeu é sempre o encadeado; o que a tela oferece para empurrar
      // junto é o outro — o parado.
      const parado = andaram.has(a.id) ? b : a;
      const movido = andaram.has(a.id) ? a : b;

      if (colideAgora && !colidiaAntes) {
        if (a.ambiente_id === b.ambiente_id) {
          registrar({
            tipo: "sobreposicao",
            blocoId: parado.id,
            titulo: parado.titulo,
            contraId: movido.id,
            contraTitulo: movido.titulo,
          });
        } else if (a.responsavel_id && a.responsavel_id === b.responsavel_id) {
          // Ambientes diferentes se sobreporem é o normal de um evento — só
          // vira problema quando é a MESMA PESSOA nos dois. É o "o fotógrafo
          // está escalado nos dois".
          registrar({
            tipo: "mesma_pessoa",
            blocoId: parado.id,
            titulo: parado.titulo,
            contraId: movido.id,
            contraTitulo: movido.titulo,
          });
        }
      }

      // Ordem trocada: o cravado que ficou para trás. É o CO₂ que passa a
      // disparar ANTES do show que ele acompanhava. Não há sobreposição
      // nenhuma aqui — e é exatamente por isso que sem esta checagem o erro
      // passaria batido.
      if (parado.ancora === "cravado" && !colideAgora) {
        const antesDepoisDoMovido = ms(antesPorId.get(parado.id)!.inicio) >= ms(antesPorId.get(movido.id)!.inicio);
        const agoraAntesDoMovido = ms(parado.inicio) < ms(movido.inicio);
        if (antesDepoisDoMovido && agoraAntesDoMovido) {
          registrar({
            tipo: "ordem_trocada",
            blocoId: parado.id,
            titulo: parado.titulo,
            contraId: movido.id,
            contraTitulo: movido.titulo,
          });
        }
      }
    }
  }

  return colisoes;
}

/**
 * "Empurro a Ativação B também?" — sim.
 *
 * Empurrar um cravado é sempre decisão de gente, nunca do sistema; por isso
 * não acontece dentro de `aplicarAtraso`, mas numa chamada separada, depois do
 * toque na tela.
 */
export function empurrarTambem(
  blocos: readonly BlocoParaCascata[],
  ids: readonly string[],
  minutos: number
): Deslocamento[] {
  const alvos = new Set(ids);
  return blocos
    .filter((b) => alvos.has(b.id))
    .map((b) => ({ id: b.id, inicio: mover(b.inicio, minutos), fim: b.fim ? mover(b.fim, minutos) : null }));
}

/**
 * O fim de um bloco a partir da duração — a tela edita minutos, não hora de
 * fim, porque quando o bloco anda é a DURAÇÃO que precisa ficar igual.
 */
export function fimPelaDuracao(inicio: string, duracaoMin: number | null): string | null {
  if (!duracaoMin || duracaoMin <= 0) return null;
  return mover(inicio, duracaoMin);
}

/**
 * O PLAY. "O evento era 22h, dei o play 22h10" — a grade inteira anda 10
 * minutos e o relógio passa a valer.
 *
 * É o mesmo atraso em cascata de sempre, aplicado ao evento todo de uma vez:
 * tudo que é "segue o anterior" anda, tudo que é hora cravada fica onde está.
 * E isso é o certo, não um atalho: a virada da meia-noite continua à
 * meia-noite mesmo que o evento tenha começado atrasado, e a ativação
 * contratada para 23h continua contratada para 23h.
 *
 * Devolve a lista de deslocamentos e as colisões que o próprio atraso da
 * abertura criou — porque começar 10 minutos tarde já pode jogar o primeiro
 * show por cima de uma ativação, e é melhor descobrir isso no minuto do play
 * do que às duas da manhã.
 */
export function aplicarAtrasoDaAbertura(
  blocos: readonly BlocoParaCascata[],
  minutos: number
): ResultadoDaCascata {
  if (minutos === 0) return { deslocados: [], colisoes: [] };

  const depois = new Map<string, BlocoParaCascata>();
  const andaram = new Set<string>();
  const deslocados: Deslocamento[] = [];

  for (const b of blocos) {
    if (b.ancora !== "encadeado") {
      depois.set(b.id, b);
      continue;
    }
    const novo: BlocoParaCascata = {
      ...b,
      inicio: mover(b.inicio, minutos),
      fim: b.fim ? mover(b.fim, minutos) : null,
    };
    depois.set(b.id, novo);
    andaram.add(b.id);
    deslocados.push({ id: novo.id, inicio: novo.inicio, fim: novo.fim });
  }

  return { deslocados, colisoes: acharColisoes(blocos, depois, andaram) };
}

/** Quantos minutos o play atrasou em relação ao horário marcado. Negativo = começou adiantado. */
export function minutosDoPlay(inicioPrevisto: string, iniciadoEm: string): number {
  return Math.round((ms(iniciadoEm) - ms(inicioPrevisto)) / MINUTO);
}
