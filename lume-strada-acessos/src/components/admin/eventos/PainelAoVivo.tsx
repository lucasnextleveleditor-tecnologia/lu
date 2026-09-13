"use client";

import { useMemo, useTransition } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils/cn";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { fusoValido } from "@/lib/utils/fusos";
import { estadoDaCaptura, type CapturaRow, type EquipeEventoRow } from "@/lib/types/eventos";
import { marcarCaptura } from "@/app/admin/eventos/[id]/actions";

/**
 * O PAINEL FIXO DO AO VIVO — o que falta captar agora, e quem está em campo.
 *
 * A grade responde "o que está acontecendo". Este painel responde a outra
 * pergunta, que é a que tira o sono: **o que ainda não temos e ainda dá para
 * ter.** São coisas diferentes, e é por isso que ele não é uma aba da grade e
 * sim uma faixa embaixo dela, sempre aberta.
 *
 * A ORDEM É POR URGÊNCIA, e é a única tela do módulo ordenada assim:
 *
 *   1. o que a janela já fechou e ninguém marcou — ainda dá para correr atrás
 *      no minuto seguinte, e depois não dá mais;
 *   2. o que é obrigatório (ativação contratada) e está aberto;
 *   3. o resto, pela janela que fecha primeiro.
 *
 * Quem está na base TAMBÉM marca daqui. Parece redundante com o celular do
 * freela e não é: o operador vê o vídeo entrando e sabe que aquilo existe
 * antes de o câmera guardar o equipamento e pegar o telefone.
 */

const MINUTO = 60_000;

export function PainelAoVivo({
  eventoId,
  capturas,
  equipe,
  fuso,
  agora,
}: {
  eventoId: string;
  capturas: CapturaRow[];
  equipe: EquipeEventoRow[];
  fuso: string;
  /** O relógio vem de cima: uma batida só para a tela inteira. */
  agora: number | null;
}) {
  const { dict } = useLocale();
  const t = dict.eventos;
  const router = useRouter();
  const [pendente, iniciar] = useTransition();

  const zona = fusoValido(fuso);
  const agoraISO = agora === null ? new Date(0).toISOString() : new Date(agora).toISOString();

  const hora = (iso: string) =>
    new Intl.DateTimeFormat("pt-BR", { timeZone: zona, hour: "2-digit", minute: "2-digit", hour12: false }).format(
      new Date(iso)
    );

  const fila = useMemo(() => {
    if (agora === null) return [];

    const abertos = capturas.filter((c) => {
      const estado = estadoDaCaptura(c, agoraISO);
      if (estado !== "pendente" && estado !== "perdido") return false;
      // Só o que já é da vez: o que abre daqui a uma hora não é problema de
      // agora, e enche o painel do que importa.
      const abre = c.janela_inicio ? new Date(c.janela_inicio).getTime() : null;
      return abre === null || abre - agora <= 20 * MINUTO;
    });

    const peso = (c: CapturaRow) => {
      const estado = estadoDaCaptura(c, agoraISO);
      if (estado === "perdido") return 0;
      if (c.obrigatorio) return 1;
      return 2;
    };

    return abertos.sort((a, b) => {
      const p = peso(a) - peso(b);
      if (p !== 0) return p;
      const fa = a.janela_fim ? new Date(a.janela_fim).getTime() : Number.MAX_SAFE_INTEGER;
      const fb = b.janela_fim ? new Date(b.janela_fim).getTime() : Number.MAX_SAFE_INTEGER;
      return fa - fb;
    });
  }, [capturas, agora, agoraISO]);

  function marcar(id: string, status: "captado" | "nao_rolou") {
    iniciar(async () => {
      await marcarCaptura(eventoId, id, status);
      router.refresh();
    });
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[1.5fr_1fr]">
      {/* --- o que falta agora --- */}
      <div className="ev-console relative overflow-hidden rounded-2xl border border-white/10">
        <div aria-hidden className="ev-linhas-monitor pointer-events-none absolute inset-0 opacity-60" />
        <div className="relative px-5 py-5">
          <div className="flex items-center justify-between gap-3">
            <p className="font-mono text-[10px] uppercase tracking-[0.24em]" style={{ color: "rgb(var(--color-accent))" }}>
              {t.aoVivoFaltaAgora}
            </p>
            <span className="font-mono text-[11px] tabular-nums text-white/40">{fila.length}</span>
          </div>

          {fila.length === 0 ? (
            <p className="py-8 text-center text-xs text-white/35">
              {agora === null ? "…" : t.aoVivoFaltaVazio}
            </p>
          ) : (
            <ul className="mt-4 space-y-1.5">
              {fila.map((c) => {
                const perdido = estadoDaCaptura(c, agoraISO) === "perdido";
                const dono = c.responsavel_id ? equipe.find((p) => p.id === c.responsavel_id) : null;

                return (
                  <li
                    key={c.id}
                    className={cn(
                      "flex flex-wrap items-center gap-x-3 gap-y-2 rounded-lg border px-3.5 py-2.5",
                      perdido ? "border-danger/30 bg-danger/[0.06]" : "border-white/[0.08] bg-black/40"
                    )}
                  >
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-1.5">
                        <span className="truncate text-[13px] text-white/90">{c.titulo}</span>
                        {c.obrigatorio && (
                          <span className="shrink-0 rounded-full border border-accent/40 px-1.5 py-px font-mono text-[8px] uppercase tracking-[0.1em] text-accent">
                            {t.celularObrigatorio}
                          </span>
                        )}
                      </span>
                      <span className="mt-0.5 flex flex-wrap gap-x-2 font-mono text-[9px] uppercase tracking-[0.1em] text-white/35">
                        {c.janela_fim && (
                          <span className={cn(perdido && "text-danger")}>
                            {perdido ? t.aoVivoPassouDaHora : hora(c.janela_fim)}
                          </span>
                        )}
                        <span>{dono ? dono.nome : t.aoVivoSemDono}</span>
                      </span>
                    </span>

                    <span className="flex shrink-0 gap-1.5">
                      <button
                        type="button"
                        disabled={pendente}
                        onClick={() => marcar(c.id, "captado")}
                        className="rounded-md px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.1em] text-black transition disabled:opacity-40"
                        style={{ background: "rgb(var(--color-accent))" }}
                      >
                        {t.celularCaptei}
                      </button>
                      <button
                        type="button"
                        disabled={pendente}
                        onClick={() => marcar(c.id, "nao_rolou")}
                        className="rounded-md border border-white/15 px-2.5 py-1.5 font-mono text-[10px] uppercase tracking-[0.1em] text-white/55 transition hover:text-white disabled:opacity-40"
                      >
                        {t.celularNaoRolou}
                      </button>
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>

      {/* --- quem está em campo --- */}
      <div className="ev-console relative overflow-hidden rounded-2xl border border-white/10">
        <div aria-hidden className="ev-linhas-monitor pointer-events-none absolute inset-0 opacity-60" />
        <div className="relative px-5 py-5">
          <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-white/45">{t.aoVivoEmCampo}</p>

          {equipe.length === 0 ? (
            <p className="py-8 text-center text-xs text-white/35">{t.aoVivoNinguemEmCampo}</p>
          ) : (
            <ul className="mt-4 space-y-1.5">
              {equipe.map((p) => {
                const meus = capturas.filter((c) => c.responsavel_id === p.id);
                const feitos = meus.filter((c) => c.status === "captado").length;
                const emCampo = !!p.checkin_em && !p.checkout_em;

                return (
                  <li key={p.id} className="flex items-center gap-2.5 rounded-lg border border-white/[0.06] bg-black/30 px-3 py-2">
                    <span
                      className={cn(
                        "h-1.5 w-1.5 shrink-0 rounded-full",
                        emCampo
                          ? "bg-status-good shadow-[0_0_7px_rgb(34_197_94/0.85)]"
                          : p.checkout_em
                            ? "bg-white/15"
                            : "ev-pendente bg-white/40"
                      )}
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[13px] text-white/85">{p.nome}</span>
                      <span className="block truncate font-mono text-[9px] uppercase tracking-[0.1em] text-white/30">
                        {p.funcao ?? (emCampo ? t.aoVivoChegou : t.aoVivoNaoChegou)}
                      </span>
                    </span>
                    {meus.length > 0 && (
                      <span className="shrink-0 font-mono text-[10px] tabular-nums text-white/45">
                        {feitos}/{meus.length}
                      </span>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
