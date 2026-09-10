import {
  bitmapParaJpeg,
  nomeDeSaida,
  respirar,
  type AoProgredir,
  type ResultadoCompressao,
  type TextosDoCompressor,
} from "./nucleo";

/**
 * Degraus de tentativa, do menos destrutivo para o mais.
 *
 * Primeiro a ferramenta tenta só baixar a qualidade do JPEG, mantendo a
 * imagem no tamanho original em pixels — é o que preserva nitidez. Só quando
 * a qualidade sozinha não chega ao alvo é que ela começa a reduzir a
 * dimensão. A ordem é essa porque uma foto com qualidade 40 ainda serve pra
 * quase tudo, enquanto uma foto reduzida a 25% da largura não volta atrás.
 */
const DEGRAUS: ReadonlyArray<{ escala: number; qualidades: number[] }> = [
  { escala: 1, qualidades: [0.92, 0.82, 0.7, 0.58, 0.45, 0.34] },
  { escala: 0.8, qualidades: [0.7, 0.55, 0.42] },
  { escala: 0.6, qualidades: [0.65, 0.5, 0.38] },
  { escala: 0.45, qualidades: [0.6, 0.45] },
  { escala: 0.32, qualidades: [0.55, 0.4] },
  { escala: 0.22, qualidades: [0.5, 0.35] },
];

/**
 * Reduz uma imagem até caber no alvo.
 *
 * A saída é sempre JPEG, inclusive pra PNG: manter PNG e "comprimir" é
 * praticamente impossível no canvas (o PNG do navegador não tem controle de
 * qualidade, só de tamanho), e é justamente o PNG de 12 MB que a pessoa
 * quer diminuir. A troca custa a transparência, que vira branco — por isso
 * o aviso volta no resultado em vez de a ferramenta fingir que nada mudou.
 */
export async function comprimirImagem(
  file: File,
  alvoBytes: number,
  textos: TextosDoCompressor,
  aoProgredir: AoProgredir
): Promise<ResultadoCompressao> {
  aoProgredir({ etapa: textos.etapaAbrindoImagem, porcentagem: 5 });

  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    // HEIC do iPhone é o caso mais comum: o Chrome não decodifica, o Safari
    // sim. Dizer isso é mais útil do que "formato não suportado".
    throw new Error(textos.erroImagemNaoAbre);
  }

  const tinhaTransparencia = /png|webp|gif|avif/i.test(file.type || file.name);
  const total = DEGRAUS.reduce((n, d) => n + d.qualidades.length, 0);
  let feitas = 0;
  let melhor: { blob: Blob; largura: number; altura: number } | null = null;

  try {
    for (const degrau of DEGRAUS) {
      for (const qualidade of degrau.qualidades) {
        feitas++;
        aoProgredir({
          etapa: textos.etapaTestandoQualidade,
          porcentagem: 5 + Math.round((feitas / total) * 90),
        });
        await respirar();

        const tentativa = await bitmapParaJpeg(bitmap, degrau.escala, qualidade, textos);
        // Guarda a MENOR de todas, não a última: se nenhuma bater o alvo, é
        // ela que a pessoa recebe, junto com o aviso.
        if (!melhor || tentativa.blob.size < melhor.blob.size) melhor = tentativa;
        // Como as qualidades de cada degrau vão da maior pra menor, a
        // primeira que couber é a de melhor imagem que cabe. Pode parar.
        if (tentativa.blob.size <= alvoBytes) {
          return montar(file, tentativa, alvoBytes, tinhaTransparencia, textos);
        }
      }
    }
  } finally {
    bitmap.close();
  }

  if (!melhor) throw new Error(textos.erroImagemGenerico);
  return montar(file, melhor, alvoBytes, tinhaTransparencia, textos);
}

function montar(
  file: File,
  r: { blob: Blob; largura: number; altura: number },
  alvoBytes: number,
  tinhaTransparencia: boolean,
  textos: TextosDoCompressor
): ResultadoCompressao {
  const avisos: string[] = [];
  if (r.blob.size > alvoBytes) avisos.push(textos.avisoMenorPossivel);
  if (tinhaTransparencia) avisos.push(textos.avisoVirouJpg);
  if (r.blob.size >= file.size) avisos.push(textos.avisoJaOtimizado);

  return {
    blob: r.blob,
    nome: nomeDeSaida(file.name, "jpg", textos.sufixoArquivo),
    bytesAntes: file.size,
    bytesDepois: r.blob.size,
    aviso: avisos.length > 0 ? avisos.join(" ") : undefined,
  };
}
