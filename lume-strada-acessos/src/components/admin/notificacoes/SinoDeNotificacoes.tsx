"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils/cn";
import { useCaixaDeNotificacoes } from "@/lib/notificacoes/useCaixaDeNotificacoes";
import { TOM_AVISO, tempoRelativo, type NotificacaoRow } from "@/lib/types/notificacoes";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { LOCALE_BCP47 } from "@/lib/i18n/locales";
import {
  IconBell,
  IconCheck,
  IconMegaphone,
  IconAtSign,
  IconClipboardList,
  IconFileText,
  IconSignature,
} from "@/components/ui/icons";

const ICONE_POR_TIPO = {
  task_assignment: IconClipboardList,
  mention: IconAtSign,
  announcement: IconMegaphone,
  contrato: IconFileText,
  assinatura: IconSignature,
  system: IconBell,
} as const;

/**
 * O sino.
 *
 * Duas listas moram no mesmo painel, e a ordem entre elas não é estética: os
 * AVISOS DA EMPRESA vêm primeiro e não somem sozinhos, porque quem os mandou
 * precisa saber que foram vistos — some só no clique explícito em "marcar
 * como visto". As NOTIFICAÇÕES vêm embaixo e se apagam com o próprio uso:
 * clicou, foi para lá, está lida.
 */
export function SinoDeNotificacoes() {
  const router = useRouter();
  const { dict, locale } = useLocale();
  const t = dict.notificacoes;
  const quando = (iso: string) => tempoRelativo(iso, t, LOCALE_BCP47[locale]);
  const [aberto, setAberto] = useState(false);
  const caixa = useCaixaDeNotificacoes();
  const painelRef = useRef<HTMLDivElement | null>(null);

  // Esc fecha, e clicar fora fecha. Um painel que só fecha no próprio botão
  // vira uma janela presa na frente do que a pessoa quer ver.
  useEffect(() => {
    if (!aberto) return;
    const aoTeclar = (e: KeyboardEvent) => {
      if (e.key === "Escape") setAberto(false);
    };
    window.addEventListener("keydown", aoTeclar);
    return () => window.removeEventListener("keydown", aoTeclar);
  }, [aberto]);

  function abrirNotificacao(n: NotificacaoRow) {
    void caixa.marcarComoLida(n.id);
    setAberto(false);
    if (n.href) router.push(n.href);
  }

  const avisosPendentes = caixa.avisos.filter((a) => !a.visto);
  const temAlgo = avisosPendentes.length > 0 || caixa.notificacoes.length > 0;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setAberto((a) => !a)}
        aria-label={caixa.naoLidas > 0 ? t.naoLidas.replace("{n}", String(caixa.naoLidas)) : t.titulo}
        title={t.titulo}
        className={cn(
          "relative flex h-9 w-9 items-center justify-center rounded-lg border border-base-700 bg-base-900/80 text-ink-secondary backdrop-blur transition",
          "hover:border-ink-muted hover:text-ink-primary",
          aberto && "border-ink-muted text-ink-primary"
        )}
      >
        <IconBell className="h-4 w-4" />
        {caixa.naoLidas > 0 && (
          // O emblema encosta na borda do sino de propósito: no canto exato
          // para onde o olho vai quando alguma coisa muda no topo da tela.
          <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-danger px-1 text-[10px] font-bold leading-none text-white">
            {caixa.naoLidas > 9 ? "9+" : caixa.naoLidas}
          </span>
        )}
      </button>

      {aberto && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setAberto(false)} aria-hidden />
          <div
            ref={painelRef}
            className="absolute right-0 z-50 mt-2 flex max-h-[70vh] w-[min(22rem,calc(100vw-2rem))] flex-col overflow-hidden rounded-xl border border-base-700 bg-base-900 shadow-2xl"
          >
            <div className="flex items-center justify-between gap-2 border-b border-base-800 px-4 py-3">
              <p className="text-sm font-semibold text-ink-primary">{t.titulo}</p>
              {caixa.notificacoes.some((n) => !n.read) && (
                <button
                  type="button"
                  onClick={() => void caixa.marcarTodasComoLidas()}
                  className="text-[11px] font-medium text-accent hover:underline"
                >
                  {t.marcarTodas}
                </button>
              )}
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto">
              {caixa.carregando && <p className="px-4 py-8 text-center text-xs text-ink-muted">{t.carregando}</p>}

              {!caixa.carregando && !temAlgo && (
                <div className="px-4 py-10 text-center">
                  <span className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-base-800">
                    <IconBell className="h-4 w-4 text-ink-muted" />
                  </span>
                  <p className="text-xs font-medium text-ink-secondary">{t.vazioTitulo}</p>
                  <p className="mx-auto mt-1 max-w-[15rem] text-[11px] leading-snug text-ink-muted">
                    {t.vazioAjuda}
                  </p>
                </div>
              )}

              {/* ---------------------------------------------------------- */}
              {/* AVISOS DA EMPRESA — primeiro, e só saem no clique           */}
              {/* ---------------------------------------------------------- */}
              {avisosPendentes.map((aviso) => {
                const tom = TOM_AVISO[aviso.tone];
                return (
                  <div key={aviso.id} className="border-b border-base-800 px-4 py-3" style={{ backgroundColor: `${tom.cor}0f` }}>
                    <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider" style={{ color: tom.cor }}>
                      <IconMegaphone className="h-3 w-3" />
                      {t.tom[aviso.tone]}
                    </p>
                    <p className="mt-1 text-xs font-semibold text-ink-primary">{aviso.title}</p>
                    <p className="mt-1 whitespace-pre-line text-[11px] leading-relaxed text-ink-secondary">{aviso.message}</p>
                    <div className="mt-2 flex items-center justify-between gap-2">
                      <p className="text-[10px] text-ink-muted">
                        {aviso.sender_nome ?? t.administracao} · {quando(aviso.created_at)}
                      </p>
                      <button
                        type="button"
                        onClick={() => void caixa.marcarAvisoComoVisto(aviso.id)}
                        className="inline-flex shrink-0 items-center gap-1 rounded-lg border px-2 py-1 text-[10px] font-medium transition hover:brightness-125"
                        style={{ borderColor: `${tom.cor}55`, color: tom.cor }}
                      >
                        <IconCheck className="h-2.5 w-2.5" /> {t.marcarComoVisto}
                      </button>
                    </div>
                  </div>
                );
              })}

              {/* ---------------------------------------------------------- */}
              {/* NOTIFICAÇÕES                                                */}
              {/* ---------------------------------------------------------- */}
              {caixa.notificacoes
                // A notificação que anuncia um aviso sai da lista enquanto o
                // aviso ainda está em destaque acima: seriam duas linhas
                // dizendo a mesma coisa, uma em cima da outra.
                .filter((n) => !(n.tipo === "announcement" && avisosPendentes.some((a) => a.id === n.reference_id)))
                .map((n) => {
                  const Icone = ICONE_POR_TIPO[n.tipo] ?? IconBell;
                  return (
                    <button
                      key={n.id}
                      type="button"
                      onClick={() => abrirNotificacao(n)}
                      className={cn(
                        "flex w-full items-start gap-3 border-b border-base-800 px-4 py-3 text-left transition hover:bg-base-800/50",
                        !n.read && "bg-accent/[0.06]"
                      )}
                    >
                      <span
                        className={cn(
                          "mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg",
                          n.read ? "bg-base-800 text-ink-muted" : "bg-accent/15 text-accent"
                        )}
                      >
                        <Icone className="h-3.5 w-3.5" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center gap-1.5">
                          <span className="text-[10px] uppercase tracking-wider text-ink-muted">{t.tipo[n.tipo]}</span>
                          {!n.read && <span className="h-1.5 w-1.5 rounded-full bg-accent" aria-hidden />}
                        </span>
                        <span className={cn("mt-0.5 block text-xs", n.read ? "text-ink-secondary" : "font-semibold text-ink-primary")}>
                          {n.titulo}
                        </span>
                        {n.mensagem && <span className="mt-0.5 block truncate text-[11px] text-ink-muted">{n.mensagem}</span>}
                        <span className="mt-1 block text-[10px] text-ink-muted">
                          {n.ator_nome ? `${n.ator_nome} · ` : ""}
                          {quando(n.created_at)}
                        </span>
                      </span>
                    </button>
                  );
                })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
