"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils/cn";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { fusoValido } from "@/lib/utils/fusos";
import { estadoDaCaptura, type CapturaRow } from "@/lib/types/eventos";
import type { PautaDoFreela } from "@/app/evento/[token]/data";
import { marcarPorToken } from "@/app/evento/[token]/actions";

/**
 * A TIMELINE NO CELULAR DE QUEM ESTÁ EM CAMPO.
 *
 * Antes esta tela era só a lista do que era dele. Funcionava para marcar e
 * falhava em tudo o mais: quem está no meio de um festival não pergunta apenas
 * "o que eu tenho que fazer", pergunta "onde eu estou na noite". Sem a
 * programação inteira, o freelancer não sabia que o show seguinte começava em
 * dez minutos no palco ao lado, nem por que a janela dele fechava às 23h40.
 *
 * Então a noite inteira aparece, e o que é DELE aparece aceso no meio dela. O
 * resto entra apagado, sem botão — é paisagem para ele se localizar, e a
 * própria ação no servidor recusa a marcação de item de outra pessoa, então a
 * tela não está guardando nada que o servidor não guarde também.
 *
 * VERTICAL, e não a grade do computador. Numa tela de 375px uma linha do tempo
 * horizontal de seis horas é uma tira ilegível; o que funciona no telefone é a
 * ordem de cima para baixo, com a hora na lateral, que é como a pessoa já lê
 * qualquer coisa no celular.
 *
 * A tela desce sozinha até AGORA ao abrir. Quem abre isto está atrasado para
 * alguma coisa por definição: fazer a pessoa rolar duas horas de programação
 * até achar o próprio minuto é começar errado.
 */

const MINUTO = 60_000;

export function TimelineDoCelular({ pauta, token }: { pauta: PautaDoFreela; token: string }) {
  const { dict } = useLocale();
  const t = dict.eventos;
  const router = useRouter();
  const [pendente, iniciar] = useTransition();
  const [erro, setErro] = useState<string | null>(null);

  const zona = fusoValido(pauta.evento.fuso);
  const [agora, setAgora] = useState<number | null>(null);
  const alvoAgora = useRef<HTMLLIElement>(null);

  // O relógio só começa depois de montar (hidratação), e bate a cada 30s — no
  // celular de campo, mais do que isso é bateria à toa.
  useEffect(() => {
    setAgora(Date.now());
    const id = setInterval(() => setAgora(Date.now()), 30_000);
    return () => clearInterval(id);
  }, []);

  // Uma vez só, ao abrir: desce até o bloco da vez.
  const jaDesceu = useRef(false);
  useEffect(() => {
    if (jaDesceu.current || agora === null) return;
    jaDesceu.current = true;
    const id = requestAnimationFrame(() => {
      alvoAgora.current?.scrollIntoView({ block: "center", behavior: "smooth" });
    });
    return () => cancelAnimationFrame(id);
  }, [agora]);

  const hora = (iso: string) =>
    new Intl.DateTimeFormat("pt-BR", { timeZone: zona, hour: "2-digit", minute: "2-digit", hour12: false }).format(
      new Date(iso)
    );

  const corDoAmbiente = (id: string | null) =>
    pauta.ambientes.find((a) => a.id === id)?.cor ?? "rgb(var(--color-accent))";
  const nomeDoAmbiente = (id: string | null) => pauta.ambientes.find((a) => a.id === id)?.nome ?? "";

  /** Os itens sem bloco não somem: eles aparecem no fim, como "a noite toda". */
  const soltas = pauta.capturas.filter((c) => !c.bloco_id);

  const linhas = useMemo(() => {
    const ordenados = [...pauta.blocos].sort(
      (a, b) => new Date(a.inicio).getTime() - new Date(b.inicio).getTime()
    );
    return ordenados.map((b) => ({
      bloco: b,
      itens: pauta.capturas.filter((c) => c.bloco_id === b.id),
    }));
  }, [pauta.blocos, pauta.capturas]);

  const blocoDaVez = useMemo(() => {
    if (agora === null) return null;
    const rolando = linhas.find(
      (l) =>
        agora >= new Date(l.bloco.inicio).getTime() &&
        agora <= new Date(l.bloco.fim ?? l.bloco.inicio).getTime()
    );
    if (rolando) return rolando.bloco.id;
    // Nada rolando: o próximo que ainda vai começar.
    return linhas.find((l) => new Date(l.bloco.inicio).getTime() > agora)?.bloco.id ?? null;
  }, [linhas, agora]);

  /** Dele, ou sem dono — o servidor usa exatamente a mesma regra. */
  const meu = (c: CapturaRow) => c.responsavel_id === pauta.pessoa.id || c.responsavel_id === null;

  const meusPendentes = pauta.capturas.filter((c) => meu(c) && c.status === "pendente").length;

  function marcar(capturaId: string, status: "captado" | "nao_rolou") {
    iniciar(async () => {
      const r = await marcarPorToken(token, capturaId, status);
      if (!r.ok) {
        setErro(t.celularErroGenerico);
        return;
      }
      setErro(null);
      router.refresh();
    });
  }

  return (
    <div className="ev-console min-h-screen pb-16">
      <div aria-hidden className="ev-linhas-monitor pointer-events-none fixed inset-0" />

      {/* --- cabeçalho fixo --- */}
      <header className="ev-console sticky top-0 z-20 border-b border-white/10 px-5 py-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-[15px] font-semibold text-white">{pauta.evento.nome}</p>
            <p className="mt-0.5 truncate font-mono text-[9.5px] uppercase tracking-[0.14em] text-white/40">
              {[pauta.pessoa.nome, pauta.pessoa.funcao].filter(Boolean).join(" · ")}
            </p>
          </div>
          <p
            className="shrink-0 font-mono text-lg tabular-nums leading-none"
            style={{ color: "rgb(var(--color-accent))" }}
          >
            {agora === null ? "--:--" : hora(new Date(agora).toISOString())}
          </p>
        </div>

        <p className="mt-2 font-mono text-[9px] uppercase tracking-[0.16em] text-white/30">
          {meusPendentes > 0 ? t.celularToqueNoSeu : t.celularSoLeitura}
        </p>
      </header>

      {erro && (
        <p className="mx-5 mt-4 rounded-lg border border-danger/40 bg-danger/10 px-3 py-2 text-xs text-danger">
          {erro}
        </p>
      )}

      {/* --- a noite --- */}
      <p className="px-5 pt-5 font-mono text-[9.5px] uppercase tracking-[0.22em] text-white/30">
        {t.celularTimeline}
      </p>

      <ol className="mt-3 px-5">
        {linhas.map(({ bloco, itens }) => {
          const cor = corDoAmbiente(bloco.ambiente_id);
          const daVez = blocoDaVez === bloco.id;
          const passou = agora !== null && agora > new Date(bloco.fim ?? bloco.inicio).getTime();
          const temMeu = itens.some(meu);

          return (
            <li key={bloco.id} ref={daVez ? alvoAgora : undefined} className="flex gap-3">
              {/* a trilha da esquerda: hora + nó + fio */}
              <div className="flex w-[52px] shrink-0 flex-col items-end">
                <span
                  className={cn(
                    "font-mono text-[11px] tabular-nums leading-none",
                    daVez ? "text-accent" : passou ? "text-white/25" : "text-white/50"
                  )}
                >
                  {hora(bloco.inicio)}
                </span>
                <span aria-hidden className="mt-1 flex flex-1 flex-col items-center self-stretch pr-[3px]">
                  <span
                    className={cn("h-2 w-2 shrink-0 rounded-full", daVez && "ev-agora")}
                    style={{ background: cor, boxShadow: daVez ? `0 0 10px ${cor}` : undefined }}
                  />
                  <span className="w-px flex-1 bg-white/[0.09]" />
                </span>
              </div>

              <div className="min-w-0 flex-1 pb-5">
                <div
                  className={cn(
                    "rounded-xl border px-3.5 py-3 transition",
                    daVez ? "border-accent/40 bg-accent/[0.05]" : passou ? "border-white/[0.06] opacity-60" : "border-white/[0.09]"
                  )}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="min-w-0 truncate text-[14px] font-medium text-white/90">{bloco.titulo}</span>
                    {daVez && (
                      <span className="shrink-0 font-mono text-[8.5px] uppercase tracking-[0.14em] text-accent">
                        {t.celularAgora}
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 truncate font-mono text-[9px] uppercase tracking-[0.12em] text-white/30">
                    {nomeDoAmbiente(bloco.ambiente_id)}
                  </p>

                  {itens.length > 0 && (
                    <ul className="mt-2.5 space-y-1.5">
                      {itens.map((c) => (
                        <Item
                          key={c.id}
                          captura={c}
                          meu={meu(c)}
                          agora={agora}
                          ocupado={pendente}
                          onMarcar={marcar}
                        />
                      ))}
                    </ul>
                  )}

                  {itens.length === 0 && !temMeu && (
                    <p className="mt-2 font-mono text-[9px] uppercase tracking-[0.12em] text-white/20">
                      {t.celularNadaAgora}
                    </p>
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ol>

      {soltas.length > 0 && (
        <div className="px-5">
          <p className="pt-2 font-mono text-[9.5px] uppercase tracking-[0.22em] text-white/30">{t.celularASeguir}</p>
          <ul className="mt-2 space-y-1.5 pb-6">
            {soltas.map((c) => (
              <Item key={c.id} captura={c} meu={meu(c)} agora={agora} ocupado={pendente} onMarcar={marcar} />
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

/**
 * Um item da pauta.
 *
 * O que é dele tem os três botões; o que é de outra pessoa aparece apagado,
 * sem botão nenhum e com o rótulo dizendo de quem é. Mostrar sem poder tocar
 * parece inútil e não é: é assim que ele sabe que aquela foto tem dono e não
 * precisa correr atrás dela.
 */
function Item({
  captura,
  meu,
  agora,
  ocupado,
  onMarcar,
}: {
  captura: CapturaRow;
  meu: boolean;
  agora: number | null;
  ocupado: boolean;
  onMarcar: (id: string, status: "captado" | "nao_rolou") => void;
}) {
  const { dict } = useLocale();
  const t = dict.eventos;
  const [pulado, setPulado] = useState(false);

  const estado = agora === null ? "pendente" : estadoDaCaptura(captura, new Date(agora).toISOString());
  const feito = captura.status !== "pendente";

  if (pulado && !feito) return null;

  return (
    <li
      className={cn(
        "rounded-lg border px-3 py-2.5 transition",
        !meu
          ? "border-white/[0.05] bg-black/20 opacity-45"
          : captura.status === "captado"
            ? "border-status-good/35 bg-status-good/[0.06]"
            : captura.status === "nao_rolou"
              ? "border-white/[0.08] bg-black/30 opacity-70"
              : estado === "perdido"
                ? "border-danger/35 bg-danger/[0.06]"
                : "border-white/[0.12] bg-black/40"
      )}
    >
      <div className="flex items-start gap-2">
        <span className="min-w-0 flex-1">
          <span className="flex flex-wrap items-center gap-1.5">
            <span className="text-[13px] leading-snug text-white/90">{captura.titulo}</span>
            {captura.obrigatorio && meu && (
              <span className="shrink-0 rounded-full border border-accent/40 px-1.5 py-px font-mono text-[8px] uppercase tracking-[0.1em] text-accent">
                {t.celularObrigatorio}
              </span>
            )}
          </span>
          <span className="mt-0.5 flex flex-wrap gap-x-2 font-mono text-[8.5px] uppercase tracking-[0.1em] text-white/30">
            {!meu && <span>{t.celularOutrosItens}</span>}
            {captura.precisa_video && <span>{t.celularVideo}</span>}
            {captura.status === "captado" && <span className="text-status-good">{t.celularFeito}</span>}
            {meu && captura.status === "pendente" && estado === "perdido" && (
              <span className="text-danger">{t.celularPassou}</span>
            )}
          </span>
        </span>
      </div>

      {meu && !feito && (
        <div className="mt-2.5 flex gap-1.5">
          <button
            type="button"
            disabled={ocupado}
            onClick={() => onMarcar(captura.id, "captado")}
            className="flex-1 rounded-lg px-3 py-2.5 font-mono text-[11px] uppercase tracking-[0.1em] text-black transition disabled:opacity-40"
            style={{ background: "rgb(var(--color-accent))" }}
          >
            {t.celularCaptei}
          </button>
          <button
            type="button"
            disabled={ocupado}
            onClick={() => onMarcar(captura.id, "nao_rolou")}
            className="rounded-lg border border-white/15 px-3 py-2.5 font-mono text-[11px] uppercase tracking-[0.1em] text-white/55 transition disabled:opacity-40"
          >
            {t.celularNaoRolou}
          </button>
          {/* Pular NÃO grava nada: é só tirar da frente nesta sessão. Gravar um
              "pulei" criaria um terceiro estado que ninguém pediu e que o
              fechamento teria de explicar. */}
          <button
            type="button"
            onClick={() => setPulado(true)}
            className="rounded-lg px-2.5 py-2.5 font-mono text-[11px] uppercase tracking-[0.1em] text-white/25 transition hover:text-white/60"
          >
            {t.celularPular}
          </button>
        </div>
      )}
    </li>
  );
}
