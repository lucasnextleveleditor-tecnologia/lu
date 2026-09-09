export type AssinaturaStatus = "rascunho" | "enviado" | "assinado" | "cancelado";
export type SignatarioStatus = "pendente" | "visualizado" | "assinado" | "recusado";

export interface AssinaturaDocumentoRow {
  id: string;
  company_id: string;
  titulo: string;
  arquivo_path: string;
  arquivo_nome: string;
  paginas: number;
  hash_original: string | null;
  status: AssinaturaStatus;
  ordem_obrigatoria: boolean;
  criado_por: string | null;
  enviado_em: string | null;
  concluido_em: string | null;
  arquivado: boolean;
  /** PDF final carimbado. O original em `arquivo_path` NUNCA é alterado. */
  arquivo_assinado_path: string | null;
  hash_assinado: string | null;
  assinado_gerado_em: string | null;
  created_at: string;
  atualizado_em: string;
}

export interface SignatarioRow {
  id: string;
  documento_id: string;
  nome: string;
  email: string;
  /** CPF esperado. Quando preenchido, o que a pessoa digitar ao assinar tem de bater. */
  documento: string | null;
  papel: string;
  ordem: number;
  token: string;
  status: SignatarioStatus;
  visualizado_em: string | null;
  assinado_em: string | null;
  ip: string | null;
  user_agent: string | null;
  nome_informado: string | null;
  cpf_informado: string | null;
  assinatura_imagem: string | null;
}

/**
 * Um campo que uma pessoa preenche no documento.
 *
 * Posição e tamanho em FRAÇÃO da página (0 a 1), nunca em pixels: o mesmo
 * campo precisa cair no lugar certo em três tamanhos diferentes — a tela de
 * quem posiciona, a tela de quem assina (que pode ser um celular) e o PDF
 * final, medido em pontos. Fração é a única unidade que sobrevive aos três.
 */
export interface CampoAssinaturaRow {
  id: string;
  documento_id: string;
  signatario_id: string;
  pagina: number;
  tipo: TipoCampo;
  x: number;
  y: number;
  largura: number;
  altura: number;
}

export type TipoCampo = "assinatura" | "rubrica" | "nome" | "cpf" | "data";

/**
 * Os cinco campos, e o tamanho padrão de cada um em fração de página.
 *
 * Uma assinatura ocupa uma faixa larga e baixa; uma rubrica é um quadradinho;
 * data e CPF são linhas curtas de texto. Nascer com o tamanho certo poupa
 * quem está posicionando de redimensionar cada campo que solta.
 */
export const TIPOS_CAMPO: Record<TipoCampo, { rotulo: string; largura: number; altura: number }> = {
  assinatura: { rotulo: "Assinatura", largura: 0.26, altura: 0.06 },
  rubrica: { rotulo: "Rubrica", largura: 0.1, altura: 0.05 },
  nome: { rotulo: "Nome", largura: 0.24, altura: 0.03 },
  cpf: { rotulo: "CPF", largura: 0.18, altura: 0.03 },
  data: { rotulo: "Data", largura: 0.14, altura: 0.03 },
};

export const ORDEM_TIPOS_CAMPO: TipoCampo[] = ["assinatura", "rubrica", "nome", "cpf", "data"];

/** Sete cores para distinguir signatários de relance — as mesmas do mapa mental. */
export const CORES_SIGNATARIO = ["#4F7CFF", "#22B8CF", "#37B24D", "#F59F00", "#F76707", "#E64980", "#845EF7"];

export function corDoSignatario(indice: number): string {
  return CORES_SIGNATARIO[indice % CORES_SIGNATARIO.length] as string;
}

/** Um acontecimento da trilha. Escrito uma vez e nunca editado — é o que se apresenta se alguém contestar. */
export interface EventoAssinaturaRow {
  id: string;
  documento_id: string;
  signatario_id: string | null;
  tipo: string;
  descricao: string;
  ip: string | null;
  user_agent: string | null;
  created_at: string;
}

export interface DocumentoCompleto {
  documento: AssinaturaDocumentoRow;
  signatarios: SignatarioRow[];
  campos: CampoAssinaturaRow[];
}
