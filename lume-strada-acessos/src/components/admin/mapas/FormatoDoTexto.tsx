"use client";

import type { MapaNoRow } from "@/lib/types/mapa-mental";
import { FONTES_MAPA, ORDEM_FONTES, TAMANHOS_MAPA, fonteCss } from "@/lib/types/mapa-mental";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { cn } from "@/lib/utils/cn";
import { IconType } from "@/components/ui/icons";

/**
 * Fonte, tamanho, negrito e itálico de um balão.
 *
 * Cada opção de fonte é mostrada NA PRÓPRIA fonte — escolher tipografia por
 * uma lista de nomes é adivinhação. E os tamanhos são quatro degraus, não um
 * campo numérico: num quadro de ideias o que importa é "isto é mais
 * importante que aquilo", e uma régua de milímetro só convida a passar meia
 * hora acertando 15 contra 16 pixels.
 */
export function FormatoDoTexto({
  no,
  aoMudar,
}: {
  no: MapaNoRow;
  aoMudar: (valores: Partial<MapaNoRow>) => void;
}) {
  const { dict } = useLocale();
  const t = dict.mapaMental;
  const tamanhoAtual = no.tamanho || 14;

  return (
    <div className="border-t border-base-800 pt-3">
      <p className="mb-2 flex items-center gap-1.5 text-[10px] uppercase tracking-[0.14em] text-ink-muted">
        <IconType className="h-3 w-3" /> {t.texto}
      </p>

      <div className="space-y-2">
        <select
          value={no.fonte || "padrao"}
          onChange={(e) => aoMudar({ fonte: e.target.value === "padrao" ? "" : e.target.value })}
          aria-label={t.fonte}
          className="w-full rounded-lg border border-base-700 bg-base-950 px-2 py-1.5 text-xs text-ink-primary outline-none focus:border-accent"
          style={{ fontFamily: fonteCss(no.fonte) }}
        >
          {ORDEM_FONTES.map((chave) => (
            <option key={chave} value={chave} style={{ fontFamily: FONTES_MAPA[chave].css }}>
              {FONTES_MAPA[chave].rotulo}
            </option>
          ))}
        </select>

        <div className="flex items-center gap-1.5">
          <div className="flex flex-1 items-center gap-0.5 rounded-lg border border-base-700 p-0.5">
            {TAMANHOS_MAPA.map((tamanho) => (
              <button
                key={tamanho}
                type="button"
                onClick={() => aoMudar({ tamanho })}
                aria-pressed={tamanhoAtual === tamanho}
                aria-label={`${t.tamanho} ${tamanho}`}
                className={cn(
                  "flex-1 rounded-md py-1 leading-none transition",
                  tamanhoAtual === tamanho ? "bg-accent/[0.16] text-accent" : "text-ink-muted hover:text-ink-primary"
                )}
                // O botão mostra o tamanho que ele aplica, em escala — é mais
                // rápido de ler do que quatro números iguais.
                style={{ fontSize: Math.round(9 + (tamanho - 12) * 0.55) }}
              >
                A
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => aoMudar({ negrito: !no.negrito })}
            aria-pressed={no.negrito}
            aria-label={t.negrito}
            title={t.negrito}
            className={cn(
              "h-7 w-7 rounded-lg border border-base-700 text-xs font-bold transition",
              no.negrito ? "bg-accent/[0.16] text-accent" : "text-ink-muted hover:text-ink-primary"
            )}
          >
            B
          </button>
          <button
            type="button"
            onClick={() => aoMudar({ italico: !no.italico })}
            aria-pressed={no.italico}
            aria-label={t.italico}
            title={t.italico}
            className={cn(
              "h-7 w-7 rounded-lg border border-base-700 font-serif text-xs italic transition",
              no.italico ? "bg-accent/[0.16] text-accent" : "text-ink-muted hover:text-ink-primary"
            )}
          >
            I
          </button>
        </div>
      </div>
    </div>
  );
}
