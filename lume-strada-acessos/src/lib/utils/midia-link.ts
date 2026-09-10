/**
 * De um link colado para algo que dá para MOSTRAR na tela.
 *
 * O sistema guarda PDF, imagem e documento; vídeo, não. Vídeo é o arquivo
 * que enche o armazenamento e, pior, o que custa caro para ENTREGAR: cada
 * download sai da cota de tráfego, todo mês, para sempre. Então o vídeo
 * mora onde já estava (Drive, YouTube, Vimeo) e o sistema só aponta para
 * ele — o custo de guardar e servir fica com quem já cobra por isso.
 *
 * Esta função decide SE dá para embutir e COM QUE URL. Ela nunca promete
 * que vai carregar: um arquivo do Drive sem "qualquer pessoa com o link"
 * mostra a tela de permissão do Google dentro do quadro, e isso é o
 * esperado. Por isso o link original continua visível ao lado, sempre.
 */

export type TipoPreviewMidia = "iframe" | "imagem" | "video";

export type OrigemMidia =
  | "youtube"
  | "vimeo"
  | "loom"
  | "streamable"
  | "instagram"
  | "tiktok"
  | "drive"
  | "google-docs"
  | "dropbox"
  | "arquivo";

export interface PreviewMidia {
  tipo: TipoPreviewMidia;
  src: string;
  /** De onde veio, para escrever na tela e para explicar uma falha ("o vídeo é do Drive e está privado"). */
  origem: OrigemMidia;
  /** Proporção sugerida do quadro. Reels e TikTok são verticais; o resto é 16:9. */
  vertical?: boolean;
}

/** Só o id do vídeo do YouTube, em qualquer das formas que a URL aparece por aí. */
function idDoYoutube(u: URL): string | null {
  const host = u.hostname.replace(/^www\./, "");
  if (host === "youtu.be") return u.pathname.slice(1).split("/")[0] || null;
  if (host !== "youtube.com" && host !== "m.youtube.com" && host !== "music.youtube.com") return null;

  const v = u.searchParams.get("v");
  if (v) return v;
  // `/embed/`, `/shorts/` e `/live/` são as outras três formas que o
  // YouTube usa hoje — colar qualquer uma delas tem de funcionar.
  const m = u.pathname.match(/\/(embed|shorts|live|v)\/([^/?]+)/);
  return m?.[2] ?? null;
}

/** Vídeo do Vimeo, incluindo o formato de link NÃO LISTADO (`/123456/abcdef`), em que a segunda parte é a senha do link. */
function vimeo(u: URL): { id: string; hash: string | null } | null {
  const host = u.hostname.replace(/^www\./, "");
  if (host === "player.vimeo.com") {
    const m = u.pathname.match(/\/video\/(\d+)/);
    return m ? { id: m[1] as string, hash: u.searchParams.get("h") } : null;
  }
  if (host !== "vimeo.com") return null;
  const partes = u.pathname.split("/").filter(Boolean);
  const i = partes.findIndex((p) => /^\d+$/.test(p));
  if (i === -1) return null;
  const proxima = partes[i + 1];
  return { id: partes[i] as string, hash: proxima && /^[a-z0-9]+$/i.test(proxima) ? proxima : u.searchParams.get("h") };
}

export function resolverMidiaDeLink(url: string): PreviewMidia | null {
  let u: URL;
  try {
    u = new URL(url.trim());
  } catch {
    return null;
  }
  if (u.protocol !== "http:" && u.protocol !== "https:") return null;
  const host = u.hostname.replace(/^www\./, "");

  const yt = idDoYoutube(u);
  if (yt) {
    // `rel=0` não desliga os relacionados (o YouTube tirou isso), mas
    // restringe ao próprio canal — é o mais perto que dá de não sugerir o
    // concorrente no fim do vídeo do cliente.
    return { tipo: "iframe", src: `https://www.youtube.com/embed/${yt}?rel=0`, origem: "youtube" };
  }

  const vm = vimeo(u);
  if (vm) {
    const query = vm.hash ? `?h=${vm.hash}` : "";
    return { tipo: "iframe", src: `https://player.vimeo.com/video/${vm.id}${query}`, origem: "vimeo" };
  }

  if (host === "loom.com") {
    const m = u.pathname.match(/\/(share|embed)\/([^/?]+)/);
    if (m) return { tipo: "iframe", src: `https://www.loom.com/embed/${m[2]}`, origem: "loom" };
    return null;
  }

  if (host === "streamable.com") {
    const id = u.pathname.replace(/^\/(e\/)?/, "").split("/")[0];
    if (id) return { tipo: "iframe", src: `https://streamable.com/e/${id}`, origem: "streamable" };
    return null;
  }

  if (host === "instagram.com") {
    // Post, reel e tv usam o mesmo `/embed` — serve para a agência de social
    // media mostrar no portfólio o que de fato publicou.
    const m = u.pathname.match(/\/(p|reel|reels|tv)\/([^/?]+)/);
    if (m) {
      const caminho = m[1] === "reels" ? "reel" : m[1];
      return { tipo: "iframe", src: `https://www.instagram.com/${caminho}/${m[2]}/embed`, origem: "instagram", vertical: true };
    }
    return null;
  }

  if (host === "tiktok.com" || host === "vm.tiktok.com") {
    const m = u.pathname.match(/\/video\/(\d+)/);
    if (m) return { tipo: "iframe", src: `https://www.tiktok.com/embed/v2/${m[1]}`, origem: "tiktok", vertical: true };
    return null;
  }

  if (host === "drive.google.com") {
    const arquivo = u.pathname.match(/\/file\/d\/([^/]+)/);
    if (arquivo) return { tipo: "iframe", src: `https://drive.google.com/file/d/${arquivo[1]}/preview`, origem: "drive" };
    const pasta = u.pathname.match(/\/drive\/folders\/([^/?]+)/);
    if (pasta) return { tipo: "iframe", src: `https://drive.google.com/embeddedfolderview?id=${pasta[1]}#list`, origem: "drive" };
    const id = u.searchParams.get("id");
    if (id) return { tipo: "iframe", src: `https://drive.google.com/file/d/${id}/preview`, origem: "drive" };
    return null;
  }

  if (host === "docs.google.com") {
    const m = u.pathname.match(/\/(document|spreadsheets|presentation)\/d\/([^/]+)/);
    if (m) {
      const [, tipoDoc, id] = m;
      const sufixo = tipoDoc === "presentation" ? "embed" : "preview";
      return { tipo: "iframe", src: `https://docs.google.com/${tipoDoc}/d/${id}/${sufixo}`, origem: "google-docs" };
    }
    return null;
  }

  if (host === "dropbox.com" || host === "dl.dropboxusercontent.com") {
    // `?raw=1` no lugar do `?dl=` entrega o arquivo em si, e não a página de
    // download do Dropbox — é o que permite pôr num `<img>`/`<video>`.
    const ehImagem = /\.(png|jpe?g|gif|webp)$/i.test(u.pathname);
    const ehVideo = /\.(mp4|webm|mov|m4v)$/i.test(u.pathname);
    if (!ehImagem && !ehVideo) return null;
    const raw = new URL(u.toString());
    raw.searchParams.delete("dl");
    raw.searchParams.set("raw", "1");
    return { tipo: ehVideo ? "video" : "imagem", src: raw.toString(), origem: "dropbox" };
  }

  if (/\.(png|jpe?g|gif|webp|svg)$/i.test(u.pathname)) return { tipo: "imagem", src: u.toString(), origem: "arquivo" };
  if (/\.(mp4|webm|mov|m4v)$/i.test(u.pathname)) return { tipo: "video", src: u.toString(), origem: "arquivo" };

  return null;
}

export const ROTULO_ORIGEM: Record<OrigemMidia, string> = {
  youtube: "YouTube",
  vimeo: "Vimeo",
  loom: "Loom",
  streamable: "Streamable",
  instagram: "Instagram",
  tiktok: "TikTok",
  drive: "Google Drive",
  "google-docs": "Google Docs",
  dropbox: "Dropbox",
  arquivo: "Link direto",
};

/** O que a tela sugere quando o link colado não é reconhecido. */
export const SERVICOS_ACEITOS = "YouTube, Vimeo, Loom, Streamable, Instagram, TikTok, Google Drive, Dropbox ou link direto do arquivo";
