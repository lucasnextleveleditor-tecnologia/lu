import type { MapaNoRow } from "@/lib/types/mapa-mental";

/**
 * Onde cada balão fica.
 *
 * O layout é CALCULADO, nunca guardado. Duas razões, e as duas importam:
 *
 * 1. Um mapa mental cresce e encolhe o tempo todo. Se a posição fosse
 *    gravada, todo balão novo deixaria os vizinhos por cima uns dos outros e
 *    alguém teria de arrumar a mão — que é exatamente o trabalho que o mapa
 *    deveria poupar.
 * 2. Duas pessoas editando ao mesmo tempo nunca disputam coordenada, porque
 *    não existe coordenada guardada para disputar. Cada uma recebe a árvore
 *    e chega, sozinha, ao mesmo desenho.
 *
 * Quem quiser puxar um ramo para outro canto guarda um DESLOCAMENTO sobre a
 * posição calculada (`desloc_x`/`desloc_y`) — o ajuste sobrevive ao mapa
 * crescer em volta, e "Reorganizar" zera todos de uma vez.
 *
 * A forma é a clássica: o balão do meio, e os ramos abrindo para os dois
 * lados. Cada lado é uma árvore horizontal; a altura de um ramo é a soma da
 * altura dos filhos, então nada nunca se sobrepõe.
 */

export const LARGURA_MIN = 92;
export const LARGURA_MAX = 224;
export const ALTURA_LINHA = 19;
export const PADDING_X = 14;
export const PADDING_Y = 11;
/** Espaço horizontal entre um balão e os filhos dele. */
export const VAO_X = 62;
/** Respiro vertical entre dois irmãos. */
export const VAO_Y = 14;

/**
 * Tamanho do balão a partir do texto, SEM medir no navegador.
 *
 * Medir de verdade (`getBoundingClientRect`) daria pixel exato, mas exigiria
 * desenhar uma vez, medir, e desenhar de novo — e, pior, cada pessoa mediria
 * com a sua fonte carregada num momento diferente, então o mesmo mapa ficaria
 * com desenhos diferentes em duas telas. Uma estimativa determinística vale
 * mais aqui do que precisão: todo mundo vê o mesmo mapa.
 */
export function medirBalao(texto: string, ehRaiz: boolean): { largura: number; altura: number } {
  const escala = ehRaiz ? 8.4 : 7.3; // largura média do caractere na Outfit
  const conteudo = texto.trim() || "…";
  const larguraIdeal = conteudo.length * escala + PADDING_X * 2;
  const largura = Math.max(LARGURA_MIN, Math.min(ehRaiz ? LARGURA_MAX + 40 : LARGURA_MAX, larguraIdeal));

  const porLinha = Math.max(1, Math.floor((largura - PADDING_X * 2) / escala));
  // Conta as quebras que a pessoa digitou, além das que o texto vai dar
  // sozinho ao encher a linha.
  const linhas = conteudo
    .split("\n")
    .reduce((total, linha) => total + Math.max(1, Math.ceil(linha.length / porLinha)), 0);

  const alturaLinha = ehRaiz ? ALTURA_LINHA + 4 : ALTURA_LINHA;
  return { largura, altura: linhas * alturaLinha + PADDING_Y * 2 };
}

export interface BalaoPosicionado {
  no: MapaNoRow;
  x: number;
  y: number;
  largura: number;
  altura: number;
  /** -1 = à esquerda do meio, 1 = à direita. A raiz é 0. */
  lado: number;
  profundidade: number;
  /** Índice do ramo na raiz — é ele que decide a cor herdada. */
  ramo: number;
  cor: string;
  temFilhos: boolean;
  filhosOcultos: number;
}

export interface MapaDesenhado {
  baloes: BalaoPosicionado[];
  ligacoes: { de: string; para: string; cor: string }[];
  /** Retângulo que envolve tudo — o zoom "encaixar na tela" usa isto. */
  limites: { minX: number; minY: number; maxX: number; maxY: number };
}

/** Filhos de um nó, na ordem, indexados uma vez só. */
function indexarFilhos(nos: MapaNoRow[]): Map<string | null, MapaNoRow[]> {
  const mapa = new Map<string | null, MapaNoRow[]>();
  for (const no of nos) {
    const chave = no.pai_id;
    const atual = mapa.get(chave);
    if (atual) atual.push(no);
    else mapa.set(chave, [no]);
  }
  for (const lista of mapa.values()) lista.sort((a, b) => a.ordem - b.ordem);
  return mapa;
}

/**
 * Altura que um ramo inteiro ocupa — a soma dos filhos, ou a do próprio
 * balão quando o ramo está fechado ou não tem filhos. É esta conta,
 * feita de baixo para cima, que garante que nada se sobreponha.
 */
function alturaDoRamo(no: MapaNoRow, filhosDe: Map<string | null, MapaNoRow[]>, cache: Map<string, number>): number {
  const guardado = cache.get(no.id);
  if (guardado !== undefined) return guardado;

  const { altura } = medirBalao(no.texto, no.pai_id === null);
  const filhos = no.colapsado ? [] : (filhosDe.get(no.id) ?? []);

  let total = altura;
  if (filhos.length > 0) {
    total = filhos.reduce((soma, filho) => soma + alturaDoRamo(filho, filhosDe, cache), 0) + VAO_Y * (filhos.length - 1);
    total = Math.max(total, altura);
  }

  cache.set(no.id, total);
  return total;
}

export function desenharMapa(nos: MapaNoRow[], corDoRamo: (cor: string, ramo: number) => string): MapaDesenhado {
  const encontrada = nos.find((n) => n.pai_id === null);
  if (!encontrada) {
    return { baloes: [], ligacoes: [], limites: { minX: 0, minY: 0, maxX: 0, maxY: 0 } };
  }
  // Copiado para uma const já estreitada: as funções aninhadas abaixo usam
  // `raiz.id`, e o TypeScript não carrega o resultado do `if` acima para
  // dentro de uma função declarada depois.
  const raiz: MapaNoRow = encontrada;

  const filhosDe = indexarFilhos(nos);
  const cacheAltura = new Map<string, number>();

  const baloes: BalaoPosicionado[] = [];
  const ligacoes: { de: string; para: string; cor: string }[] = [];

  const medidaRaiz = medirBalao(raiz.texto, true);
  baloes.push({
    no: raiz,
    x: -medidaRaiz.largura / 2,
    y: -medidaRaiz.altura / 2,
    largura: medidaRaiz.largura,
    altura: medidaRaiz.altura,
    lado: 0,
    profundidade: 0,
    ramo: 0,
    cor: "",
    temFilhos: (filhosDe.get(raiz.id) ?? []).length > 0,
    filhosOcultos: raiz.colapsado ? (filhosDe.get(raiz.id) ?? []).length : 0,
  });

  const ramos = raiz.colapsado ? [] : (filhosDe.get(raiz.id) ?? []);

  // Distribui os ramos entre os dois lados. Quem escolheu um lado à mão fica
  // nele; o resto vai alternando, para os dois lados crescerem parelhos.
  const direita: MapaNoRow[] = [];
  const esquerda: MapaNoRow[] = [];
  let alternador = 0;
  for (const ramo of ramos) {
    if (ramo.lado === -1) esquerda.push(ramo);
    else if (ramo.lado === 1) direita.push(ramo);
    else (alternador++ % 2 === 0 ? direita : esquerda).push(ramo);
  }

  /** Empilha uma lista de ramos verticalmente, centrada na altura do meio. */
  function empilhar(lista: MapaNoRow[], lado: -1 | 1) {
    if (lista.length === 0) return;

    const alturaTotal =
      lista.reduce((soma, no) => soma + alturaDoRamo(no, filhosDe, cacheAltura), 0) + VAO_Y * (lista.length - 1);

    let topo = -alturaTotal / 2;
    lista.forEach((no, i) => {
      const altura = alturaDoRamo(no, filhosDe, cacheAltura);
      const centroY = topo + altura / 2;
      const indiceRamo = ramos.indexOf(no);
      posicionar(no, lado, medidaRaiz.largura / 2 + VAO_X, centroY, 1, indiceRamo, raiz.id);
      topo += altura + VAO_Y;
    });
  }

  /**
   * Coloca um balão e desce para os filhos.
   *
   * `distancia` é o quanto o balão está afastado do meio; `centroY` é onde o
   * RAMO inteiro está centrado, não o balão — é o que mantém o pai alinhado
   * com o miolo dos filhos em vez de com o primeiro deles.
   */
  function posicionar(
    no: MapaNoRow,
    lado: -1 | 1,
    distancia: number,
    centroY: number,
    profundidade: number,
    ramo: number,
    paiId: string
  ) {
    const { largura, altura } = medirBalao(no.texto, false);
    const x = lado === 1 ? distancia : -distancia - largura;
    const y = centroY - altura / 2;

    const filhos = no.colapsado ? [] : (filhosDe.get(no.id) ?? []);
    const todosOsFilhos = filhosDe.get(no.id) ?? [];
    const cor = corDoRamo(no.cor, ramo);

    baloes.push({
      no,
      x: x + (no.desloc_x ?? 0),
      y: y + (no.desloc_y ?? 0),
      largura,
      altura,
      lado,
      profundidade,
      ramo,
      cor,
      temFilhos: todosOsFilhos.length > 0,
      filhosOcultos: no.colapsado ? todosOsFilhos.length : 0,
    });
    ligacoes.push({ de: paiId, para: no.id, cor });

    if (filhos.length === 0) return;

    const alturaFilhos =
      filhos.reduce((soma, f) => soma + alturaDoRamo(f, filhosDe, cacheAltura), 0) + VAO_Y * (filhos.length - 1);
    let topo = centroY - alturaFilhos / 2;

    for (const filho of filhos) {
      const alturaF = alturaDoRamo(filho, filhosDe, cacheAltura);
      posicionar(filho, lado, distancia + largura + VAO_X, topo + alturaF / 2, profundidade + 1, ramo, no.id);
      topo += alturaF + VAO_Y;
    }
  }

  empilhar(direita, 1);
  empilhar(esquerda, -1);

  const limites = baloes.reduce(
    (acc, b) => ({
      minX: Math.min(acc.minX, b.x),
      minY: Math.min(acc.minY, b.y),
      maxX: Math.max(acc.maxX, b.x + b.largura),
      maxY: Math.max(acc.maxY, b.y + b.altura),
    }),
    { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity }
  );

  return { baloes, ligacoes, limites };
}

/**
 * A curva que liga pai e filho.
 *
 * Curva e não reta: numa árvore que abre para os dois lados, retas cruzadas
 * viram um emaranhado difícil de seguir com o olho. A curva sai horizontal
 * do pai e chega horizontal no filho, então o olho acompanha o ramo sem
 * perder de qual pai ele vem.
 */
export function caminhoLigacao(
  pai: BalaoPosicionado,
  filho: BalaoPosicionado
): string {
  const saiDireita = filho.x > pai.x;
  const x1 = saiDireita ? pai.x + pai.largura : pai.x;
  const y1 = pai.y + pai.altura / 2;
  const x2 = saiDireita ? filho.x : filho.x + filho.largura;
  const y2 = filho.y + filho.altura / 2;
  const curva = Math.max(24, Math.abs(x2 - x1) * 0.5);
  const c1 = saiDireita ? x1 + curva : x1 - curva;
  const c2 = saiDireita ? x2 - curva : x2 + curva;
  return `M ${x1} ${y1} C ${c1} ${y1}, ${c2} ${y2}, ${x2} ${y2}`;
}
