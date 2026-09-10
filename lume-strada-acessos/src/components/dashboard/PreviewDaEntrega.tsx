"use client";

import { PlayerDeMidia } from "@/components/ui/PlayerDeMidia";
import { IconDownload, IconPaperclip } from "@/components/ui/icons";
import { useLocale } from "@/lib/i18n/LocaleProvider";

/**
 * A peça, tocando DENTRO da plataforma.
 *
 * Antes o cliente clicava no nome do arquivo e o navegador abria o Drive
 * numa aba nova — ou seja, o momento mais importante do fluxo (ele decidir se
 * aprova) acontecia fora do sistema, numa tela que não tem a legenda, não tem
 * o botão de aprovar e não tem a marca da agência. Aqui ele fica.
 *
 * Dois caminhos, porque uma versão é uma coisa ou outra:
 *
 *   LINK  → `PlayerDeMidia`, o mesmo componente do portfólio e dos criativos.
 *           Ele já conhece YouTube, Vimeo, Loom, Streamable, Instagram,
 *           TikTok, Google Drive, Dropbox e link direto de arquivo. Ensinar um
 *           serviço novo lá dentro vale para o sistema inteiro de uma vez.
 *
 *   ARQUIVO → desenhado aqui pelo tipo MIME, com a URL assinada que a
 *           listagem já trouxe. Vídeo toca, imagem aparece, PDF abre no leitor
 *           do próprio navegador.
 *
 * O que NÃO tem preview vira um botão de baixar honesto, em vez de um quadro
 * vazio: um .aep ou um .zip não têm como ser mostrados, e fingir que têm é
 * pior do que dizer que não.
 */
export function PreviewDaEntrega({
  linkUrl,
  urlArquivo,
  tipoMime,
  nomeArquivo,
}: {
  linkUrl: string | null;
  urlArquivo: string | null;
  tipoMime: string | null;
  nomeArquivo: string;
}) {
  const { dict } = useLocale();

  if (linkUrl) {
    // `mostrarLink` fica falso: o cliente não precisa saber que o vídeo está
    // no Drive de alguém — o que ele vê é o sistema.
    return <PlayerDeMidia url={linkUrl} />;
  }

  if (!urlArquivo) {
    return (
      <p className="flex items-center gap-1.5 text-xs text-ink-muted">
        <IconPaperclip className="h-3.5 w-3.5 shrink-0" />
        {nomeArquivo}
      </p>
    );
  }

  const mime = (tipoMime ?? "").toLowerCase();
  const extensao = nomeArquivo.split(".").pop()?.toLowerCase() ?? "";

  // O MIME manda; a extensão é o plano B. Arquivo enviado por alguns
  // navegadores chega com `tipo_mime` vazio, e aí o nome é a única pista.
  const ehVideo = mime.startsWith("video/") || ["mp4", "webm", "mov", "m4v"].includes(extensao);
  const ehImagem = mime.startsWith("image/") || ["png", "jpg", "jpeg", "gif", "webp", "avif"].includes(extensao);
  const ehPdf = mime === "application/pdf" || extensao === "pdf";

  if (ehVideo) {
    return (
      <div className="w-full overflow-hidden rounded-lg border border-base-700 bg-black">
        <video src={urlArquivo} controls preload="metadata" className="max-h-[70vh] w-full bg-black object-contain" />
      </div>
    );
  }

  if (ehImagem) {
    return (
      <div className="w-full overflow-hidden rounded-lg border border-base-700 bg-base-950">
        {/* eslint-disable-next-line @next/next/no-img-element -- URL assinada e temporária do Storage, sem como configurar em next/image */}
        <img src={urlArquivo} alt={nomeArquivo} className="max-h-[70vh] w-full object-contain" />
      </div>
    );
  }

  if (ehPdf) {
    return (
      // Alto de propósito: PDF em quadro 16:9 mostra um terço de página, e o
      // cliente teria que rolar dentro de uma caixinha para ler o material que
      // ele precisa aprovar.
      <iframe
        src={urlArquivo}
        title={nomeArquivo}
        className="h-[70vh] w-full rounded-lg border border-base-700 bg-base-950"
        loading="lazy"
      />
    );
  }

  return (
    <a
      href={urlArquivo}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 rounded-lg border border-base-600 px-3 py-2 text-xs font-medium text-ink-secondary transition hover:border-ink-muted hover:text-ink-primary"
    >
      <IconDownload className="h-3.5 w-3.5" />
      {dict.cliente.baixarArquivo} — {nomeArquivo}
    </a>
  );
}
