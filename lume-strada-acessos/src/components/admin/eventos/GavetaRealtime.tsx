"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils/cn";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { useRelogio } from "@/components/admin/eventos/Grade";
import type { EquipeEventoRow, RealtimeRow, StatusRealtime } from "@/lib/types/eventos";
import {
  criarPedidoRealtime,
  mudarStatusRealtime,
  enviarRealtimeParaProducao,
  removerRealtime,
} from "@/app/admin/eventos/[id]/actions";

/**
 * A GAVETA DE ENTREGA REALTIME — pedido → editor → link, com o prazo correndo.
 *
 * É a única gaveta do módulo onde o tempo anda na tela. As outras respondem "o
 * que aconteceu"; esta responde **"quanto ainda dá"** — e essa resposta muda
 * sozinha a cada quinze segundos, esteja alguém olhando ou não.
 *
 * O prazo é pedido EM MINUTOS, nunca em hora do relógio. "Para as 23h40" e "em
 * trinta minutos" são a mesma informação e não são a mesma cabeça: no meio de
 * um evento ninguém faz a conta de que horas são daqui a meia hora. A tela
 * pergunta do jeito que a pessoa pensa e guarda o instante, que é o jeito que
 * o banco precisa.
 *
 * A fila é ordenada por quem vence primeiro, com o que já estourou no topo. É
 * a mesma regra do painel do Ao Vivo, pelo mesmo motivo: o que ainda dá para
 * salvar tem que estar onde o olho cai, não onde a ordem de criação deixou.
 *
 * O "→ Produção" é a válvula do que NÃO deu tempo. O corte pedido às duas da
 * manhã que ninguém entregou às duas e meia não pode evaporar quando o evento
 * fecha — ele atravessa para o quadro da semana, com o nome do evento no
 * título, em vez de virar uma mensagem perdida no grupo.
 */

const MINUTO = 60_000;

/** Os degraus de prazo. São os que se pedem de verdade; o resto é digitar. */
const PRAZOS = [15, 30, 45, 60, 90, 120] as const;

const CORES: Record<StatusRealtime, string> = {
  pedido: "border-white/15 text-white/60",
  editando: "border-accent/45 text-accent",
  entregue: "border-status-good/45 text-status-good",
  cancelado: "border-white/10 text-white/25",
};

export function GavetaRealtime({
  eventoId,
  realtime,
  equipe,
  onFechar,
}: {
  eventoId: string;
  realtime: RealtimeRow[];
  equipe: EquipeEventoRow[];
  onFechar: () => void;
}) {
  const { dict } = useLocale();
  const t = dict.eventos;
  const router = useRouter();
  const [pendente, iniciar] = useTransition();

  // O relógio desta gaveta. Ela pode ser aberta no Plano, onde a batida da
  // grade está desligada — e um contador parado mente pior do que não existir.
  const agora = useRelogio(true);

  const [pedido, setPedido] = useState("");
  const [editorId, setEditorId] = useState<string | null>(null);
  const [prazoMin, setPrazoMin] = useState(30);
  const [linkAberto, setLinkAberto] = useState<string | null>(null);
  const [link, setLink] = useState("");

  function criar() {
    if (!pedido.trim()) return;
    iniciar(async () => {
      const r = await criarPedidoRealtime(eventoId, { pedido, editorEquipeId: editorId, prazoMin });
      if (!r.ok) return;
      setPedido("");
      setEditorId(null);
      router.refresh();
    });
  }

  function andar(id: string, status: StatusRealtime, comLink?: string | null) {
    iniciar(async () => {
      await mudarStatusRealtime(eventoId, id, status, comLink);
      setLinkAberto(null);
      setLink("");
      router.refresh();
    });
  }

  function paraProducao(id: string) {
    iniciar(async () => {
      await enviarRealtimeParaProducao(eventoId, id);
      router.refresh();
    });
  }

  function remover(id: string) {
    iniciar(async () => {
      await removerRealtime(eventoId, id);
      router.refresh();
    });
  }

  /** Minutos que faltam. Negativo = estourou. `null` = pedido sem prazo. */
  function faltam(item: RealtimeRow): number | null {
    if (!item.prazo_em || agora === null) return null;
    return Math.round((new Date(item.prazo_em).getTime() - agora) / MINUTO);
  }

  // Quem vence primeiro em cima; entregue e cancelado descem para o pé da
  // lista, porque já não pedem nada de ninguém.
  const fila = [...realtime].sort((a, b) => {
    const morto = (i: RealtimeRow) => (i.status === "entregue" || i.status === "cancelado" ? 1 : 0);
    const m = morto(a) - morto(b);
    if (m !== 0) return m;
    const pa = a.prazo_em ? new Date(a.prazo_em).getTime() : Number.MAX_SAFE_INTEGER;
    const pb = b.prazo_em ? new Date(b.prazo_em).getTime() : Number.MAX_SAFE_INTEGER;
    return pa - pb;
  });

  const correndo = realtime.filter((i) => i.status === "pedido" || i.status === "editando").length;

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
            <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-white/45">{t.realtimeTitulo}</p>
            <button
              type="button"
              onClick={onFechar}
              className="font-mono text-[10px] uppercase tracking-[0.14em] text-white/40 transition hover:text-white"
            >
              {dict.common.fechar}
            </button>
          </div>

          {correndo > 0 && (
            <div className="mt-4 rounded-xl border border-accent/30 bg-accent/[0.06] px-4 py-3">
              <p className="font-mono text-lg tabular-nums text-accent">{correndo}</p>
              <p className="mt-0.5 font-mono text-[9.5px] uppercase tracking-[0.16em] text-white/40">
                {t.realtimeCorrendo}
              </p>
            </div>
          )}

          {/* --- novo pedido --- */}
          <div className="mt-5 rounded-xl border border-white/[0.08] bg-black/40 p-4">
            <p className="font-mono text-[9.5px] uppercase tracking-[0.18em] text-white/40">{t.realtimeNovo}</p>

            <input
              value={pedido}
              onChange={(e) => setPedido(e.target.value)}
              placeholder={t.realtimePlaceholder}
              className="mt-1.5 w-full rounded-lg border border-white/10 bg-black/50 px-3 py-2.5 text-sm text-white placeholder:text-white/25 focus:border-accent/60 focus:outline-none"
            />

            <p className="mt-3 font-mono text-[9.5px] uppercase tracking-[0.18em] text-white/40">{t.realtimeEditor}</p>
            <select
              value={editorId ?? ""}
              onChange={(e) => setEditorId(e.target.value || null)}
              className="mt-1.5 w-full rounded-lg border border-white/10 bg-black/50 px-3 py-2.5 text-sm text-white focus:border-accent/60 focus:outline-none"
            >
              <option value="">{t.realtimeSemEditor}</option>
              {equipe.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.funcao ? `${p.nome} · ${p.funcao}` : p.nome}
                </option>
              ))}
            </select>

            {/* O prazo em minutos: degraus prontos, porque quem pede está com
                o rádio na outra mão. */}
            <p className="mt-3 font-mono text-[9.5px] uppercase tracking-[0.18em] text-white/40">{t.realtimePrazo}</p>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {PRAZOS.map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setPrazoMin(m)}
                  className={cn(
                    "rounded-lg border px-3 py-1.5 font-mono text-[11px] tabular-nums transition",
                    prazoMin === m
                      ? "border-accent/60 bg-accent/10 text-accent"
                      : "border-white/10 text-white/45 hover:border-white/25 hover:text-white/80"
                  )}
                >
                  {m}
                  <span className="ml-0.5 text-[9px] uppercase tracking-[0.1em] opacity-60">{t.realtimeMin}</span>
                </button>
              ))}
            </div>

            <button
              type="button"
              disabled={pendente || !pedido.trim()}
              onClick={criar}
              className="mt-4 w-full rounded-lg px-4 py-2.5 font-mono text-[11px] uppercase tracking-[0.14em] text-black transition disabled:opacity-30"
              style={{ background: "rgb(var(--color-accent))" }}
            >
              {t.realtimePedir}
            </button>
          </div>

          {/* --- a fila --- */}
          {fila.length === 0 ? (
            <p className="py-10 text-center text-xs text-white/35">{t.realtimeVazio}</p>
          ) : (
            <ul className="mt-5 space-y-2">
              {fila.map((item) => {
                const min = faltam(item);
                const vivo = item.status === "pedido" || item.status === "editando";
                const estourou = min !== null && min < 0 && vivo;
                const editor = item.editor_equipe_id ? equipe.find((p) => p.id === item.editor_equipe_id) : null;

                return (
                  <li
                    key={item.id}
                    className={cn(
                      "rounded-xl border px-4 py-3",
                      estourou ? "border-danger/35 bg-danger/[0.06]" : "border-white/[0.08] bg-black/40",
                      !vivo && "opacity-55"
                    )}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <p className="min-w-0 flex-1 text-[13px] leading-snug text-white/90">{item.pedido}</p>

                      {/* O relógio do pedido. Só existe enquanto é pedido. */}
                      {vivo && min !== null && (
                        <span
                          className={cn(
                            "shrink-0 font-mono text-[11px] tabular-nums",
                            estourou ? "text-danger" : min <= 10 ? "text-accent" : "text-white/45"
                          )}
                        >
                          {estourou ? `+${Math.abs(min)}` : min}
                          <span className="ml-0.5 text-[9px] uppercase tracking-[0.1em] opacity-60">
                            {t.realtimeMin}
                          </span>
                        </span>
                      )}
                    </div>

                    <div className="mt-1.5 flex flex-wrap items-center gap-x-2.5 gap-y-1 font-mono text-[9px] uppercase tracking-[0.1em] text-white/35">
                      <span className={cn("rounded-full border px-1.5 py-px", CORES[item.status])}>
                        {t.realtimeStatus[item.status]}
                      </span>
                      <span>{editor ? editor.nome : t.realtimeSemEditor}</span>
                      {estourou && <span className="text-danger">{t.realtimeEstourou}</span>}
                      {item.tarefa_id && <span className="text-accent/70">{t.realtimeNaProducao}</span>}
                    </div>

                    {item.link && (
                      <a
                        href={item.link}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-2 block truncate font-mono text-[10px] text-accent underline underline-offset-2"
                      >
                        {item.link}
                      </a>
                    )}

                    {/* O campo de link só aparece quando se vai entregar — no
                        resto do tempo ele é uma caixa vazia pedindo atenção. */}
                    {linkAberto === item.id ? (
                      <div className="mt-2.5 flex gap-1.5">
                        <input
                          value={link}
                          onChange={(e) => setLink(e.target.value)}
                          placeholder={t.realtimeLinkPlaceholder}
                          className="min-w-0 flex-1 rounded-lg border border-white/10 bg-black/50 px-2.5 py-1.5 text-xs text-white placeholder:text-white/25 focus:border-accent/60 focus:outline-none"
                        />
                        <button
                          type="button"
                          disabled={pendente}
                          onClick={() => andar(item.id, "entregue", link)}
                          className="shrink-0 rounded-lg px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.1em] text-black disabled:opacity-40"
                          style={{ background: "rgb(var(--color-accent))" }}
                        >
                          {t.realtimeEntregar}
                        </button>
                      </div>
                    ) : (
                      <div className="mt-2.5 flex flex-wrap gap-1.5">
                        {item.status === "pedido" && (
                          <Acao rotulo={t.realtimeComecar} onClick={() => andar(item.id, "editando")} pendente={pendente} />
                        )}
                        {vivo && (
                          <Acao
                            rotulo={t.realtimeEntregar}
                            destaque
                            onClick={() => {
                              setLink(item.link ?? "");
                              setLinkAberto(item.id);
                            }}
                            pendente={pendente}
                          />
                        )}
                        {vivo && !item.tarefa_id && (
                          <Acao rotulo={t.realtimeParaProducao} onClick={() => paraProducao(item.id)} pendente={pendente} />
                        )}
                        {vivo && (
                          <Acao rotulo={t.realtimeCancelar} onClick={() => andar(item.id, "cancelado")} pendente={pendente} />
                        )}
                        {!vivo && (
                          <Acao rotulo={dict.common.remover} onClick={() => remover(item.id)} pendente={pendente} />
                        )}
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </aside>
    </>
  );
}

function Acao({
  rotulo,
  onClick,
  pendente,
  destaque,
}: {
  rotulo: string;
  onClick: () => void;
  pendente: boolean;
  destaque?: boolean;
}) {
  return (
    <button
      type="button"
      disabled={pendente}
      onClick={onClick}
      className={cn(
        "rounded-lg border px-2.5 py-1.5 font-mono text-[10px] uppercase tracking-[0.1em] transition disabled:opacity-40",
        destaque
          ? "border-accent/45 text-accent hover:bg-accent/10"
          : "border-white/12 text-white/50 hover:border-white/30 hover:text-white"
      )}
    >
      {rotulo}
    </button>
  );
}
