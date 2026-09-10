import { nomeDeSaida, substituir, type AoProgredir, type ResultadoCompressao, type TextosDoCompressor } from "./nucleo";

/**
 * Compressão de vídeo com o ffmpeg compilado para WebAssembly, rodando
 * dentro da aba.
 *
 * Não existe caminho de servidor pra isso: a Vercel corta requisição com
 * corpo acima de ~4,5 MB e a função serverless não tem binário de ffmpeg
 * nem tempo de execução pra transcodificar. Então ou é no navegador, ou não
 * é. A contrapartida é que o vídeo nunca sai da máquina da pessoa — o que,
 * pra material de cliente ainda não divulgado, é uma vantagem de verdade.
 *
 * O núcleo do ffmpeg (~32 MB) vem de CDN e não do nosso repositório: colocar
 * 32 MB de wasm no git faria todo mundo baixar isso em cada clone e a Vercel
 * subir isso em cada deploy, pra servir uma ferramenta que a maioria dos dias
 * ninguém abre. Ele é baixado UMA vez, quando alguém abre a ferramenta, e o
 * navegador guarda em cache daí em diante.
 */

const VERSAO_CORE = "0.12.10";
const ORIGENS_DO_CORE = [
  `https://unpkg.com/@ffmpeg/core@${VERSAO_CORE}/dist/umd`,
  `https://cdn.jsdelivr.net/npm/@ffmpeg/core@${VERSAO_CORE}/dist/umd`,
];

type FFmpegInstancia = import("@ffmpeg/ffmpeg").FFmpeg;

let instancia: FFmpegInstancia | null = null;
let carregando: Promise<FFmpegInstancia> | null = null;

/**
 * Carrega o ffmpeg uma vez por aba e reaproveita.
 *
 * A promessa fica guardada (e não só a instância) porque dois cliques
 * seguidos em "Comprimir" antes do fim do download começariam dois
 * carregamentos de 32 MB em paralelo.
 */
async function carregarFFmpeg(textos: TextosDoCompressor, aoProgredir: AoProgredir): Promise<FFmpegInstancia> {
  if (instancia) return instancia;
  if (carregando) return carregando;

  carregando = (async () => {
    aoProgredir({ etapa: textos.etapaBaixandoConversor, porcentagem: null });
    const [{ FFmpeg }, { toBlobURL }] = await Promise.all([import("@ffmpeg/ffmpeg"), import("@ffmpeg/util")]);

    let ultimoErro: unknown = null;
    for (const base of ORIGENS_DO_CORE) {
      try {
        const ff = new FFmpeg();
        await ff.load({
          coreURL: await toBlobURL(`${base}/ffmpeg-core.js`, "text/javascript"),
          wasmURL: await toBlobURL(`${base}/ffmpeg-core.wasm`, "application/wasm"),
        });
        instancia = ff;
        return ff;
      } catch (erro) {
        // CDN fora do ar ou bloqueada pela rede da empresa: tenta a próxima
        // antes de desistir.
        ultimoErro = erro;
      }
    }
    throw new Error(
      substituir(textos.erroBaixarConversor, {
        detalhe: ultimoErro instanceof Error ? ` (${ultimoErro.message})` : "",
      })
    );
  })();

  try {
    return await carregando;
  } finally {
    carregando = null;
  }
}

/**
 * Duração em segundos, lida por um `<video>` invisível.
 *
 * Perguntar ao próprio ffmpeg custaria uma passada inteira pelo arquivo
 * dentro do wasm; o elemento de vídeo lê só o cabeçalho e responde em
 * milissegundos. E a duração é o número mais importante de todos: é dela que
 * sai o bitrate necessário pra bater o tamanho pedido.
 */
function lerDuracao(file: File, textos: TextosDoCompressor): Promise<{ duracao: number; altura: number }> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const v = document.createElement("video");
    v.preload = "metadata";
    v.muted = true;
    const limpar = () => URL.revokeObjectURL(url);
    v.onloadedmetadata = () => {
      const duracao = v.duration;
      const altura = v.videoHeight || 0;
      limpar();
      if (!Number.isFinite(duracao) || duracao <= 0) {
        reject(new Error(textos.erroDuracao));
        return;
      }
      resolve({ duracao, altura });
    };
    v.onerror = () => {
      limpar();
      // Acontece com .mkv/.avi/.wmv, que o navegador não abre. O ffmpeg até
      // converteria, mas sem a duração não dá pra mirar num tamanho.
      reject(new Error(textos.erroFormatoVideo));
    };
    v.src = url;
  });
}

/** Altura máxima que faz sentido para um dado bitrate — acima disso a imagem vira mosaico. */
function alturaPara(bitrateKbps: number): number {
  if (bitrateKbps >= 4000) return 1080;
  if (bitrateKbps >= 2000) return 720;
  if (bitrateKbps >= 1100) return 540;
  if (bitrateKbps >= 600) return 480;
  return 360;
}

export async function comprimirVideo(
  file: File,
  alvoBytes: number,
  textos: TextosDoCompressor,
  aoProgredir: AoProgredir
): Promise<ResultadoCompressao> {
  const { duracao, altura: alturaOriginal } = await lerDuracao(file, textos);
  const ffmpeg = await carregarFFmpeg(textos, aoProgredir);
  const { fetchFile } = await import("@ffmpeg/util");

  // Orçamento de bits: o arquivo inteiro tem `alvoBytes`; tira 4% pro
  // contêiner MP4 (índice, cabeçalhos) e o resto se divide entre som e
  // imagem. Áudio de 96k é transparente pra voz e música de fundo; abaixo de
  // 64k começa a chiar, então ele é o último a ser cortado.
  const bitsTotais = alvoBytes * 8 * 0.96;
  const kbpsTotal = bitsTotais / duracao / 1000;
  const kbpsAudio = kbpsTotal < 400 ? 64 : 96;
  let kbpsVideo = Math.floor(kbpsTotal - kbpsAudio);

  if (kbpsVideo < 90) {
    throw new Error(
      substituir(textos.erroAlvoImpossivelVideo, {
        mb: Math.round(alvoBytes / (1024 * 1024)),
        min: Math.max(1, Math.round(duracao / 60)),
      })
    );
  }

  const altura = Math.min(alturaPara(kbpsVideo), alturaOriginal || 1080);
  const entrada = "entrada" + (file.name.match(/\.[a-z0-9]+$/i)?.[0] ?? ".mp4");
  const saida = "saida.mp4";

  const aoProgressoDoFfmpeg = ({ progress }: { progress: number }) => {
    // O ffmpeg às vezes passa de 1 no fim (arredondamento do timestamp).
    const p = Math.max(0, Math.min(1, progress));
    aoProgredir({ etapa: textos.etapaConvertendoVideo, porcentagem: 10 + Math.round(p * 82) });
  };

  aoProgredir({ etapa: textos.etapaPreparandoArquivo, porcentagem: 6 });
  await ffmpeg.writeFile(entrada, await fetchFile(file));
  ffmpeg.on("progress", aoProgressoDoFfmpeg);

  try {
    let resultado = await converter(ffmpeg, entrada, saida, kbpsVideo, kbpsAudio, altura, alturaOriginal, textos);

    // Uma segunda passada quando erra feio pra cima. O libx264 mira no
    // bitrate médio, não no tamanho final: em vídeo com muito movimento ele
    // estoura. Corrigir pela razão observada acerta quase sempre — e uma
    // repetição só é o limite, porque cada uma custa o tempo inteiro de
    // conversão de novo.
    if (resultado.length > alvoBytes * 1.06) {
      const fator = (alvoBytes / resultado.length) * 0.94;
      const novoKbps = Math.max(90, Math.floor(kbpsVideo * fator));
      if (novoKbps < kbpsVideo * 0.97) {
        aoProgredir({ etapa: textos.etapaAjustando, porcentagem: 12 });
        kbpsVideo = novoKbps;
        resultado = await converter(
          ffmpeg,
          entrada,
          saida,
          kbpsVideo,
          kbpsAudio,
          Math.min(alturaPara(kbpsVideo), alturaOriginal || 1080),
          alturaOriginal,
          textos
        );
      }
    }

    aoProgredir({ etapa: textos.etapaFinalizando, porcentagem: 97 });
    const blob = new Blob([resultado.slice()], { type: "video/mp4" });

    const avisos: string[] = [];
    if (blob.size > alvoBytes * 1.06) avisos.push(textos.avisoVideoAcimaDoAlvo);
    if (altura < (alturaOriginal || altura)) avisos.push(substituir(textos.avisoResolucaoCaiu, { altura }));
    if (blob.size >= file.size) avisos.push(textos.avisoVideoJaComprimido);

    return {
      blob,
      nome: nomeDeSaida(file.name, "mp4", textos.sufixoArquivo),
      bytesAntes: file.size,
      bytesDepois: blob.size,
      aviso: avisos.length > 0 ? avisos.join(" ") : undefined,
    };
  } finally {
    ffmpeg.off("progress", aoProgressoDoFfmpeg);
    // O sistema de arquivos do ffmpeg mora na memória da aba: sem apagar, o
    // vídeo de entrada e o de saída continuam ocupando RAM até a página ser
    // recarregada, e a segunda conversão do dia falha por falta de memória.
    await ffmpeg.deleteFile(entrada).catch(() => {});
    await ffmpeg.deleteFile(saida).catch(() => {});
  }
}

async function converter(
  ffmpeg: FFmpegInstancia,
  entrada: string,
  saida: string,
  kbpsVideo: number,
  kbpsAudio: number,
  altura: number,
  alturaOriginal: number,
  textos: TextosDoCompressor
): Promise<Uint8Array> {
  const args = [
    "-i", entrada,
    "-c:v", "libx264",
    // `veryfast` é o meio-termo honesto: `ultrafast` gera arquivo bem maior
    // pro mesmo bitrate, e `medium` chega a triplicar o tempo dentro do wasm.
    "-preset", "veryfast",
    "-b:v", `${kbpsVideo}k`,
    // Teto e reservatório evitam o pico que estoura o alvo num corte de cena.
    "-maxrate", `${Math.round(kbpsVideo * 1.35)}k`,
    "-bufsize", `${Math.round(kbpsVideo * 2)}k`,
    "-pix_fmt", "yuv420p",
  ];

  // `-2` mantém a proporção e força largura par, que o H.264 exige. Só
  // reduz: fazer upscale de um vídeo pequeno só gastaria bits à toa.
  if (alturaOriginal && altura < alturaOriginal) args.push("-vf", `scale=-2:${altura}`);

  args.push(
    "-c:a", "aac",
    "-b:a", `${kbpsAudio}k`,
    "-ac", "2",
    // Joga o índice do MP4 pro começo: sem isso o vídeo só começa a tocar
    // depois de baixar inteiro quando servido por link.
    "-movflags", "+faststart",
    "-y", saida
  );

  const codigo = await ffmpeg.exec(args);
  if (codigo !== 0) throw new Error(textos.erroConversor);
  const dados = await ffmpeg.readFile(saida);
  if (typeof dados === "string") throw new Error(textos.erroRespostaConversor);
  return dados;
}
