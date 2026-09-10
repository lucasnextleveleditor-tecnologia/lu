/**
 * Compressor de arquivos — vocabulário comum das três estratégias.
 *
 * TUDO acontece no navegador de quem está usando, e isso não é uma escolha
 * de estilo: a Vercel recusa qualquer requisição com corpo acima de ~4,5 MB
 * e não tem ffmpeg instalado, então um vídeo de 1 GB nunca chegaria ao
 * servidor pra ser comprimido lá. Fazendo aqui, o arquivo não sai da máquina
 * dele — não gasta banda, não gasta armazenamento da conta e não passa por
 * nenhum lugar onde a gente precisaria guardá-lo.
 *
 * O preço disso é o que os limites abaixo tentam segurar: a memória é a do
 * navegador, e um vídeo grande demais não trava o servidor, trava a aba da
 * pessoa. Por isso os tetos são conservadores e o aviso aparece ANTES de
 * começar, não depois de dez minutos perdidos.
 */

export type TipoDeArquivo = "video" | "pdf" | "imagem";

export interface ProgressoCompressao {
  /** Texto curto do que está acontecendo agora ("Convertendo o vídeo…"). */
  etapa: string;
  /** 0–100, ou `null` quando a etapa não tem como medir progresso. */
  porcentagem: number | null;
}

export type AoProgredir = (p: ProgressoCompressao) => void;

export interface ResultadoCompressao {
  blob: Blob;
  nome: string;
  bytesAntes: number;
  bytesDepois: number;
  /**
   * Quando não deu pra chegar no alvo pedido, ou quando chegar custaria algo
   * que a pessoa precisa saber (texto virou imagem, transparência virou
   * fundo branco). Vazio = correu tudo como ela pediu.
   */
  aviso?: string;
}

/**
 * Todo texto que estas três estratégias podem mostrar — etapa da barra de
 * progresso, aviso no resultado e mensagem de erro.
 *
 * Elas NÃO importam o dicionário: são módulos de cálculo, e o idioma de quem
 * está olhando é decisão de quem chamou. Quem chama (`CompressorDeArquivos`)
 * já tem o dicionário na mão via `useLocale()` e passa este objeto adiante.
 * Assim as três funções continuam testáveis fora do app, e nenhuma frase
 * escapa da tradução — se faltar uma chave aqui, o `tsc` para.
 *
 * `{...}` marca onde entra número: `substituir()` faz a troca.
 */
export interface TextosDoCompressor {
  /** Sufixo do arquivo gerado: `contrato` + isto + `.pdf`. */
  sufixoArquivo: string;

  erroCanvas: string;
  erroGerarImagem: string;

  etapaAbrindoImagem: string;
  etapaTestandoQualidade: string;
  erroImagemNaoAbre: string;
  erroImagemGenerico: string;
  avisoMenorPossivel: string;
  avisoVirouJpg: string;
  avisoJaOtimizado: string;

  etapaProcurandoImagens: string;
  /** `{n}` = imagem atual, `{total}` = quantas ao todo. */
  etapaRecomprimindoImagem: string;
  etapaRemontandoPdf: string;
  etapaAbrindoDocumento: string;
  etapaCalculandoQualidade: string;
  /** `{n}` = página atual, `{total}` = quantas ao todo. */
  etapaConvertendoPagina: string;
  etapaMontandoArquivo: string;
  erroConverterPagina: string;
  avisoPdfSoTexto: string;
  /** `{kb}` = quanto a estrutura do PDF ocupa sozinha. */
  avisoAlvoImpossivelPdf: string;
  avisoImagensJaMinimas: string;
  avisoNaoChegouMantendoTexto: string;
  avisoDevolviMenor: string;
  avisoTextoVirouImagem: string;
  avisoAcimaDoAlvo: string;
  avisoRasterizarPiora: string;

  etapaBaixandoConversor: string;
  etapaPreparandoArquivo: string;
  etapaConvertendoVideo: string;
  etapaAjustando: string;
  etapaFinalizando: string;
  /** `{detalhe}` = mensagem técnica da falha, entre parênteses ou vazia. */
  erroBaixarConversor: string;
  erroDuracao: string;
  erroFormatoVideo: string;
  /** `{mb}` = alvo pedido, `{min}` = duração do vídeo em minutos. */
  erroAlvoImpossivelVideo: string;
  erroConversor: string;
  erroRespostaConversor: string;
  avisoVideoAcimaDoAlvo: string;
  /** `{altura}` = resolução final, em linhas (720, 1080…). */
  avisoResolucaoCaiu: string;
  avisoVideoJaComprimido: string;
}

/** Troca `{chave}` pelos valores dados. Sem chave correspondente, o texto passa intacto. */
export function substituir(texto: string, valores: Record<string, string | number>): string {
  return texto.replace(/\{(\w+)\}/g, (inteiro, chave: string) =>
    chave in valores ? String(valores[chave]) : inteiro
  );
}

/** Acima disto o navegador começa a ficar sem memória de verdade. */
export const LIMITES_DE_ENTRADA: Record<TipoDeArquivo, number> = {
  video: 500 * 1024 * 1024,
  pdf: 150 * 1024 * 1024,
  imagem: 60 * 1024 * 1024,
};

/** A partir daqui ainda funciona, mas é honesto avisar que vai demorar. */
export const AVISO_DE_PESO: Record<TipoDeArquivo, number> = {
  video: 250 * 1024 * 1024,
  pdf: 60 * 1024 * 1024,
  imagem: 25 * 1024 * 1024,
};

const EXT_VIDEO = ["mp4", "mov", "m4v", "webm", "mkv", "avi", "mpg", "mpeg", "wmv", "flv"];
const EXT_IMAGEM = ["jpg", "jpeg", "png", "webp", "bmp", "gif", "avif", "heic", "heif"];

export function extensaoDe(nome: string): string {
  const i = nome.lastIndexOf(".");
  return i === -1 ? "" : nome.slice(i + 1).toLowerCase();
}

/**
 * Descobre o tipo pelo MIME e, se ele vier vazio, pela extensão.
 *
 * A ordem importa: navegador em Windows costuma mandar `.mov` com MIME
 * vazio, e arquivo vindo de nuvem às vezes chega como
 * `application/octet-stream`. Confiar só no MIME faria a ferramenta recusar
 * arquivos que ela sabe tratar.
 */
export function detectarTipo(file: File): TipoDeArquivo | null {
  const mime = (file.type || "").toLowerCase();
  if (mime.startsWith("video/")) return "video";
  if (mime === "application/pdf") return "pdf";
  if (mime.startsWith("image/")) return "imagem";

  const ext = extensaoDe(file.name);
  if (EXT_VIDEO.includes(ext)) return "video";
  if (ext === "pdf") return "pdf";
  if (EXT_IMAGEM.includes(ext)) return "imagem";
  return null;
}

/**
 * Tamanho de arquivo em texto curto.
 *
 * As unidades (B, KB, MB, GB) NÃO são traduzidas de propósito: são as mesmas
 * nos três idiomas do app, e inventar variação regional aqui só criaria
 * chance de erro. O separador decimal segue o locale.
 */
export function fmtBytes(bytes: number, locale = "pt-BR"): string {
  const n = (valor: number, casas: number) =>
    valor.toLocaleString(locale, { minimumFractionDigits: casas, maximumFractionDigits: casas });
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${n(bytes / 1024, 0)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${n(bytes / (1024 * 1024), 1)} MB`;
  return `${n(bytes / (1024 * 1024 * 1024), 2)} GB`;
}

export const MB = 1024 * 1024;

/**
 * Atalhos de tamanho oferecidos como botão.
 *
 * Filtrados pelo tamanho do arquivo: não faz sentido oferecer "100 MB" pra
 * quem subiu um PDF de 8 MB — o alvo tem que ser menor que o original,
 * senão a ferramenta promete uma redução que não existe. O último item é
 * sempre uma fração do próprio arquivo, pra que sobre alguma opção mesmo em
 * arquivos pequenos.
 */
export function alvosSugeridos(tipo: TipoDeArquivo, bytesOriginais: number): number[] {
  const escada =
    tipo === "video"
      ? [25, 50, 100, 200, 500].map((n) => n * MB)
      : tipo === "pdf"
        ? [1, 2, 5, 10, 25].map((n) => n * MB)
        : [0.2, 0.5, 1, 2, 5].map((n) => n * MB);

  const validos = escada.filter((a) => a < bytesOriginais * 0.9);
  if (validos.length > 0) return validos.slice(-4);
  // Arquivo já é menor que o menor degrau: oferece metade e um terço dele.
  return [Math.round(bytesOriginais / 2), Math.round(bytesOriginais / 3)].filter((a) => a > 20 * 1024);
}

/** `contrato.pdf` + sufixo do idioma → `contrato-menor.pdf`, com a extensão nova quando ela muda. */
export function nomeDeSaida(nomeOriginal: string, novaExtensao: string, sufixo: string): string {
  const i = nomeOriginal.lastIndexOf(".");
  const base = i === -1 ? nomeOriginal : nomeOriginal.slice(0, i);
  return `${base}${sufixo}.${novaExtensao}`;
}

/**
 * Desenha um bitmap num canvas e devolve o JPEG.
 *
 * Existe aqui, e não dentro de cada estratégia, porque imagem solta, página
 * de PDF rasterizada e figura embutida num PDF terminam todas no mesmo
 * lugar: um canvas virando JPEG. `alpha: false` pinta o fundo de branco em
 * vez de preto — sem isso, todo PNG com transparência sai com tarja preta,
 * que é o erro clássico de quem converte PNG pra JPEG no canvas.
 */
export async function bitmapParaJpeg(
  bitmap: ImageBitmap,
  escala: number,
  qualidade: number,
  textos: TextosDoCompressor
): Promise<{ blob: Blob; largura: number; altura: number }> {
  const largura = Math.max(1, Math.round(bitmap.width * escala));
  const altura = Math.max(1, Math.round(bitmap.height * escala));

  const canvas = document.createElement("canvas");
  canvas.width = largura;
  canvas.height = altura;
  const ctx = canvas.getContext("2d", { alpha: false });
  if (!ctx) throw new Error(textos.erroCanvas);
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, largura, altura);
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(bitmap, 0, 0, largura, altura);

  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", qualidade));
  // Libera a memória do canvas na hora: num PDF de 80 páginas, deixar 80
  // canvases pro coletor de lixo decidir quando limpar estoura a aba.
  canvas.width = 0;
  canvas.height = 0;
  if (!blob) throw new Error(textos.erroGerarImagem);
  return { blob, largura, altura };
}

/** Dá ao navegador uma brecha pra redesenhar a barra de progresso entre etapas pesadas. */
export function respirar(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 0));
}
