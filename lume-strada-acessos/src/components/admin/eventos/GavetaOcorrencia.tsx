"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils/cn";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { fusoValido } from "@/lib/utils/fusos";
import type { EquipeEventoRow, OcorrenciaRow } from "@/lib/types/eventos";
import { registrarOcorrencia } from "@/app/admin/eventos/[id]/actions";

/**
 * A GAVETA DE OCORRÊNCIA — dois toques, e fica no log com hora e autor.
 *
 * DOIS TOQUES é literal: abre a gaveta, toca no que aconteceu. Os seis
 * atalhos cobrem o que realmente acontece num evento — chuva, artista
 * atrasado, equipamento com problema, acesso negado, briga de produção,
 * público acima do previsto — e existem porque, no meio da operação, ninguém
 * escreve. A caixa de texto fica logo abaixo, para o que não coube nos seis.
 *
 * Por que registrar isso de todo: no dia seguinte, a diferença entre "o show
 * atrasou" e "o show atrasou porque o caminhão do som chegou 21h40" é a
 * diferença entre engolir o prejuízo e cobrar de quem o causou. E essa frase
 * não existe se ninguém a escrever no minuto em que aconteceu.
 *
 * O log mostra TUDO — atraso, play, captação e ocorrência — porque a história
 * do evento é uma só. Separar em abas faria alguém ler metade.
 */

const ATALHOS = ["chuva", "artistaAtrasado", "equipamento", "acessoNegado", "publico", "producao"] as const;

export function GavetaOcorrencia({
  eventoId,
  ocorrencias,
  equipe,
  fuso,
  onFechar,
}: {
  eventoId: string;
  ocorrencias: OcorrenciaRow[];
  equipe: EquipeEventoRow[];
  fuso: string;
  onFechar: () => void;
}) {
  const { dict } = useLocale();
  const t = dict.eventos;
  const router = useRouter();
  const [pendente, iniciar] = useTransition();
  const [texto, setTexto] = useState("");

  const zona = fusoValido(fuso);
  const hora = (iso: string) =>
    new Intl.DateTimeFormat("pt-BR", { timeZone: zona, hour: "2-digit", minute: "2-digit", hour12: false }).format(
      new Date(iso)
    );

  function registrar(conteudo: string) {
    const limpo = conteudo.trim();
    if (!limpo) return;
    iniciar(async () => {
      const r = await registrarOcorrencia(eventoId, limpo, null);
      if (!r.ok) return;
      setTexto("");
      router.refresh();
    });
  }

  return (
    <>
      <button type="button" aria-label={dict.common.fechar} onClick={onFechar} className="fixed inset-0 z-40 bg-black/50 backdrop-blur-[1px]" />

      <aside className="ev-console fixed inset-y-0 right-0 z-50 flex w-full max-w-lg flex-col overflow-y-auto border-l border-white/10 shadow-2xl">
        <div aria-hidden className="ev-linhas-monitor pointer-events-none absolute inset-0" />

        <div className="relative px-5 py-6 sm:px-6">
          <div className="flex items-center justify-between">
            <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-white/45">{t.ocorrenciaTitulo}</p>
            <button type="button" onClick={onFechar} className="font-mono text-[10px] uppercase tracking-[0.14em] text-white/40 transition hover:text-white">
              {dict.common.fechar}
            </button>
          </div>

          <p className="mt-2 text-[11px] leading-relaxed text-white/40">{t.ocorrenciaAjuda}</p>

          {/* O segundo toque. */}
          <div className="mt-4 grid grid-cols-2 gap-1.5">
            {ATALHOS.map((chave) => (
              <button
                key={chave}
                type="button"
                disabled={pendente}
                onClick={() => registrar(t.ocorrenciaAtalhos[chave] ?? chave)}
                className="rounded-xl border border-white/10 bg-black/40 px-3.5 py-3 text-left text-[13px] text-white/80 transition hover:border-accent/40 hover:text-white disabled:opacity-40"
              >
                {t.ocorrenciaAtalhos[chave] ?? chave}
              </button>
            ))}
          </div>

          {/* A saída para o que não coube nos seis. */}
          <div className="mt-3 flex gap-2">
            <input
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") registrar(texto);
              }}
              placeholder={t.ocorrenciaOutra}
              className="min-w-0 flex-1 rounded-lg border border-white/10 bg-black/50 px-3 py-2.5 text-sm text-white placeholder:text-white/25 focus:border-accent/60 focus:outline-none"
            />
            <button
              type="button"
              disabled={pendente || !texto.trim()}
              onClick={() => registrar(texto)}
              className="rounded-lg px-4 py-2.5 text-sm font-medium text-black transition disabled:opacity-40"
              style={{ background: "rgb(var(--color-accent))" }}
            >
              {t.ocorrenciaRegistrar}
            </button>
          </div>

          {/* O log inteiro. */}
          <p className="mt-7 font-mono text-[9.5px] uppercase tracking-[0.18em] text-white/40">{t.ocorrenciaLog}</p>

          <ul className="mt-2 space-y-1.5">
            {ocorrencias.length === 0 && (
              <li className="rounded-xl border border-white/[0.07] bg-black/30 px-4 py-6 text-center text-xs text-white/35">{t.ocorrenciaLogVazio}</li>
            )}

            {ocorrencias.map((o) => {
              const autor = o.autor_equipe_id ? equipe.find((p) => p.id === o.autor_equipe_id) : null;
              return (
                <li key={o.id} className="flex gap-3 rounded-lg border border-white/[0.06] bg-black/30 px-3.5 py-2.5">
                  <span className="shrink-0 font-mono text-[11px] tabular-nums text-white/35">{hora(o.created_at)}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[13px] leading-snug text-white/75">{o.texto}</span>
                    <span className="mt-0.5 flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.1em] text-white/25">
                      <Etiqueta tipo={o.tipo} t={t} />
                      {/* Autor: o nome de quem marcou pelo celular, ou "painel"
                          para quem estava logado. Buscar o nome do profile aqui
                          custaria mais uma consulta para dizer o que a pessoa
                          que está olhando já sabe — ela é o painel. */}
                      <span>{autor ? autor.nome : t.ocorrenciaAutorPainel}</span>
                    </span>
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      </aside>
    </>
  );
}

function Etiqueta({ tipo, t }: { tipo: OcorrenciaRow["tipo"]; t: { ocorrenciaTipos: Record<string, string> } }) {
  const cor =
    tipo === "atraso"
      ? "text-danger/70"
      : tipo === "captura"
        ? "text-status-good/70"
        : tipo === "status"
          ? "text-accent/70"
          : "text-white/30";

  return <span className={cn("shrink-0", cor)}>{t.ocorrenciaTipos[tipo] ?? tipo}</span>;
}
