/** O que o link solto do mapa libera para quem não tem conta. */
export type AcessoPublicoMapa = "privado" | "ver" | "comentar" | "editar";

export interface MapaMentalRow {
  id: string;
  company_id: string;
  titulo: string;
  token: string;
  acesso_publico: AcessoPublicoMapa;
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
}

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
