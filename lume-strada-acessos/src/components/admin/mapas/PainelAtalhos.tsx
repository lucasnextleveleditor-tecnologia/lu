"use client";

import { useState } from "react";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { cn } from "@/lib/utils/cn";

/**
 * Os atalhos, escritos na tela.
 *
 * Atalho que ninguém descobre é atalho que não existe — e um mapa mental é
 * quase todo teclado: quem não sabe que Tab ramifica acaba clicando em
 * "Novo ramo" trinta vezes. Fica aberto na primeira visita e a pessoa fecha
 * quando não precisar mais; recolhido vira uma pastilha de uma palavra, para
 * continuar à mão sem tapar o mapa.
 */
export function PainelAtalhos() {
  const { dict } = useLocale();
  const t = dict.mapaMental;
  const [aberto, setAberto] = useState(true);

  const linhas: { teclas: string[]; oQueFaz: string }[] = [
    { teclas: ["Tab"], oQueFaz: t.atalhoRamo },
    { teclas: ["Enter"], oQueFaz: t.atalhoVizinho },
    { teclas: ["F2"], oQueFaz: t.atalhoEditar },
    { teclas: ["Delete"], oQueFaz: t.atalhoApagar },
    { teclas: ["Esc"], oQueFaz: t.atalhoSair },
    { teclas: ["Scroll"], oQueFaz: t.atalhoZoom },
    { teclas: ["Espaço", "+", "arrastar"], oQueFaz: t.atalhoArrastar },
  ];

  return (
    // Translúcido em repouso e opaco quando o olho vai até ele: a legenda
    // precisa estar à mão sem tapar o canto do mapa. `backdrop-blur` é o que
    // mantém o texto legível mesmo com o desenho passando por trás.
    <div className="group/atalhos absolute bottom-3 left-3 z-10 max-w-[min(20rem,calc(100%-1.5rem))] opacity-55 transition-opacity duration-200 hover:opacity-100 focus-within:opacity-100">
      <button
        type="button"
        onClick={() => setAberto((a) => !a)}
        className={cn(
          "flex w-full items-center gap-2 rounded-lg border border-base-700 bg-base-900/60 px-2.5 py-1.5 text-[10px] uppercase tracking-[0.14em] text-ink-muted backdrop-blur-md transition hover:text-ink-secondary",
          aberto && "rounded-b-none border-b-0"
        )}
      >
        <span className="flex-1 text-left">{t.atalhos}</span>
        <span className="text-xs leading-none">{aberto ? "−" : "+"}</span>
      </button>

      {aberto && (
        <dl className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-2.5 gap-y-1.5 rounded-b-lg border border-base-700 bg-base-900/60 px-2.5 py-2 backdrop-blur-md">
          {linhas.map((linha) => (
            <div key={linha.oQueFaz} className="contents">
              <dt className="flex items-center gap-1 whitespace-nowrap">
                {linha.teclas.map((tecla) =>
                  tecla === "+" ? (
                    <span key={tecla} className="text-[10px] text-ink-muted">
                      +
                    </span>
                  ) : (
                    <kbd
                      key={tecla}
                      className="rounded border border-base-600 bg-base-950 px-1.5 py-0.5 font-sans text-[10px] font-medium text-ink-secondary"
                    >
                      {tecla}
                    </kbd>
                  )
                )}
              </dt>
              <dd className="self-center text-[11px] leading-snug text-ink-muted">{linha.oQueFaz}</dd>
            </div>
          ))}
        </dl>
      )}
    </div>
  );
}
