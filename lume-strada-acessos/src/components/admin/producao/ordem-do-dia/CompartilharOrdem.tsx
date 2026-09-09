"use client";

import { useState, useTransition } from "react";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { cn } from "@/lib/utils/cn";
import { Button } from "@/components/ui/Button";
import { IconGlobe, IconLock, IconCopy, IconCheck, IconMessageCircle } from "@/components/ui/icons";
import { definirCompartilhamento } from "@/app/admin/producao/ordem-do-dia/actions";

/**
 * Liga o link da folha e entrega o jeito de mandá-lo.
 *
 * Dois estados só, ligado e desligado — a folha é para ler. E o botão do
 * WhatsApp existe porque é ali que uma ordem de externa de fato circula na
 * véspera: obrigar a copiar o link e trocar de aplicativo seria fingir que
 * não sabemos disso.
 */
export function CompartilharOrdem({
  ordemId,
  token,
  compartilhadoInicial,
  projeto,
  data,
}: {
  ordemId: string;
  token: string;
  compartilhadoInicial: boolean;
  projeto: string;
  data: string | null;
}) {
  const { dict } = useLocale();
  const t = dict.ordemDoDia;

  const [ligado, setLigado] = useState(compartilhadoInicial);
  const [aberto, setAberto] = useState(false);
  const [copiado, setCopiado] = useState(false);
  const [, start] = useTransition();

  const url = typeof window === "undefined" ? "" : `${window.location.origin}/externa/${token}`;
  const mensagem = `${t.mensagemWhatsapp
    .replace("{projeto}", projeto || t.semProjeto)
    .replace("{data}", data ?? t.semData)} ${url}`;

  function alternar(valor: boolean) {
    setLigado(valor);
    start(async () => {
      await definirCompartilhamento(ordemId, valor);
    });
  }

  return (
    <div className="relative print:hidden">
      <Button variant="ghost" className="px-2.5 py-1 text-xs" onClick={() => setAberto((a) => !a)}>
        {ligado ? <IconGlobe className="h-3.5 w-3.5 text-accent" /> : <IconLock className="h-3.5 w-3.5" />}
        {t.enviar}
      </Button>

      {aberto && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setAberto(false)} aria-hidden />
          <div className="absolute right-0 z-50 mt-2 w-80 rounded-xl border border-base-700 bg-base-900 p-3 shadow-xl">
            <p className="text-[11px] leading-snug text-ink-muted">{t.avisoCadastro}</p>

            <div className="mt-2.5 space-y-1">
              {[
                { valor: false, rotulo: t.linkDesligado, hint: t.linkDesligadoHint },
                { valor: true, rotulo: t.linkLigado, hint: t.linkLigadoHint },
              ].map((op) => (
                <button
                  key={String(op.valor)}
                  type="button"
                  onClick={() => alternar(op.valor)}
                  className={cn(
                    "w-full rounded-lg px-2.5 py-2 text-left transition",
                    ligado === op.valor ? "bg-accent/[0.14] ring-1 ring-inset ring-accent/30" : "hover:bg-base-800/60"
                  )}
                >
                  <span className={cn("block text-xs font-medium", ligado === op.valor ? "text-accent" : "text-ink-primary")}>
                    {op.rotulo}
                  </span>
                  <span className="mt-0.5 block text-[11px] leading-snug text-ink-muted">{op.hint}</span>
                </button>
              ))}
            </div>

            {ligado && (
              <div className="mt-3 space-y-2 border-t border-base-800 pt-3">
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
                        // Sem permissão de área de transferência: o campo ao
                        // lado continua ali para copiar à mão.
                      }
                    }}
                  >
                    {copiado ? <IconCheck className="h-3 w-3 text-status-good" /> : <IconCopy className="h-3 w-3" />}
                    {copiado ? t.linkCopiado : t.copiarLink}
                  </Button>
                </div>

                <a
                  href={`https://wa.me/?text=${encodeURIComponent(mensagem)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-accent/[0.14] px-2 py-1.5 text-[11px] font-medium text-accent ring-1 ring-inset ring-accent/25 transition hover:bg-accent/20"
                >
                  <IconMessageCircle className="h-3 w-3" /> {t.enviarWhatsapp}
                </a>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
