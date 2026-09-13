"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils/cn";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { getSiteUrl } from "@/lib/utils/siteUrl";
import type { EquipeEventoRow } from "@/lib/types/eventos";
import type { MembroDaCasa } from "@/app/admin/eventos/[id]/data";
import {
  adicionarNaEquipe,
  atualizarPessoaDaEquipe,
  baterPonto,
  removerDaEquipe,
} from "@/app/admin/eventos/[id]/actions";

/**
 * A GAVETA DE EQUIPE — quem vai, o que recebe, e o link de cada um.
 *
 * Abre por cima da grade e devolve para ela. Quem está montando um evento não
 * pode perder o lugar na programação para escalar uma pessoa.
 *
 * DUAS PORTAS PARA A MESMA COISA, e é o ponto do módulo inteiro: escolher no
 * cadastro da casa OU escrever o nome. A primeira já traz o cachê do
 * `valor_diaria`; a segunda existe porque num evento grande a maior parte da
 * equipe é freelancer que ninguém vai cadastrar — o cadastro é atalho, nunca
 * pedágio.
 *
 * O LINK é por PESSOA, nunca do evento. É isso que faz o "captei" ficar
 * assinado com um nome: com um link só, todo mundo seria "a equipe" e a
 * marcação não valeria como registro.
 */

export function GavetaEquipe({
  eventoId,
  equipe,
  membros,
  usaPonto,
  usaCache,
  onFechar,
}: {
  eventoId: string;
  equipe: EquipeEventoRow[];
  membros: MembroDaCasa[];
  /** Ligado nos Ajustes do evento. Desligado, o ponto some — o dado fica. */
  usaPonto: boolean;
  /** Idem para cachê e extras: escalar gente não deveria pedir dinheiro. */
  usaCache: boolean;
  onFechar: () => void;
}) {
  const { dict, fmtMoeda } = useLocale();
  const t = dict.eventos;
  const router = useRouter();
  const [pendente, iniciar] = useTransition();

  const [nome, setNome] = useState("");
  const [funcao, setFuncao] = useState("");
  const [cache, setCache] = useState(0);
  const [membroId, setMembroId] = useState<string | null>(null);
  const [copiado, setCopiado] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  /** Escolher do cadastro preenche nome, função e cachê de uma vez. */
  function escolherMembro(id: string) {
    const m = membros.find((x) => x.id === id);
    if (!m) {
      setMembroId(null);
      return;
    }
    setMembroId(m.id);
    setNome(m.nome);
    setFuncao(m.cargo ?? "");
    setCache(Number(m.valor_diaria ?? 0));
  }

  function adicionar() {
    setErro(null);
    iniciar(async () => {
      const r = await adicionarNaEquipe(eventoId, { membroId, nome, funcao: funcao || null, telefone: null, cache });
      if (!r.ok) {
        setErro(r.error === "PESSOA_SEM_NOME" ? t.equipeErroSemNome : r.error);
        return;
      }
      setNome("");
      setFuncao("");
      setCache(0);
      setMembroId(null);
      router.refresh();
    });
  }

  async function copiarLink(pessoa: EquipeEventoRow) {
    const url = `${getSiteUrl()}/evento/${pessoa.token}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopiado(pessoa.id);
      setTimeout(() => setCopiado(null), 2200);
    } catch {
      // Área de transferência bloqueada (contexto não seguro, permissão
      // negada): mostrar o link é melhor do que não fazer nada — dá para
      // selecionar na mão.
      window.prompt(t.equipeCopiarManual, url);
    }
  }

  const total = equipe.reduce((s, p) => s + Number(p.cache ?? 0) + Number(p.extras ?? 0), 0);

  return (
    <>
      <button type="button" aria-label={dict.common.fechar} onClick={onFechar} className="fixed inset-0 z-40 bg-black/50 backdrop-blur-[1px]" />

      <aside className="ev-console fixed inset-y-0 right-0 z-50 flex w-full max-w-lg flex-col overflow-y-auto border-l border-white/10 shadow-2xl">
        <div aria-hidden className="ev-linhas-monitor pointer-events-none absolute inset-0" />

        <div className="relative px-5 py-6 sm:px-6">
          <div className="flex items-center justify-between">
            <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-white/45">{t.equipeGavetaTitulo}</p>
            <button type="button" onClick={onFechar} className="font-mono text-[10px] uppercase tracking-[0.14em] text-white/40 transition hover:text-white">
              {dict.common.fechar}
            </button>
          </div>

          {erro && <p className="mt-4 rounded-lg border border-danger/40 bg-danger/10 px-3 py-2 text-xs text-danger">{erro}</p>}

          {/* --- escalar --- */}
          <div className="mt-5 rounded-xl border border-white/[0.08] bg-black/40 p-4">
            <p className="font-mono text-[9.5px] uppercase tracking-[0.18em] text-white/40">{t.equipeDoCadastro}</p>
            <select
              value={membroId ?? ""}
              onChange={(e) => escolherMembro(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-white/10 bg-black/50 px-3 py-2.5 text-sm text-white focus:border-accent/60 focus:outline-none"
            >
              <option value="">{t.equipeOuEscreva}</option>
              {membros.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.cargo ? `${m.nome} · ${m.cargo}` : m.nome}
                </option>
              ))}
            </select>

            <div className="mt-3 grid grid-cols-2 gap-2">
              <input
                value={nome}
                onChange={(e) => {
                  setNome(e.target.value);
                  setMembroId(null);
                }}
                placeholder={t.equipeNome}
                className="rounded-lg border border-white/10 bg-black/50 px-3 py-2.5 text-sm text-white placeholder:text-white/25 focus:border-accent/60 focus:outline-none"
              />
              <input
                value={funcao}
                onChange={(e) => setFuncao(e.target.value)}
                placeholder={t.equipeFuncao}
                className="rounded-lg border border-white/10 bg-black/50 px-3 py-2.5 text-sm text-white placeholder:text-white/25 focus:border-accent/60 focus:outline-none"
              />
            </div>

            <div className="mt-3 flex items-center gap-3">
              {usaCache && (
                <>
                  <span className="font-mono text-[9.5px] uppercase tracking-[0.16em] text-white/40">{t.equipeCache}</span>
                  <span className="inline-flex items-stretch overflow-hidden rounded-lg border border-white/12 bg-black/50">
                    <button type="button" onClick={() => setCache((c) => Math.max(0, c - 50))} className="w-9 text-white/50 transition hover:text-accent">−</button>
                    <span className="flex min-w-[92px] items-center justify-center px-2 font-mono text-sm tabular-nums text-white">
                      {fmtMoeda(cache)}
                    </span>
                    <button type="button" onClick={() => setCache((c) => c + 50)} className="w-9 text-white/50 transition hover:text-accent">+</button>
                  </span>
                </>
              )}

              <button
                type="button"
                onClick={adicionar}
                disabled={pendente || !nome.trim()}
                className="ml-auto rounded-lg px-4 py-2.5 text-sm font-medium text-black transition disabled:opacity-40"
                style={{ background: "rgb(var(--color-accent))" }}
              >
                {t.equipeEscalar}
              </button>
            </div>
          </div>

          {/* --- a escala --- */}
          <div className="mt-6 flex items-center justify-between">
            <p className="font-mono text-[9.5px] uppercase tracking-[0.18em] text-white/40">{t.equipeEscala}</p>
            {usaCache && <span className="font-mono text-[11px] tabular-nums text-white/40">{fmtMoeda(total)}</span>}
          </div>

          <ul className="mt-2 space-y-2">
            {equipe.length === 0 && <li className="rounded-xl border border-white/[0.07] bg-black/30 px-4 py-6 text-center text-xs text-white/35">{t.equipeVazia}</li>}

            {equipe.map((p) => (
              <li key={p.id} className="rounded-xl border border-white/[0.08] bg-black/40 px-4 py-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-[14px] font-medium text-white">{p.nome}</p>
                    <p className="mt-0.5 flex flex-wrap items-center gap-x-2 font-mono text-[9.5px] uppercase tracking-[0.1em] text-white/35">
                      {p.funcao && <span>{p.funcao}</span>}
                      {usaCache && <span>{fmtMoeda(Number(p.cache ?? 0))}</span>}
                      {p.equipe_membro_id && <span className="text-white/25">{t.equipeDaCasa}</span>}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => copiarLink(p)}
                    className={cn(
                      "shrink-0 rounded-lg border px-3 py-2 font-mono text-[9.5px] uppercase tracking-[0.12em] transition",
                      copiado === p.id ? "border-status-good/50 text-status-good" : "border-accent/40 text-accent hover:bg-accent/10"
                    )}
                  >
                    {copiado === p.id ? t.equipeLinkCopiado : t.equipeCopiarLink}
                  </button>
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-1.5">
                  {usaPonto && (
                    <>
                      <BotaoPonto
                        marcado={!!p.checkin_em}
                        texto={t.equipeChegou}
                        ocupado={pendente}
                        onClick={() => iniciar(async () => { await baterPonto(eventoId, p.id, "entrada"); router.refresh(); })}
                      />
                      <BotaoPonto
                        marcado={!!p.checkout_em}
                        texto={t.equipeSaiu}
                        ocupado={pendente}
                        onClick={() => iniciar(async () => { await baterPonto(eventoId, p.id, "saida"); router.refresh(); })}
                      />
                    </>
                  )}

                  {usaCache && (
                    <button
                      type="button"
                      disabled={pendente}
                      onClick={() => iniciar(async () => { await atualizarPessoaDaEquipe(eventoId, p.id, { extras: Number(p.extras ?? 0) + 50 }); router.refresh(); })}
                      className="rounded-lg border border-white/10 px-2.5 py-1.5 font-mono text-[9.5px] uppercase tracking-[0.1em] text-white/45 transition hover:text-white disabled:opacity-40"
                    >
                      {t.equipeExtra} {Number(p.extras ?? 0) > 0 ? fmtMoeda(Number(p.extras)) : "+"}
                    </button>
                  )}

                  <button
                    type="button"
                    disabled={pendente}
                    onClick={() => iniciar(async () => { await removerDaEquipe(eventoId, p.id); router.refresh(); })}
                    className="ml-auto rounded-lg px-2 py-1.5 font-mono text-[9.5px] uppercase tracking-[0.1em] text-white/25 transition hover:text-danger disabled:opacity-40"
                  >
                    {dict.common.excluir}
                  </button>
                </div>
              </li>
            ))}
          </ul>

          <p className="mt-5 text-[11px] leading-relaxed text-white/35">{t.equipeLinkAjuda}</p>
        </div>
      </aside>
    </>
  );
}

/** O ponto é um toque, e o toque já aconteceu: marcado vira estado, não volta a ser botão. */
function BotaoPonto({ marcado, texto, ocupado, onClick }: { marcado: boolean; texto: string; ocupado: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      disabled={ocupado || marcado}
      onClick={onClick}
      className={cn(
        "rounded-lg border px-2.5 py-1.5 font-mono text-[9.5px] uppercase tracking-[0.1em] transition disabled:opacity-100",
        marcado ? "border-status-good/40 text-status-good" : "border-white/10 text-white/45 hover:text-white"
      )}
    >
      {texto}
    </button>
  );
}
