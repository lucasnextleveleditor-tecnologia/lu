"use client";

import type { TarefaComRelacoes } from "@/lib/types/producao";
import { IconPlus } from "@/components/ui/icons";
import { cn } from "@/lib/utils/cn";
import { useLocale } from "@/lib/i18n/LocaleProvider";

interface DiaTarefasModalProps {
  data: string; // ISO yyyy-mm-dd
  tarefas: TarefaComRelacoes[];
  onAbrirTarefa: (id: string) => void;
  onNovaTarefa: (data: string) => void;
  onClose: () => void;
}

/**
 * Visão "grande" de um dia do Calendário de Produção — abre ao clicar em
 * "+n mais" quando um dia tem mais tarefas do que cabem na célula compacta
 * da grade (ver `CalendarioTarefas`). Duplo clique na área do card (ou o
 * botão "+ Nova Tarefa") cria uma tarefa nova já com essa data como Prazo de
 * Entrega — mesmo atalho do clique direto numa célula vazia da grade
 * compacta.
 */
export function DiaTarefasModal({ data, tarefas, onAbrirTarefa, onNovaTarefa, onClose }: DiaTarefasModalProps) {
  const { dict } = useLocale();
  const dataFmt = new Date(`${data}T00:00:00`).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={onClose}>
      <div
        className="max-h-[80vh] w-full max-w-md overflow-y-auto rounded-2xl border border-base-700 bg-base-900 p-6"
        onClick={(e) => e.stopPropagation()}
        onDoubleClick={() => onNovaTarefa(data)}
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-base font-semibold capitalize">{dataFmt}</h3>
          <button onClick={onClose} className="text-xl leading-none text-ink-muted hover:text-ink-primary" aria-label={dict.common.fechar}>
            ×
          </button>
        </div>

        <div className="space-y-1.5">
          {tarefas.map((t) => (
            <button
              key={t.id}
              onClick={(e) => {
                e.stopPropagation();
                onAbrirTarefa(t.id);
              }}
              onDoubleClick={(e) => e.stopPropagation()}
              className={cn(
                "block w-full truncate rounded-lg px-3 py-2 text-left text-sm font-medium text-ink-primary transition hover:opacity-80",
                t.prioridade === "urgente" || t.prioridade === "alta" ? "bg-status-critical/20" : "bg-base-800"
              )}
              title={t.titulo}
            >
              {t.titulo}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onNovaTarefa(data);
          }}
          className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-base-600 py-2 text-xs font-medium text-ink-secondary transition hover:border-ink-muted hover:text-ink-primary"
        >
          <IconPlus className="h-3.5 w-3.5" />
          {dict.producao.novaTarefa}
        </button>
      </div>
    </div>
  );
}
