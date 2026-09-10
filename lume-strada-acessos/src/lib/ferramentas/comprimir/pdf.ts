import { PDFDocument, PDFName, PDFNumber, PDFRawStream } from "pdf-lib";
import {
  bitmapParaJpeg,
  nomeDeSaida,
  respirar,
  type AoProgredir,
  type ResultadoCompressao,
} from "./nucleo";

/**
 * Duas maneiras muito diferentes de encolher um PDF — e a escolha entre elas
 * é do usuário, não da ferramenta, porque uma delas cobra um preço que só
 * ele sabe se pode pagar.
 *
 * `preservar-texto` mexe SÓ nas imagens que já estão dentro do PDF: acha
 * cada figura JPEG embutida, redesenha menor e coloca de volta no lugar. O
 * texto continua texto — dá pra buscar, copiar, e um leitor de tela ainda lê.
 * É o certo pra contrato, proposta, nota fiscal.
 *
 * `rasterizar` desenha cada página como se fosse uma foto e monta um PDF novo
 * só com essas fotos. Encolhe muito mais e funciona em qualquer PDF, mas o
 * documento deixa de ter texto: ninguém mais busca uma palavra dentro dele.
 * É o certo pra um escaneado que já era imagem de qualquer jeito.
 *
 * Um PDF de texto puro (contrato gerado pelo próprio sistema) não ganha nada
 * com nenhuma das duas — não há imagem pra encolher, e rasterizar
 * provavelmente deixaria o arquivo MAIOR. Nesse caso a ferramenta devolve o
 * original e diz isso, em vez de entregar um arquivo pior fingindo sucesso.
 */
export type EstrategiaPdf = "preservar-texto" | "rasterizar";

// ---------------------------------------------------------------------------

export async function comprimirPdf(
  file: File,
  alvoBytes: number,
  estrategia: EstrategiaPdf,
  aoProgredir: AoProgredir
): Promise<ResultadoCompressao> {
  const bytes = new Uint8Array(await file.arrayBuffer());
  return estrategia === "rasterizar"
    ? rasterizar(file, bytes, alvoBytes, aoProgredir)
    : reencodarImagens(file, bytes, alvoBytes, aoProgredir);
}

// --- Estratégia 1: mexer só nas imagens, mantendo o texto -------------------

/** Degraus (escala, qualidade) escolhidos pelo quanto é preciso encolher. */
function degrauPara(razao: number): { escala: number; qualidade: number } {
  if (razao >= 0.75) return { escala: 1, qualidade: 0.82 };
  if (razao >= 0.5) return { escala: 1, qualidade: 0.68 };
  if (razao >= 0.32) return { escala: 1, qualidade: 0.52 };
  if (razao >= 0.2) return { escala: 0.85, qualidade: 0.45 };
  if (razao >= 0.12) return { escala: 0.7, qualidade: 0.4 };
  if (razao >= 0.06) return { escala: 0.55, qualidade: 0.35 };
  return { escala: 0.4, qualidade: 0.3 };
}

async function reencodarImagens(
  file: File,
  bytes: Uint8Array,
  alvoBytes: number,
  aoProgredir: AoProgredir
): Promise<ResultadoCompressao> {
  aoProgredir({ etapa: "Procurando as imagens dentro do PDF…", porcentagem: 6 });

  // `ignoreEncryption` deixa abrir PDF com dono/senha vazia (o caso comum de
  // arquivo exportado por scanner). Se tiver senha de verdade, o load falha
  // logo aqui e o erro sobe legível.
  const doc = await PDFDocument.load(bytes, { ignoreEncryption: true, updateMetadata: false });
  const contexto = doc.context;

  const candidatas: Array<{ ref: any; stream: PDFRawStream }> = [];
  let bytesEmImagens = 0;

  for (const [ref, obj] of contexto.enumerateIndirectObjects()) {
    if (!(obj instanceof PDFRawStream)) continue;
    const dict = obj.dict;
    if (String(dict.get(PDFName.of("Subtype"))) !== "/Image") continue;
    // Só JPEG: é o que o navegador sabe decodificar de volta com
    // `createImageBitmap`. PNG embutido (FlateDecode) e JPEG-2000 ficam de
    // fora — mexer neles exigiria decodificar o formato à mão.
    if (!String(dict.get(PDFName.of("Filter"))).includes("DCTDecode")) continue;
    // Máscara de recorte (1 bit por pixel) não é foto: reencodar como JPEG
    // destruiria o recorte.
    if (String(dict.get(PDFName.of("ImageMask"))) === "true") continue;

    candidatas.push({ ref, stream: obj });
    bytesEmImagens += obj.contents.length;
  }

  if (candidatas.length === 0 || bytesEmImagens < file.size * 0.15) {
    return {
      blob: new Blob([bytes.slice()], { type: "application/pdf" }),
      nome: file.name,
      bytesAntes: file.size,
      bytesDepois: file.size,
      aviso:
        "Este PDF é quase todo texto — não há imagem pesada pra encolher, então não dá pra reduzir sem transformar o texto em foto. Se você aceitar perder a busca dentro do documento, troque para “Rasterizar as páginas”.",
    };
  }

  // Quanto do peso do arquivo NÃO são as imagens: fonte, texto, estrutura.
  // Esse tanto não some, então o alvo real das imagens é o que sobra.
  const fixo = Math.max(0, file.size - bytesEmImagens);
  const alvoDasImagens = alvoBytes - fixo;
  if (alvoDasImagens <= bytesEmImagens * 0.03) {
    return {
      blob: new Blob([bytes.slice()], { type: "application/pdf" }),
      nome: file.name,
      bytesAntes: file.size,
      bytesDepois: file.size,
      aviso: `Esse alvo é impossível mantendo o texto: só a estrutura do documento já ocupa ${Math.round(fixo / 1024)} KB. Escolha um alvo maior ou use “Rasterizar as páginas”.`,
    };
  }

  const { escala, qualidade } = degrauPara(alvoDasImagens / bytesEmImagens);
  let trocadas = 0;

  for (let i = 0; i < candidatas.length; i++) {
    const candidata = candidatas[i];
    if (!candidata) continue;
    const { ref, stream } = candidata;
    aoProgredir({
      etapa: `Recomprimindo imagem ${i + 1} de ${candidatas.length}…`,
      porcentagem: 8 + Math.round((i / candidatas.length) * 78),
    });
    await respirar();

    try {
      // `slice()` copia: passar a view direto num Blob e depois deixar o
      // pdf-lib mexer no buffer original já rendeu arquivo corrompido.
      const original = stream.contents;
      const bitmap = await createImageBitmap(new Blob([original.slice()], { type: "image/jpeg" }));
      const nova = await bitmapParaJpeg(bitmap, escala, qualidade);
      bitmap.close();

      const conteudo = new Uint8Array(await nova.blob.arrayBuffer());
      // Se a recompressão não ganhou nada (imagem já pequena ou já muito
      // comprimida), mantém a original — trocar por uma maior seria pior.
      if (conteudo.length >= original.length) continue;

      const dict = stream.dict;
      dict.set(PDFName.of("Width"), PDFNumber.of(nova.largura));
      dict.set(PDFName.of("Height"), PDFNumber.of(nova.altura));
      dict.set(PDFName.of("BitsPerComponent"), PDFNumber.of(8));
      dict.set(PDFName.of("ColorSpace"), PDFName.of("DeviceRGB"));
      dict.set(PDFName.of("Length"), PDFNumber.of(conteudo.length));
      // O canvas devolve JPEG RGB comum: qualquer instrução de inversão ou
      // de parâmetro do filtro antigo agora estaria mentindo sobre o dado.
      dict.delete(PDFName.of("Decode"));
      dict.delete(PDFName.of("DecodeParms"));

      contexto.assign(ref, PDFRawStream.of(dict, conteudo));
      trocadas++;
    } catch {
      // Uma figura que o navegador não decodifica (CMYK, perfil exótico) não
      // pode derrubar o arquivo inteiro: fica como está.
      continue;
    }
  }

  aoProgredir({ etapa: "Remontando o PDF…", porcentagem: 92 });
  const saida = await doc.save({ useObjectStreams: true });
  const blob = new Blob([saida.slice()], { type: "application/pdf" });

  const avisos: string[] = [];
  if (trocadas === 0) avisos.push("As imagens deste PDF já estavam no menor tamanho possível.");
  if (blob.size > alvoBytes)
    avisos.push(
      "Não deu pra chegar no alvo mantendo o texto do documento. Se puder abrir mão da busca dentro do PDF, tente “Rasterizar as páginas”."
    );
  if (blob.size >= file.size)
    avisos.push("O arquivo original já estava otimizado — devolvi o menor dos dois.");

  return {
    blob: blob.size < file.size ? blob : new Blob([bytes.slice()], { type: "application/pdf" }),
    nome: blob.size < file.size ? nomeDeSaida(file.name, "pdf") : file.name,
    bytesAntes: file.size,
    bytesDepois: Math.min(blob.size, file.size),
    aviso: avisos.length > 0 ? avisos.join(" ") : undefined,
  };
}

// --- Estratégia 2: cada página vira uma foto --------------------------------

/**
 * Escalas de rasterização, da mais nítida para a mais econômica.
 *
 * 2 ≈ 144 dpi (lê bem na tela e imprime aceitável); 0,8 ≈ 58 dpi, que já é
 * visivelmente borrado de perto mas ainda legível. Abaixo disso o documento
 * deixa de servir como documento.
 */
const RASTER_MINIMO = { escala: 0.8, qualidade: 0.4 };
const ESCADA_RASTER: ReadonlyArray<{ escala: number; qualidade: number }> = [
  { escala: 2, qualidade: 0.82 },
  { escala: 1.7, qualidade: 0.72 },
  { escala: 1.4, qualidade: 0.62 },
  { escala: 1.15, qualidade: 0.55 },
  { escala: 0.95, qualidade: 0.48 },
  RASTER_MINIMO,
];

async function carregarPdfjs() {
  const pdfjs = await import("pdfjs-dist");
  // Mesmo arquivo estático usado pelo visualizador de contratos — ver
  // `PaginaPdf.tsx` e `scripts/copiar-worker-pdf.mjs`.
  pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
  return pdfjs;
}

async function desenharPagina(pagina: any, escala: number, qualidade: number): Promise<{ jpeg: Uint8Array; largura: number; altura: number }> {
  const viewport = pagina.getViewport({ scale: escala });
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.floor(viewport.width));
  canvas.height = Math.max(1, Math.floor(viewport.height));
  const ctx = canvas.getContext("2d", { alpha: false });
  if (!ctx) throw new Error("Este navegador não conseguiu abrir a área de desenho.");
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  await pagina.render({ canvasContext: ctx, viewport, background: "#ffffff" }).promise;

  const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, "image/jpeg", qualidade));
  const largura = canvas.width;
  const altura = canvas.height;
  // Zerar o canvas devolve a memória na hora; num PDF de oitenta páginas,
  // esperar o coletor de lixo decidir sozinho estoura a aba.
  canvas.width = 0;
  canvas.height = 0;
  if (!blob) throw new Error("Não consegui converter a página em imagem.");
  return { jpeg: new Uint8Array(await blob.arrayBuffer()), largura, altura };
}

async function rasterizar(
  file: File,
  bytes: Uint8Array,
  alvoBytes: number,
  aoProgredir: AoProgredir
): Promise<ResultadoCompressao> {
  aoProgredir({ etapa: "Abrindo o documento…", porcentagem: 4 });
  const pdfjs = await carregarPdfjs();
  // O pdf.js assume a posse do buffer que recebe (ele o transfere pro
  // worker), então vai uma cópia — o `bytes` original ainda é usado abaixo.
  const doc = await pdfjs.getDocument({ data: bytes.slice() }).promise;
  const paginas = doc.numPages;

  // Mede a primeira página em cada degrau e estima o total. Renderizar as
  // 80 páginas seis vezes pra descobrir o degrau certo levaria minutos; uma
  // página em cada degrau leva segundos e erra pouco, porque páginas de um
  // mesmo documento costumam pesar parecido.
  aoProgredir({ etapa: "Calculando a qualidade que cabe no alvo…", porcentagem: 8 });
  const primeira = await doc.getPage(1);
  let escolhido = RASTER_MINIMO;
  for (const degrau of ESCADA_RASTER) {
    const amostra = await desenharPagina(primeira, degrau.escala, degrau.qualidade);
    // +6% de folga: estrutura do PDF e a variação entre páginas.
    if (amostra.jpeg.length * paginas * 1.06 + 3000 <= alvoBytes) {
      escolhido = degrau;
      break;
    }
    await respirar();
  }

  const saidaDoc = await PDFDocument.create();
  for (let n = 1; n <= paginas; n++) {
    aoProgredir({
      etapa: `Convertendo página ${n} de ${paginas}…`,
      porcentagem: 12 + Math.round(((n - 1) / paginas) * 80),
    });
    await respirar();

    const pagina = n === 1 ? primeira : await doc.getPage(n);
    const { jpeg } = await desenharPagina(pagina, escolhido.escala, escolhido.qualidade);
    const img = await saidaDoc.embedJpg(jpeg);

    // A página nova nasce do tamanho REAL da original em pontos (escala 1),
    // não do tamanho do bitmap: assim o PDF continua em A4 de verdade, e a
    // resolução da imagem é só a densidade dentro dessa mesma folha.
    const medida = pagina.getViewport({ scale: 1 });
    const nova = saidaDoc.addPage([medida.width, medida.height]);
    nova.drawImage(img, { x: 0, y: 0, width: medida.width, height: medida.height });
    pagina.cleanup();
  }

  aoProgredir({ etapa: "Montando o arquivo final…", porcentagem: 95 });
  const saida = await saidaDoc.save({ useObjectStreams: true });
  await doc.destroy();
  const blob = new Blob([saida.slice()], { type: "application/pdf" });

  const avisos = ["O texto virou imagem: o PDF não pode mais ser buscado nem copiado."];
  if (blob.size > alvoBytes)
    avisos.push("Mesmo na menor qualidade utilizável o arquivo ficou acima do alvo pedido.");
  if (blob.size >= file.size) {
    return {
      blob: new Blob([bytes.slice()], { type: "application/pdf" }),
      nome: file.name,
      bytesAntes: file.size,
      bytesDepois: file.size,
      aviso:
        "Rasterizar deixaria este PDF MAIOR do que ele já é — é sinal de que ele é feito de texto, que ocupa muito menos espaço que foto. Devolvi o original intacto.",
    };
  }

  return {
    blob,
    nome: nomeDeSaida(file.name, "pdf"),
    bytesAntes: file.size,
    bytesDepois: blob.size,
    aviso: avisos.join(" "),
  };
}
