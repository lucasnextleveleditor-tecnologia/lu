"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils/cn";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { estadoDaCaptura, type CapturaRow, type EstadoCaptura } from "@/lib/types/eventos";
import { fusoValido } from "@/lib/utils/fusos";
import { marcarPorToken } from "@/app/evento/[token]/actions";
import type { PautaDoFreela } from "@/app/evento/[token]/data";

/**
 * O CELULAR DE QUEM ESTÁ EM CAMPO.
 *
 * A regra desta tela é uma só, e vale mais do que qualquer outra coisa:
 * **ele nunca digita nada.** Três botões por item — captei, não rolou, pular —
 * e mais nada. Quem está com a câmera na mão, no escuro, com som alto e a
 * banda entrando, não preenche formulário. Se essa tela pedir uma linha de
 * texto, ela deixa de ser usada no segundo evento, e a pauta volta a ser o
 * grupo do WhatsApp.
 *
 * "Não rolou" também não pede motivo aqui, de propósito. O motivo é conversa
 * de quem está na base, com calma, na tela do Fechamento — e cobrar isso no
 * meio do show custaria a marcação inteira.
 *
 * "PULAR" não escreve no banco. Ele manda o item para o fim da fila NESTA
 * sessão, e é o botão que faz os outros dois serem honestos: sem ele, quem não
 * quer decidir agora acaba marcando qualquer coisa só para a lista andar.
 *
 * A ORDEM é pelo relógio, não por importância: agora, depois, e o que já
 * passou. Quem abre esta tela abre para saber o que fazer NO MINUTO SEGUINTE.
 */

const MINUTO = 60_000;

/** Relógio local. `null` até montar, pelo mesmo motivo da grade do painel: no servidor não existe "agora". */
function useAgora(): number | null {
  const [agora, setAgora] = useState<number | null>(null);
  useEffect(() => {
    setAgora(Date.now());
    const id = setInterval(() => setAgora(Date.now()), 15_000);
    return () => clearInterval(id);
  }, []);
  return agora;
}

export function PautaDoCelular({ pauta, token }: { pauta: PautaDoFreela; token: string }) {
  const { dict } = useLocale();
  const t = dict.eventos;
  const router = useRouter();
  const [pendente, iniciar] = useTransition();
  const [pulados, setPulados] = useState<string[]>([]);
  const [erro, setErro] = useState<string | null>(null);

  const agora = useAgora();
  const zona = fusoValido(pauta.evento.fuso);
  const agoraISO = agora === null ? new Date(0).toISOString() : new Date(agora).toISOString();

  const blocoPorId = useMemo(() => new Map(pauta.blocos.map((b) => [b.id, b])), [pauta.blocos]);
  const ambientePorId = useMemo(() => new Map(pauta.ambientes.map((a) => [a.id, a])), [pauta.ambientes]);

  const hora = (iso: string) =>
    new Intl.DateTimeFormat("pt-BR", { timeZone: zona, hour: "2-digit", minute: "2-digit", hour12: false }).format(
      new Date(iso)
    );

  /** Três listas pelo relógio, e os pulados sempre no fim da sua. */
  const { agoraLista, depois, passou, feitos } = useMemo(() => {
    const agoraLista: CapturaRow[] = [];
    const depois: CapturaRow[] = [];
    const passou: CapturaRow[] = [];
    const feitos: CapturaRow[] = [];

    for (const c of pauta.capturas) {
      const estado = estadoDaCaptura(c, agoraISO);
      if (estado === "captado" || estado === "nao_rolou") {
        feitos.push(c);
        continue;
      }
      if (estado === "perdido") {
        passou.push(c);
        continue;
      }
      const abre = c.janela_inicio ? new Date(c.janela_inicio).getTime() : null;
      // "Agora" inclui o que abre nos próximos 20 minutos: numa operação de
      // campo, o que vem já já é tão urgente quanto o que está aberto — é o
      // tempo de atravessar o galpão e trocar a lente.
      const jaVale = abre === null || agora === null || abre - agora <= 20 * MINUTO;
      (jaVale ? agoraLista : depois).push(c);
    }

    const fim = (lista: CapturaRow[]) =>
      [...lista].sort((a, b) => Number(pulados.includes(a.id)) - Number(pulados.includes(b.id)));

    return { agoraLista: fim(agoraLista), depois, passou, feitos };
  }, [pauta.capturas, agoraISO, agora, pulados]);

  function marcar(id: string, status: "captado" | "nao_rolou" | "pendente") {
    setErro(null);
    iniciar(async () => {
      const r = await marcarPorToken(token, id, status);
      if (!r.ok) {
        setErro(
          r.error === "LINK_EXPIRADO"
            ? t.celularLinkExpirado
            : r.error === "ITEM_DE_OUTRA_PESSOA"
              ? t.celularItemDeOutro
              : t.celularErroGenerico
        );
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="ev-console min-h-screen">
      <div aria-hidden className="ev-linhas-monitor pointer-events-none fixed inset-0" />

      <div className="relative mx-auto max-w-lg px-4 pb-24 pt-6">
        <header>
          <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-white/40">{pauta.evento.nome}</p>
          <h1 className="mt-1 text-xl font-semibold tracking-tight text-white">
            {t.celularOla.replace("{nome}", pauta.pessoa.nome.split(" ")[0] ?? pauta.pessoa.nome)}
          </h1>
          <div className="mt-1 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.14em] text-white/35">
            {pauta.pessoa.funcao && <span>{pauta.pessoa.funcao}</span>}
            <span className="ml-auto tabular-nums" style={{ color: "rgb(var(--color-accent))" }}>
              {agora === null ? "--:--" : hora(new Date(agora).toISOString())}
            </span>
          </div>
        </header>

        {erro && (
          <p className="mt-4 rounded-lg border border-danger/40 bg-danger/10 px-3 py-2 text-xs text-danger">{erro}</p>
        )}

        <Secao titulo={t.celularAgora} destaque contador={agoraLista.length}>
          {agoraLista.length === 0 ? (
            <Vazio texto={t.celularNadaAgora} />
          ) : (
            agoraLista.map((c) => (
              <Item
                key={c.id}
                captura={c}
                bloco={c.bloco_id ? blocoPorId.get(c.bloco_id) : undefined}
                ambiente={c.ambiente_id ? ambientePorId.get(c.ambiente_id) : undefined}
                hora={hora}
                pulado={pulados.includes(c.id)}
                ocupado={pendente}
                onCaptei={() => marcar(c.id, "captado")}
                onNaoRolou={() => marcar(c.id, "nao_rolou")}
                onPular={() => setPulados((l) => (l.includes(c.id) ? l : [...l, c.id]))}
              />
            ))
          )}
        </Secao>

        {passou.length > 0 && (
          <Secao titulo={t.celularPassou} alerta contador={passou.length}>
            {passou.map((c) => (
              <Item
                key={c.id}
                captura={c}
                bloco={c.bloco_id ? blocoPorId.get(c.bloco_id) : undefined}
                ambiente={c.ambiente_id ? ambientePorId.get(c.ambiente_id) : undefined}
                hora={hora}
                atrasado
                ocupado={pendente}
                onCaptei={() => marcar(c.id, "captado")}
                onNaoRolou={() => marcar(c.id, "nao_rolou")}
              />
            ))}
          </Secao>
        )}

        {depois.length > 0 && (
          <Secao titulo={t.celularASeguir} contador={depois.length}>
            {depois.map((c) => (
              <Proximo
                key={c.id}
                captura={c}
                bloco={c.bloco_id ? blocoPorId.get(c.bloco_id) : undefined}
                hora={hora}
              />
            ))}
          </Secao>
        )}

        {feitos.length > 0 && (
          <Secao titulo={t.celularFeito} contador={feitos.length}>
            {feitos.map((c) => (
              <Feito key={c.id} captura={c} hora={hora} ocupado={pendente} onDesfazer={() => marcar(c.id, "pendente")} />
            ))}
          </Secao>
        )}
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------------

function Secao({
  titulo,
  contador,
  destaque,
  alerta,
  children,
}: {
  titulo: string;
  contador: number;
  destaque?: boolean;
  alerta?: boolean;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-7">
      <div className="mb-2.5 flex items-center justify-between">
        <p
          className={cn("font-mono text-[10px] uppercase tracking-[0.22em]", alerta ? "text-danger/80" : "text-white/40")}
          style={destaque ? { color: "rgb(var(--color-accent))" } : undefined}
        >
          {titulo}
        </p>
        <span className="font-mono text-[11px] tabular-nums text-white/30">{contador}</span>
      </div>
      <div className="space-y-2">{children}</div>
    </section>
  );
}

function Vazio({ texto }: { texto: string }) {
  return <p className="rounded-xl border border-white/[0.07] bg-black/30 px-4 py-6 text-center text-xs text-white/35">{texto}</p>;
}

/**
 * O item, com os três botões.
 *
 * Alvos grandes (48px de altura) e o "captei" ocupando metade da largura: é o
 * botão que vai ser tocado nove em cada dez vezes, e tocado de pé, no escuro,
 * às vezes com luva.
 */
function Item({
  captura,
  bloco,
  ambiente,
  hora,
  pulado,
  atrasado,
  ocupado,
  onCaptei,
  onNaoRolou,
  onPular,
}: {
  captura: CapturaRow;
  bloco?: { titulo: string; inicio: string };
  ambiente?: { nome: string; cor: string | null };
  hora: (iso: string) => string;
  pulado?: boolean;
  atrasado?: boolean;
  ocupado: boolean;
  onCaptei: () => void;
  onNaoRolou: () => void;
  onPular?: () => void;
}) {
  const { dict } = useLocale();
  const t = dict.eventos;

  return (
    <div
      className={cn(
        "rounded-xl border bg-black/40 px-4 py-3.5 transition",
        atrasado ? "border-danger/30" : "border-white/[0.09]",
        pulado && "opacity-55"
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-[15px] font-medium leading-snug text-white">{captura.titulo}</p>
        {captura.obrigatorio && (
          <span className="shrink-0 rounded-full border border-accent/40 px-2 py-0.5 font-mono text-[8.5px] uppercase tracking-[0.12em] text-accent">
            {t.celularObrigatorio}
          </span>
        )}
      </div>

      <p className="mt-1 flex flex-wrap items-center gap-x-2 font-mono text-[10px] uppercase tracking-[0.1em] text-white/35">
        {ambiente && <span style={{ color: ambiente.cor ?? undefined }}>{ambiente.nome}</span>}
        {bloco && <span>{bloco.titulo}</span>}
        {captura.janela_fim && <span className={cn(atrasado && "text-danger")}>{hora(captura.janela_fim)}</span>}
        <span className="text-white/25">
          {captura.precisa_foto && captura.precisa_video ? t.celularFotoEVideo : captura.precisa_foto ? t.celularFoto : t.celularVideo}
        </span>
      </p>

      <div className="mt-3 flex gap-2">
        <button
          type="button"
          disabled={ocupado}
          onClick={onCaptei}
          className="h-12 flex-1 rounded-lg text-sm font-semibold text-black transition active:scale-[0.98] disabled:opacity-40"
          style={{ background: "rgb(var(--color-accent))", boxShadow: "0 0 20px rgb(var(--color-accent) / 0.4)" }}
        >
          {t.celularCaptei}
        </button>
        <button
          type="button"
          disabled={ocupado}
          onClick={onNaoRolou}
          className="h-12 rounded-lg border border-white/15 px-3.5 text-xs font-medium text-white/65 transition active:scale-[0.98] disabled:opacity-40"
        >
          {t.celularNaoRolou}
        </button>
        {onPular && (
          <button
            type="button"
            onClick={onPular}
            className="h-12 rounded-lg px-3 text-xs text-white/35 transition active:scale-[0.98]"
          >
            {t.celularPular}
          </button>
        )}
      </div>
    </div>
  );
}

/** O que ainda vai abrir: só informação, sem botão. Botão aqui convidaria a marcar o que ainda não aconteceu. */
function Proximo({
  captura,
  bloco,
  hora,
}: {
  captura: CapturaRow;
  bloco?: { titulo: string; inicio: string };
  hora: (iso: string) => string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-white/[0.06] bg-black/25 px-3.5 py-2.5">
      <span className="font-mono text-[11px] tabular-nums text-white/40">
        {captura.janela_inicio ? hora(captura.janela_inicio) : "--:--"}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[13px] text-white/70">{captura.titulo}</span>
        {bloco && <span className="block truncate font-mono text-[9px] uppercase tracking-[0.1em] text-white/25">{bloco.titulo}</span>}
      </span>
    </div>
  );
}

function Feito({
  captura,
  hora,
  ocupado,
  onDesfazer,
}: {
  captura: CapturaRow;
  hora: (iso: string) => string;
  ocupado: boolean;
  onDesfazer: () => void;
}) {
  const { dict } = useLocale();
  const captado = captura.status === "captado";

  return (
    <div className="flex items-center gap-3 rounded-lg border border-white/[0.06] bg-black/25 px-3.5 py-2.5">
      <span
        className={cn(
          "h-1.5 w-1.5 shrink-0 rounded-full",
          captado ? "bg-status-good shadow-[0_0_6px_rgb(34_197_94/0.8)]" : "bg-white/20"
        )}
      />
      <span className="min-w-0 flex-1">
        <span className={cn("block truncate text-[13px]", captado ? "text-white/55 line-through decoration-white/20" : "text-white/45")}>
          {captura.titulo}
        </span>
        {captura.marcado_em && (
          <span className="block font-mono text-[9px] tabular-nums text-white/25">{hora(captura.marcado_em)}</span>
        )}
      </span>
      <button
        type="button"
        disabled={ocupado}
        onClick={onDesfazer}
        className="shrink-0 font-mono text-[9.5px] uppercase tracking-[0.12em] text-white/30 transition hover:text-white disabled:opacity-40"
      >
        {dict.eventos.celularDesfazer}
      </button>
    </div>
  );
}
