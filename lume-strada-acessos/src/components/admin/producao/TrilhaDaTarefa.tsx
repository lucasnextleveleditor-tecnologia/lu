"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils/cn";
import { substituir } from "@/lib/utils/texto";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { IconActivity } from "@/components/ui/icons";
import { listarEventosDaTarefa } from "@/app/admin/producao/actions";
import type { EventoRow } from "@/lib/eventos/registrar";

/**
 * A vida da peça, dentro dela — do momento em que virou trabalho até o
 * "concluído".
 *
 * A trilha por CLIENTE (aba Histórico) responde "o que anda acontecendo com
 * essa conta"; esta responde "o que aconteceu com ESTE arquivo". São perguntas
 * diferentes e é por isso que existem as duas: quando o cliente liga dizendo
 * que não recebeu o vídeo, ninguém quer filtrar a linha do tempo da agência
 * inteira — quer abrir a peça e ver que ela foi para preview terça às 15h40 e
 * voltou quinta às 9h.
 *
 * Ordem CRESCENTE aqui, ao contrário da tela do cliente. Lá a pergunta é "o
 * que aconteceu por último"; aqui é a história da peça, e história se lê do
 * começo.
 *
 * Carregada só quando o detalhe abre, e não junto da lista de tarefas: são
 * dezenas de cards no Kanban, e trazer a trilha de todos para mostrar a de um
 * seria pagar por noventa consultas para usar uma.
 */
export function TrilhaDaTarefa({ tarefaId }: { tarefaId: string }) {
  const { dict, locale } = useLocale();
  const t = dict.historico;

  const [eventos, setEventos] = useState<EventoRow[] | null>(null);

  useEffect(() => {
    let vivo = true;
    listarEventosDaTarefa(tarefaId).then((r) => {
      if (vivo) setEventos(r.ok ? r.eventos : []);
    });
    return () => {
      vivo = false;
    };
  }, [tarefaId]);

  const rotuloStatus: Record<string, string> = {
    backlog: dict.producao.statusBacklog,
    a_fazer: dict.producao.statusAFazer,
    em_producao: dict.producao.statusEmProducao,
    revisao_interna: dict.producao.statusRevisaoInterna,
    preview_cliente: dict.producao.statusPreviewCliente,
    concluida: dict.producao.statusConcluida,
  };

  if (eventos === null) {
    return (
      <div className="rounded-2xl border border-base-800/70 bg-base-950/50 p-4">
        <p className="text-xs text-ink-muted">{dict.common.carregando}</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-base-800/70 bg-base-950/50 p-4">
      <p className="mb-3 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-ink-muted">
        <IconActivity className="h-3.5 w-3.5" />
        {t.trilhaDaTarefa}
      </p>

      {eventos.length === 0 ? (
        <p className="text-xs text-ink-muted">{t.semEventosDaTarefa}</p>
      ) : (
        <ol className="space-y-0">
          {eventos.map((e, i) => {
            const quando = new Date(e.created_at);
            const transicao =
              e.de || e.para
                ? substituir(t.transicao, {
                    de: e.de ? (rotuloStatus[e.de] ?? e.de) : "—",
                    para: e.para ? (rotuloStatus[e.para] ?? e.para) : "—",
                  })
                : null;
            const ultimo = i === eventos.length - 1;

            return (
              <li key={e.id} className="relative flex gap-3 pb-3 last:pb-0">
                {/* O fio ligando um passo ao outro — e ele não desce do último,
                    senão a trilha pareceria continuar para um passo que ainda
                    não existe. */}
                {!ultimo && <span aria-hidden className="absolute left-[3px] top-3 h-full w-px bg-base-800" />}
                <span
                  className={cn(
                    "relative mt-1.5 h-[7px] w-[7px] shrink-0 rounded-full",
                    e.ator_tipo === "cliente" ? "bg-status-good" : e.ator_tipo === "sistema" ? "bg-base-600" : "bg-accent"
                  )}
                />

                <div className="min-w-0 flex-1">
                  <p className="flex flex-wrap items-baseline gap-x-2 text-xs">
                    <span className="font-medium text-ink-primary">{t.acoes[e.acao] ?? e.acao}</span>
                    {transicao && (
                      <span className="rounded-full border border-base-700 px-1.5 py-0.5 text-[10px] text-ink-muted">
                        {transicao}
                      </span>
                    )}
                  </p>
                  <p className="mt-0.5 text-[11px] text-ink-muted">
                    {e.ator_nome ?? t.atorDesconhecido}
                    {/* O cargo entre parênteses: "Julia (social media) enviou
                        para revisão" responde também POR QUE ela fez isso —
                        numa trilha lida meses depois, por alguém que talvez
                        nem trabalhasse aqui na época. */}
                    {e.ator_cargo && <span className="text-ink-muted/70"> ({e.ator_cargo})</span>}
                    {e.ator_tipo !== "equipe" && ` · ${e.ator_tipo === "cliente" ? t.atorCliente : t.atorSistema}`}
                    {" · "}
                    <span className="tabular-nums">
                      {quando.toLocaleDateString(locale)}{" "}
                      {quando.toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </p>

                  {/* A observação de quem devolveu vai junto: "foi devolvido"
                      sem o motivo obriga a abrir outra tela para saber por quê. */}
                  {/* Marca o que veio do BACKFILL: estes eventos foram
                      reconstruídos de dados que já estavam gravados (data da
                      versão, quem enviou, quem aprovou), e não anotados no
                      momento em que aconteceram. É honesto dizer a diferença —
                      o que falta nesses históricos falta porque nunca foi
                      guardado, não porque alguém deixou de fazer. */}
                  {e.detalhe?.reconstruido === true && (
                    <p className="mt-0.5 text-[10px] uppercase tracking-wide text-ink-muted/60">{t.reconstruido}</p>
                  )}

                  {typeof e.detalhe?.observacao === "string" && (
                    <p className="mt-1 border-l-2 border-base-700 pl-2 text-[11px] italic text-ink-secondary">
                      {e.detalhe.observacao}
                    </p>
                  )}
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}
