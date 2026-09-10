"use client";

import { resolverMidiaDeLink, ROTULO_ORIGEM } from "@/lib/utils/midia-link";
import { cn } from "@/lib/utils/cn";
import { IconExternalLink } from "@/components/ui/icons";

/**
 * Mostra um link de mídia dentro da tela.
 *
 * O link ORIGINAL fica sempre visível embaixo, e isso não é enfeite: um
 * arquivo do Drive sem "qualquer pessoa com o link" mostra a tela de
 * permissão do Google dentro do quadro, e o YouTube derruba vídeo com
 * direito autoral. Quando o quadro falha — e um dia falha —, quem está
 * olhando precisa ter para onde clicar em vez de achar que o sistema
 * quebrou.
 *
 * Se o serviço não é reconhecido, não tenta embutir domínio arbitrário:
 * mostra só o link. Iframe de origem desconhecida é porta aberta.
 */
export function PlayerDeMidia({
  url,
  className,
  mostrarLink = true,
}: {
  url: string;
  className?: string;
  mostrarLink?: boolean;
}) {
  const midia = resolverMidiaDeLink(url);
  const limpo = url.replace(/^https?:\/\//, "").replace(/\/$/, "");

  return (
    <div className={cn("w-full", className)}>
      {midia && (
        <div
          className={cn(
            "w-full overflow-hidden rounded-lg border border-base-700 bg-base-950",
            // Reel e TikTok são verticais: num quadro 16:9 sairiam com duas
            // tarjas pretas ocupando metade da largura.
            midia.vertical ? "mx-auto aspect-[9/16] max-w-[320px]" : "aspect-video"
          )}
        >
          {midia.tipo === "iframe" && (
            <iframe
              src={midia.src}
              title={ROTULO_ORIGEM[midia.origem]}
              className="h-full w-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
              allowFullScreen
              // `sandbox` não entra aqui de propósito: o YouTube e o Vimeo
              // precisam de script e de tela cheia para o player funcionar,
              // e a lista de origens é fechada (ver `resolverMidiaDeLink`).
              referrerPolicy="strict-origin-when-cross-origin"
              loading="lazy"
            />
          )}
          {midia.tipo === "video" && <video src={midia.src} controls preload="metadata" className="h-full w-full bg-black object-contain" />}
          {midia.tipo === "imagem" && (
            // eslint-disable-next-line @next/next/no-img-element -- domínio externo arbitrário, sem como configurar em next/image
            <img src={midia.src} alt="" className="h-full w-full object-contain" />
          )}
        </div>
      )}

      {(mostrarLink || !midia) && (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            "mt-1.5 flex items-center gap-1 text-xs text-ink-muted transition hover:text-accent",
            !midia && "mt-0"
          )}
        >
          <IconExternalLink className="h-3 w-3 shrink-0" />
          <span className="truncate">
            {midia ? `Abrir no ${ROTULO_ORIGEM[midia.origem]}` : limpo}
          </span>
        </a>
      )}
    </div>
  );
}
