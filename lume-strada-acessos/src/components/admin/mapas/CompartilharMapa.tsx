"use client";

import { useState, useTransition } from "react";
import type { AcessoPublicoMapa } from "@/lib/types/mapa-mental";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { cn } from "@/lib/utils/cn";
import { Button } from "@/components/ui/Button";
import { IconGlobe, IconLock, IconCopy, IconCheck } from "@/components/ui/icons";
import { definirAcessoPublico } from "@/app/admin/mapas/actions";

/**
 * O menu de compartilhamento.
 *
 * Os quatro níveis ficam visíveis ao mesmo tempo, cada um com a frase do que
 * ele libera de verdade. Um interruptor "público sim/não" com um seletor
 * escondido atrás obrigaria a pessoa a adivinhar o que "público" significa —
 * e a diferença entre deixar alguém comentar e deixar alguém editar o mapa
 * inteiro é grande demais para ficar implícita.
 */
export function CompartilharMapa({ mapaId, token, acessoInicial }: { mapaId: string; token: string; acessoInicial: AcessoPublicoMapa }) {
  const { dict } = useLocale();
  const t = dict.mapaMental;

  const [acesso, setAcesso] = useState<AcessoPublicoMapa>(acessoInicial);
  const [aberto, setAberto] = useState(false);
  const [copiado, setCopiado] = useState(false);
  const [, start] = useTransition();

  const url = typeof window === "undefined" ? "" : `${window.location.origin}/mapa/${token}`;
  const publico = acesso !== "privado";

  const opcoes: { chave: AcessoPublicoMapa; rotulo: string; hint: string }[] = [
    { chave: "privado", rotulo: t.acessoPrivadoLabel, hint: t.acessoPrivadoHint },
    { chave: "ver", rotulo: t.acessoVerLabel, hint: t.acessoVerHint },
    { chave: "comentar", rotulo: t.acessoComentarLabel, hint: t.acessoComentarHint },
    { chave: "editar", rotulo: t.acessoEditarLabel, hint: t.acessoEditarHint },
  ];

  function escolher(chave: AcessoPublicoMapa) {
    setAcesso(chave);
    start(async () => {
      await definirAcessoPublico(mapaId, chave);
    });
  }

  return (
    <div className="relative">
      <Button variant="ghost" className="px-2.5 py-1 text-xs" onClick={() => setAberto((a) => !a)}>
        {publico ? <IconGlobe className="h-3.5 w-3.5 text-accent" /> : <IconLock className="h-3.5 w-3.5" />}
        {publico ? t.compartilhar : t.privado}
      </Button>

      {aberto && (
        <>
          {/* Camada invisível que fecha ao clicar fora — sem ela o menu ficaria
              aberto atrapalhando o mapa. */}
          <div className="fixed inset-0 z-40" onClick={() => setAberto(false)} aria-hidden />
          <div className="absolute right-0 z-50 mt-2 w-80 rounded-xl border border-base-700 bg-base-900 p-3 shadow-xl">
            <p className="mb-2 text-[10px] uppercase tracking-[0.14em] text-ink-muted">{t.quemPodeAbrir}</p>

            <div className="space-y-1">
              {opcoes.map((o) => (
                <button
                  key={o.chave}
                  type="button"
                  onClick={() => escolher(o.chave)}
                  className={cn(
                    "w-full rounded-lg px-2.5 py-2 text-left transition",
                    acesso === o.chave ? "bg-accent/[0.14] ring-1 ring-inset ring-accent/30" : "hover:bg-base-800/60"
                  )}
                >
                  <span className={cn("block text-xs font-medium", acesso === o.chave ? "text-accent" : "text-ink-primary")}>
                    {o.rotulo}
                  </span>
                  <span className="mt-0.5 block text-[11px] leading-snug text-ink-muted">{o.hint}</span>
                </button>
              ))}
            </div>

            {publico && (
              <div className="mt-3 border-t border-base-800 pt-3">
                <div className="flex items-center gap-2">
                  <input
                    readOnly
                    value={url}
                    onFocus={(e) => e.currentTarget.select()}
                    className="min-w-0 flex-1 truncate rounded-lg border border-base-700 bg-base-950 px-2 py-1 text-[11px] text-ink-secondary outline-none"
                  />
                  <Button
                    variant="ghost"
                    className="shrink-0 px-2 py-1 text-[11px]"
                    onClick={async () => {
                      try {
                        await navigator.clipboard.writeText(url);
                        setCopiado(true);
                        setTimeout(() => setCopiado(false), 2000);
                      } catch {
                        // Navegador sem permissão de área de transferência: o
                        // campo acima continua ali para copiar à mão.
                      }
                    }}
                  >
                    {copiado ? <IconCheck className="h-3 w-3 text-status-good" /> : <IconCopy className="h-3 w-3" />}
                    {copiado ? t.linkCopiado : t.copiarLink}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
