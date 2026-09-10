"use client";

import type { MapaNoRow } from "@/lib/types/mapa-mental";
import { FONTES_MAPA, FORMAS_MAPA, LARGURAS_MAPA, ORDEM_FONTES, ORDEM_FORMAS, TAMANHOS_MAPA, fonteCss } from "@/lib/types/mapa-mental";
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
  const larguraAtual = no.largura || 0;

  return (
    <div className="border-t border-base-800 pt-3">
      <p className="mb-2 flex items-center gap-1.5 text-[10px] uppercase tracking-[0.14em] text-ink-muted">
        <IconType className="h-3 w-3" /> {t.formaETexto}
      </p>

      <div className="space-y-2">
        {/* A forma do balão vem antes da tipografia: é a escolha que muda
            mais o mapa de longe, e a que a pessoa procura primeiro. Cada
            opção é desenhada com a própria forma — uma lista de nomes
            ("hexágono", "pílula") obrigaria a imaginar o resultado. */}
        {no.pai_id && (
          <div className="flex flex-wrap gap-1.5 pb-1">
            {ORDEM_FORMAS.map((chave) => {
              const atual = (no.forma || "arredondado") === chave;
              return (
                <button
                  key={chave}
                  type="button"
                  onClick={() => aoMudar({ forma: chave === "arredondado" ? "" : chave })}
                  title={FORMAS_MAPA[chave].rotulo}
                  aria-label={FORMAS_MAPA[chave].rotulo}
                  aria-pressed={atual}
                  className={cn(
                    "flex h-8 w-10 items-center justify-center rounded-lg border transition",
                    atual ? "border-accent/40 bg-accent/[0.14]" : "border-base-700 hover:border-base-600"
                  )}
                >
                  <MiniForma forma={chave} ativa={atual} />
                </button>
              );
            })}
          </div>
        )}

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

        {/* A largura é o que decide ONDE o texto quebra. No automático o
            balão cresce até o teto e a quebra é onde couber — é o que faz
            uma frase média virar um balão comprido de uma linha só, e o
            mapa esticar de lado a lado. Cada botão mostra a proporção que
            aplica, e não um número. */}
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] uppercase tracking-[0.14em] text-ink-muted">{t.largura}</span>
          <div className="flex flex-1 items-center gap-0.5 rounded-lg border border-base-700 p-0.5">
            {LARGURAS_MAPA.map((opcao) => (
              <button
                key={opcao.valor}
                type="button"
                onClick={() => aoMudar({ largura: opcao.valor })}
                aria-pressed={larguraAtual === opcao.valor}
                title={opcao.rotulo}
                aria-label={`${t.largura}: ${opcao.rotulo}`}
                className={cn(
                  "flex flex-1 items-center justify-center rounded-md py-1.5 transition",
                  larguraAtual === opcao.valor ? "bg-accent/[0.16]" : "hover:bg-base-800/60"
                )}
              >
                {opcao.valor === 0 ? (
                  <span className={cn("text-[10px] font-medium leading-none", larguraAtual === 0 ? "text-accent" : "text-ink-muted")}>
                    Auto
                  </span>
                ) : (
                  <span
                    className={cn("h-[3px] rounded-full", larguraAtual === opcao.valor ? "bg-accent" : "bg-ink-muted")}
                    style={{ width: Math.round(opcao.valor / 14) }}
                  />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/** A prévia de uma forma, desenhada com ela mesma. */
function MiniForma({ forma, ativa }: { forma: string; ativa: boolean }) {
  const cor = ativa ? "rgb(var(--color-accent))" : "rgb(var(--color-ink-muted))";
  const comum = { width: 22, height: 13, border: `1.5px solid ${cor}` } as const;

  if (forma === "sublinhado") {
    return <span style={{ width: 22, height: 13, borderBottom: `2.5px solid ${cor}` }} />;
  }
  if (forma === "hexagono") {
    return (
      <span
        style={{
          width: 22,
          height: 13,
          backgroundColor: cor,
          clipPath: "polygon(22% 0, 78% 0, 100% 50%, 78% 100%, 22% 100%, 0 50%)",
        }}
      />
    );
  }
  const raio = forma === "pilula" ? 999 : forma === "elipse" ? "50%" : forma === "reto" ? 0 : 4;
  return <span style={{ ...comum, borderRadius: raio }} />;
}
