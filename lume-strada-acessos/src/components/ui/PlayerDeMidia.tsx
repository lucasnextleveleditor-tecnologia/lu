"use client";

import { resolverMidiaDeLink, ROTULO_ORIGEM } from "@/lib/utils/midia-link";
import { cn } from "@/lib/utils/cn";
import { IconExternalLink } from "@/components/ui/icons";

/**
 * Mostra um link de mídia dentro da tela.
 *
 * Quando o player monta, NADA é escrito embaixo dele — nem o endereço, nem
 * o nome do serviço. O cliente da agência não precisa saber que o vídeo
 * está no Drive de alguém: o que ele vê é o sistema, e citar a hospedagem
 * ali embaixo quebra essa impressão sem entregar nada em troca. Se o
 * arquivo estiver sem permissão, a própria tela do Google aparece dentro do
 * quadro, com o botão de pedir acesso dela.
 *
 * A exceção é o serviço NÃO RECONHECIDO: aí não há player nenhum, e sem o
 * link a pessoa fica olhando para um vazio. Só nesse caso o endereço
 * aparece. Domínio arbitrário nunca é embutido — iframe de origem
 * desconhecida é porta aberta.
 */
export function PlayerDeMidia({
  url,
  className,
  mostrarLink = false,
}: {
  url: string;
  className?: string;
  /** Escreve o endereço embaixo do player. Fora do padrão de propósito: serve a telas internas de conferência, nunca ao que o cliente vê. */
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
          <span className="truncate">{limpo}</span>
        </a>
      )}
    </div>
  );
}
