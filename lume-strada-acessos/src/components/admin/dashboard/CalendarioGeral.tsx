"use client";

import { useMemo, useState } from "react";
import type { TarefaAgendaItem, LeadAgendaItem } from "@/lib/types/dashboard";
import { leadEstaAberto } from "@/lib/utils/comercial";
import { addMeses, fmtMesAno, gradeDoMes, hojeISO } from "@/lib/utils/dashboard";
import { Card } from "@/components/ui/Card";
import { IconChevronLeft, IconChevronRight } from "@/components/ui/icons";
import { AgendaDoDia } from "@/components/admin/dashboard/AgendaDoDia";
import { cn } from "@/lib/utils/cn";

interface CalendarioGeralProps {
  tarefas: TarefaAgendaItem[];
  leads: LeadAgendaItem[];
}

const DIAS_SEMANA = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

/**
 * Calendário Geral — captações e entregas de Produção + follow-ups do
 * Comercial, num grid mensal. Clicar num dia abre a Agenda daquele dia ao
 * lado (mesmo componente `AgendaDoDia` da Visão Geral) — o grid é só pra
 * navegar, o detalhe de verdade fica sempre na Agenda.
 */
export function CalendarioGeral({ tarefas, leads }: CalendarioGeralProps) {
  const hojeIso = hojeISO();
  const [referencia, setReferencia] = useState(() => {
    const hoje = new Date();
    return new Date(Date.UTC(hoje.getFullYear(), hoje.getMonth(), 1));
  });
  const [diaSelecionado, setDiaSelecionado] = useState(hojeIso);

  const semanas = gradeDoMes(referencia);
  const leadsAbertos = useMemo(() => leads.filter(leadEstaAberto), [leads]);

  const { captacoesPorDia, entregasPorDia, followUpsPorDia } = useMemo(() => {
    const captacoes = new Map<string, TarefaAgendaItem[]>();
    const entregas = new Map<string, TarefaAgendaItem[]>();
    const followUps = new Map<string, LeadAgendaItem[]>();

    for (const t of tarefas) {
      if (t.data_captacao) captacoes.set(t.data_captacao, [...(captacoes.get(t.data_captacao) ?? []), t]);
      if (t.data_entrega) entregas.set(t.data_entrega, [...(entregas.get(t.data_entrega) ?? []), t]);
    }
    for (const l of leadsAbertos) {
      if (l.proximo_contato_em) followUps.set(l.proximo_contato_em, [...(followUps.get(l.proximo_contato_em) ?? []), l]);
    }

    return { captacoesPorDia: captacoes, entregasPorDia: entregas, followUpsPorDia: followUps };
  }, [tarefas, leadsAbertos]);

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
      <Card className="p-4 sm:p-5">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm font-semibold capitalize">{fmtMesAno(referencia)}</p>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setReferencia((r) => addMeses(r, -1))}
              className="flex h-7 w-7 items-center justify-center rounded-lg border border-base-600 text-ink-secondary transition hover:border-ink-muted hover:text-ink-primary"
              aria-label="Mês anterior"
            >
              <IconChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => {
                const hoje = new Date();
                setReferencia(new Date(Date.UTC(hoje.getFullYear(), hoje.getMonth(), 1)));
                setDiaSelecionado(hojeIso);
              }}
              className="rounded-lg border border-base-600 px-2.5 py-1 text-xs text-ink-secondary transition hover:border-ink-muted hover:text-ink-primary"
            >
              Hoje
            </button>
            <button
              onClick={() => setReferencia((r) => addMeses(r, 1))}
              className="flex h-7 w-7 items-center justify-center rounded-lg border border-base-600 text-ink-secondary transition hover:border-ink-muted hover:text-ink-primary"
              aria-label="Próximo mês"
            >
              <IconChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1.5 text-center text-[11px] font-medium uppercase tracking-wide text-ink-muted">
          {DIAS_SEMANA.map((d) => (
            <div key={d} className="pb-1.5">
              {d}
            </div>
          ))}
        </div>

        <div className="space-y-1.5">
          {semanas.map((semana, i) => (
            <div key={i} className="grid grid-cols-7 gap-1.5">
              {semana.map((dia, j) => {
                if (!dia) return <div key={j} className="min-h-[76px] rounded-lg" />;
                const qtdCaptacoes = captacoesPorDia.get(dia)?.length ?? 0;
                const qtdEntregas = entregasPorDia.get(dia)?.length ?? 0;
                const qtdFollowUps = followUpsPorDia.get(dia)?.length ?? 0;
                const isHoje = dia === hojeIso;
                const isSelecionado = dia === diaSelecionado;
                return (
                  <button
                    key={j}
                    onClick={() => setDiaSelecionado(dia)}
                    className={cn(
                      "min-h-[76px] rounded-lg border p-1.5 text-left transition",
                      isSelecionado
                        ? "border-accent bg-base-800"
                        : isHoje
                          ? "border-accent/50 bg-base-900/60 hover:bg-base-800/60"
                          : "border-base-800 bg-base-950/40 hover:bg-base-800/40"
                    )}
                  >
                    <p className={cn("mb-1 text-[11px]", isHoje ? "font-semibold text-ink-primary" : "text-ink-muted")}>
                      {Number(dia.slice(-2))}
                    </p>
                    <div className="space-y-0.5">
                      {qtdCaptacoes > 0 && (
                        <p className="truncate rounded bg-base-700 px-1 py-0.5 text-[10px] font-medium text-ink-primary">
                          {qtdCaptacoes} captação{qtdCaptacoes > 1 ? "ões" : ""}
                        </p>
                      )}
                      {qtdEntregas > 0 && (
                        <p className="truncate rounded bg-white/10 px-1 py-0.5 text-[10px] font-medium text-ink-primary">
                          {qtdEntregas} entrega{qtdEntregas > 1 ? "s" : ""}
                        </p>
                      )}
                      {qtdFollowUps > 0 && (
                        <p className="truncate rounded border border-base-700 px-1 py-0.5 text-[10px] font-medium text-ink-secondary">
                          {qtdFollowUps} follow-up{qtdFollowUps > 1 ? "s" : ""}
                        </p>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-4 text-[11px] text-ink-muted">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-base-700" /> Captação
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-white/30" /> Entrega
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full border border-base-600" /> Follow-up
          </span>
        </div>
      </Card>

      <AgendaDoDia
        data={diaSelecionado}
        captacoes={captacoesPorDia.get(diaSelecionado) ?? []}
        entregas={entregasPorDia.get(diaSelecionado) ?? []}
        followUps={followUpsPorDia.get(diaSelecionado) ?? []}
      />
    </div>
  );
}
