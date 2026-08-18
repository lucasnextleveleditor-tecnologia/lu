"use client";

import type { TarefaComRelacoes, PrioridadeTarefa } from "@/lib/types/producao";
import { PRIORIDADE_TAREFA_META, calcularProgressoSubtarefas, isTarefaAtrasada } from "@/lib/utils/producao";
import { fmtData } from "@/lib/utils/status";
import { Meter } from "@/components/ui/Meter";
import { PillTag } from "@/components/admin/producao/PillTag";
import { cn } from "@/lib/utils/cn";
import { useLocale } from "@/lib/i18n/LocaleProvider";

interface TarefaCardProps {
  tarefa: TarefaComRelacoes;
  onClick: () => void;
  className?: string;
}

function iniciais(nome: string): string {
  const partes = nome.trim().split(/\s+/);
  const primeira = partes[0]?.[0] ?? "";
  const ultima = partes.length > 1 ? partes[partes.length - 1]![0] : "";
  return (primeira + ultima).toUpperCase();
}

/**
 * Card compacto do Kanban (visual "premium" — degradê + reflexo interno no
 * topo + flutuação no hover, ver diretrizes de redesign). Quando a tarefa é
 * urgente ou está atrasada, um glow vermelho esfumaçado reforça o card —
 * sempre como REFORÇO da pílula/texto "Urgente"/"Atrasada", nunca como
 * única pista (cor nunca carrega sozinha o significado).
 */
export function TarefaCard({ tarefa, onClick, className }: TarefaCardProps) {
  const { dict } = useLocale();
  const prioridadeLabel: Record<PrioridadeTarefa, string> = {
    baixa: dict.producao.prioridadeBaixa,
    normal: dict.producao.prioridadeNormal,
    alta: dict.producao.prioridadeAlta,
    urgente: dict.producao.prioridadeUrgente,
  };
  const prioridadeMeta = PRIORIDADE_TAREFA_META[tarefa.prioridade];
  const atrasada = isTarefaAtrasada(tarefa);
  const progresso = calcularProgressoSubtarefas(
    Array.from({ length: tarefa.subtarefas_total }, (_, i) => ({ concluida: i < tarefa.subtarefas_concluidas }))
  );
  const emAlerta = tarefa.prioridade === "urgente" || atrasada;

  return (
    <button
      onClick={onClick}
      className={cn(
        "group w-full rounded-xl border border-base-700/70 bg-gradient-to-br from-base-900 to-base-950 p-3.5 text-left",
        "transition-all duration-300 hover:-translate-y-1 hover:border-base-600 hover:shadow-[0_8px_30px_rgb(0,0,0,0.5)]",
        // Um único `shadow-[...]` de base por vez (nunca duas classes
        // `shadow-[...]` simultâneas no mesmo elemento — a última do CSS
        // gerado vence e a outra é descartada por inteiro, não somam).
        emAlerta
          ? "shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_0_18px_-6px_rgba(211,59,59,0.35)]"
          : "shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]",
        className
      )}
    >
      <div className="mb-2.5 flex items-start justify-between gap-2">
        <p className="text-sm font-medium leading-snug text-ink-primary">{tarefa.titulo}</p>
        <PillTag tone={prioridadeMeta.tone} label={prioridadeLabel[tarefa.prioridade]} />
      </div>

      {(tarefa.cliente_nome || tarefa.tipo_servico_nome) && (
        <div className="mb-2.5 flex flex-wrap items-center gap-1.5">
          {tarefa.cliente_nome && <p className="truncate text-xs text-ink-secondary">{tarefa.cliente_nome}</p>}
          {tarefa.tipo_servico_nome && <PillTag tone="neutral" label={tarefa.tipo_servico_nome} />}
        </div>
      )}

      {tarefa.subtarefas_total > 0 && (
        <div className="mb-2.5">
          <div className="mb-1 flex items-center justify-between text-[11px] text-ink-muted">
            <span>{dict.producao.subtarefas}</span>
            <span>
              {progresso.concluidas}/{progresso.total}
            </span>
          </div>
          <Meter pct={progresso.pct} tone={progresso.pct >= 1 ? "good" : "neutral"} />
        </div>
      )}

      <div className="flex items-center justify-between gap-2 border-t border-base-800/70 pt-2.5">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-ink-muted">
          {tarefa.data_captacao && (
            <span>
              {dict.producao.captacaoPrefixo}
              {fmtData(tarefa.data_captacao)}
            </span>
          )}
          {tarefa.data_entrega && (
            <span className={atrasada ? "font-semibold text-danger" : ""}>
              {atrasada ? dict.producao.atrasadaPrefixo : dict.producao.prazoPrefixo}
              {fmtData(tarefa.data_entrega)}
            </span>
          )}
        </div>
        {tarefa.responsavel_nome && (
          <span
            title={tarefa.responsavel_nome}
            className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-base-600 bg-gradient-to-br from-base-700 to-base-800 text-[9px] font-semibold text-ink-secondary"
          >
            {iniciais(tarefa.responsavel_nome)}
          </span>
        )}
      </div>
    </button>
  );
}
