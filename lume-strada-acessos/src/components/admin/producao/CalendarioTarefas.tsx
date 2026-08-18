"use client";

import { useState } from "react";
import type { TarefaComRelacoes } from "@/lib/types/producao";
import { addMeses, fmtMesAno, gradeDoMes } from "@/lib/utils/producao";
import { Card } from "@/components/ui/Card";
import { IconChevronLeft, IconChevronRight } from "@/components/ui/icons";
import { cn } from "@/lib/utils/cn";
import { useLocale } from "@/lib/i18n/LocaleProvider";

interface CalendarioTarefasProps {
  tarefas: TarefaComRelacoes[];
  onAbrirTarefa: (id: string) => void;
}

const MAX_VISIVEIS_POR_DIA = 3;

/** Grade mensal por prazo de entrega — navegação de mês fica só no estado do componente (o dataset inteiro já veio do servidor de uma vez). */
export function CalendarioTarefas({ tarefas, onAbrirTarefa }: CalendarioTarefasProps) {
  const { dict } = useLocale();
  const DIAS_SEMANA = dict.producao.diasSemana;
  const [referencia, setReferencia] = useState(() => {
    const hoje = new Date();
    return new Date(Date.UTC(hoje.getFullYear(), hoje.getMonth(), 1));
  });

  const hojeIso = new Date().toISOString().slice(0, 10);
  const semanas = gradeDoMes(referencia);

  const tarefasPorDia = new Map<string, TarefaComRelacoes[]>();
  for (const t of tarefas) {
    if (!t.data_entrega) continue;
    tarefasPorDia.set(t.data_entrega, [...(tarefasPorDia.get(t.data_entrega) ?? []), t]);
  }

  return (
    <Card className="p-4 sm:p-5">
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm font-semibold capitalize">{fmtMesAno(referencia)}</p>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setReferencia((r) => addMeses(r, -1))}
            className="flex h-7 w-7 items-center justify-center rounded-lg border border-base-600 text-ink-secondary transition hover:border-ink-muted hover:text-ink-primary"
            aria-label={dict.producao.mesAnterior}
          >
            <IconChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={() => {
              const hoje = new Date();
              setReferencia(new Date(Date.UTC(hoje.getFullYear(), hoje.getMonth(), 1)));
            }}
            className="rounded-lg border border-base-600 px-2.5 py-1 text-xs text-ink-secondary transition hover:border-ink-muted hover:text-ink-primary"
          >
            {dict.producao.irParaHoje}
          </button>
          <button
            onClick={() => setReferencia((r) => addMeses(r, 1))}
            className="flex h-7 w-7 items-center justify-center rounded-lg border border-base-600 text-ink-secondary transition hover:border-ink-muted hover:text-ink-primary"
            aria-label={dict.producao.proximoMes}
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
              if (!dia) return <div key={j} className="min-h-[92px] rounded-lg" />;
              const tarefasDoDia = tarefasPorDia.get(dia) ?? [];
              const visiveis = tarefasDoDia.slice(0, MAX_VISIVEIS_POR_DIA);
              const restantes = tarefasDoDia.length - visiveis.length;
              const isHoje = dia === hojeIso;
              return (
                <div
                  key={j}
                  className={cn(
                    "min-h-[92px] rounded-lg border p-1.5",
                    isHoje ? "border-accent/50 bg-base-900/60" : "border-base-800 bg-base-950/40"
                  )}
                >
                  <p className={cn("mb-1 px-0.5 text-[11px]", isHoje ? "font-semibold text-ink-primary" : "text-ink-muted")}>
                    {Number(dia.slice(-2))}
                  </p>
                  <div className="space-y-1">
                    {visiveis.map((t) => (
                      <button
                        key={t.id}
                        onClick={() => onAbrirTarefa(t.id)}
                        className={cn(
                          "block w-full truncate rounded px-1.5 py-1 text-left text-[11px] font-medium text-ink-primary transition hover:opacity-80",
                          t.prioridade === "urgente" || t.prioridade === "alta" ? "bg-status-critical/20" : "bg-base-800"
                        )}
                        title={t.titulo}
                      >
                        {t.titulo}
                      </button>
                    ))}
                    {restantes > 0 && (
                      <p className="px-1.5 text-[10px] text-ink-muted">{dict.producao.maisTarefas.replace("{n}", String(restantes))}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>

      <div className="mt-4 flex items-center gap-4 text-[11px] text-ink-muted">
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-status-critical/60" /> {dict.producao.legendaAltaUrgente}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-base-700" /> {dict.producao.legendaNormalBaixa}
        </span>
      </div>
    </Card>
  );
}
