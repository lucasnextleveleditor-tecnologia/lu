/** O que o link solto do mapa libera para quem não tem conta. */
export type AcessoPublicoMapa = "privado" | "ver" | "comentar" | "editar";

export interface MapaMentalRow {
  id: string;
  company_id: string;
  titulo: string;
  token: string;
  acesso_publico: AcessoPublicoMapa;
  arquivado: boolean;
  criado_por: string | null;
  created_at: string;
  atualizado_em: string;
}

/**
 * Um balão do mapa.
 *
 * Repare no que NÃO existe aqui: `x` e `y`. A posição é calculada a cada
 * desenho (ver `lib/mapa-mental/layout.ts`); o que se guarda é só um
 * deslocamento opcional, para quem quiser puxar um ramo para outro canto.
 * É isso que faz duas pessoas editarem o mesmo mapa sem uma empurrar a
 * outra: não há coordenada para disputar.
 */
export interface MapaNoRow {
  id: string;
  mapa_id: string;
  /** `null` = é o balão do meio. Um mapa tem exatamente um. */
  pai_id: string | null;
  ordem: number;
  texto: string;
  /** `""` = herda a cor do ramo. */
  cor: string;
  colapsado: boolean;
  desloc_x: number | null;
  desloc_y: number | null;
  /** -1 esquerda, 1 direita, `null` = o layout equilibra sozinho. */
  lado: number | null;
  /** URL solta que a pessoa colou. `""` = sem link. */
  link: string;
  /** Caminho no bucket `mapas`. A URL pública é montada na leitura, nunca gravada. */
  imagem_path: string | null;
  /** Chave da fonte — nunca uma família CSS crua (ver `FONTES_MAPA`). */
  fonte: string;
  /** Tamanho em px. `0` = herda o padrão do nível do balão. */
  tamanho: number;
  negrito: boolean;
  italico: boolean;
}

/**
 * As quatro fontes.
 *
 * Todas são pilhas do próprio sistema operacional, de propósito: baixar mais
 * quatro fontes da web só para o mapa mental somaria centenas de kB ao app
 * inteiro e deixaria o balão trocar de largura no meio do desenho quando a
 * fonte terminasse de carregar — e o desenho é calculado, então isso
 * empurraria os vizinhos. Estas quatro já estão na máquina de quem abre, e
 * são visualmente bem diferentes entre si, que é o que a escolha precisa
 * entregar.
 *
 * `larguraChar` é o quanto cada uma ocupa por caractere, usado pelo cálculo
 * de posição — uma monoespaçada é bem mais larga que uma sem serifa.
 */
export const FONTES_MAPA = {
  // `larguraChar` é medida GENEROSA de propósito: subestimar faz o texto
  // estourar a caixa que o layout reservou, e aí ou ele é cortado ou quebra
  // uma linha que o cálculo não previu — e o balão cresce por baixo,
  // encostando no vizinho. Sobrar alguns pixels à direita não custa nada;
  // faltar arruína o desenho.
  padrao: { rotulo: "Padrão", css: "var(--font-sans), system-ui, sans-serif", larguraChar: 7.9 },
  sistema: { rotulo: "Sistema", css: "system-ui, -apple-system, 'Segoe UI', sans-serif", larguraChar: 7.8 },
  serifada: { rotulo: "Serifada", css: "Georgia, 'Times New Roman', serif", larguraChar: 7.6 },
  maquina: { rotulo: "Máquina", css: "ui-monospace, 'SF Mono', Menlo, Consolas, monospace", larguraChar: 8.7 },
} as const;

export type FonteMapa = keyof typeof FONTES_MAPA;
export const ORDEM_FONTES = Object.keys(FONTES_MAPA) as FonteMapa[];

/** Quatro degraus de tamanho. Mais que isso vira régua de milímetro num quadro de ideias. */
export const TAMANHOS_MAPA = [12, 14, 17, 21] as const;

export function fonteCss(chave: string): string {
  return (FONTES_MAPA[chave as FonteMapa] ?? FONTES_MAPA.padrao).css;
}

export function larguraCharDaFonte(chave: string): number {
  return (FONTES_MAPA[chave as FonteMapa] ?? FONTES_MAPA.padrao).larguraChar;
}

/** Altura reservada para a miniatura dentro do balão. */
export const ALTURA_IMAGEM = 96;

export interface MapaComentarioRow {
  id: string;
  mapa_id: string;
  no_id: string;
  autor: string;
  texto: string;
  created_at: string;
}

export interface MapaCompleto {
  mapa: MapaMentalRow;
  nos: MapaNoRow[];
  comentarios: MapaComentarioRow[];
}

/**
 * Cores dos ramos.
 *
 * Sete tons, e não uma roda de cores infinita: num mapa mental a cor serve
 * para SEPARAR ramos de relance, não para decorar. Sete é o limite em que
 * dois ramos ainda são distinguíveis um do outro num piscar de olhos — e
 * todos passam contraste tanto no fundo escuro quanto no claro, porque o
 * mesmo mapa é lido nos dois modos e impresso pelo link público.
 */
export const CORES_MAPA = {
  azul: "#4F7CFF",
  ciano: "#22B8CF",
  verde: "#37B24D",
  ambar: "#F59F00",
  coral: "#F76707",
  rosa: "#E64980",
  violeta: "#845EF7",
} as const;

export type CorMapa = keyof typeof CORES_MAPA;
export const ORDEM_CORES = Object.keys(CORES_MAPA) as CorMapa[];

/** A cor de um ramo: a escolhida à mão, ou a da posição do ramo na raiz. */
export function corDoRamo(corEscolhida: string, indiceDoRamo: number): string {
  if (corEscolhida && corEscolhida in CORES_MAPA) return CORES_MAPA[corEscolhida as CorMapa];
  return CORES_MAPA[ORDEM_CORES[indiceDoRamo % ORDEM_CORES.length] as CorMapa];
}
