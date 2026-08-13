"use client";

import type { TarefaComRelacoes } from "@/lib/types/producao";
import { PRIORIDADE_TAREFA_META, calcularProgressoSubtarefas, isTarefaAtrasada } from "@/lib/utils/producao";
import { fmtData } from "@/lib/utils/status";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils/cn";

interface TarefaCardProps {
  tarefa: TarefaComRelacoes;
  onClick: () => void;
  className?: string;
}

/** Card compacto — usado no Kanban e (versão ainda mais reduzida, como "pill") no Calendário. */
export function TarefaCard({ tarefa, onClick, className }: TarefaCardProps) {
  const prioridadeMeta = PRIORIDADE_TAREFA_META[tarefa.prioridade];
  const atrasada = isTarefaAtrasada(tarefa);
  const progresso = calcularProgressoSubtarefas(
    Array.from({ length: tarefa.subtarefas_total }, (_, i) => ({ concluida: i < tarefa.subtarefas_concluidas }))
  );

  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full rounded-xl border border-base-700 bg-base-900/80 p-3.5 text-left transition hover:-translate-y-0.5 hover:border-base-600",
        "shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)]",
        className
      )}
    >
      <div className="mb-2 flex items-start justify-between gap-2">
        <p className="text-sm font-medium leading-snug text-ink-primary">{tarefa.titulo}</p>
        <Badge tone={prioridadeMeta.tone} label={prioridadeMeta.label} className="shrink-0" />
      </div>

      {tarefa.cliente_nome && <p className="mb-1 truncate text-xs text-ink-secondary">{tarefa.cliente_nome}</p>}

      <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ink-muted">
        {tarefa.data_entrega && (
          <span className={atrasada ? "font-medium text-danger" : ""}>
            {atrasada ? "Atrasada · " : "Prazo: "}
            {fmtData(tarefa.data_entrega)}
          </span>
        )}
        {tarefa.subtarefas_total > 0 && (
          <span>
            ✓ {progresso.concluidas}/{progresso.total}
          </span>
        )}
        {tarefa.responsavel_nome && <span className="truncate">{tarefa.responsavel_nome}</span>}
      </div>
    </button>
  );
}
