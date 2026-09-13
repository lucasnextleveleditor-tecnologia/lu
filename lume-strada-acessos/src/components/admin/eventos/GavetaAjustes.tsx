"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils/cn";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import type { EventoRow } from "@/lib/types/eventos";
import { ajustarEvento, type ChaveDeUso } from "@/app/admin/eventos/[id]/actions";

/**
 * A GAVETA DE AJUSTES — o que ESTE evento usa.
 *
 * O módulo cobre desde duas câmeras num casamento até quatro palcos com entrega
 * realtime a noite inteira. Mostrar tudo o que ele sabe fazer em todo evento
 * transforma o casamento num painel de usina: quem abre passa a gastar atenção
 * decidindo ignorar botão, e atenção no meio de um show é o recurso mais curto
 * que existe.
 *
 * Por isso tudo nasce DESLIGADO e a tela começa no mínimo — grade, equipe e
 * ocorrência. O resto aparece pelo lado de quem pediu.
 *
 * E é justamente por nascer desligado que cada chave carrega uma linha
 * explicando o que ela liga: esta gaveta não é um formulário de configuração,
 * é o **cardápio do módulo**. Se ela só listasse "Kit / Realtime / Ponto", o
 * default desligado viraria feature escondida, que é pior do que feature
 * demais.
 *
 * Ocorrência não tem chave de propósito: é o log, custa um botão, e é o único
 * lugar onde "o show atrasou" vira "o som chegou 21h40". Evento sem log não é
 * evento mais simples — é evento sem memória.
 */

export function GavetaAjustes({ evento, onFechar }: { evento: EventoRow; onFechar: () => void }) {
  const { dict } = useLocale();
  const t = dict.eventos;
  const router = useRouter();
  const [pendente, iniciar] = useTransition();

  const CHAVES: { chave: ChaveDeUso; ligado: boolean; titulo: string; texto: string }[] = [
    { chave: "usa_kit", ligado: evento.usa_kit, titulo: t.ajustesKit, texto: t.ajustesKitAjuda },
    { chave: "usa_realtime", ligado: evento.usa_realtime, titulo: t.ajustesRealtime, texto: t.ajustesRealtimeAjuda },
    { chave: "usa_ponto", ligado: evento.usa_ponto, titulo: t.ajustesPonto, texto: t.ajustesPontoAjuda },
    { chave: "usa_cache", ligado: evento.usa_cache, titulo: t.ajustesCache, texto: t.ajustesCacheAjuda },
    { chave: "usa_entregas", ligado: evento.usa_entregas, titulo: t.ajustesEntregas, texto: t.ajustesEntregasAjuda },
  ];

  function virar(chave: ChaveDeUso, valor: boolean) {
    iniciar(async () => {
      await ajustarEvento(evento.id, chave, valor);
      router.refresh();
    });
  }

  return (
    <>
      <button
        type="button"
        aria-label={dict.common.fechar}
        onClick={onFechar}
        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-[1px]"
      />

      <aside className="ev-console fixed inset-y-0 right-0 z-50 flex w-full max-w-lg flex-col overflow-y-auto border-l border-white/10 shadow-2xl">
        <div aria-hidden className="ev-linhas-monitor pointer-events-none absolute inset-0" />

        <div className="relative px-5 py-6 sm:px-6">
          <div className="flex items-center justify-between">
            <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-white/45">{t.ajustesTitulo}</p>
            <button
              type="button"
              onClick={onFechar}
              className="font-mono text-[10px] uppercase tracking-[0.14em] text-white/40 transition hover:text-white"
            >
              {dict.common.fechar}
            </button>
          </div>

          <p className="mt-3 text-[12px] leading-relaxed text-white/45">{t.ajustesAjuda}</p>

          <ul className="mt-5 space-y-2">
            {CHAVES.map((c) => (
              <li key={c.chave}>
                <button
                  type="button"
                  disabled={pendente}
                  onClick={() => virar(c.chave, !c.ligado)}
                  className={cn(
                    "flex w-full items-start gap-3.5 rounded-xl border px-4 py-3.5 text-left transition disabled:opacity-50",
                    c.ligado
                      ? "border-accent/40 bg-accent/[0.06]"
                      : "border-white/[0.08] bg-black/40 hover:border-white/20"
                  )}
                >
                  <Chave ligada={c.ligado} />
                  <span className="min-w-0 flex-1">
                    <span className={cn("block text-[14px] font-medium", c.ligado ? "text-white" : "text-white/70")}>
                      {c.titulo}
                    </span>
                    <span className="mt-1 block text-[11.5px] leading-relaxed text-white/45">{c.texto}</span>
                  </span>
                </button>
              </li>
            ))}
          </ul>

          <p className="mt-6 font-mono text-[9.5px] leading-relaxed tracking-[0.06em] text-white/25">
            {t.ajustesRodape}
          </p>
        </div>
      </aside>
    </>
  );
}

/** O interruptor. Desenhado, não `<input type=checkbox>`: o resto da tela é console. */
function Chave({ ligada }: { ligada: boolean }) {
  return (
    <span
      aria-hidden
      className={cn(
        "mt-0.5 flex h-[22px] w-[38px] shrink-0 items-center rounded-full border p-[3px] transition",
        ligada ? "justify-end border-accent/50 bg-accent/20" : "justify-start border-white/15 bg-black/60"
      )}
    >
      <span
        className={cn(
          "h-[14px] w-[14px] rounded-full transition",
          ligada ? "shadow-[0_0_8px_rgb(var(--color-accent)/0.9)]" : "bg-white/25"
        )}
        style={ligada ? { background: "rgb(var(--color-accent))" } : undefined}
      />
    </span>
  );
}
